import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import SignIn from '../signin';
import { createClient } from '@/lib/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
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
    const mockRouter = {
        push: jest.fn(),
        refresh: jest.fn(),
    };
    const mockParams = new URLSearchParams();
    const mockSupabase = {
        auth: {
            signInWithPassword: jest.fn(),
        },
    };
    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });
    });

    test('validates input fields correctly', async () => {
        render(<SignIn />);

        // Submit form without any inputs
        fireEvent.click(screen.getByTestId('signin-submit-button'));

        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
            expect(screen.getByText('Please enter your password')).toBeInTheDocument();
        });

        // Enter invalid email
        fireEvent.change(screen.getByTestId('signin-email-input'), {
            target: { value: 'invalid-email' },
        });

        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        });
    });

    test('submits the form successfully', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null });

        render(<SignIn />);

        // Fill in form fields
        fireEvent.change(screen.getByTestId('signin-email-input'), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByTestId('signin-password-input'), {
            target: { value: 'password123' },
        });

        // Submit the form
        fireEvent.click(screen.getByTestId('signin-submit-button'));

        await waitFor(() => {
            expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
            expect(mockRouter.refresh).toHaveBeenCalled();
        });
    });

    test('handles authentication error', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
            error: { message: 'Invalid credentials' }
        });

        render(<SignIn />);

        // Fill in form fields
        fireEvent.change(screen.getByTestId('signin-email-input'), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByTestId('signin-password-input'), {
            target: { value: 'password123' },
        });

        // Submit the form
        fireEvent.click(screen.getByTestId('signin-submit-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    test('handles unexpected errors', async () => {
        const error = new Error('Unexpected error');
        mockSupabase.auth.signInWithPassword.mockRejectedValueOnce(error);

        render(<SignIn />);

        // Fill in form fields
        fireEvent.change(screen.getByTestId('signin-email-input'), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByTestId('signin-password-input'), {
            target: { value: 'password123' },
        });

        // Submit the form
        fireEvent.click(screen.getByTestId('signin-submit-button'));

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalledWith(error, { action: 'signIn' });
            expect(toast.error).toHaveBeenCalledWith('An error occurred during sign in. Please try again.');
        });
    });

    test('shows error toast when error param is present', () => {
        mockParams.append('error', 'session_expired');
        render(<SignIn />);

        expect(toast.error).toHaveBeenCalledWith('Your session has expired. Please sign in again.');
    });

    test('shows success toast when verification_sent message is present', () => {
        mockParams.append('message', 'verification_sent');
        render(<SignIn />);

        expect(toast.success).toHaveBeenCalledWith('Please check your email to verify your account before signing in.');
    });

    test('respects custom redirect parameter', async () => {
        mockParams.append('redirect', '/custom-route');
        mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null });

        render(<SignIn />);

        // Fill in form fields
        fireEvent.change(screen.getByTestId('signin-email-input'), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByTestId('signin-password-input'), {
            target: { value: 'password123' },
        });

        // Submit the form
        fireEvent.click(screen.getByTestId('signin-submit-button'));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/custom-route');
        });
    });
});