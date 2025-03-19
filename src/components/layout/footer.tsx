// src/components/layout/footer.tsx
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full border-t bg-muted/50" data-testid="site-footer">
            <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3 md:text-left text-center">
                        <h3 className="text-lg font-bold" data-testid="footer-company-heading">
                            AceYourHireVue
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
                            AI-powered interview preparation to help you excel in one-way interviews
                            and land your dream job.
                        </p>
                        <div className="flex space-x-4 justify-center md:justify-start">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary"
                                data-testid="footer-social-twitter"
                                aria-label="Follow us on Twitter"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary"
                                data-testid="footer-social-linkedin"
                                aria-label="Connect with us on LinkedIn"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h4
                            className="text-sm font-medium mb-4"
                            data-testid="footer-product-heading"
                        >
                            Product
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/features"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-features"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-pricing"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/testimonials"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-testimonials"
                                >
                                    Testimonials
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h4
                            className="text-sm font-medium mb-4"
                            data-testid="footer-company-links-heading"
                        >
                            Company
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-about"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-contact"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/careers"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-careers"
                                >
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-sm font-medium mb-4" data-testid="footer-legal-heading">
                            Legal
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-privacy"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    data-testid="footer-link-terms"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
                    <p data-testid="footer-copyright">
                        &copy; {new Date().getFullYear()} AceYourHireVue. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
