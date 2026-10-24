import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { buildContributionRoute } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { findingId } = await req.json();
    if (!findingId) {
      return NextResponse.json({ error: 'findingId is required' }, { status: 400 });
    }

    const finding = db.getFindingById(findingId);
    if (!finding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    const scan = db.getScanById(finding.scanId);
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (scan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to scan' }, { status: 403 });
    }

    const route = await buildContributionRoute(finding, scan);
    db.saveRoute(route);

    // Update finding
    finding.routeCreated = true;
    finding.routeId = route.id;
    db.updateFinding(finding);

    db.logActivity({
      userId: user.id,
      type: 'route_created',
      repoName: scan.repoName,
      description: `Created contribution route for "${finding.title}" (${route.difficulty}, ${route.estimatedEffort})`,
    });

    return NextResponse.json({ success: true, route });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create contribution route' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get('scanId') || undefined;

  let routes = db.getRoutes(scanId);
  if (!scanId) {
    const userScanIds = db.getScans(user.id).map((s) => s.id);
    routes = routes.filter((r) => userScanIds.includes(r.scanId));
  }

  return NextResponse.json({ routes, ok: true, success: true });
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { routeId, status, learningChecklist, skillId, completed } = await req.json();
    if (!routeId) {
      return NextResponse.json({ error: 'routeId is required' }, { status: 400 });
    }

    const route = db.getRouteById(routeId);
    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const scan = db.getScanById(route.scanId);
    if (!scan || scan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to route' }, { status: 403 });
    }

    if (status) {
      const validStatuses = ['not-started', 'in-progress', 'needs-review', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      route.status = status;
    }

    if (Array.isArray(learningChecklist)) {
      route.learningChecklist = learningChecklist;
    } else if (skillId && typeof completed === 'boolean') {
      if (route.learningChecklist) {
        route.learningChecklist = route.learningChecklist.map((item) =>
          item.id === skillId ? { ...item, completed } : item
        );
      }
    }

    db.saveRoute(route);

    db.logActivity({
      userId: user.id,
      type: 'route_updated',
      repoName: scan.repoName,
      description: `Updated contribution route "${route.title}" (Status: ${route.status})`,
    });

    return NextResponse.json({ ok: true, success: true, route });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update route' }, { status: 500 });
  }
}
