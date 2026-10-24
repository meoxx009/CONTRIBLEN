/**
 * ContribLens GitHub Fetcher
 * Strictly read-only, bounded file retrieval.
 * NEVER executes code. Respects byte and file boundaries.
 */

export interface GitHubRepoMeta {
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  licenseName?: string;
}

export interface BoundedFile {
  path: string;
  size: number;
  content: string;
}

const MAX_FILES = Number(process.env.SCAN_MAX_FILES) || 60;
const MAX_FILE_SIZE_BYTES = Number(process.env.SCAN_MAX_FILE_BYTES) || 180 * 1024;
const MAX_TOTAL_BYTES = Number(process.env.SCAN_MAX_TOTAL_BYTES) || 3 * 1024 * 1024;
const MAX_TREE_ENTRIES = Number(process.env.SCAN_MAX_TREE_ENTRIES) || 20000;

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.exe', '.dll',
  '.so', '.dylib', '.bin', '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.mp3', '.mov', '.avi', '.lockb', '.wasm', '.jar'
]);

const IGNORED_DIRECTORIES = [
  'node_modules/',
  'vendor/',
  '.git/',
  'dist/',
  'build/',
  '.next/',
  'out/',
  'venv/',
  '.venv/',
  '__pycache__/',
  'target/',
  '.terraform/',
  'coverage/',
];

export function parseGitHubUrl(rawUrl: string): { owner: string; repo: string } | null {
  try {
    let cleanUrl = rawUrl.trim().replace(/\/$/, '');
    if (!cleanUrl) return null;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'github.com' && hostname !== 'www.github.com') {
      return null;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');

    if (!owner || !repo || !/^[a-zA-Z0-9_\-\.]+$/.test(owner) || !/^[a-zA-Z0-9_\-\.]+$/.test(repo)) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ContribLens-OSS-Scanner',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<GitHubRepoMeta> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(url, { headers: getGitHubHeaders() });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please configure a read-only GITHUB_TOKEN in settings or wait.');
    }
    throw new Error(`GitHub API error: ${response.statusText} (${response.status})`);
  }

  const data = await response.json();
  return {
    owner: data.owner?.login || owner,
    repo: data.name || repo,
    defaultBranch: data.default_branch || 'main',
    description: data.description || '',
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    openIssues: data.open_issues_count || 0,
    licenseName: data.license?.spdx_id || data.license?.name,
  };
}

export async function fetchBoundedRepositoryTree(
  owner: string,
  repo: string,
  branch: string
): Promise<{ files: BoundedFile[]; totalFilesIndexed: number; totalBytes: number; warnings: string[] }> {
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetch(treeUrl, { headers: getGitHubHeaders() });

  if (!response.ok) {
    throw new Error(`Failed to load repository tree for branch "${branch}": ${response.statusText}`);
  }

  const data = await response.json();
  const tree: Array<{ path: string; type: string; size?: number; url: string }> = data.tree || [];
  const warnings: string[] = [];

  if (data.truncated) {
    warnings.push('Repository tree was truncated by GitHub API due to size constraints. Analysis bounded to available entries.');
  }

  if (tree.length > MAX_TREE_ENTRIES) {
    warnings.push(`Repository tree contains ${tree.length} entries, exceeding safe limit of ${MAX_TREE_ENTRIES}. Analysis bounded.`);
  }

  const candidateBlobs = tree.filter((item) => {
    if (item.type !== 'blob') return false;
    const lower = item.path.toLowerCase();
    if (IGNORED_DIRECTORIES.some((d) => lower.includes(d))) return false;
    const ext = '.' + lower.split('.').pop();
    if (BINARY_EXTENSIONS.has(ext)) return false;
    return true;
  });

  if (candidateBlobs.length > MAX_FILES) {
    warnings.push(`Repository contains ${candidateBlobs.length} files. Scan was safely bounded to the top ${MAX_FILES} configuration files.`);
  }

  // Prioritize configuration, security, CI/CD, and manifest files
  const prioritized = candidateBlobs.sort((a, b) => {
    const priorityFiles = [
      'package.json',
      'requirements.txt',
      'pyproject.toml',
      'pipfile',
      'security.md',
      'contributing.md',
      'readme.md',
      'license',
      '.env.example',
    ];

    const isAPriority = priorityFiles.some((p) => a.path.toLowerCase().includes(p)) || a.path.includes('.github/workflows');
    const isBPriority = priorityFiles.some((p) => b.path.toLowerCase().includes(p)) || b.path.includes('.github/workflows');

    if (isAPriority && !isBPriority) return -1;
    if (!isAPriority && isBPriority) return 1;
    return 0;
  });

  const selectedBlobs = prioritized.slice(0, MAX_FILES);
  const boundedFiles: BoundedFile[] = [];
  let totalBytes = 0;

  for (const blob of selectedBlobs) {
    if (totalBytes >= MAX_TOTAL_BYTES) {
      warnings.push(`Total text size exceeded 3 MB limit. Remaining candidate files were truncated.`);
      break;
    }

    try {
      // Fetch raw content
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${blob.path}`;
      const res = await fetch(rawUrl, {
        headers: { 'User-Agent': 'ContribLens-OSS-Scanner' },
      });

      if (!res.ok) continue;

      const text = await res.text();
      const fileSize = Buffer.byteLength(text, 'utf-8');

      if (fileSize > MAX_FILE_SIZE_BYTES) {
        // Enforce per-file limit
        const truncated = text.slice(0, MAX_FILE_SIZE_BYTES);
        totalBytes += MAX_FILE_SIZE_BYTES;
        boundedFiles.push({ path: blob.path, size: MAX_FILE_SIZE_BYTES, content: truncated });
        warnings.push(`File "${blob.path}" exceeded 180 KB and was truncated to the bounded limit.`);
      } else {
        totalBytes += fileSize;
        boundedFiles.push({ path: blob.path, size: fileSize, content: text });
      }
    } catch (e) {
      // Non-blocking file fetch error
      continue;
    }
  }

  return {
    files: boundedFiles,
    totalFilesIndexed: candidateBlobs.length,
    totalBytes,
    warnings,
  };
}
