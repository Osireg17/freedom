import React from 'react';
import { render, screen } from '@testing-library/react';
import { PricingCard } from '../pricing-card';

describe('PricingCard', () => {
    const mockProps = {
        title: 'Basic Plan',
        price: '$10',
        description: 'A simple plan for getting started',
        features: [
            { text: 'Feature 1', included: true },
            { text: 'Feature 2', included: true },
            { text: 'Feature 3', included: false }
        ],
        buttonText: 'Get Started',
        buttonLink: '/signup',
        testId: 'basic-plan-card'
    };

    it('renders the pricing card with all content', () => {
        render(<PricingCard {...mockProps} />);

        expect(screen.getByTestId('basic-plan-card')).toBeInTheDocument();
        expect(screen.getByText('Basic Plan')).toBeInTheDocument();
        expect(screen.getByText('$10')).toBeInTheDocument();
        expect(screen.getByText('A simple plan for getting started')).toBeInTheDocument();
        expect(screen.getByText('Feature 1')).toBeInTheDocument();
        expect(screen.getByText('Feature 2')).toBeInTheDocument();
        expect(screen.getByText('Feature 3')).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('displays the monthly indicator for paid plans', () => {
        render(<PricingCard {...mockProps} />);
        expect(screen.getByText('/month')).toBeInTheDocument();
    });

    it('does not display the monthly indicator for free plans', () => {
        render(<PricingCard {...mockProps} price="Free" />);
        expect(screen.queryByText('/month')).not.toBeInTheDocument();
    });

    it('shows the popular badge when isPopular is true', () => {
        render(<PricingCard {...mockProps} isPopular={true} />);
        expect(screen.getByTestId('basic-plan-card-popular-badge')).toBeInTheDocument();
        expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });

    it('does not show the popular badge when isPopular is false', () => {
        render(<PricingCard {...mockProps} isPopular={false} />);
        expect(screen.queryByTestId('basic-plan-card-popular-badge')).not.toBeInTheDocument();
        expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
    });

    it('applies correct styling for included features', () => {
        render(<PricingCard {...mockProps} />);
        const feature1 = screen.getByTestId('basic-plan-card-feature-0');
        expect(feature1).toHaveTextContent('Feature 1');
        expect(feature1.querySelector('div')).toHaveClass('bg-primary/10');
    });

    it('applies correct styling for non-included features', () => {
        render(<PricingCard {...mockProps} />);
        const feature3 = screen.getByTestId('basic-plan-card-feature-2');
        expect(feature3).toHaveTextContent('Feature 3');
        expect(feature3.querySelector('div')).toHaveClass('bg-muted');
    });

    it('sets the correct aria-label on the button', () => {
        render(<PricingCard {...mockProps} />);
        const button = screen.getByTestId('basic-plan-card-button');
        expect(button).toHaveAttribute('aria-label', 'Sign up for the Basic Plan plan');
    });
});