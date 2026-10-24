import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route guard: anonymous users cannot access /app/*
  if (pathname.startsWith('/app')) {
    const sessionCookie =
      request.cookies.get('contriblens_session')?.value ||
      request.cookies.get('contribshield_session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
