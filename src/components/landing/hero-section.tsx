// src/components/landing/hero-section.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
    return (
        <section className="py-20 md:py-28" data-testid="landing-hero-section">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="space-y-2">
                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter"
                            data-testid="landing-hero-heading"
                        >
                            Excel in Your One-Way{' '}
                            <span className="text-primary">Video Interviews</span>
                        </h1>
                        <p
                            className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
                            data-testid="landing-hero-description"
                        >
                            Practice with AI-powered interview simulations that provide personalised
                            feedback to help you land your dream job.
                        </p>
                    </div>
                    <div
                        className="flex flex-col sm:flex-row gap-3 min-[400px]:gap-4"
                        data-testid="landing-hero-cta-container"
                    >
                        <Button
                            size="lg"
                            asChild
                            data-testid="landing-hero-cta-primary"
                            aria-label="Get started with a free account"
                        >
                            <Link href="/sign-up">Get Started Free</Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            data-testid="landing-hero-cta-secondary"
                            aria-label="See how it works"
                        >
                            <Link href="#how-it-works">See How It Works</Link>
                        </Button>
                    </div>
                    <p
                        className="text-xs text-muted-foreground pt-3"
                        data-testid="landing-hero-promo"
                    >
                        No credit card required. Start with 3 free practice interviews.
                    </p>
                </div>
            </div>
        </section>
    );
}
