'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
import { createUserRecord } from '@/lib/actions/auth-actions';


// Define the profile form schema using zod
const profileSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: 'First name must be at least 2 characters' })
        .max(50, { message: 'First name must be less than 50 characters' }),
    lastName: z
        .string()
        .min(2, { message: 'Last name must be at least 2 characters' })
        .max(50, { message: 'Last name must be less than 50 characters' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    userId: string;
    email: string;
    redirectTo?: string;
}

export default function ProfileForm({ userId, email, redirectTo = '/dashboard' }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { logError } = useErrorLogging();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
        },
    });

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            setIsLoading(true);

            const result = await createUserRecord(
                userId,
                email,
                values.firstName,
                values.lastName
            );

            if (!result.success) {
                toast.error(result.error || 'Failed to create profile');
                return;
            }

            toast.success('Profile created successfully');
            router.push(redirectTo);
            router.refresh(); // Refresh the page to update the session
        } catch (error) {
            logError(error, { action: 'profileForm' });
            toast.error('An error occurred while creating your profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]" data-testid="profile-form-container">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Complete your profile</CardTitle>
                    <CardDescription>
                        Please provide your name to complete your profile
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="profile-form">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    data-testid="profile-firstname-input"
                                                    aria-label="First name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    data-testid="profile-lastname-input"
                                                    aria-label="Last name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                data-testid="profile-submit-button"
                                aria-label="Complete profile"
                            >
                                {isLoading ? 'Saving...' : 'Complete Profile'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}