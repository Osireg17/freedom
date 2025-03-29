'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logServerError } from '@/lib/error/logger';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

/**
 * Server action to sign out the current user
 * Clears the user's session and redirects to the home page
 */
export async function signOut() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // Clear any additional cookies if needed
    const cookieStore = await cookies(); // Get the cookie store
    cookieStore.set('session', '', {
      expires: new Date(0),
      path: '/',
    });

    // Revalidate relevant paths
    revalidatePath('/', 'layout');

    // Redirect to the home page
    redirect('/');
  } catch (error) {
    logServerError(
      error instanceof Error ? error : new Error('Unknown error during sign out'),
      {
        action: 'signOut',
      }
    );

    // Redirect to home page even if there's an error
    redirect('/');
  }
}

/**
 * Creates a new user record in our database after Supabase authentication
 * This is used to store additional user information
 */
export async function createUserRecord(
  userId: string,
  email: string,
  firstName: string,
  lastName: string
) {
  try {
    // First, check if the user already exists in our database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (existingUser) {
      // User already exists, update their info
      await db.update(users)
        .set({
          firstName,
          lastName,
          email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      return { success: true };
    }

    // Create username from email by taking everything before @ and adding a random number
    const usernameBase = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const usernameRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const username = `${usernameBase}-${usernameRandom}`;
    
    // Insert user record into our database
    await db.insert(users).values({
      id: userId,
      firstName,
      lastName,
      email,
      username,
      subscriptionTier: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Verify the Supabase auth user exists
    const supabaseClient = await createClient();
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
      throw new Error('Authentication error: User not found in Supabase Auth');
    }
    
    return { success: true };
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error('Unknown error creating user record'), {
      action: 'createUserRecord',
      userId,
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating user record'
    };
  }
}

/**
 * Gets the current user from Supabase Auth
 * Used to protect server-rendered pages
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    logServerError(error instanceof Error ? error : new Error('Unknown error getting current user'), {
      action: 'getCurrentUser'
    });
    
    return null;
  }
}

/**
 * Protects a route by checking if the user is authenticated
 * If not, redirects to the sign-in page
 */
export async function protectRoute(redirectTo: string = '/auth/sign-in') {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(`${redirectTo}?error=session_expired`);
  }
  
  return user;
}