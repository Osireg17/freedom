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
                className="ml-64 flex-1 px-8 py-6 bg-background overflow-y-auto space-y-6"
                data-testid="dashboard-content"
            >
                {children}
            </main>
        </div>
    );
}
