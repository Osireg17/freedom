import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import SignUp from '../signup';
import { createClient } from '@/lib/supabase/client';

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
    useErrorLogging: () => ({ logError: jest.fn() }),
}));

describe('SignUp Component', () => {
    const mockRouter = {
        push: jest.fn(),
    };
    const mockSupabaseAuth = {
        signUp: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (createClient as jest.Mock).mockReturnValue({ auth: mockSupabaseAuth });
    });

    it('renders the signup form correctly', () => {
        render(<SignUp />);

        expect(screen.getByTestId('signup-form-container')).toBeInTheDocument();
        expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-confirm-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-submit-button')).toBeInTheDocument();
        expect(screen.getByTestId('signup-signin-link')).toBeInTheDocument();
    });

    it('validates email format', async () => {
        render(<SignUp />);

        const emailInput = screen.getByTestId('signup-email-input');
        await userEvent.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        });

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'valid@example.com');
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
        });
    });

    it('validates password requirements', async () => {
        render(<SignUp />);

        const passwordInput = screen.getByTestId('signup-password-input');
        await userEvent.type(passwordInput, 'weak');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
        });

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'strongPass1');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.queryByText('Password must be at least 8 characters long')).not.toBeInTheDocument();
        });
    });

    it('validates passwords match', async () => {
        render(<SignUp />);

        const passwordInput = screen.getByTestId('signup-password-input');
        const confirmPasswordInput = screen.getByTestId('signup-confirm-password-input');

        await userEvent.type(passwordInput, 'StrongPass1');
        await userEvent.type(confirmPasswordInput, 'DifferentPass1');
        fireEvent.blur(confirmPasswordInput);

        await waitFor(() => {
            expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();
        });

        await userEvent.clear(confirmPasswordInput);
        await userEvent.type(confirmPasswordInput, 'StrongPass1');
        fireEvent.blur(confirmPasswordInput);

        await waitFor(() => {
            expect(screen.queryByText('Passwords don\'t match')).not.toBeInTheDocument();
        });
    });

    it('toggles password visibility', async () => {
        render(<SignUp />);

        const passwordInput = screen.getByTestId('signup-password-input');
        const confirmPasswordInput = screen.getByTestId('signup-confirm-password-input');

        // Initial state - passwords should be hidden
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');

        // Toggle password visibility
        const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
        await userEvent.click(toggleButtons[0]); // Password field toggle
        await userEvent.click(toggleButtons[1]); // Confirm password field toggle

        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('submits the form with valid data', async () => {
        mockSupabaseAuth.signUp.mockResolvedValueOnce({
            data: { user: { id: 'user-id' } },
            error: null,
        });

        render(<SignUp />);

        await userEvent.type(screen.getByTestId('signup-email-input'), 'test@example.com');
        await userEvent.type(screen.getByTestId('signup-password-input'), 'StrongPass1');
        await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'StrongPass1');

        await userEvent.click(screen.getByTestId('signup-submit-button'));

        await waitFor(() => {
            expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'StrongPass1',
                options: expect.objectContaining({
                    emailRedirectTo: expect.any(String),
                    data: { email_confirmed: false },
                }),
            });

            expect(mockRouter.push).toHaveBeenCalledWith(
                expect.stringContaining('/verify-email?email=test%40example.com&type=signup')
            );
        });
    });

    it('displays error message when signup fails', async () => {
        mockSupabaseAuth.signUp.mockResolvedValueOnce({
            data: null,
            error: { message: 'Email already in use' },
        });

        render(<SignUp />);

        await userEvent.type(screen.getByTestId('signup-email-input'), 'test@example.com');
        await userEvent.type(screen.getByTestId('signup-password-input'), 'StrongPass1');
        await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'StrongPass1');

        await userEvent.click(screen.getByTestId('signup-submit-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Email already in use');
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    it('shows loading state during submission', async () => {
        // Create a promise that won't resolve immediately to observe loading state
        let resolveSignUp: (value: any) => void;
        const signUpPromise = new Promise(resolve => {
            resolveSignUp = resolve;
        });

        mockSupabaseAuth.signUp.mockReturnValueOnce(signUpPromise);

        render(<SignUp />);

        await userEvent.type(screen.getByTestId('signup-email-input'), 'test@example.com');
        await userEvent.type(screen.getByTestId('signup-password-input'), 'StrongPass1');
        await userEvent.type(screen.getByTestId('signup-confirm-password-input'), 'StrongPass1');

        await userEvent.click(screen.getByTestId('signup-submit-button'));

        expect(screen.getByTestId('signup-submit-button')).toHaveTextContent('Creating account...');
        expect(screen.getByTestId('signup-submit-button')).toBeDisabled();

        // Resolve the promise to finish the test
        resolveSignUp({ data: { user: { id: 'user-id' } }, error: null });
    });
});