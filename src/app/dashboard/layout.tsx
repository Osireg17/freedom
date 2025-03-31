// src/app/dashboard/layout.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Protect the route - this will redirect to sign-in if the user is not authenticated
    await protectRoute();

    return (
        <div className="flex w-full h-screen" data-testid="dashboard-layout">
            {/* Fixed-width sidebar */}
            <div className="w-64 h-screen bg-black flex-shrink-0 fixed left-0 top-0 bottom-0 border-r border-gray-800">
                <DashboardSidebar />
            </div>

            {/* Main content with left margin to accommodate sidebar */}
            <main className="ml-64 flex-1 p-6 bg-background overflow-y-auto" data-testid="dashboard-content">
                {children}
            </main>
        </div>
    );
}