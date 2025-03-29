// src/app/sign-in/page.tsx
import { Metadata } from 'next';
import SignIn from '@/components/auth/signin';

export const metadata: Metadata = {
    title: 'Sign In - AceYourHireVue',
    description: 'Sign in to your AceYourHireVue account to continue practicing for interviews',
};

export default function SignInPage() {
    return (
        <div className="container flex h-screen w-full flex-col items-center justify-center" data-testid="signin-page">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account to continue your interview practice
                    </p>
                </div>
                <SignIn />
            </div>
        </div>
    );
}