// src/components/auth/verify-email-content.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface VerifyEmailContentProps {
    email?: string;
    type: 'signup' | 'recovery' | 'confirmation';
    message?: string;
}

export default function VerifyEmailContent({
    email = '',
    type = 'confirmation',
    message
}: VerifyEmailContentProps) {
    const router = useRouter();
    const [isResending, setIsResending] = useState(false);
    const { logError } = useErrorLogging();
    const supabase = createClient();

    // Different content based on verification type
    const titles: Record<string, string> = {
        'signup': 'Verify your email',
        'recovery': 'Check your email',
        'confirmation': 'Email verification required',
    };

    const descriptions: Record<string, string> = {
        'signup': 'We\'ve sent a verification link to your email. Please check your inbox and follow the instructions to verify your account.',
        'recovery': 'We\'ve sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password.',
        'confirmation': 'Please verify your email address to continue. Check your inbox for a verification link.',
    };

    // Handle resending verification email
    const handleResendEmail = async () => {
        if (!email) {
            toast.error('Please provide your email address');
            return;
        }

        try {
            setIsResending(true);

            let result;
            if (type === 'recovery') {
                // Resend password reset email
                result = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
            } else {
                // Resend verification email
                result = await supabase.auth.resend({
                    type: 'signup',
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                    }
                });
            }

            if (result.error) {
                toast.error(result.error.message);
                return;
            }

            toast.success(`Verification email resent to ${email}`);
        } catch (error) {
            logError(error, { action: 'resendVerification' });
            toast.error('Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{titles[type]}</CardTitle>
                <CardDescription>
                    {descriptions[type]}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />

                {email && (
                    <div className="text-center mb-4">
                        <p className="font-medium">{email}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            The link will expire in 24 hours
                        </p>
                    </div>
                )}

                {message && (
                    <Alert
                        variant={message.startsWith('Error') ? 'destructive' : 'default'}
                        className="mt-4 mb-2"
                    >
                        {message.startsWith('Error') ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                            {message.startsWith('Error') ? 'Error' : 'Note'}
                        </AlertTitle>
                        <AlertDescription>
                            {message}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="w-full mt-4 space-y-2">
                    <p className="text-sm text-center text-muted-foreground">
                        Didn&apos;t receive an email? Check your spam folder or resend the verification email.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    className="w-full"
                    onClick={handleResendEmail}
                    disabled={isResending || !email}
                    data-testid="resend-email-button"
                >
                    {isResending ? 'Sending...' : 'Resend Email'}
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/sign-in')}
                    data-testid="back-to-sign-in-button"
                >
                    Back to Sign In
                </Button>
                <div className="text-center w-full mt-2">
                    <Link
                        href="/contact"
                        className="text-xs text-muted-foreground hover:text-primary"
                        data-testid="contact-support-link"
                    >
                        Need help? Contact support
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}