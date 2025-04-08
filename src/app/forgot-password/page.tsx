// src/app/forgot-password/page.tsx
import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
    title: 'Forgot Password - AceYourHireVue',
    description: 'Reset your password to regain access to your AceYourHireVue account',
};

export default function ForgotPasswordPage() {
    return (
        <div className="container flex h-screen w-full flex-col items-center justify-center" data-testid="forgot-password-page">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we&apos;ll send you a link to reset your password
                    </p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}