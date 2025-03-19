// src/components/landing/cta-section.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
    return (
        <section className="py-20" data-testid="landing-cta-section">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                    <div className="space-y-3">
                        <h2
                            className="text-3xl font-bold tracking-tighter md:text-4xl"
                            data-testid="landing-cta-heading"
                        >
                            Ready to Ace Your Next Interview?
                        </h2>
                        <p
                            className="mx-auto max-w-[600px] text-muted-foreground md:text-lg"
                            data-testid="landing-cta-description"
                        >
                            Start practicing today with our AI-powered interview preparation
                            platform
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90"
                            asChild
                            data-testid="landing-cta-button-primary"
                            aria-label="Create a free account"
                        >
                            <Link href="/sign-up">Start Free Trial</Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            data-testid="landing-cta-button-secondary"
                            aria-label="View pricing plans"
                        >
                            <Link href="/pricing">View Pricing</Link>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="landing-cta-note">
                        No credit card required. Get started with our free tier instantly.
                    </p>
                </div>
            </div>
        </section>
    );
}
