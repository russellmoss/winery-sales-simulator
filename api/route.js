import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle static files
  if (pathname.startsWith('/static/')) {
    return NextResponse.next();
  }

  // For all other routes, serve the React app
  return NextResponse.rewrite(new URL('/index.html', request.url));
}

// Build configuration
export const build = {
  buildCommand: 'cd client && npm install && npm run build',
  outputDirectory: 'client/build',
  installCommand: 'npm install',
}; 