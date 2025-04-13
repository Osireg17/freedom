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
    ChevronDown,
    Briefcase,
    BookText,
    ListChecks,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const navItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        testId: 'nav-item-dashboard',
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

const interviewTypes = [
    {
        name: 'Job Interview',
        href: '/interviews/job',
        icon: Briefcase,
        testId: 'interview-type-job',
    },
    {
        name: 'Resume Interview',
        href: '/interviews/resume',
        icon: BookText,
        testId: 'interview-type-resume',
    },
    {
        name: 'Custom Interview',
        href: '#',
        icon: ListChecks,
        testId: 'interview-type-custom',
        comingSoon: true,
    },
];

interface AuthenticatedNavigationProps {
    username?: string;
    isMobile?: boolean;
}

export function AuthenticatedNavigation({ username, isMobile = false }: AuthenticatedNavigationProps) {
    const pathname = usePathname();

    const displayName = username || 'Account';

    // Check if any interview path is active
    const isInterviewActive = pathname?.startsWith('/interviews');

    return (
        <div className="flex items-center gap-4" data-testid="auth-navigation">
            {!isMobile ? (
                <>
                    {/* Desktop navigation links */}
                    <nav className="flex items-center gap-4" aria-label="Main navigation">
                        {/* Regular nav items */}
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

                        {/* Interview dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant={isInterviewActive ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "flex items-center gap-1.5 text-sm font-medium",
                                        isInterviewActive && "bg-primary/10 text-primary hover:bg-primary/20"
                                    )}
                                    data-testid="nav-item-interviews"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Practice Interviews</span>
                                    <ChevronDown className="h-3 w-3 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-56">
                                <DropdownMenuLabel>Interview Types</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    {interviewTypes.map((type) => (
                                        <DropdownMenuItem
                                            key={type.testId}
                                            disabled={type.comingSoon}
                                            asChild={!type.comingSoon}
                                            data-testid={type.testId}
                                            className={type.comingSoon ? "cursor-not-allowed opacity-60" : ""}
                                        >
                                            {!type.comingSoon ? (
                                                <Link href={type.href} className="w-full flex items-center">
                                                    <type.icon className="mr-2 h-4 w-4" />
                                                    <span>{type.name}</span>
                                                </Link>
                                            ) : (
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <type.icon className="mr-2 h-4 w-4" />
                                                        <span>{type.name}</span>
                                                    </div>
                                                    <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
                                                </div>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Dashboard, Analytics, Profile links */}
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

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Interview Types</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Interview type links */}
                        {interviewTypes.map((type) => (
                            <DropdownMenuItem
                                key={type.testId}
                                disabled={type.comingSoon}
                                asChild={!type.comingSoon}
                                data-testid={`mobile-${type.testId}`}
                                className={type.comingSoon ? "cursor-not-allowed opacity-60" : ""}
                            >
                                {!type.comingSoon ? (
                                    <Link href={type.href} className="w-full flex items-center">
                                        <type.icon className="mr-2 h-4 w-4" />
                                        <span>{type.name}</span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <type.icon className="mr-2 h-4 w-4" />
                                            <span>{type.name}</span>
                                        </div>
                                        <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />
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