import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoDemo } from '../video-demo';

describe('VideoDemo', () => {
    const mockProps = {
        title: 'Test Video',
        description: 'This is a test video description',
        testId: 'video-demo-test'
    };

    it('renders with the correct title', () => {
        render(<VideoDemo {...mockProps} />);
        expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    });

    it('renders with the "coming soon" text', () => {
        render(<VideoDemo {...mockProps} />);
        expect(screen.getByText('Video demonstration coming soon')).toBeInTheDocument();
    });

    it('closes the info dialog when clicking the close button', () => {
        render(<VideoDemo {...mockProps} />);

        // Open dialog
        fireEvent.click(screen.getByTestId(`${mockProps.testId}-info-button`));
        expect(screen.getByTestId(`${mockProps.testId}-info-dialog`)).toBeInTheDocument();

        // Find and click the close button (the dialog from shadcn uses a close button with aria-label)
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        // Dialog should no longer be visible
        expect(screen.queryByTestId(`${mockProps.testId}-info-dialog`)).not.toBeInTheDocument();
    });

    it('renders fullscreen button', () => {
        render(<VideoDemo {...mockProps} />);
        expect(screen.getByTestId(`${mockProps.testId}-fullscreen-button`)).toBeInTheDocument();
    });

    it('uses the correct testId for the component', () => {
        render(<VideoDemo {...mockProps} />);
        expect(screen.getByTestId(mockProps.testId)).toBeInTheDocument();
    });
});