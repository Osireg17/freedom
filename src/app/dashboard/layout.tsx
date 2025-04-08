// src/app/dashboard/layout.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import DashboardSidebar from '@/components/layout/sidebar';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await protectRoute();

    return (
        <div
            className="flex w-full min-h-screen bg-background"
            data-testid="dashboard-layout"
        >
            <DashboardSidebar />

            <main
                className="flex-1 p-4 lg:p-8 bg-background"
                data-testid="dashboard-content"
            >
                {children}
            </main>
        </div>
    );
}
