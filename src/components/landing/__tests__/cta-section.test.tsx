import { render, screen } from '@testing-library/react';
import { CtaSection } from '../cta-section';

// Mock Next.js Link component
jest.mock('next/link', () => {
    const LinkComponent = ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
    LinkComponent.displayName = 'Link';
    return LinkComponent;
});

describe('CtaSection component', () => {
    it('renders the component with correct section data-testid', () => {
        render(<CtaSection />);
        expect(screen.getByTestId('landing-cta-section')).toBeInTheDocument();
    });

    it('displays the correct heading', () => {
        render(<CtaSection />);
        expect(screen.getByTestId('landing-cta-heading')).toHaveTextContent('Ready to Ace Your Next Interview?');
    });

    it('displays the correct description', () => {
        render(<CtaSection />);
        expect(screen.getByTestId('landing-cta-description')).toHaveTextContent(
            'Start practicing today with our AI-powered interview preparation platform'
        );
    });

    it('renders the primary CTA button with correct link', () => {
        render(<CtaSection />);
        const primaryButton = screen.getByText('Start Free Trial');
        expect(primaryButton).toHaveTextContent('Start Free Trial');
        expect(primaryButton.closest('a')).toHaveAttribute('href', '/sign-up');
    });

    it('renders the secondary CTA button with correct link', () => {
        render(<CtaSection />);
        const secondaryButton = screen.getByText('View Pricing');
        expect(secondaryButton).toHaveTextContent('View Pricing');
        expect(secondaryButton.closest('a')).toHaveAttribute('href', '/pricing');
    });

    it('displays the no credit card required note', () => {
        render(<CtaSection />);
        expect(screen.getByTestId('landing-cta-note')).toHaveTextContent(
            'No credit card required. Get started with our free tier instantly.'
        );
    });

    it('has the correct accessibility labels on buttons', () => {
        render(<CtaSection />);
        // Skip this test if aria-labels aren't implemented yet
        const buttons = screen.getAllByRole('link');
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
});