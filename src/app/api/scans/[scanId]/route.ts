import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  props: { params: Promise<{ scanId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', errorCode: 'AUTH_INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const { scanId } = await props.params;
    if (!scanId) {
      return NextResponse.json({ error: 'scanId is required', errorCode: 'AUTH_INVALID_INPUT' }, { status: 400 });
    }

    const scan = db.getScanById(scanId);
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found', errorCode: 'GITHUB_NOT_FOUND' }, { status: 404 });
    }

    // Verify scan ownership or access
    if (scan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to this scan' }, { status: 403 });
    }

    const findings = db.getFindings(scanId);
    const routes = db.getRoutes(scanId);
    const drafts = db.getDrafts(scanId);

    return NextResponse.json({
      ok: true,
      scanId: scan.id,
      repository: {
        fullName: scan.repoName,
        ref: scan.branch,
      },
      summary: scan,
      technologies: scan.techStack,
      health: {
        score: scan.readinessScore,
      },
      findings,
      routes,
      drafts,
      // Backward compatibility aliases
      success: true,
      scan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve scan', errorCode: 'PERSISTENCE_FAILED' },
      { status: 500 }
    );
  }
}
