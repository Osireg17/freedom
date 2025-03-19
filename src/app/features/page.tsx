"use client"


import { interviewFeatures, practiceFeatures, feedbackFeatures } from "@/components/features/data/features"
import { CTASection } from "@/components/features/features-cta"
import { HeroSection } from "@/components/features/features-hero-section"
import { FeatureSection } from "@/components/features/features-section"


export default function FeaturesPageClient() {
    return (
        <div className="min-h-screen" data-testid="features-page">

            <HeroSection />

            <FeatureSection
                title="Interview Preparation"
                description="Generate relevant questions based on job descriptions, your resume, or choose from our question library"
                features={interviewFeatures}
                testId="interview-preparation-section"
            />

            <FeatureSection
                title="Practice & Simulation"
                description="Practice your responses in a realistic environment that mimics actual one-way video interviews"
                features={practiceFeatures}
                testId="practice-simulation-section"
            />

            <FeatureSection
                title="Feedback & Analysis"
                description="Receive detailed feedback and analysis to help you improve your interview performance"
                features={feedbackFeatures}
                testId="feedback-analysis-section"
            />

            <CTASection />
        </div>
    )
}

