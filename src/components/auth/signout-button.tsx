'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { signOut } from '@/lib/actions/auth-actions';

interface SignOutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showIcon?: boolean;
}

export function SignOutButton({
    variant = 'outline',
    size = 'default',
    showIcon = true
}: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { logError } = useErrorLogging();

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await signOut();
            // The redirect will happen automatically in the server action
        } catch (error) {
            logError(error, { action: 'signOutButton' });
            // The server action should handle redirects even on error
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