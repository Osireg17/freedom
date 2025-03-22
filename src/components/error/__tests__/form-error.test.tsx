import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormError } from '../form-error';

// Mock the ErrorAlert component
jest.mock('../error-alert', () => ({
    ErrorAlert: ({ message, title, testId }: { message: string; title: string; testId: string }) => (
        <div data-testid={testId}>
            <div data-testid="mocked-error-title">{title}</div>
            <div data-testid="mocked-error-message">{message}</div>
        </div>
    ),
}));

describe('FormError', () => {
    it('renders nothing when error is null', () => {
        const { container } = render(<FormError error={null} />);

        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId('form-error-container')).not.toBeInTheDocument();
    });

    it('renders nothing when error is undefined', () => {
        const { container } = render(<FormError error={undefined} />);

        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId('form-error-container')).not.toBeInTheDocument();
    });

    it('renders nothing when error is empty string', () => {
        const { container } = render(<FormError error="" />);

        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId('form-error-container')).not.toBeInTheDocument();
    });

    it('renders error message when error is provided', () => {
        render(<FormError error="Form submission failed" />);

        expect(screen.getByTestId('form-error-container')).toBeInTheDocument();
        expect(screen.getByTestId('form-error-alert')).toBeInTheDocument();
        expect(screen.getByTestId('mocked-error-message')).toHaveTextContent('Form submission failed');
    });

    it('passes the correct title to ErrorAlert', () => {
        render(<FormError error="Form submission failed" />);

        expect(screen.getByTestId('mocked-error-title')).toHaveTextContent('Form Error');
    });
});