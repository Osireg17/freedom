import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureComparison } from '../feature-comparison';


// Mock the useErrorLogging hook
jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn().mockReturnValue({
        logError: jest.fn(),
    }),
}));

describe('FeatureComparison', () => {
    it('renders the feature comparison table', () => {
        render(<FeatureComparison />);

        const table = screen.getByTestId('pricing-feature-comparison');
        expect(table).toBeInTheDocument();

        expect(screen.getByText('Feature')).toBeInTheDocument();
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    it('shows feature descriptions', () => {
        render(<FeatureComparison />);

        expect(screen.getByText('Access to our library of common interview questions')).toBeInTheDocument();
        expect(screen.getByText('Generate questions based on specific job postings')).toBeInTheDocument();
    });

    it('displays the correct number of feature rows', () => {
        render(<FeatureComparison />);

        // 10 feature rows + 2 additional rows (Monthly Interviews and Retry Attempts)
        const featureRows = screen.getAllByTestId(/pricing-feature-row-\d+/);
        expect(featureRows).toHaveLength(10);
    });

    it('displays alternating row background colors', () => {
        render(<FeatureComparison />);

        const evenRows = screen.getAllByTestId(/pricing-feature-row-[02468]/);
        const oddRows = screen.getAllByTestId(/pricing-feature-row-[13579]/);

        evenRows.forEach(row => {
            expect(row).toHaveClass('bg-muted/30');
        });

        oddRows.forEach(row => {
            expect(row).not.toHaveClass('bg-muted/30');
        });
    });
});