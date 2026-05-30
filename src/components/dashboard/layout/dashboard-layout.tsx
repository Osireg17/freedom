// src/components/dashboard/layout/dashboard-layout.tsx
'use client';

import DashboardContent from './dashboard-content';

export interface DashboardUser {
    firstName: string | null;
    lastName: string | null;
}

interface DashboardLayoutProps {
    user: DashboardUser;
    children?: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background" data-testid="dashboard-layout-container">
            <main className="w-full p-4 sm:p-6 md:p-8">
                <DashboardContent user={user}>
                    {children}
                </DashboardContent>
            </main>
        </div>
    );
}