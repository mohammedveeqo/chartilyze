// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoutes = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if we're on the correct subdomain
  const url = new URL(req.url);
  if (url.hostname === 'www.chartilyze.com' || url.hostname === 'chartilyze.com') {
    const appUrl = new URL('https://app.chartilyze.com');
    return NextResponse.redirect(appUrl);
  }

  if (!publicRoutes(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico).*)',
  ],
};
