// src/components/layout/auth-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '../auth/signout-button';
import {
    Home,
    FileText,
    BarChart,
    UserCircle,
    Settings,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        testId: 'nav-item-dashboard',
    },
    {
        name: 'Practice Interviews',
        href: '/interviews',
        icon: FileText,
        testId: 'nav-item-interviews',
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart,
        testId: 'nav-item-analytics',
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: UserCircle,
        testId: 'nav-item-profile',
    },
];

interface AuthenticatedNavigationProps {
    username?: string;
    isMobile?: boolean;
}

export function AuthenticatedNavigation({ username, isMobile = false }: AuthenticatedNavigationProps) {
    const pathname = usePathname();

    const displayName = username || 'Account';

    return (
        <div className="flex items-center gap-4" data-testid="auth-navigation">
            {!isMobile ? (
                <>
                    {/* Desktop navigation links */}
                    <nav className="flex items-center gap-4" aria-label="Main navigation">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    data-testid={item.testId}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User profile dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto gap-1"
                                data-testid="user-menu-trigger"
                            >
                                <UserCircle className="h-4 w-4" />
                                <span>{displayName}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile" data-testid="dropdown-profile-link">
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" data-testid="dropdown-settings-link">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <SignOutButton
                                    variant="ghost"
                                    size="sm"
                                    showIcon={true}
                                    className="w-full justify-start cursor-pointer"
                                    data-testid="dropdown-signout-button"
                                />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                // Mobile dropdown menu for all navigation
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            data-testid="mobile-menu-button"
                        >
                            <span>{displayName}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {navItems.map((item) => (
                            <DropdownMenuItem
                                key={item.href}
                                asChild
                                data-testid={`mobile-${item.testId}`}
                            >
                                <Link href={item.href} className="w-full">
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuItem asChild>
                            <Link href="/settings" data-testid="mobile-dropdown-settings-link">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <SignOutButton
                                variant="ghost"
                                size="sm"
                                showIcon={true}
                                className="w-full justify-start cursor-pointer"
                                data-testid="mobile-dropdown-signout-button"
                            />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}