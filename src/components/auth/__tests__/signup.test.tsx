import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SignUp from '../signup';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn(),
}));

describe('SignUp Component', () => {
    const mockPush = jest.fn();
    const mockSignUp = jest.fn();
    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup router mock
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        // Setup supabase mock
        (createClient as jest.Mock).mockReturnValue({
            auth: {
                signUp: mockSignUp,
            }
        });

        // Setup error logging mock
        (useErrorLogging as jest.Mock).mockReturnValue({
            logError: mockLogError,
        });
    });

    test('renders sign up form', () => {
        render(<SignUp />);

        expect(screen.getByTestId('signup-form-container')).toBeInTheDocument();
        expect(screen.getByTestId('signup-form')).toBeInTheDocument();
        expect(screen.getByTestId('signup-firstname-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-lastname-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-confirm-password-input')).toBeInTheDocument();
        expect(screen.getByTestId('signup-submit-button')).toBeInTheDocument();
        expect(screen.getByTestId('signup-signin-link')).toBeInTheDocument();
    });

    test('validates form inputs', async () => {
        render(<SignUp />);

        // Submit empty form
        fireEvent.submit(screen.getByTestId('signup-form'));

        // Check validation messages
        await waitFor(() => {
            expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
            expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument();
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
            expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
        });
    });

    test('validates password matching', async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        // Enter non-matching passwords
        await user.type(screen.getByTestId('signup-password-input'), 'Password123');
        await user.type(screen.getByTestId('signup-confirm-password-input'), 'Password124');
        await user.tab(); // Move focus to trigger validation

        // Check validation message
        await waitFor(() => {
            expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();
        });
    });

    test('handles form submission successfully', async () => {
        const user = userEvent.setup();

        mockSignUp.mockResolvedValue({
            data: { user: { id: '123' } },
            error: null
        });

        render(<SignUp />);

        // Fill out form
        await user.type(screen.getByTestId('signup-firstname-input'), 'John');
        await user.type(screen.getByTestId('signup-lastname-input'), 'Doe');
        await user.type(screen.getByTestId('signup-email-input'), 'john@example.com');
        await user.type(screen.getByTestId('signup-password-input'), 'Password123');
        await user.type(screen.getByTestId('signup-confirm-password-input'), 'Password123');

        // Submit form
        await user.click(screen.getByTestId('signup-submit-button'));

        // Check if Supabase signUp was called with correct parameters
        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'john@example.com',
                password: 'Password123',
                options: {
                    emailRedirectTo: expect.any(String),
                    data: {
                        first_name: 'John',
                        last_name: 'Doe',
                        email_confirmed: false,
                    },
                },
            });
            expect(toast.success).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/verify-email?email=john%40example.com&type=signup'));
        });
    });

    test('handles signup error', async () => {
        const user = userEvent.setup();

        mockSignUp.mockResolvedValue({
            data: null,
            error: { message: 'Email already registered' }
        });

        render(<SignUp />);

        // Fill out form
        await user.type(screen.getByTestId('signup-firstname-input'), 'John');
        await user.type(screen.getByTestId('signup-lastname-input'), 'Doe');
        await user.type(screen.getByTestId('signup-email-input'), 'john@example.com');
        await user.type(screen.getByTestId('signup-password-input'), 'Password123');
        await user.type(screen.getByTestId('signup-confirm-password-input'), 'Password123');

        // Submit form
        await user.click(screen.getByTestId('signup-submit-button'));

        // Check if error toast was shown
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Email already registered');
        });
    });

    test('handles unexpected errors', async () => {
        const user = userEvent.setup();

        mockSignUp.mockImplementation(() => {
            throw new Error('Network error');
        });

        render(<SignUp />);

        // Fill out form
        await user.type(screen.getByTestId('signup-firstname-input'), 'John');
        await user.type(screen.getByTestId('signup-lastname-input'), 'Doe');
        await user.type(screen.getByTestId('signup-email-input'), 'john@example.com');
        await user.type(screen.getByTestId('signup-password-input'), 'Password123');
        await user.type(screen.getByTestId('signup-confirm-password-input'), 'Password123');

        // Submit form
        await user.click(screen.getByTestId('signup-submit-button'));

        // Check if error was logged and toast shown
        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), { action: "signUp" });
            expect(toast.error).toHaveBeenCalledWith('An error occurred during sign up. Please try again.');
        });
    });
});