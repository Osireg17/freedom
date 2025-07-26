// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logServerError } from '@/lib/error/logger';
import { createUserRecord } from '@/lib/actions/auth-actions';

/**
 * Route handler for authentication callbacks from Supabase
 * Handles email confirmation, password reset, and OAuth provider callbacks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/dashboard';
    
    // If this is an email confirmation, password reset, or email change
    if (token_hash && type) {
      const supabase = await createClient();
      
      // Verify the OTP token
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      
      if (error) {
        // If verification fails, redirect to error page with details
        console.error('OTP verification error:', error);
        return NextResponse.redirect(
          new URL(`/verify-email?message=Error: ${encodeURIComponent(error.message)}`, request.url)
        );
      }
      
      // Get the user data regardless of verification type
      const { data: userData } = await supabase.auth.getUser();
      
      // Update the user metadata to reflect email confirmation
      if (userData?.user) {
        // Update email confirmation status
        await supabase.auth.updateUser({
          data: { email_confirmed: true }
        });
        
        // Check if we have first_name and last_name in metadata
        const firstName = userData.user.user_metadata?.first_name;
        const lastName = userData.user.user_metadata?.last_name;
        
        if (firstName && lastName) {
          // Create user record in our database using the auth-actions function
          try {
            await createUserRecord(
              userData.user.id,
              userData.user.email || '',
              firstName,
              lastName
            );
          } catch (createUserError) {
            logServerError(
              createUserError instanceof Error ? createUserError : new Error('Unknown error creating user record'),
              { action: 'authCallback' }
            );
            // Even if this fails, we continue with the flow
          }
        }
      }
      
      // For password reset, redirect to reset-password page to set new password
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', request.url));
      }
      
      // After successful signup and email verification, go directly to dashboard
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // For any other verification types, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // This is likely a callback from an OAuth provider
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if email is confirmed before allowing access
      const isEmailConfirmed = user.email_confirmed_at || user.user_metadata?.email_confirmed === true;
      
      if (!isEmailConfirmed) {
        // If email is not confirmed, redirect to a page asking them to confirm email first
        return NextResponse.redirect(
          new URL('/verify-email?message=Please verify your email before continuing&type=confirmation', request.url)
        );
      }
      
      // Check if we need to create user profile
      const firstName = user.user_metadata?.first_name;
      const lastName = user.user_metadata?.last_name;
      
      if (firstName && lastName) {
        // Create user record if missing
        try {
          await createUserRecord(
            user.id,
            user.email || '',
            firstName,
            lastName
          );
        } catch (createUserError) {
          logServerError(
            createUserError instanceof Error ? createUserError : new Error('Unknown error creating user record'),
            { action: 'authCallback' }
          );
          // Even if this fails, we continue with the flow
        }
        
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
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