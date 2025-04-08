import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ResetPasswordForm from '../reset-password-form';

// Mocks
jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn()
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn()
}));

describe('ResetPasswordForm', () => {
    const mockUpdateUser = jest.fn();
    const mockPush = jest.fn();
    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue({
            auth: {
                updateUser: mockUpdateUser
            }
        });
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });
        mockUpdateUser.mockResolvedValue({ error: null });
    });

    test('renders the reset password form', () => {
        render(<ResetPasswordForm />);

        expect(screen.getByText('Create new password')).toBeInTheDocument();
        expect(screen.getByText('Your new password must be different from previously used passwords')).toBeInTheDocument();
        expect(screen.getByLabelText('New password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument();
    });

    test('validates password strength', async () => {
        render(<ResetPasswordForm />);

        const passwordInput = screen.getByTestId('reset-password-password-input');
        const submitButton = screen.getByTestId('reset-password-submit-button');

        // Enter weak password
        await userEvent.type(passwordInput, 'weak');
        await userEvent.click(submitButton);

        // Should display error message
        await waitFor(() => {
            expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
        });

        // Enter strong password
        fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
        await userEvent.click(submitButton);

        // Should not display error message
        await waitFor(() => {
            expect(screen.queryByText('Password must be at least 8 characters long')).not.toBeInTheDocument();
        });
    });

    test('validates passwords match', async () => {
        render(<ResetPasswordForm />);

        const passwordInput = screen.getByTestId('reset-password-password-input');
        const confirmInput = screen.getByTestId('reset-password-confirm-input');
        const submitButton = screen.getByTestId('reset-password-submit-button');

        // Enter different passwords
        await userEvent.type(passwordInput, 'Password123');
        await userEvent.type(confirmInput, 'Password456');
        await userEvent.click(submitButton);

        // Should display error message
        await waitFor(() => {
            expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
        });
    });

    test('submits form with valid data and handles success', async () => {
        render(<ResetPasswordForm />);

        const passwordInput = screen.getByTestId('reset-password-password-input');
        const confirmInput = screen.getByTestId('reset-password-confirm-input');
        const submitButton = screen.getByTestId('reset-password-submit-button');

        // Enter matching passwords
        await userEvent.type(passwordInput, 'Password123');
        await userEvent.type(confirmInput, 'Password123');
        await userEvent.click(submitButton);

        // Check if Supabase was called with correct data
        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'Password123' });
            expect(toast.success).toHaveBeenCalledWith('Password reset successfully!');
            expect(mockPush).toHaveBeenCalledWith('/sign-in?message=password_reset_complete');
        });
    });

    test('handles API errors', async () => {
        mockUpdateUser.mockResolvedValue({ error: { message: 'API Error' } });

        render(<ResetPasswordForm />);

        const passwordInput = screen.getByTestId('reset-password-password-input');
        const confirmInput = screen.getByTestId('reset-password-confirm-input');
        const submitButton = screen.getByTestId('reset-password-submit-button');

        // Enter matching passwords
        await userEvent.type(passwordInput, 'Password123');
        await userEvent.type(confirmInput, 'Password123');
        await userEvent.click(submitButton);

        // Check if error is handled correctly
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('API Error');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    test('handles unexpected errors', async () => {
        mockUpdateUser.mockRejectedValue(new Error('Unexpected error'));

        render(<ResetPasswordForm />);

        const passwordInput = screen.getByTestId('reset-password-password-input');
        const confirmInput = screen.getByTestId('reset-password-confirm-input');
        const submitButton = screen.getByTestId('reset-password-submit-button');

        // Enter matching passwords
        await userEvent.type(passwordInput, 'Password123');
        await userEvent.type(confirmInput, 'Password123');
        await userEvent.click(submitButton);

        // Check if error is logged and user is notified
        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(
                'An error occurred while resetting your password. Please try again.'
            );
        });
    });
});