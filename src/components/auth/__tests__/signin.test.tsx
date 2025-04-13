import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import SignIn from '../signin';
import { createClient } from '@/lib/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn(),
}));

describe('SignIn Component', () => {
    const mockSignInWithPassword = jest.fn();
    const mockLogError = jest.fn();
    const mockSearchParams = new Map();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mocks
        (useSearchParams as jest.Mock).mockReturnValue({
            get: (param: string) => mockSearchParams.get(param),
        });

        (createClient as jest.Mock).mockReturnValue({
            auth: {
                signInWithPassword: mockSignInWithPassword,
            },
        });

        (useErrorLogging as jest.Mock).mockReturnValue({
            logError: mockLogError,
        });

        // Reset search params for each test
        mockSearchParams.clear();

        // Mock window.location
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' },
        });
    });

    test('displays validation errors when form is submitted with empty fields', async () => {
        render(<SignIn />);

        const submitButton = screen.getByTestId('signin-submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
            expect(screen.getByText('Please enter your password')).toBeInTheDocument();
        });
    });

    test('submits form with valid credentials and redirects on success', async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null });
        mockSearchParams.set('redirect', '/custom-redirect');

        render(<SignIn />);

        const emailInput = screen.getByTestId('signin-email-input');
        const passwordInput = screen.getByTestId('signin-password-input');
        const submitButton = screen.getByTestId('signin-submit-button');

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(toast.success).toHaveBeenCalledWith('Signed in successfully');
            expect(window.location.href).toBe('/custom-redirect');
        });
    });

    test('handles sign-in error', async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: { message: 'Invalid login credentials' }
        });

        render(<SignIn />);

        const emailInput = screen.getByTestId('signin-email-input');
        const passwordInput = screen.getByTestId('signin-password-input');
        const submitButton = screen.getByTestId('signin-submit-button');

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'wrong-password');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSignInWithPassword).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Invalid login credentials');
        });
    });

    test('shows error toast if error parameter is in URL', () => {
        mockSearchParams.set('error', 'session_expired');

        render(<SignIn />);

        expect(toast.error).toHaveBeenCalledWith(
            'Your session has expired. Please sign in again.'
        );
    });

    test('shows success toast when verification was sent', () => {
        mockSearchParams.set('message', 'verification_sent');

        render(<SignIn />);

        expect(toast.success).toHaveBeenCalledWith(
            'Please check your email to verify your account before signing in.'
        );
    });

    test('handles unexpected error during sign in', async () => {
        mockSignInWithPassword.mockRejectedValue(new Error('Network error'));

        render(<SignIn />);

        const emailInput = screen.getByTestId('signin-email-input');
        const passwordInput = screen.getByTestId('signin-password-input');
        const submitButton = screen.getByTestId('signin-submit-button');

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(
                'An error occurred during sign in. Please try again.'
            );
        });
    });
});