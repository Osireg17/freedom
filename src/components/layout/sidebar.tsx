"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Settings,
    UserCircle,
    FileText,
    BarChart,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { SignOutButton } from "../auth/signout-button"

const sidebarItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        testId: "sidebar-item-overview",
    },
    {
        name: "Practice Interviews",
        href: "/interviews",
        icon: FileText,
        testId: "sidebar-item-practice-interviews",
    },
    {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart,
        testId: "sidebar-item-analytics",
    },
    {
        name: "Profile",
        href: "/profile",
        icon: UserCircle,
        testId: "sidebar-item-profile",
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        testId: "sidebar-item-settings",
    },
]

interface SidebarItemProps {
    href: string
    icon: React.ComponentType<{ className?: string }>
    name: string
    isActive: boolean
    isCollapsed: boolean
    testId: string
}

function SidebarItem({ href, icon: Icon, name, isActive, isCollapsed, testId }: SidebarItemProps) {
    return (
        <li>
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href={href}
                            className={cn(
                                "flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                            data-testid={testId}
                            aria-label={name}
                        >
                            <Icon
                                className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-all duration-200",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                                )}
                            />
                            {!isCollapsed && <span className="truncate transition-all duration-200">{name}</span>}
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" sideOffset={18} className="font-medium">
                            {name}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </li>
    )
}

interface DashboardSidebarProps {
    isMobile?: boolean
    isCollapsed?: boolean
    onToggle?: () => void
}

export default function DashboardSidebar({
    isCollapsed: propIsCollapsed,
    onToggle,
}: DashboardSidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(propIsCollapsed)

    // Sync with props when they change
    useEffect(() => {
        setIsCollapsed(propIsCollapsed)
    }, [propIsCollapsed])

    const handleToggle = () => {
        if (onToggle) {
            onToggle()
        } else {
            setIsCollapsed(!isCollapsed)
        }
    }

    return (
        <div
            className={cn(
                "h-full flex flex-col bg-background border-r transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[70px]" : "w-[260px]",
            )}
            data-testid="dashboard-sidebar"
        >
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b px-4">
                <div className="flex w-full items-center">
                    {!isCollapsed ? (
                        <>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
                                <span className="font-bold text-lg">A</span>
                            </div>
                            <span className="ml-3 font-bold text-lg tracking-tight transition-opacity duration-200">
                                AceYourHireVue
                            </span>
                        </>
                    ) : null}

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 rounded-full hover:bg-accent", isCollapsed ? "mx-auto" : "ml-auto")}
                        onClick={handleToggle}
                        data-testid={isCollapsed ? "expand-sidebar-button" : "collapse-sidebar-button"}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto py-6 px-3">
                <nav aria-label="Main Navigation">
                    <ul className="space-y-1.5">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                            return (
                                <SidebarItem
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    name={item.name}
                                    isActive={isActive}
                                    isCollapsed={!!isCollapsed}
                                    testId={item.testId}
                                />
                            )
                        })}
                    </ul>
                </nav>
            </div>

            {/* Help & Support Section */}
            {!isCollapsed ? (
                <div className="mt-auto px-3 mb-4">
                    <div className="bg-muted/40 rounded-lg p-3 shadow-sm border border-border/50">
                        <h4 className="font-medium text-sm mb-2 text-center">Need help?</h4>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-1/2 h-9 text-xs gap-1.5 font-medium"
                                data-testid="help-button"
                            >
                                <HelpCircle className="h-3.5 w-3.5" />
                                Help
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-1/2 h-9 text-xs gap-1.5 font-medium"
                                data-testid="support-button"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Support
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-auto px-3 mb-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="w-full h-9" data-testid="help-button">
                                    <HelpCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Help & Support</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

            {/* Footer with signout */}
            <div className="border-t p-3">
                {isCollapsed ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <SignOutButton
                                        variant="ghost"
                                        size="icon"
                                        showIcon={true}
                                        hideText={true}
                                        className="w-full justify-center text-muted-foreground hover:text-primary h-9"
                                        data-testid="signout-button"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Sign Out</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <SignOutButton
                        variant="ghost"
                        size="sm"
                        showIcon={true}
                        hideText={false}
                        className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent h-9 px-3"
                        data-testid="signout-button"
                    />
                )}
            </div>
        </div>
    )
}
