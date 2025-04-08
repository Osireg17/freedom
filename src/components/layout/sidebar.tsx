// src/components/layout/sidebar/dashboard-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Home,
    Settings,
    UserCircle,
    FileText,
    BarChart,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { SignOutButton } from '@/components/auth/signout-button';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarItems = [
    {
        name: 'Overview',
        href: '/dashboard',
        icon: Home,
        testId: 'sidebar-item-overview'
    },
    {
        name: 'Practice Interviews',
        href: '/dashboard/interviews',
        icon: FileText,
        testId: 'sidebar-item-practice-interviews'
    },
    {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart,
        testId: 'sidebar-item-analytics'
    },
    {
        name: 'Profile',
        href: '/dashboard/profile',
        icon: UserCircle,
        testId: 'sidebar-item-profile'
    },
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        testId: 'sidebar-item-settings'
    },
];

interface SidebarItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    name: string;
    isActive: boolean;
    isCollapsed: boolean;
    testId: string;
}

function SidebarItem({ href, icon: Icon, name, isActive, isCollapsed, testId }: SidebarItemProps) {
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    "flex items-center gap-x-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                )}
                data-testid={testId}
                aria-label={name}
            >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {!isCollapsed && <span>{name}</span>}
            </Link>
        </li>
    );
}

interface DashboardSidebarProps {
    isMobile?: boolean;
}

export default function DashboardSidebar({ isMobile = false }: DashboardSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        // Set initial collapse state based on screen size
        if (typeof window !== 'undefined') {
            const isSmallScreen = window.innerWidth < 1024;
            setIsCollapsed(isSmallScreen);
        }
    }, []);

    // For mobile, we use the Sheet component for responsive sliding drawer
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="lg:hidden"
                        data-testid="mobile-sidebar-toggle"
                        aria-label="Open menu"
                    >
                        <Home className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0" data-testid="mobile-sidebar">
                    <div className="flex h-full flex-col">
                        {/* Logo */}
                        <div className="flex h-14 items-center border-b px-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <span className="font-bold">A</span>
                                </div>
                                <span className="font-bold">AceYourHireVue</span>
                            </Link>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-auto py-4">
                            <ul className="space-y-1 px-2">
                                {sidebarItems.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    return (
                                        <SidebarItem
                                            key={item.href}
                                            href={item.href}
                                            icon={item.icon}
                                            name={item.name}
                                            isActive={isActive}
                                            isCollapsed={false}
                                            testId={item.testId}
                                        />
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="border-t p-4">
                            <SignOutButton
                                variant="ghost"
                                size="sm"
                                showIcon={true}
                                hideText={false}
                                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent"
                                data-testid="signout-button"
                            />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop sidebar
    return (
        <TooltipProvider>
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-background transition-all",
                    isCollapsed ? "w-16" : "w-64"
                )}
                data-testid="dashboard-sidebar"
            >
                {/* Logo */}
                <div className="flex h-14 items-center border-b px-4">
                    {isCollapsed ? (
                        <Link href="/" className="flex items-center justify-center w-full">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <span className="font-bold">A</span>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex w-full items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <span className="font-bold">A</span>
                                </div>
                                <span className="font-bold">AceYourHireVue</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-auto py-4">
                    <ul className="space-y-1 px-2">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <SidebarItem
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    name={item.name}
                                    isActive={isActive}
                                    isCollapsed={isCollapsed}
                                    testId={item.testId}
                                />
                            );
                        })}
                    </ul>
                </div>

                {/* Footer with collapsible toggle and sign out */}
                <div className="border-t p-2">
                    <div className="flex items-center justify-between p-2">
                        {!isCollapsed && (
                            <span className="text-xs text-muted-foreground">
                                AceYourHireVue
                            </span>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSidebar}
                                    data-testid={isCollapsed ? "expand-sidebar-button" : "collapse-sidebar-button"}
                                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                >
                                    {isCollapsed ? (
                                        <ChevronRight className="h-4 w-4" />
                                    ) : (
                                        <ChevronLeft className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="mt-2">
                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <SignOutButton
                                            variant="ghost"
                                            size="icon"
                                            showIcon={true}
                                            hideText={true}
                                            className="w-full justify-center text-muted-foreground hover:text-primary"
                                            data-testid="signout-button"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Sign Out</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <SignOutButton
                                variant="ghost"
                                size="sm"
                                showIcon={true}
                                hideText={false}
                                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent"
                                data-testid="signout-button"
                            />
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}