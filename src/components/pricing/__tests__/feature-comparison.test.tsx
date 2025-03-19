import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureComparison } from '../feature-comparison';

describe('FeatureComparison', () => {
    beforeEach(() => {
        render(<FeatureComparison />);
    });

    test('renders the feature comparison table', () => {
        expect(screen.getByTestId('pricing-feature-comparison')).toBeInTheDocument();
    });

    test('displays all table headers correctly', () => {
        expect(screen.getByText('Feature')).toBeInTheDocument();
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    test('renders all feature rows', () => {
        // The component has 10 feature items
        for (let i = 0; i < 10; i++) {
            expect(screen.getByTestId(`pricing-feature-row-${i}`)).toBeInTheDocument();
        }
    });

    test('displays basic question library feature correctly', () => {
        const row = screen.getByTestId('pricing-feature-row-0');
        expect(row).toHaveTextContent('Basic Question Library');

        // Free, Standard, and Pro all have checks for this feature
        const checks = row.querySelectorAll('svg.text-primary');
        expect(checks.length).toBe(3);
    });

    test('displays detailed STAR method breakdown feature correctly', () => {
        const row = screen.getByTestId('pricing-feature-row-7');
        expect(row).toHaveTextContent('Detailed STAR Method Breakdown');

        // Only Pro has a check, Free and Standard have X marks
        const checks = row.querySelectorAll('svg.text-primary');
        const xMarks = row.querySelectorAll('svg.text-muted-foreground');
        expect(checks.length).toBe(1);
        expect(xMarks.length).toBe(2);
    });

    test('displays the monthly interviews section correctly', () => {
        expect(screen.getByText('Monthly Interviews')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Unlimited')).toBeInTheDocument();
    });

    test('shows descriptions for features', () => {
        // Check that the description for the first feature is present
        expect(screen.getByText('Access to our library of common interview questions')).toBeInTheDocument();
    });
});