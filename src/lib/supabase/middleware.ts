/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Middleware function to refresh the Supabase session using Supabase's SSR pattern.
 * This version follows the docs by using `getAll` and `setAll` for cookie handling.
 */
export async function updateSupabaseSession() {
  // Get the request cookies
  const cookiesInstance = await cookies();
  const requestCookies = await cookiesInstance;
  // Create a NextResponse to apply any cookie changes
  const response = NextResponse.next();

  // Create a Supabase client with cookie handlers matching the Supabase docs
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => requestCookies.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookies on the NextResponse
              response.cookies.set(name, value, options);
            });
          } catch {
            // Ignore errors (e.g., when called from a Server Component)
          }
        },
      },
    }
  );

  // Refresh the session (this updates cookies via the setAll handler)
  await supabase.auth.getSession();

  return response;
}
