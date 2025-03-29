// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logServerError } from '@/lib/error/logger';

/**
 * Route handler for authentication callbacks from Supabase
 * Handles email confirmation and OAuth provider callbacks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/dashboard';
    
    // If this is an email confirmation
    if (token_hash && type) {
      const supabase = await createClient();
      
      // Verify the OTP token
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      
      if (!error) {
        // If this is a brand new user (email verification after signup)
        if (type === 'signup') {
          // Check if they need to complete their profile
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Update the user metadata to reflect email confirmation
            await supabase.auth.updateUser({
              data: { email_confirmed: true }
            });
            
            // Redirect to the complete profile page
            // This is where they'll fill in their name, etc.
            return NextResponse.redirect(new URL('/complete-profile', request.url));
          }
        }
        
        // For password reset or other OTP verifications
        // Redirect to sign-in with a success message
        if (type === 'recovery') {
          return NextResponse.redirect(new URL('/sign-in?message=password_reset_complete', request.url));
        }
        
        // For other types, redirect to the specified next page or dashboard
        return NextResponse.redirect(new URL('/sign-in?message=verification_complete', request.url));
      } else {
        // If verification fails, redirect to error page
        console.error('OTP verification error:', error);
        return NextResponse.redirect(new URL('/error?code=verification_failed', request.url));
      }
    }
    
    // This is likely a callback from an OAuth provider
    // Redirect to the dashboard or specified page
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    // Log the error and redirect to error page
    logServerError(error instanceof Error ? error : new Error('Unknown error during auth callback'), {
      component: 'AuthCallback',
      path: '/auth/callback'
    });
    
    return NextResponse.redirect(new URL('/error?code=callback_error', request.url));
  }
}