'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, UserCircle, FileText, BarChart, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SignOutButton } from '@/components/auth/signout-button';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Toggle the sidebar collapse state
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Handle click outside to collapse sidebar on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                window.innerWidth < 768 &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setIsCollapsed(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Set CSS variable for main content margin
    useEffect(() => {
        document.documentElement.style.setProperty(
            '--sidebar-width',
            isCollapsed ? '64px' : '256px'
        );

        // Add or remove a class to the document for responsive styling
        if (isCollapsed) {
            document.documentElement.classList.add('sidebar-collapsed');
            document.documentElement.classList.remove('sidebar-expanded');
        } else {
            document.documentElement.classList.add('sidebar-expanded');
            document.documentElement.classList.remove('sidebar-collapsed');
        }

        return () => {
            // Cleanup
            document.documentElement.classList.remove('sidebar-collapsed', 'sidebar-expanded');
        };
    }, [isCollapsed]);

    // Animation variants
    const sidebarVariants = {
        expanded: { width: 256 },
        collapsed: { width: 64 }
    };

    const itemTextVariants = {
        expanded: { opacity: 1, x: 0, display: "block" },
        collapsed: { opacity: 0, x: -10, display: "none" }
    };

    const iconVariants = {
        expanded: { marginRight: 12 },
        collapsed: { marginRight: 0 }
    };

    return (
        <TooltipProvider>
            <motion.div
                ref={sidebarRef}
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 z-40 h-full bg-black text-white border-r border-gray-800 flex flex-col"
                data-testid="dashboard-sidebar"
            >
                {/* Sidebar Header */}
                <div className="border-b border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={toggleSidebar}
                                        className="flex aspect-square w-8 h-8 items-center justify-center rounded-lg bg-white text-black"
                                        aria-label="Expand sidebar"
                                        data-testid="expand-sidebar-button"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </motion.button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Expand Sidebar</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <Link href="/" className="flex items-center">
                                    <motion.div
                                        className="flex aspect-square w-8 h-8 items-center justify-center rounded-lg bg-white text-black"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span className="font-bold">A</span>
                                    </motion.div>
                                    <motion.div
                                        className="ml-2 flex flex-col gap-0.5 leading-none"
                                        variants={itemTextVariants}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="font-bold text-xl">AceYourHireVue</span>
                                    </motion.div>
                                </Link>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={toggleSidebar}
                                            className="text-gray-400 hover:text-white"
                                            aria-label="Collapse sidebar"
                                            data-testid="collapse-sidebar-button"
                                        >
                                            <X className="h-4 w-4" />
                                        </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Collapse Sidebar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-2">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <motion.li
                                    key={item.href}
                                    whileHover={{ x: 4 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    {isCollapsed ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center rounded-lg p-2 transition-all ${isActive
                                                        ? 'bg-gray-800 text-white'
                                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                        }`}
                                                    data-testid={`sidebar-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                    aria-label={item.name}
                                                >
                                                    <motion.div
                                                        variants={iconVariants}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <item.icon className="h-5 w-5" />
                                                    </motion.div>
                                                    <span className="sr-only">{item.name}</span>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{item.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`flex items-center rounded-lg p-2 transition-all ${isActive
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                }`}
                                            data-testid={`sidebar-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                            aria-label={item.name}
                                        >
                                            <motion.div
                                                variants={iconVariants}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <item.icon className="h-5 w-5" />
                                            </motion.div>

                                            <AnimatePresence>
                                                <motion.span
                                                    variants={itemTextVariants}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-base font-medium"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            </AnimatePresence>
                                        </Link>
                                    )}
                                </motion.li>
                            );
                        })}
                    </ul>
                </div>

                {/* Sidebar Footer with SignOutButton */}
                <div className="border-t border-gray-800 p-4">
                    <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <SignOutButton
                                            variant="ghost"
                                            size="icon"
                                            showIcon={true}
                                            hideText={true}
                                            className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-800"
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
                                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                                data-testid="signout-button"
                            />
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </TooltipProvider>
    );
}