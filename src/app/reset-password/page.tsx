// src/app/reset-password/page.tsx
import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
    title: 'Reset Password - AceYourHireVue',
    description: 'Set a new password for your AceYourHireVue account',
};

export default function ResetPasswordPage() {
    return (
        <div className="container flex h-screen w-full flex-col items-center justify-center" data-testid="reset-password-page">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new password for your account
                    </p>
                </div>
                <ResetPasswordForm />
            </div>
        </div>
    );
}