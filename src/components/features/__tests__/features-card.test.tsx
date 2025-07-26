import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureCard } from '../features-card';
import { FileText } from 'lucide-react';

describe('FeatureCard', () => {
    const defaultProps = {
        icon: <FileText data-testid="test-icon" />,
        title: 'Test Feature',
        description: 'This is a test feature',
        details: ['Detail 1', 'Detail 2', 'Detail 3'],
        testId: 'test-feature-card'
    };

    it('renders with correct title and description', () => {
        render(<FeatureCard {...defaultProps} />);

        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test feature')).toBeInTheDocument();
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('shows "New" badge when isNew is true', () => {
        render(<FeatureCard {...defaultProps} isNew={true} />);

        expect(screen.getByTestId('test-feature-card-new-badge')).toBeInTheDocument();
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('does not show "New" badge when isNew is false', () => {
        render(<FeatureCard {...defaultProps} isNew={false} />);

        expect(screen.queryByTestId('test-feature-card-new-badge')).not.toBeInTheDocument();
    });

    it('does not display details initially', () => {
        render(<FeatureCard {...defaultProps} />);

        expect(screen.queryByTestId('test-feature-card-details')).not.toBeInTheDocument();
    });

    it('toggles details visibility when "Show more" button is clicked', () => {
        render(<FeatureCard {...defaultProps} />);

        // Details should not be visible initially
        expect(screen.queryByTestId('test-feature-card-details')).not.toBeInTheDocument();

        // Click "Show more" button
        fireEvent.click(screen.getByTestId('test-feature-card-toggle-button'));

        // Details should now be visible
        expect(screen.getByTestId('test-feature-card-details')).toBeInTheDocument();
        expect(screen.getByText('Detail 1')).toBeInTheDocument();
        expect(screen.getByText('Detail 2')).toBeInTheDocument();
        expect(screen.getByText('Detail 3')).toBeInTheDocument();
        expect(screen.getByText('Show less')).toBeInTheDocument();

        // Click "Show less" button
        fireEvent.click(screen.getByTestId('test-feature-card-toggle-button'));

        // Details should be hidden again
        expect(screen.queryByTestId('test-feature-card-details')).not.toBeInTheDocument();
        expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    it('renders each detail with the correct test id', () => {
        render(<FeatureCard {...defaultProps} />);

        // Show details
        fireEvent.click(screen.getByTestId('test-feature-card-toggle-button'));

        // Check each detail has the correct test id
        expect(screen.getByTestId('test-feature-card-detail-0')).toBeInTheDocument();
        expect(screen.getByTestId('test-feature-card-detail-1')).toBeInTheDocument();
        expect(screen.getByTestId('test-feature-card-detail-2')).toBeInTheDocument();
    });
});