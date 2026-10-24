import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isExport = searchParams.get('export') === 'true';

  const exportData = db.exportUserData(user.id);
  if (!exportData) {
    return NextResponse.json({ error: 'User data not found' }, { status: 404 });
  }

  if (isExport) {
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="contriblens-export-${user.id}.json"`,
      },
    });
  }

  return NextResponse.json(exportData);
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, settings } = body;

    if (name) {
      user.name = name.trim();
    }
    if (settings) {
      user.settings = {
        ...user.settings,
        ...settings,
      };
    }

    db.saveUser(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isAccountDeletion = searchParams.get('account') === 'true';

  if (isAccountDeletion) {
    db.deleteUserAccount(user.id);
    const res = NextResponse.json({
      success: true,
      message: 'User account and associated records deleted permanently.',
    });
    res.cookies.set('contriblens_session', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    res.cookies.set('contribshield_session', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    return res;
  }

  db.clearUserData(user.id);
  return NextResponse.json({
    success: true,
    message: 'All user scan records and activities cleared successfully.',
  });
}
