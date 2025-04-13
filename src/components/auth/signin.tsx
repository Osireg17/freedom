'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';

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

// Define the sign-in form schema using zod
const signInSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(1, { message: 'Please enter your password' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const { logError } = useErrorLogging();
    const supabase = createClient();

    // Check if there's a redirect parameter
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    // Retrieve messages from URL parameters
    const errorMessage = searchParams.get('error');
    const message = searchParams.get('message');

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Show error toast if error parameter is in URL (only once on mount)
    useEffect(() => {
        if (errorMessage) {
            const errorText =
                errorMessage === 'session_expired'
                    ? 'Your session has expired. Please sign in again.'
                    : 'Authentication error. Please sign in again.';
            toast.error(errorText);
        }
    }, [errorMessage]);

    // Show success message if verification was sent or completed (only once on mount)
    useEffect(() => {
        if (message === 'verification_sent') {
            toast.success('Please check your email to verify your account before signing in.');
        } else if (message === 'verification_complete') {
            toast.success('Your email has been verified! You can now sign in.');
        } else if (message === 'password_reset_complete') {
            toast.success('Your password has been successfully reset! You can now sign in with your new password.');
        }
    }, [message]);

    const onSubmit = async (values: SignInFormValues) => {
        try {
            setIsLoading(true);

            // Sign in with Supabase
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            // Show success message
            toast.success('Signed in successfully');

            // Use a hard navigation to ensure all auth state is properly refreshed
            window.location.href = redirectTo;
        } catch (error) {
            logError(error, { action: 'signIn' });
            toast.error('An error occurred during sign in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]" data-testid="signin-form-container">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>
                        Enter your email and password to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="signin-form">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                {...field}
                                                data-testid="signin-email-input"
                                                aria-label="Email address"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Password</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs text-muted-foreground hover:text-primary"
                                                data-testid="signin-forgot-password-link"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                                data-testid="signin-password-input"
                                                aria-label="Password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                data-testid="signin-submit-button"
                                aria-label="Sign in"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center gap-4 p-4">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/sign-up"
                            className="text-primary hover:underline"
                            data-testid="signin-signup-link"
                        >
                            Sign up
                        </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <Link
                            href="/forgot-password"
                            className="text-primary hover:underline"
                            data-testid="signin-forgot-password-link"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}