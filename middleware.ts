// src/middleware.ts
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from '@supabase/ssr';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/',
  '/interviews/',
  '/analytics/',
  '/profile/',
  '/settings/'
];

export async function middleware(request: NextRequest) {
  // First, handle Supabase auth session refresh
  const authResponse = await updateSupabaseSession();
  
  // Check if the path is a protected route
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}`)
  );
  
  // If it's a protected route, check if the user is authenticated
  if (isProtectedRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {}, // We don't need to set cookies here
          remove() {}, // We don't need to remove cookies here
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // User is not authenticated, redirect to sign in
      const redirectUrl = new URL('/sign-in', request.url);
      redirectUrl.searchParams.set('error', 'session_expired');
      redirectUrl.searchParams.set('redirect', path);
      
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // If we have a modified response from auth session update, return it
  if (authResponse) {
    return authResponse;
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     * - and file extensions (.svg, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};