// src/app/pricing/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { PricingCard } from '@/components/pricing/pricing-card';
import { FeatureComparison } from '@/components/pricing/feature-comparison';
import { FaqSection } from '@/components/pricing/faq-section';

export const metadata: Metadata = {
    title: 'Pricing - AceYourHireVue',
    description: 'Choose the perfect plan to help you prepare for your one-way video interviews',
};

export default function PricingPage() {
    return (
        <div className="w-full" data-testid="pricing-page">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24 bg-muted/50">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1
                            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                            data-testid="pricing-hero-heading"
                        >
                            Simple, Transparent Pricing
                        </h1>
                        <p
                            className="text-xl text-muted-foreground mb-0"
                            data-testid="pricing-hero-description"
                        >
                            Choose the plan that fits your interview preparation needs
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="w-full py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-6 md:grid-cols-3 lg:gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            title="Free"
                            price="Free"
                            description="Get started with basic interview preparation tools"
                            features={[
                                { text: '3 practice interviews per month', included: true },
                                { text: 'Basic question library access', included: true },
                                { text: 'Job description-based questions', included: true },
                                { text: 'Basic STAR method scoring', included: true },
                                { text: 'Retry attempts', included: false },
                                { text: 'Detailed analysis feedback', included: false },
                            ]}
                            buttonText="Get Started"
                            buttonLink="/sign-up"
                            testId="pricing-card-free"
                        />

                        <PricingCard
                            title="Standard"
                            price="£9.99"
                            description="Enhanced feedback and more practice opportunities"
                            features={[
                                { text: '10 practice interviews per month', included: true },
                                { text: 'Full question library access', included: true },
                                { text: '2 retry attempts per question', included: true },
                                { text: 'Detailed STAR method feedback', included: true },
                                { text: 'Speech metrics analysis', included: true },
                                { text: 'Communication quality assessment', included: true },
                            ]}
                            buttonText="Subscribe Now"
                            buttonLink="/sign-up?plan=standard"
                            isPopular={true}
                            testId="pricing-card-standard"
                        />

                        <PricingCard
                            title="Pro"
                            price="£16.99"
                            description="Comprehensive analysis and unlimited practice"
                            features={[
                                { text: 'Unlimited practice interviews', included: true },
                                { text: '3 retry attempts per question', included: true },
                                { text: 'Advanced speech pattern analysis', included: true },
                                { text: 'Interpersonal traits assessment', included: true },
                                { text: 'Industry-specific benchmarking', included: true },
                                { text: 'Unlimited response storage', included: true },
                            ]}
                            buttonText="Go Pro"
                            buttonLink="/sign-up?plan=pro"
                            testId="pricing-card-pro"
                        />
                    </div>
                </div>
            </section>

            {/* Feature Comparison Section */}
            <section className="w-full py-16 bg-muted/50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-6 text-center"
                            data-testid="pricing-comparison-heading"
                        >
                            Compare All Features
                        </h2>
                        <FeatureComparison />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="w-full py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <FaqSection />
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-16 bg-primary/5 border-t">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-4"
                            data-testid="pricing-cta-heading"
                        >
                            Ready to ace your next interview?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Start practicing today with our AI-powered interview platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/sign-up"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium"
                                data-testid="pricing-cta-button"
                                aria-label="Get started with AceYourHireVue"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-background hover:bg-muted border border-input px-8 py-3 rounded-md font-medium"
                                data-testid="pricing-contact-button"
                                aria-label="Contact us for enterprise pricing"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
