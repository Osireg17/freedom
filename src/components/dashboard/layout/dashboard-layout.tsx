// src/components/dashboard/layout/dashboard-layout.tsx
'use client';

import { User } from '@supabase/supabase-js';
import DashboardContent from './dashboard-content';

interface DashboardLayoutProps {
    user: User;
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