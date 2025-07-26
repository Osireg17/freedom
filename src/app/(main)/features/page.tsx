// src/app/features/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mic, BarChart, Star, } from 'lucide-react';
import { VideoDemo } from '@/components/features/video-demo';
import { FeatureCard } from '@/components/features/features-card';
import { featureCards, videoSections } from '@/components/features/features';
import ErrorBoundary from '@/components/error/error-boundary';

export const metadata: Metadata = {
    title: 'Features - AceYourHireVue',
    description: 'Discover all the powerful features of AceYourHireVue for acing your one-way video interviews',
};

interface FeatureSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
    testId: string;
}

function FeatureSection({ title, description, children, testId }: FeatureSectionProps) {
    return (
        <section
            className="py-16 border-b last:border-b-0"
            data-testid={testId}
        >
            <div className="space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4" data-testid={`${testId}-heading`}>
                        {title}
                    </h2>
                    <p className="text-lg text-muted-foreground" data-testid={`${testId}-description`}>
                        {description}
                    </p>
                </div>

                {children}
            </div>
        </section>
    );
}

export default function FeaturesPage() {
    return (
        <div className="container py-12 md:py-16" data-testid="features-page">
            {/* Hero section */}
            <section className="text-center mb-16" data-testid="features-hero-section">
                <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="features-page-heading">
                    Ace Every One-Way Interview
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="features-page-description">
                    AceYourHireVue provides powerful tools specifically designed to help you master
                    one-way video interviews. Explore our comprehensive feature set below.
                </p>
            </section>

            {/* Features overview */}
            <ErrorBoundary
                fallback={
                    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Feature Overview</h2>
                        <p className="text-gray-600 mb-4">
                            We&apos;re currently having trouble loading our feature information.
                            Please check back later or <Link href="/contact" className="text-primary hover:underline">contact us</Link> for details.
                        </p>
                    </div>
                }
            >
                <FeatureSection
                    title="Feature Overview"
                    description="AceYourHireVue offers a complete suite of tools to help you prepare, practice, and perfect your interview skills."
                    testId="features-overview-section"
                >
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featureCards.map((card) => (
                            <FeatureCard
                                key={card.testId}
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                details={card.details}
                                isNew={card.isNew}
                                testId={card.testId}
                            />
                        ))}
                    </div>
                </FeatureSection>
            </ErrorBoundary>

            {/* Video demonstrations */}
            <ErrorBoundary
                fallback={
                    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Video Demonstrations</h2>
                        <p className="text-gray-600 mb-4">
                            We&apos;re experiencing an issue loading our demonstration videos.
                            Please try again later or explore other sections of our features page.
                        </p>
                    </div>
                }
            >
                <FeatureSection
                    title="See AceYourHireVue in Action"
                    description="Watch these video demonstrations to learn how to maximize each feature and improve your interview performance."
                    testId="features-videos-section"
                >
                    <div className="grid md:grid-cols-2 gap-8">
                        {videoSections.map((demo) => (
                            <div key={demo.testId} className="space-y-3" data-testid={`${demo.testId}-container`}>
                                <h3 className="text-xl font-bold" data-testid={`${demo.testId}-title`}>{demo.title}</h3>
                                <p className="text-muted-foreground" data-testid={`${demo.testId}-description`}>
                                    {demo.description}
                                </p>
                                <VideoDemo
                                    title={demo.videoTitle}
                                    description={demo.videoDescription}
                                    testId={demo.testId}
                                />
                            </div>
                        ))}
                    </div>
                </FeatureSection>
            </ErrorBoundary>

            {/* How it works section */}
            <ErrorBoundary
                fallback={
                    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md">
                        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                        <p className="text-gray-600 mb-4">
                            We&apos;re currently having trouble displaying our process information.
                            Check back soon or <Link href="/contact" className="text-primary hover:underline">contact our support team</Link> with any questions about how AceYourHireVue works.
                        </p>
                    </div>
                }
            >
                <FeatureSection
                    title="How It Works"
                    description="Our four-step process makes interview preparation simple and effective."
                    testId="features-how-it-works-section"
                >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                        {[
                            {
                                icon: <FileText className="h-8 w-8 text-primary" />,
                                title: "Create Your Session",
                                description: "Upload a job description or resume to generate relevant interview questions.",
                                testId: "how-it-works-step-1"
                            },
                            {
                                icon: <Mic className="h-8 w-8 text-primary" />,
                                title: "Practice Your Answers",
                                description: "Record your responses to questions, with options to retry up to 3 times.",
                                testId: "how-it-works-step-2"
                            },
                            {
                                icon: <Star className="h-8 w-8 text-primary" />,
                                title: "Receive AI Feedback",
                                description: "Get detailed analysis on your content, delivery, and communication style.",
                                testId: "how-it-works-step-3"
                            },
                            {
                                icon: <BarChart className="h-8 w-8 text-primary" />,
                                title: "Track Your Progress",
                                description: "Monitor your improvement over time and focus on areas that need attention.",
                                testId: "how-it-works-step-4"
                            }
                        ].map((step) => (
                            <div
                                key={step.testId}
                                className="flex flex-col items-center text-center"
                                data-testid={step.testId}
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2" data-testid={`${step.testId}-title`}>{step.title}</h3>
                                <p className="text-muted-foreground" data-testid={`${step.testId}-description`}>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </FeatureSection>
            </ErrorBoundary>

            {/* CTA Section */}
            <ErrorBoundary
                fallback={
                    <section className="py-12 mt-12 text-center">
                        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md">
                            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                            <p className="text-gray-600 mb-4">
                                Visit our homepage to learn more about AceYourHireVue.
                            </p>
                            <Button asChild>
                                <Link href="/">Go to Homepage</Link>
                            </Button>
                        </div>
                    </section>
                }
            >
                <section className="py-12 mt-12 text-center" data-testid="features-cta-section">
                    <Card className="max-w-4xl mx-auto">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl md:text-3xl">Ready to ace your next interview?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-lg text-muted-foreground">
                                Start practicing today with our AI-powered platform and transform your interview performance.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    asChild
                                    data-testid="features-cta-button-primary"
                                    aria-label="Sign up for a free account"
                                >
                                    <Link href="/sign-up">Start Free Trial</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    data-testid="features-cta-button-secondary"
                                    aria-label="Learn more about how our platform works"
                                >
                                    <Link href="/contact">Contact Sales</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </ErrorBoundary>
        </div>
    );
}