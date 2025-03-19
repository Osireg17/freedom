// src/app/features/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mic, BarChart, Repeat, Star, BookMarked } from 'lucide-react';
import { VideoDemo } from '@/components/features/video-demo';
import { FeatureCard } from '@/components/features/features-card';

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
    // Feature cards for the Overview section
    const featureCards = [
        {
            icon: <FileText className="h-6 w-6 text-primary" />,
            title: "Contextual Question Generation",
            description: "Generate interview questions based on job descriptions and your resume",
            details: [
                "Upload job descriptions to create tailored question sets",
                "Generate questions based on your resume and experience",
                "Questions adapt to your experience level",
                "Industry-specific question targeting"
            ],
            testId: "feature-card-questions",
            isNew: false
        },
        {
            icon: <Repeat className="h-6 w-6 text-primary" />,
            title: "Practice & Refinement",
            description: "Record, review, and refine your responses to perfect your interview technique",
            details: [
                "Record video responses to practice questions",
                "Review your recordings with AI analysis",
                "Retry answers up to three times (depending on plan)",
                "Compare different versions of your answers"
            ],
            testId: "feature-card-practice",
            isNew: false
        },
        {
            icon: <Star className="h-6 w-6 text-primary" />,
            title: "STAR Method Evaluation",
            description: "Receive guidance on structuring effective responses using the STAR framework",
            details: [
                "Analysis of Situation, Task, Action, and Result components",
                "Specific feedback on improving each component",
                "Tips for creating well-balanced responses",
            ],
            testId: "feature-card-star",
            isNew: false
        },
        {
            icon: <Mic className="h-6 w-6 text-primary" />,
            title: "Communication Analysis",
            description: "Get detailed feedback on your verbal communication style and delivery",
            details: [
                "Speaking pace and clarity assessment",
                "Filler word detection and reduction tips",
                "Vocal variety and engagement analysis",
                "Confidence and persuasiveness metrics"
            ],
            testId: "feature-card-communication",
            isNew: true
        },
        {
            icon: <BarChart className="h-6 w-6 text-primary" />,
            title: "Progress Tracking",
            description: "Monitor your improvement with detailed analytics and performance metrics",
            details: [
                "Track improvement across multiple practice sessions",
                "Identify strengths and weaknesses by question category",
                "View detailed communication and content metrics",
                "Set improvement goals based on analytics"
            ],
            testId: "feature-card-analytics",
            isNew: false
        },
        {
            icon: <BookMarked className="h-6 w-6 text-primary" />,
            title: "Question Library",
            description: "Access a comprehensive library of interview questions by industry and role",
            details: [
                "Thousands of real interview questions",
                "Filter by industry, company, and position",
                "Browse behavioral, technical, and situational questions",
                "Create custom practice sessions"
            ],
            testId: "feature-card-library",
            isNew: true
        },
    ];

    // Video demonstrations with descriptions
    const videoSections = [
        {
            title: "Creating Job-Based Interview Sessions",
            description: "Learn how to generate relevant interview questions by uploading a job description",
            videoTitle: "Job Description Interview Generator",
            videoDescription: "This tutorial walks you through uploading a job description and configuring your practice session settings to generate customized interview questions that match the specific requirements of the position you're applying for.",
            testId: "video-demo-job-based"
        },
        {
            title: "Resume-Based Interview Preparation",
            description: "See how AceYourHireVue analyzes your resume to create personalized practice questions",
            videoTitle: "Resume Analysis and Question Generation",
            videoDescription: "This demonstration shows the resume parsing process and how our AI generates tailored questions based on your specific experience, skills, and potential gap areas that might come up in interviews.",
            testId: "video-demo-resume-based"
        },
        {
            title: "Mastering the STAR Method with AI Feedback",
            description: "Discover how detailed STAR method analysis helps improve your response structure",
            videoTitle: "STAR Method Evaluation Walkthrough",
            videoDescription: "This tutorial explains how our AI analyzes your responses using the Situation, Task, Action, Result framework, with examples of how to improve each component based on the feedback provided.",
            testId: "video-demo-star-method"
        },
        {
            title: "Communication Skills Assessment",
            description: "See how speech analysis provides insights to improve your verbal communication",
            videoTitle: "Speech Pattern and Delivery Analysis",
            videoDescription: "This video demonstrates our advanced speech analysis features, including pace, clarity, filler word detection, and speaking confidence metrics, with tips on how to interpret and act on this feedback.",
            testId: "video-demo-speech-analysis"
        }
    ];

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

            {/* Video demonstrations */}
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

            {/* How it works section */}
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

            {/* CTA Section */}
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
        </div>
    );
}