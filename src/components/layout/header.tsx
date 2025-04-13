// src/components/layout/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthenticatedNavigation } from './auth-navigation';
import { useMediaQuery } from '@/hooks/use-media-query';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 1024px)");

    // Don't render header on error pages
    const isErrorPage = pathname && pathname.startsWith('/error');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isDashboardPathname = pathname &&
        (pathname.startsWith('/dashboard') ||
            pathname.startsWith('/interviews') ||
            pathname.startsWith('/analytics') ||
            pathname.startsWith('/profile') ||
            pathname.startsWith('/settings'));

    useEffect(() => {
        async function getUser() {
            setIsLoading(true);
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error('Error getting user:', error);
            } finally {
                setIsLoading(false);
            }
        }

        getUser();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    if (isErrorPage) return null;

    return (
        <header
            className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            data-testid="site-header"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-xl"
                        data-testid="header-logo-link"
                        aria-label="AceYourHireVue home"
                    >
                        <span className="text-primary">AceYourHireVue</span>
                    </Link>
                </div>

                {!isLoading && user ? (
                    <AuthenticatedNavigation
                        username={user.user_metadata?.first_name}
                        isMobile={isMobile}
                    />
                ) : (
                    <>
                        {/* Default navigation for non-authenticated users */}
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                            <Link
                                href="/features"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                data-testid="header-nav-features"
                            >
                                Features
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                data-testid="header-nav-pricing"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/contact"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                data-testid="header-nav-contact"
                            >
                                Contact
                            </Link>
                        </nav>

                        {/* Authentication Buttons - Desktop */}
                        <div className="hidden md:flex items-center gap-4">
                            {!isLoading && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        data-testid="header-signin-button"
                                        aria-label="Sign in to your account"
                                    >
                                        <Link href="/sign-in">Sign In</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        asChild
                                        data-testid="header-signup-button"
                                        aria-label="Create a new account"
                                    >
                                        <Link href="/sign-up">Sign Up</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="flex md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            data-testid="header-mobile-menu-button"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </>
                )}
            </div>

            {/* Mobile Menu - Only for non-authenticated users */}
            {isMenuOpen && !user && (
                <div
                    className="container mx-auto md:hidden pb-4 px-4"
                    data-testid="header-mobile-menu"
                >
                    <nav className="flex flex-col space-y-4" aria-label="Mobile navigation">
                        <Link
                            href="/features"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            data-testid="header-mobile-nav-features"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            data-testid="header-mobile-nav-pricing"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium hover:text-primary transition-colors"
                            data-testid="header-mobile-nav-contact"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </Link>
                        <div className="flex flex-col space-y-2 pt-2">
                            {!isLoading && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        data-testid="header-mobile-signin-button"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Link href="/sign-in">Sign In</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        asChild
                                        data-testid="header-mobile-signup-button"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Link href="/sign-up">Sign Up</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}