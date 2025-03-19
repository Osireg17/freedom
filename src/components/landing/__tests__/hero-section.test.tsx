import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../hero-section';

// Mock the next/link component
jest.mock('next/link', () => {
    const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
    MockLink.displayName = 'Link';
    return MockLink;
});

describe('HeroSection', () => {
    it('renders the section with the correct test id', () => {
        render(<HeroSection />);
        expect(screen.getByTestId('landing-hero-section')).toBeInTheDocument();
    });

    it('displays the main heading with correct text', () => {
        render(<HeroSection />);
        const heading = screen.getByTestId('landing-hero-heading');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Excel in Your One-Way Video Interviews');
    });

    it('displays the description text', () => {
        render(<HeroSection />);
        const description = screen.getByTestId('landing-hero-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
            'Practice with AI-powered interview simulations that provide personalised feedback to help you land your dream job.'
        );
    });

    it('renders the primary CTA button with correct link', () => {
        render(<HeroSection />);
        const primaryCta = screen.getByText('Get Started Free');
        expect(primaryCta).toBeInTheDocument();
        expect(primaryCta.closest('a')).toHaveAttribute('href', '/sign-up');
    });

    it('renders the secondary CTA button with correct link', () => {
        render(<HeroSection />);
        const secondaryCta = screen.getByText('See How It Works');
        expect(secondaryCta).toBeInTheDocument();
        expect(secondaryCta.closest('a')).toHaveAttribute('href', '#how-it-works');
    });

    it('displays the promotional text', () => {
        render(<HeroSection />);
        const promoText = screen.getByTestId('landing-hero-promo');
        expect(promoText).toBeInTheDocument();
        expect(promoText).toHaveTextContent('No credit card required. Start with free practice interviews today.');
    });

    it('renders both CTA buttons in a container', () => {
        render(<HeroSection />);
        const ctaContainer = screen.getByTestId('landing-hero-cta-container');
        expect(ctaContainer).toBeInTheDocument();
        expect(ctaContainer.children.length).toBe(2);
    });
});