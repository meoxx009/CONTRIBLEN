import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redactSecrets } from '@/lib/redaction';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', errorCode: 'AUTH_INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }

  const { draftId } = await params;
  const draft = db.getDraftById(draftId);
  if (!draft) {
    return NextResponse.json(
      { error: 'Draft not found', errorCode: 'GITHUB_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, draft, success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', errorCode: 'AUTH_INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }

  const { draftId } = await params;
  const body = await req.json();

  const { title, markdownContent, body: draftBody, labels, status } = body;
  const safeTitle = title !== undefined ? redactSecrets(title) : undefined;
  const rawContent = markdownContent !== undefined ? markdownContent : draftBody;
  const safeMarkdown = rawContent !== undefined ? redactSecrets(rawContent) : undefined;

  const updated = db.updateDraft(draftId, {
    ...(safeTitle !== undefined && { title: safeTitle }),
    ...(safeMarkdown !== undefined && { markdownContent: safeMarkdown, body: safeMarkdown }),
    ...(labels !== undefined && { labels }),
    ...(status !== undefined && { status }),
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return NextResponse.json(
      { error: 'Draft not found', errorCode: 'GITHUB_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, draft: updated, success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', errorCode: 'AUTH_INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }

  const { draftId } = await params;
  const deleted = db.deleteDraft(draftId);
  if (!deleted) {
    return NextResponse.json(
      { error: 'Draft not found', errorCode: 'GITHUB_NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, success: true, message: 'Draft deleted' });
}
