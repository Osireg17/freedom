import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorAlert } from '../error-alert';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
    AlertCircle: () => <div data-testid="alert-circle-icon" />
}));

describe('ErrorAlert', () => {
    it('renders with default props', () => {
        render(<ErrorAlert message="An error occurred" />);

        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
        render(<ErrorAlert title="Custom Error" message="An error occurred" />);

        expect(screen.getByText('Custom Error')).toBeInTheDocument();
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('renders with custom variant', () => {
        const { container } = render(
            <ErrorAlert
                message="An error occurred"
                variant="default"
            />
        );

        // Default variant doesn't have destructive styling
        const alert = container.firstChild as HTMLElement;
        expect(alert.className).not.toContain('text-destructive');
    });

    it('renders with custom testId', () => {
        render(<ErrorAlert message="An error occurred" testId="custom-error-alert" />);

        expect(screen.getByTestId('custom-error-alert')).toBeInTheDocument();
        expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument();
    });

    it('applies additional className', () => {
        const { container } = render(
            <ErrorAlert
                message="An error occurred"
                className="custom-class"
            />
        );

        const alert = container.firstChild as HTMLElement;
        expect(alert.className).toContain('custom-class');
    });
});