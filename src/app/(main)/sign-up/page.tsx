// src/app/sign-up/page.tsx
import { Metadata } from 'next';
import SignUp from '@/components/auth/signup';

export const metadata: Metadata = {
    title: 'Sign Up - AceYourHireVue',
    description: 'Create a new account to start practicing for your one-way video interviews',
};

export default function SignUpPage() {
    return (
        <div className="container flex h-screen w-full flex-col items-center justify-center" data-testid="signup-page">
            <div className="mx-auto flex w-full max-w-md sm:max-w-xl flex-col justify-center space-y-6 px-4">

                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Create an Account</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email below to create your account and start practicing
                    </p>
                </div>
                <SignUp />
            </div>
        </div>
    );
}