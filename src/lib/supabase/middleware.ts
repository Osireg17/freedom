/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware function to handle Supabase authentication session refresh
 * Used by Next.js middleware.ts to refresh expired Auth tokens and store them in cookies
 */
export async function updateSupabaseSession(request: NextRequest) {
  // Create a response object to modify and return later
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create a Supabase client
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Convert to the NextResponse format
          request.cookies.set({
            name,
            value,
            ...options,
          });

          // Set the cookie in the response as well
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          // Convert to the NextResponse format
          request.cookies.set({
            name,
            value: '',
            ...options,
          });

          // Delete the cookie in the response
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh the session - this is what does the actual work
  // Even though we don't directly use the session value, this call
  // is crucial as it refreshes tokens and sets cookies via the cookie handlers above
  await supabase.auth.getSession();

  return response;
}