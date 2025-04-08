'use client';

import { AuthProvider } from '@/components/auth/auth-provider';

interface AuthLayoutProps {
    children: React.ReactNode;
}

/**
 * Layout component that wraps the application with the AuthProvider
 * This provides authentication context to all components in the app
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return <AuthProvider>{children}</AuthProvider>;
}