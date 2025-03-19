// src/app/page.tsx
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { CtaSection } from '@/components/landing/cta-section';

export default function Home() {
    return (
        <div data-testid="landing-page">
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <CtaSection />
        </div>
    );
}
