'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignUp } from '@clerk/nextjs';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface VerifyEmailContentProps {
    email?: string;
}

export default function VerifyEmailContent({ email = '' }: VerifyEmailContentProps) {
    const router = useRouter();
    const { signUp } = useSignUp();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async () => {
        if (!signUp) return;
        try {
            setIsLoading(true);
            const { error } = await signUp.verifications.verifyEmailCode({ code });
            if (error) {
                toast.error(error.message);
                return;
            }
            await signUp.finalize({
                navigate: ({ decorateUrl }) => {
                    window.location.href = decorateUrl('/dashboard');
                },
            });
        } catch (err: any) {
            toast.error(err?.message ?? 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!signUp) return;
        try {
            setIsResending(true);
            await signUp.verifications.sendEmailCode();
            toast.success(`Verification code resent to ${email}`);
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to resend verification code.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Verify your email</CardTitle>
                <CardDescription>
                    We sent a verification code to {email || 'your email'}. Enter it below.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4 space-y-4">
                <Mail className="h-12 w-12 text-muted-foreground" />
                <Input
                    placeholder="Enter verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    data-testid="verify-code-input"
                />
                <Button
                    className="w-full"
                    onClick={handleVerify}
                    disabled={isLoading || !code}
                    data-testid="verify-submit-button"
                >
                    {isLoading ? 'Verifying...' : 'Verify email'}
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={isResending}
                    data-testid="resend-email-button"
                >
                    {isResending ? 'Sending...' : 'Resend code'}
                </Button>
                <Button
                    variant="ghost"
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
