import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureComparison } from '../feature-comparison';
import '@testing-library/jest-dom';

describe('FeatureComparison', () => {
    beforeEach(() => {
        render(<FeatureComparison />);
    });

    test('renders component with correct title', () => {
        expect(screen.getByTestId('feature-comparison')).toBeInTheDocument();
    });

    test('renders all feature categories', () => {
        expect(screen.getByTestId('feature-category-0')).toHaveTextContent('Interview Creation');
        expect(screen.getByTestId('feature-category-1')).toHaveTextContent('Practice Features');
        expect(screen.getByTestId('feature-category-2')).toHaveTextContent('Analysis & Feedback');
    });

    test('renders correct feature availability in Interview Creation category', () => {
        // Job Description-Based Questions (available in all tiers)
        expect(screen.getByTestId('feature-0-0-basic-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-0-0-standard-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-0-0-pro-check')).toBeInTheDocument();

        // Custom Interview Creation (available in Standard and Pro)
        expect(screen.getByTestId('feature-0-2-basic-x')).toBeInTheDocument();
        expect(screen.getByTestId('feature-0-2-standard-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-0-2-pro-check')).toBeInTheDocument();
    });

    test('renders correct feature availability in Practice Features category', () => {
        // Record Responses (available in all tiers)
        expect(screen.getByTestId('feature-1-0-basic-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-1-0-standard-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-1-0-pro-check')).toBeInTheDocument();

        // Unlimited Sessions (available in Pro only)
        expect(screen.getByTestId('feature-1-3-basic-x')).toBeInTheDocument();
        expect(screen.getByTestId('feature-1-3-standard-x')).toBeInTheDocument();
        expect(screen.getByTestId('feature-1-3-pro-check')).toBeInTheDocument();
    });

    test('renders correct feature availability in Analysis & Feedback category', () => {
        // Basic STAR Evaluation (available in all tiers)
        expect(screen.getByTestId('feature-2-0-basic-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-2-0-standard-check')).toBeInTheDocument();
        expect(screen.getByTestId('feature-2-0-pro-check')).toBeInTheDocument();

        // Speech Pattern Analysis (available in Pro only)
        expect(screen.getByTestId('feature-2-3-basic-x')).toBeInTheDocument();
        expect(screen.getByTestId('feature-2-3-standard-x')).toBeInTheDocument();
        expect(screen.getByTestId('feature-2-3-pro-check')).toBeInTheDocument();
    });

    test('renders correct number of feature rows', () => {
        // 3 categories with 4 features each = 12 feature rows
        const rows = screen.getAllByTestId(/^feature-row-\d+-\d+$/);
        expect(rows).toHaveLength(12);
    });

    test('renders features with descriptions', () => {
        expect(screen.getByText('Job Description-Based Questions')).toBeInTheDocument();
        expect(screen.getByText('Generate questions from any job posting')).toBeInTheDocument();

        expect(screen.getByText('Unlimited Sessions')).toBeInTheDocument();
        expect(screen.getByText('Practice as much as you need')).toBeInTheDocument();
    });
});