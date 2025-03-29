// middleware.ts
import { logger } from "@/lib/axiom/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { transformMiddlewareRequest } from "@axiomhq/nextjs";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";


export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // First, handle Supabase auth session refresh
  const authResponse = await updateSupabaseSession(request);
  
  // Log request information to Axiom (if existing middleware is already using it)
  logger.info(...transformMiddlewareRequest(request));
  
  // Ensure logs are flushed before the response
  event.waitUntil(logger.flush());
  
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