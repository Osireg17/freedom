'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { logErrorToService } from '@/lib/error/logger';


interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        logErrorToService(error, {
            component: 'ErrorBoundary',
            react: errorInfo.componentStack,
        });
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    className="p-6 mx-auto my-8 max-w-md rounded-lg border border-gray-200 bg-white shadow-md text-center"
                    data-testid="error-boundary-fallback"
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-4">
                        We&apos;ve encountered an unexpected issue. Our team has been notified.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="mr-2"
                            data-testid="error-boundary-retry-button"
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            data-testid="error-boundary-home-button"
                        >
                            Go Home
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;