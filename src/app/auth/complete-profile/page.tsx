// src/app/complete-profile/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/auth/profile-form';

export const metadata: Metadata = {
    title: 'Complete Profile - AceYourHireVue',
    description: 'Complete your profile to get started with AceYourHireVue',
};

export default async function CompleteProfilePage() {
    // Get the current user from Supabase
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // If there's no user or an error, redirect to sign in
    if (error || !user) {
        redirect('/auth/sign-in');
    }

    return (
        <div className="container flex h-screen w-full flex-col items-center justify-center" data-testid="complete-profile-page">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Complete Your Profile</h1>
                    <p className="text-sm text-muted-foreground">
                        Almost there! Let us know your name to complete your account setup.
                    </p>
                </div>

                <ProfileForm
                    userId={user.id}
                    email={user.email || ''}
                />
            </div>
        </div>
    );
}