// src/components/auth/forgot-password-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Define the form schema using Zod
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { logError } = useErrorLogging();
    const supabase = createClient();

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        try {
            setIsLoading(true);

            // Send password reset email through Supabase
            const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            // Redirect to the verify email page
            router.push(`/verify-email?email=${encodeURIComponent(values.email)}&type=recovery`);
        } catch (error) {
            logError(error, { action: 'forgotPassword' });
            toast.error('An error occurred while sending the reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }

        setIsSubmitted(true);
        toast.success('Password reset link sent! Please check your email.');
    };

    if (isSubmitted) {
        return (
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent you a password reset link. Please check your email and follow the instructions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                    <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-sm text-muted-foreground">
                        The link will expire in 24 hours. If you don&apos;t see the email, please check your spam folder.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/sign-in')}
                        data-testid="back-to-login-button"
                    >
                        Back to Sign In
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Forgot password</CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a reset link
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="forgot-password-form">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="pl-10"
                                                {...field}
                                                data-testid="forgot-password-email-input"
                                                aria-label="Email address"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            data-testid="forgot-password-submit-button"
                            aria-label="Send reset link"
                        >
                            {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link
                    href="/sign-in"
                    className="text-sm text-muted-foreground hover:text-primary"
                    data-testid="back-to-sign-in-link"
                >
                    Back to Sign In
                </Link>
            </CardFooter>
        </Card>
    );
}