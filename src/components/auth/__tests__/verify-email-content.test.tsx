import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VerifyEmailContent from '../verify-email-content';
import { createClient } from '@/lib/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';

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

describe('VerifyEmailContent', () => {
    const mockRouter = {
        push: jest.fn()
    };

    const mockSupabase = {
        auth: {
            resetPasswordForEmail: jest.fn(),
            resend: jest.fn()
        }
    };

    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });
    });

    it('renders the signup verification content correctly', () => {
        render(<VerifyEmailContent type="signup" email="test@example.com" />);

        expect(screen.getByText('Verify your email')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText(/We've sent a verification link/)).toBeInTheDocument();
    });

    it('renders the recovery content correctly', () => {
        render(<VerifyEmailContent type="recovery" email="test@example.com" />);

        expect(screen.getByText('Check your email')).toBeInTheDocument();
        expect(screen.getByText(/We've sent a password reset link/)).toBeInTheDocument();
    });

    it('renders the confirmation content correctly', () => {
        render(<VerifyEmailContent type="confirmation" />);

        expect(screen.getByText('Email verification required')).toBeInTheDocument();
        expect(screen.getByText(/Please verify your email address/)).toBeInTheDocument();
    });

    it('displays custom error message when provided', () => {
        render(<VerifyEmailContent type="signup" message="Error: Invalid token" />);

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Error: Invalid token')).toBeInTheDocument();
    });

    it('displays custom success message when provided', () => {
        render(<VerifyEmailContent type="signup" message="Verification successful" />);

        expect(screen.getByText('Note')).toBeInTheDocument();
        expect(screen.getByText('Verification successful')).toBeInTheDocument();
    });

    it('resends verification email for signup type', async () => {
        mockSupabase.auth.resend.mockResolvedValueOnce({ error: null });

        render(<VerifyEmailContent type="signup" email="test@example.com" />);

        fireEvent.click(screen.getByTestId('resend-email-button'));

        await waitFor(() => {
            expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
                type: 'signup',
                email: 'test@example.com',
                options: { emailRedirectTo: expect.any(String) }
            });
            expect(toast.success).toHaveBeenCalled();
        });
    });

    it('resends password reset email for recovery type', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });

        render(<VerifyEmailContent type="recovery" email="test@example.com" />);

        fireEvent.click(screen.getByTestId('resend-email-button'));

        await waitFor(() => {
            expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
                'test@example.com',
                { redirectTo: expect.any(String) }
            );
            expect(toast.success).toHaveBeenCalled();
        });
    });

    it('handles error when resending verification email', async () => {
        mockSupabase.auth.resend.mockResolvedValueOnce({
            error: { message: 'Too many requests' }
        });

        render(<VerifyEmailContent type="signup" email="test@example.com" />);

        fireEvent.click(screen.getByTestId('resend-email-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Too many requests');
        });
    });

    it('navigates to sign in page when back button is clicked', () => {
        render(<VerifyEmailContent type="signup" email="test@example.com" />);

        fireEvent.click(screen.getByTestId('back-to-sign-in-button'));

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
    });

    it('disables resend button when no email is provided', () => {
        render(<VerifyEmailContent type="signup" />);

        expect(screen.getByTestId('resend-email-button')).toBeDisabled();
    });
});