// src/app/error/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
    searchParams: {
        code?: string;
        message?: string;
    };
}

export const metadata: Metadata = {
    title: 'Error - AceYourHireVue',
    description: 'Something went wrong',
};

export default function ErrorPage({ searchParams }: ErrorPageProps) {
    const errorCode = searchParams.code || 'generic_error';

    // Define error titles and messages based on error code
    const errorMessages: Record<string, { title: string; message: string }> = {
        verification_failed: {
            title: 'Verification Failed',
            message: 'We couldn\'t verify your email. The link may have expired or already been used.',
        },
        callback_error: {
            title: 'Authentication Error',
            message: 'An error occurred during the authentication process. Please try again.',
        },
        session_expired: {
            title: 'Session Expired',
            message: 'Your session has expired. Please sign in again to continue.',
        },
        not_found: {
            title: 'Not Found',
            message: 'The page you were looking for doesn\'t exist or has been moved.',
        },
        generic_error: {
            title: 'Something Went Wrong',
            message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        },
    };

    const { title, message } = errorMessages[errorCode] || errorMessages.generic_error;
    const customMessage = searchParams.message || message;

    return (
        <div className="container flex flex-col items-center justify-center min-h-screen py-12 text-center" data-testid="error-page">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold mb-3" data-testid="error-page-title">{title}</h1>
            <p className="text-muted-foreground max-w-md mb-8" data-testid="error-page-message">
                {customMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    asChild
                    variant="outline"
                    data-testid="error-page-back-button"
                    aria-label="Go back to previous page"
                >
                    <Link href="javascript:history.back()">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Link>
                </Button>

                <Button
                    asChild
                    data-testid="error-page-home-button"
                    aria-label="Go to homepage"
                >
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                    </Link>
                </Button>

                {errorCode === 'verification_failed' && (
                    <Button
                        asChild
                        variant="outline"
                        data-testid="error-page-sign-in-button"
                        aria-label="Go to sign in page"
                    >
                        <Link href="/sign-in">
                            Sign In
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}