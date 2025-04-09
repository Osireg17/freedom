// src/components/dashboard/layout/dashboard-layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

// Import dashboard components

import DashboardSidebar from '@/components/layout/sidebar';
import DashboardContent from './dashboard-content';



interface DashboardLayoutProps {
    user: User;
    children?: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
    const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed'>('expanded');
    const [isMobile, setIsMobile] = useState(false);

    // Check if screen is mobile size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarState('collapsed');
            }
        };

        // Check on initial load
        checkMobile();

        // Add window resize listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle sidebar toggle
    const toggleSidebar = () => {
        setSidebarState(sidebarState === 'expanded' ? 'collapsed' : 'expanded');
    };

    return (
        <div
            className="flex min-h-screen bg-background"
            data-testid="dashboard-layout-container"
        >
            {/* Sidebar - passes the current state and toggle function */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-30 transition-all duration-300",
                sidebarState === 'expanded' ? 'w-64' : 'w-16'
            )}>
                <DashboardSidebar
                    isMobile={isMobile}
                    isCollapsed={sidebarState === 'collapsed'}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Main Content */}
            <div className={cn(
                "flex-grow transition-all duration-300",
                sidebarState === 'expanded' ? 'lg:ml-64' : 'lg:ml-16',
                "w-full"
            )}>
                {/* Main Content Area */}
                <main className="p-4 sm:p-6 md:p-8 bg-background">
                    <DashboardContent user={user}>
                        {children}
                    </DashboardContent>
                </main>
            </div>
        </div>
    );
}