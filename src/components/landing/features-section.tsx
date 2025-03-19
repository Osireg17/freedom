// src/components/landing/features-section.tsx
import { FileText, Mic, BarChart, Repeat, Star, BookOpen } from 'lucide-react';

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    testId: string;
    comingSoon?: boolean;
};

function FeatureCard({ icon, title, description, testId, comingSoon = false }: FeatureCardProps) {
    return (
        <div
            className="flex flex-col gap-2 p-6 bg-background rounded-lg border shadow-sm"
            data-testid={testId}
        >
            <div className="p-2 w-fit rounded-full bg-primary/10">{icon}</div>
            <div className="flex items-center gap-1">
                <h3 className="text-xl font-semibold">{title}</h3>
                {comingSoon && (
                    <span
                        className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full"
                        data-testid={`${testId}-coming-soon-badge`}
                        aria-label="This feature is coming soon"
                    >
                        *
                    </span>
                )}
            </div>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

export function FeaturesSection() {
    return (
        <section className="w-full py-20 bg-muted/50" data-testid="landing-features-section">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <div className="max-w-4xl mx-auto mb-12">
                    <h2
                        className="text-3xl md:text-4xl font-bold tracking-tighter mb-4"
                        data-testid="landing-features-heading"
                    >
                        Key Features to Ace Your Interviews
                    </h2>
                    <p
                        className="text-xl text-muted-foreground mx-auto max-w-3xl"
                        data-testid="landing-features-description"
                    >
                        Our AI-powered platform is specifically designed to help you master one-way
                        video interviews.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={<FileText className="h-6 w-6 text-primary" />}
                        title="Job-Specific Questions"
                        description="Generate relevant interview questions based on the job description, company, and industry."
                        testId="landing-feature-job-questions"
                    />
                    <FeatureCard
                        icon={<Mic className="h-6 w-6 text-primary" />}
                        title="Speech Analysis"
                        description="Get feedback on your pace, tone, clarity, and other aspects of your verbal communication."
                        testId="landing-feature-speech-analysis"
                    />
                    <FeatureCard
                        icon={<Star className="h-6 w-6 text-primary" />}
                        title="STAR Method Evaluation"
                        description="Ensure your answers effectively cover Situation, Task, Action, and Result components."
                        testId="landing-feature-star-method"
                    />
                    <FeatureCard
                        icon={<BookOpen className="h-6 w-6 text-primary" />}
                        title="Interview Question Library"
                        description="Access a comprehensive library of commonly asked interview questions for different industries and roles."
                        testId="landing-feature-question-library"
                        comingSoon={true}
                    />
                    <FeatureCard
                        icon={<BarChart className="h-6 w-6 text-primary" />}
                        title="Detailed Analytics"
                        description="Track your progress and identify areas for improvement with our comprehensive dashboard."
                        testId="landing-feature-analytics"
                    />
                    <FeatureCard
                        icon={<Repeat className="h-6 w-6 text-primary" />}
                        title="Practice Options"
                        description="Keep practicing with retry options and unlimited sessions in premium tiers."
                        testId="landing-feature-practice"
                    />
                </div>
                <div
                    className="mt-8 text-sm text-muted-foreground"
                    data-testid="landing-features-footnote"
                >
                    * Feature coming soon
                </div>
            </div>
        </section>
    );
}
