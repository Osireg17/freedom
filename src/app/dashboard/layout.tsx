// src/app/dashboard/layout.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This will redirect to sign-in if the user is not authenticated
    await protectRoute();

    // The container is minimal now as the actual layout is handled by the DashboardLayout component
    return (
        <div className='container py-8 max-w-4xl mx-auto' data-testid="dashboard-container">
            {children}
        </div>
    );
}