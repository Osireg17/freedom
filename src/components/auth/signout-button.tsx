// src/components/auth/signout-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SignOutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showIcon?: boolean;
    className?: string;
}

export function SignOutButton({
    variant = 'outline',
    size = 'default',
    showIcon = true,
    className = ''
}: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { logError } = useErrorLogging();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        try {
            setIsLoading(true);

            // Sign out using the Supabase client
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            // Refresh the router to update UI state
            router.refresh();

            // Redirect to home page
            router.push('/');

            // Show success message
            toast.success('Signed out successfully');
        } catch (error) {
            logError(error, { action: 'signOutButton' });
            toast.error('Failed to sign out. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleSignOut}
            disabled={isLoading}
            data-testid="sign-out-button"
            aria-label="Sign out of your account"
            className={className}
        >
            {isLoading ? (
                'Signing out...'
            ) : (
                <>
                    {showIcon && <LogOut className="mr-2 h-4 w-4" />}
                    Sign out
                </>
            )}
        </Button>
    );
}