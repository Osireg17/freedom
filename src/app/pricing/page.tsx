// src/app/pricing/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { PricingCard } from '@/components/pricing/pricing-card';
import { FeatureComparison } from '@/components/pricing/feature-comparison';
import { FaqSection } from '@/components/pricing/faq-section';
import ErrorBoundary from '@/components/error/error-boundary';
import { logServerError } from '@/lib/error/logger';

export const metadata: Metadata = {
    title: 'Pricing - AceYourHireVue',
    description: 'Choose the perfect plan to help you prepare for your one-way video interviews',
};

const PricingPage = () => {
    try {
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
                            <ErrorBoundary>
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
                            </ErrorBoundary>

                            <ErrorBoundary>
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
                            </ErrorBoundary>

                            <ErrorBoundary>
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
                            </ErrorBoundary>
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
                            <ErrorBoundary
                                fallback={
                                    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                            Feature Comparison Unavailable
                                        </h2>
                                        <p className="text-gray-600 mb-4">
                                            We&apos;re experiencing technical difficulties loading the feature comparison.
                                            Please try again later or contact support if the issue persists.
                                        </p>
                                    </div>
                                }
                            >
                                <FeatureComparison />
                            </ErrorBoundary>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="w-full py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <ErrorBoundary
                            fallback={
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Our FAQ section is currently unavailable.
                                        If you have questions, please <Link href="/contact" className="text-primary hover:underline">contact our support team</Link>.
                                    </p>
                                </div>
                            }
                        >
                            <FaqSection />
                        </ErrorBoundary>
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
    } catch (error) {
        // Log any errors during page rendering
        logServerError(error instanceof Error ? error : new Error('Unknown error in PricingPage'), {
            component: 'PricingPage',
            path: '/pricing'
        });

        // Re-throw to let Next.js error page handle it
        throw error;
    }
}

export default PricingPage;