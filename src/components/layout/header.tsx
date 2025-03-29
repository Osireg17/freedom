// src/components/layout/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid="header-signin-button"
                        aria-label="Sign in to your account"
                    >
                        <Link href="/auth/sign-in">Sign In</Link>
                    </Button>
                    <Button
                        size="sm"
                        asChild
                        data-testid="header-signup-button"
                        aria-label="Create a new account"
                    >
                        <Link href="/auth/sign-up">Sign Up</Link>
                    </Button>
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
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
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
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                data-testid="header-mobile-signin-button"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Link href="/auth/sign-in">Sign In</Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                                data-testid="header-mobile-signup-button"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Link href="/auth/sign-up">Sign Up</Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
