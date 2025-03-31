// src/components/dashboard/dashboard-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, UserCircle, FileText, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@/components/auth/signout-button';

const sidebarItems = [
    {
        name: 'Overview',
        href: '/dashboard',
        icon: Home,
    },
    {
        name: 'Practice Interviews',
        href: '/dashboard/interviews',
        icon: FileText,
    },
    {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart,
    },
    {
        name: 'Profile',
        href: '/dashboard/profile',
        icon: UserCircle,
    },
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full text-white" data-testid="dashboard-sidebar">
            {/* Logo area */}
            <div className="p-4 border-b border-gray-800">
                <Link href="/" className="flex items-center">
                    <span className="font-bold text-xl">AceYourHireVue</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                            )}
                            data-testid={`sidebar-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out button */}
            <div className="p-4 border-t border-gray-800 mt-auto">
                <SignOutButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                    showIcon={true}
                />
            </div>
        </div>
    );
}