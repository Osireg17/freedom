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
            className="flex min-h-screen bg-background"
            data-testid="dashboard-layout"
        >
            {/* Mobile Sidebar (shown only on small screens) */}
            <div className="block lg:hidden absolute top-4 left-4 z-30">
                <DashboardSidebar isMobile={true} />
            </div>

            {/* Desktop Sidebar (hidden on small screens) */}
            <div className="hidden lg:block">
                <DashboardSidebar />
            </div>

            {/* Main Content Area */}
            <main
                className="flex-1 lg:pl-48 p-2 lg:p-4 bg-background"
                data-testid="dashboard-content"
            >
                {children}
            </main>
        </div>
    );
}