import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from '../forgot-password-form';
import { createClient } from '@/lib/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
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

describe('ForgotPasswordForm', () => {
    const mockRouter = {
        push: jest.fn(),
    };
    const mockSupabase = {
        auth: {
            resetPasswordForEmail: jest.fn(),
        },
    };
    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });
        Object.defineProperty(window, 'location', {
            value: { origin: 'http://localhost:3000' },
            writable: true,
        });
    });

    test('renders the forgot password form', () => {
        render(<ForgotPasswordForm />);

        expect(screen.getByText('Forgot password')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-submit-button')).toBeInTheDocument();
        expect(screen.getByTestId('back-to-sign-in-link')).toBeInTheDocument();
    });

    test('submits form with valid email and handles success', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

        render(<ForgotPasswordForm />);

        const user = userEvent.setup();
        const emailInput = screen.getByTestId('forgot-password-email-input');
        const submitButton = screen.getByTestId('forgot-password-submit-button');

        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
                redirectTo: 'http://localhost:3000/reset-password',
            });
        });

        expect(mockRouter.push).toHaveBeenCalledWith('/verify-email?email=test%40example.com&type=recovery');
        expect(toast.success).toHaveBeenCalled();
    });

    test('shows error toast when Supabase returns an error', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
            error: { message: 'User not found' }
        });

        render(<ForgotPasswordForm />);

        const user = userEvent.setup();
        const emailInput = screen.getByTestId('forgot-password-email-input');
        const submitButton = screen.getByTestId('forgot-password-submit-button');

        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('User not found');
        });

        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('handles unexpected errors during submission', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'));

        render(<ForgotPasswordForm />);

        const user = userEvent.setup();
        const emailInput = screen.getByTestId('forgot-password-email-input');
        const submitButton = screen.getByTestId('forgot-password-submit-button');

        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('An error occurred while sending the reset link. Please try again.');
        });
    });

    test('shows success screen after form submission', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

        render(<ForgotPasswordForm />);

        const user = userEvent.setup();
        await user.type(screen.getByTestId('forgot-password-email-input'), 'test@example.com');
        await user.click(screen.getByTestId('forgot-password-submit-button'));

        await waitFor(() => {
            expect(screen.getByText('Check your email')).toBeInTheDocument();
            expect(screen.getByTestId('back-to-login-button')).toBeInTheDocument();
        });
    });

    test('navigates back to sign-in from success screen', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

        render(<ForgotPasswordForm />);

        const user = userEvent.setup();
        await user.type(screen.getByTestId('forgot-password-email-input'), 'test@example.com');
        await user.click(screen.getByTestId('forgot-password-submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('back-to-login-button')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('back-to-login-button'));
        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
    });
});