// middleware.ts
import { logger} from "@/lib/axiom/server";
import { transformMiddlewareRequest } from "@axiomhq/nextjs";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Log request information
  logger.info(...transformMiddlewareRequest(request));

  // Ensure logs are flushed before the response
  event.waitUntil(logger.flush());
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (handled separately)
     * - Static files
     * - Image optimization files
     * - Common metadata files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};