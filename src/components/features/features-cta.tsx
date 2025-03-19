"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
    return (
        <section className="py-20 bg-primary/5 border-t" data-testid="features-cta-section">
            <div className="container px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4" data-testid="features-cta-heading">
                        Ready to Ace Your Next Interview?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8" data-testid="features-cta-description">
                        Start practicing today with our AI-powered interview platform
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            asChild
                            data-testid="features-cta-start"
                            aria-label="Get started with AceYourHireVue"
                        >
                            <Link href="/sign-up">Get Started Free</Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            data-testid="features-cta-contact"
                            aria-label="Contact us for more information"
                        >
                            <Link href="/contact">Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
