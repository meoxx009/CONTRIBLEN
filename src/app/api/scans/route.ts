import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { executeRepositoryScan } from '@/lib/scanner';
import { db } from '@/lib/db';
import { parseGitHubUrl } from '@/lib/scanner/github';
import type { ContribLensErrorCode } from '@/types';

// In-memory rate limiting and concurrency tracking
interface RateLimitTracker {
  timestamps: number[];
  activeCount: number;
}

const userRateLimits = new Map<string, RateLimitTracker>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_CONCURRENT_SCANS_PER_USER = 2;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

function checkRateLimitAndConcurrency(userId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  let tracker = userRateLimits.get(userId);

  if (!tracker) {
    tracker = { timestamps: [], activeCount: 0 };
    userRateLimits.set(userId, tracker);
  }

  // Filter timestamps within sliding window
  tracker.timestamps = tracker.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (tracker.activeCount >= MAX_CONCURRENT_SCANS_PER_USER) {
    return {
      allowed: false,
      reason: 'Too many concurrent scans. Please wait for your active scan to complete.',
    };
  }

  if (tracker.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      reason: 'Scan rate limit exceeded (maximum 10 scans per 5 minutes). Please try again shortly.',
    };
  }

  // Increment active counter and record timestamp
  tracker.activeCount += 1;
  tracker.timestamps.push(now);
  return { allowed: true };
}

function releaseActiveScan(userId: string) {
  const tracker = userRateLimits.get(userId);
  if (tracker && tracker.activeCount > 0) {
    tracker.activeCount -= 1;
  }
}

export async function POST(req: Request) {
  let authenticatedUserId: string | null = null;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Authentication required to scan a repository.',
          errorCode: 'AUTH_INVALID_CREDENTIALS' as ContribLensErrorCode,
        },
        { status: 401 }
      );
    }

    authenticatedUserId = user.id;

    // Concurrency and rate limit guard
    const rateCheck = checkRateLimitAndConcurrency(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.reason,
          errorCode: 'GITHUB_RATE_LIMITED' as ContribLensErrorCode,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const repoUrl = body.repositoryUrl || body.repoUrl;
    const ref = (body.ref || body.branch || '').trim() || undefined;
    const forceRefresh = Boolean(body.forceRefresh || body.refresh);
    const checks = Array.isArray(body.checks) ? body.checks : undefined;

    if (!repoUrl || typeof repoUrl !== 'string') {
      releaseActiveScan(user.id);
      return NextResponse.json(
        {
          error: 'Please provide a valid GitHub repository URL.',
          errorCode: 'GITHUB_INVALID_URL' as ContribLensErrorCode,
        },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      releaseActiveScan(user.id);
      return NextResponse.json(
        {
          error: 'Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repo',
          errorCode: 'GITHUB_INVALID_URL' as ContribLensErrorCode,
        },
        { status: 400 }
      );
    }

    const expectedRepoName = `${parsed.owner}/${parsed.repo}`;

    // Caching check per API INTEGRATION.md Section 7
    if (!forceRefresh) {
      const existingScans = db.getScans(user.id);
      const recentScan = existingScans.find(
        (s) =>
          s.repoName.toLowerCase() === expectedRepoName.toLowerCase() &&
          (!ref || s.branch === ref) &&
          Date.now() - new Date(s.scannedAt).getTime() < CACHE_TTL_MS
      );

      if (recentScan) {
        releaseActiveScan(user.id);
        const cachedFindings = db.getFindings(recentScan.id);
        const findingsCount = recentScan.findingsCount;

        return NextResponse.json({
          ok: true,
          scanId: recentScan.id,
          repository: {
            fullName: recentScan.repoName,
            ref: recentScan.branch,
          },
          summary: {
            findings: findingsCount.total,
            critical: findingsCount.critical,
            high: findingsCount.high,
            medium: findingsCount.medium,
            low: findingsCount.low,
            info: findingsCount.info,
          },
          technologies: recentScan.techStack,
          warnings: recentScan.warnings || [],
          goodFirstCount: recentScan.goodFirstCount,
          maintainerLevelCount: recentScan.maintainerLevelCount,
          resolvedCount: recentScan.resolvedCount,
          comparison: recentScan.comparison,
          cached: true,
          // Backward compatibility aliases
          success: true,
          scan: recentScan,
          findings: cachedFindings,
        });
      }
    }

    // Execute pure deterministic scan bounded by safety caps
    const result = await executeRepositoryScan(repoUrl, user.id, ref, checks);
    releaseActiveScan(user.id);

    const findingsCount = result.scan.findingsCount;

    return NextResponse.json({
      ok: true,
      scanId: result.scan.id,
      repository: {
        fullName: result.scan.repoName,
        ref: result.scan.branch,
      },
      summary: {
        findings: findingsCount.total,
        critical: findingsCount.critical,
        high: findingsCount.high,
        medium: findingsCount.medium,
        low: findingsCount.low,
        info: findingsCount.info,
      },
      technologies: result.scan.techStack,
      warnings: result.warnings || [],
      goodFirstCount: result.scan.goodFirstCount,
      maintainerLevelCount: result.scan.maintainerLevelCount,
      resolvedCount: result.scan.resolvedCount,
      comparison: result.scan.comparison,
      cached: false,
      // Backward compatibility aliases for existing UI
      success: true,
      scan: result.scan,
      findings: result.findings,
    });
  } catch (error: any) {
    if (authenticatedUserId) {
      releaseActiveScan(authenticatedUserId);
    }

    console.error('Scan execution error:', error);
    const message = error.message || 'Scan failed';

    let errorCode: ContribLensErrorCode = 'PERSISTENCE_FAILED';
    let statusCode = 500;

    const lower = message.toLowerCase();

    if (lower.includes('not found') || lower.includes('404')) {
      errorCode = 'GITHUB_NOT_FOUND';
      statusCode = 404;
    } else if (lower.includes('private') || lower.includes('access')) {
      errorCode = 'GITHUB_PRIVATE_OR_UNAVAILABLE';
      statusCode = 404;
    } else if (lower.includes('rate limit') || lower.includes('403') || lower.includes('429')) {
      errorCode = 'GITHUB_RATE_LIMITED';
      statusCode = 429;
    } else if (lower.includes('tree') || lower.includes('truncate') || lower.includes('candidate')) {
      errorCode = 'GITHUB_TREE_TRUNCATED';
      statusCode = 422;
    } else if (lower.includes('3 mb') || lower.includes('180 kb') || lower.includes('limit')) {
      errorCode = 'GITHUB_FILE_LIMIT';
      statusCode = 413;
    } else if (lower.includes('osv') || lower.includes('advisory')) {
      errorCode = 'OSV_UNAVAILABLE';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: message,
        errorCode,
        ok: false,
        success: false,
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', errorCode: 'AUTH_INVALID_CREDENTIALS' as ContribLensErrorCode },
      { status: 401 }
    );
  }

  const scans = db.getScans(user.id);
  return NextResponse.json({ ok: true, scans, success: true });
}
