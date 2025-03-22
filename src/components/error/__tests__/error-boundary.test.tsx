import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../error-boundary';
import { logErrorToService } from '@/lib/error/logger';

// Mock the logging service
jest.mock('@/lib/error/logger', () => ({
    logErrorToService: jest.fn()
}));

// Create a test component that throws an error
function ErrorComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>Working Component</div>;
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Suppress console errors from the error boundary
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div data-testid="child-component">Child Component</div>
            </ErrorBoundary>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('renders fallback UI when an error occurs', () => {
        render(
            <ErrorBoundary>
                <ErrorComponent />
            </ErrorBoundary>
        );

        expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('logs errors to the error service', () => {
        render(
            <ErrorBoundary>
                <ErrorComponent />
            </ErrorBoundary>
        );

        expect(logErrorToService).toHaveBeenCalled();
        const firstArg = (logErrorToService as jest.Mock).mock.calls[0][0];
        expect(firstArg.message).toBe('Test error');
    });

    it('renders custom fallback if provided', () => {
        const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ErrorComponent />
            </ErrorBoundary>
        );

        expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
        expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('resets the error state when retry button is clicked', () => {
        let shouldThrow = true;

        const TestComponent = () => {
            return shouldThrow ? <ErrorComponent /> : <div>No Error</div>;
        };

        render(
            <ErrorBoundary>
                <TestComponent />
            </ErrorBoundary>
        );

        // Error boundary shows the fallback UI
        expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();

        // Update the component to not throw errors anymore
        shouldThrow = false;

        // Click the retry button
        fireEvent.click(screen.getByTestId('error-boundary-retry-button'));

        // The component should be rendered without errors now
        expect(screen.getByText('No Error')).toBeInTheDocument();
        expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('navigates to home page when home button is clicked', () => {
        // Mock window.location.href
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, href: '' };

        render(
            <ErrorBoundary>
                <ErrorComponent />
            </ErrorBoundary>
        );

        // Click the home button
        fireEvent.click(screen.getByTestId('error-boundary-home-button'));

        // Check if we're redirected to the home page
        expect(window.location.href).toBe('/');

        // Restore original location
        window.location = originalLocation;
    });
});