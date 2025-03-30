// src/components/auth/reset-password-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Eye, EyeOff, Lock } from 'lucide-react';

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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Define the reset password form schema using zod
const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long' })
            .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
            .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
            .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { logError } = useErrorLogging();
    const supabase = createClient();

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        mode: 'onBlur',
    });

    const watchPassword = form.watch('password');

    const passwordRequirements = [
        { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
        { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
        { id: 'number', label: 'One number', regex: /[0-9]/ },
    ];

    const onSubmit = async (values: ResetPasswordFormValues) => {
        try {
            setIsLoading(true);

            // Update user's password
            const { error } = await supabase.auth.updateUser({
                password: values.password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            // Show success message and redirect
            toast.success('Password reset successfully!');
            router.push('/sign-in?message=password_reset_complete');
        } catch (error) {
            logError(error, { action: 'resetPassword' });
            toast.error('An error occurred while resetting your password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Create new password</CardTitle>
                <CardDescription>
                    Your new password must be different from previously used passwords
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="reset-password-form">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10"
                                                {...field}
                                                data-testid="reset-password-password-input"
                                                aria-label="New password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 top-1 h-8 w-8 p-0"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password requirements */}
                        <div className="space-y-2 rounded-md bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                {passwordRequirements.map((req) => (
                                    <li key={req.id} className="flex items-center gap-2 text-xs">
                                        {watchPassword && req.regex.test(watchPassword) ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        <span
                                            className={
                                                watchPassword && req.regex.test(watchPassword) ? 'text-foreground' : 'text-muted-foreground'
                                            }
                                        >
                                            {req.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10"
                                                {...field}
                                                data-testid="reset-password-confirm-input"
                                                aria-label="Confirm password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 top-1 h-8 w-8 p-0"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">
                                                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                                                </span>
                                            </Button>
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
                            data-testid="reset-password-submit-button"
                            aria-label="Reset password"
                        >
                            {isLoading ? 'Resetting password...' : 'Reset Password'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}