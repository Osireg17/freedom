import { render, screen } from '@testing-library/react';
import PricingPage from '../page';

// Mock the components that are imported in the PricingPage
jest.mock('@/components/pricing/pricing-card', () => ({
    PricingCard: ({ title, testId }: { title: string; testId: string }) => (
        <div data-testid={testId}>{title} Plan</div>
    ),
}));

jest.mock('@/components/pricing/feature-comparison', () => ({
    FeatureComparison: () => <div data-testid="feature-comparison">Feature Comparison Table</div>,
}));

jest.mock('@/components/pricing/faq-section', () => ({
    FaqSection: () => <div data-testid="faq-section">FAQ Section</div>,
}));

describe('PricingPage', () => {
    beforeEach(() => {
        render(<PricingPage />);
    });

    it('renders the pricing page', () => {
        expect(screen.getByTestId('pricing-page')).toBeInTheDocument();
    });

    it('displays the hero section with correct content', () => {
        expect(screen.getByTestId('pricing-hero-heading')).toHaveTextContent('Simple, Transparent Pricing');
        expect(screen.getByTestId('pricing-hero-description')).toHaveTextContent('Choose the plan that fits your interview preparation needs');
    });

    it('renders all three pricing cards', () => {
        expect(screen.getByTestId('pricing-card-free')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-card-standard')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-card-pro')).toBeInTheDocument();
    });

    it('displays the feature comparison section', () => {
        expect(screen.getByTestId('pricing-comparison-heading')).toHaveTextContent('Compare All Features');
        expect(screen.getByTestId('feature-comparison')).toBeInTheDocument();
    });

    it('includes the FAQ section', () => {
        expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    });

    it('renders the CTA section with correct buttons', () => {
        expect(screen.getByTestId('pricing-cta-heading')).toHaveTextContent('Ready to ace your next interview?');
        expect(screen.getByTestId('pricing-cta-button')).toHaveTextContent('Get Started Free');
        expect(screen.getByTestId('pricing-contact-button')).toHaveTextContent('Contact Sales');
    });

    it('has the correct links in the CTA section', () => {
        expect(screen.getByTestId('pricing-cta-button')).toHaveAttribute('href', '/sign-up');
        expect(screen.getByTestId('pricing-contact-button')).toHaveAttribute('href', '/contact');
    });
});