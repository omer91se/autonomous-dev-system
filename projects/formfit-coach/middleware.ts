import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect trainers away from user pages
    if (path.startsWith('/dashboard') && token?.role === 'TRAINER') {
      return NextResponse.redirect(new URL('/trainer/dashboard', req.url));
    }

    // Redirect users away from trainer pages
    if (path.startsWith('/trainer') && token?.role !== 'TRAINER') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/trainer/:path*', '/upload/:path*'],
};
