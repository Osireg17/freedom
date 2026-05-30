// src/components/auth/signout-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { useClerk } from '@clerk/nextjs';
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
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        try {
            setIsLoading(true);

            // Sign out using the Clerk client
            await signOut({ redirectUrl: '/' });

            // Show success message
            toast.success('Signed out successfully');
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