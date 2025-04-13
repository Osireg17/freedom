// src/components/auth/signout-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SignOutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showIcon?: boolean;
    hideText?: boolean;
    className?: string;
}

export function SignOutButton({
    variant = 'outline',
    size = 'default',
    showIcon = true,
    hideText = false,
    className = ''
}: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { logError } = useErrorLogging();
    const supabase = createClient();

    const handleSignOut = async () => {
        try {
            setIsLoading(true);

            // Sign out using the Supabase client
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            // Show success message
            toast.success('Signed out successfully');

            // Force a hard navigation to the home page instead of using router.push
            // This will cause a full page reload and ensure all auth state is refreshed
            window.location.href = '/';
        } catch (error) {
            logError(error, { action: 'signOutButton' });
            toast.error('Failed to sign out. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={hideText && showIcon ? 'icon' : size}
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
                    {showIcon && <LogOut className={hideText ? "" : "mr-2"} size={16} />}
                    {!hideText && <span>Sign out</span>}
                </>
            )}
        </Button>
    );
}