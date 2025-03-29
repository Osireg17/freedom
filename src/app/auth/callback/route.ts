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
        // Get the user data regardless of verification type
        const { data: userData } = await supabase.auth.getUser();
        
        // Update the user metadata to reflect email confirmation
        if (userData?.user) {
          await supabase.auth.updateUser({
            data: { email_confirmed: true }
          });
        }
        
        // For new users after signup or users who haven't completed their profile yet
        // Always redirect them to the complete-profile page
        if (type === 'signup' || type === 'email') {
          console.log("Redirecting to complete profile after email verification");
          return NextResponse.redirect(new URL('/complete-profile', request.url));
        }
        
        // For password reset, redirect to sign-in with success message
        if (type === 'recovery') {
          return NextResponse.redirect(new URL('/sign-in?message=password_reset_complete', request.url));
        }
        
        // For any other verification types, check if they should go to complete-profile
        // or dashboard based on whether they've completed their profile
        if (userData?.user) {
          // If user hasn't completed their profile (no firstName in metadata)
          // redirect them to complete-profile
          if (!userData.user.user_metadata?.firstName) {
            return NextResponse.redirect(new URL('/complete-profile', request.url));
          }
          
          // Otherwise, redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        
        // Default fallback for verification success but no specific path
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      } else {
        // If verification fails, redirect to error page with details
        console.error('OTP verification error:', error);
        return NextResponse.redirect(new URL('/error?code=verification_failed', request.url));
      }
    }
    
    // This is likely a callback from an OAuth provider
    // For OAuth, also check if they need to complete their profile and have confirmed email
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if email is confirmed before allowing access to complete-profile
      const isEmailConfirmed = user.user_metadata?.email_confirmed === true;
      
      if (!isEmailConfirmed) {
        // If email is not confirmed, redirect to a page asking them to confirm email first
        return NextResponse.redirect(new URL('/verify-email?message=confirmation_required', request.url));
      }
      
      if (!user.user_metadata?.firstName) {
        // Email confirmed and profile not complete, redirect to complete-profile
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
    }
    
    // For established users, redirect to the dashboard or specified next page
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