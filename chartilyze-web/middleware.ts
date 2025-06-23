// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define which routes are publicly accessible
const publicRoutes = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)'
]);

// Main middleware logic
export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);

  // Redirect root domain to app subdomain
  if (url.hostname === 'www.chartilyze.com' || url.hostname === 'chartilyze.com') {
    return NextResponse.redirect('https://app.chartilyze.com');
  }

  // Protect all non-public routes
  if (!publicRoutes(req)) {
    await auth.protect(); // Automatically handles redirects if not authenticated
  }
});

// Updated matcher config to allow Clerk assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
};
