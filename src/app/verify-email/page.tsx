// src/app/verify-email/page.tsx
import VerifyEmailContent from '@/components/auth/verify-email-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Verify Email - AceYourHireVue',
    description: 'Please check your email to verify your account or reset your password',
};

interface VerifyEmailPageProps {
    searchParams: { email?: string };
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
    const params = await searchParams;
    const email = params.email || '';

    return (
        <div className="container flex h-screen w-full flex-col items-center justify-center" data-testid="verify-email-page">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <VerifyEmailContent email={email} />
            </div>
        </div>
    );
}