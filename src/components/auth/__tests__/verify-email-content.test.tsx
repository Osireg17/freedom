import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import { toast } from 'sonner';
import VerifyEmailContent from '../verify-email-content';

jest.mock('@clerk/nextjs', () => ({
    useSignUp: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('VerifyEmailContent', () => {
    const mockRouter = { push: jest.fn() };
    const mockVerifyEmailCode = jest.fn();
    const mockSendEmailCode = jest.fn();
    const mockFinalize = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useSignUp as jest.Mock).mockReturnValue({
            signUp: {
                verifications: {
                    verifyEmailCode: mockVerifyEmailCode,
                    sendEmailCode: mockSendEmailCode,
                },
                finalize: mockFinalize,
            },
        });
    });

    it('renders the verify email content correctly', () => {
        render(<VerifyEmailContent email="test@example.com" />);

        expect(screen.getByText('Verify your email')).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        expect(screen.getByTestId('verify-code-input')).toBeInTheDocument();
    });

    it('verifies email code and redirects to dashboard on success', async () => {
        mockVerifyEmailCode.mockResolvedValueOnce({ error: null });
        mockFinalize.mockResolvedValueOnce({});

        render(<VerifyEmailContent email="test@example.com" />);

        fireEvent.change(screen.getByTestId('verify-code-input'), { target: { value: '123456' } });
        fireEvent.click(screen.getByTestId('verify-submit-button'));

        await waitFor(() => {
            expect(mockVerifyEmailCode).toHaveBeenCalledWith({ code: '123456' });
            expect(mockFinalize).toHaveBeenCalled();
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('shows error when verification code is wrong', async () => {
        mockVerifyEmailCode.mockResolvedValueOnce({ error: { message: 'Invalid code' } });

        render(<VerifyEmailContent email="test@example.com" />);

        fireEvent.change(screen.getByTestId('verify-code-input'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByTestId('verify-submit-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid code');
        });
    });

    it('resends verification code', async () => {
        mockSendEmailCode.mockResolvedValueOnce({});

        render(<VerifyEmailContent email="test@example.com" />);

        fireEvent.click(screen.getByTestId('resend-email-button'));

        await waitFor(() => {
            expect(mockSendEmailCode).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalled();
        });
    });

    it('navigates to sign in when back button is clicked', () => {
        render(<VerifyEmailContent email="test@example.com" />);

        fireEvent.click(screen.getByTestId('back-to-sign-in-button'));

        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
    });

    it('disables verify button when code is empty', () => {
        render(<VerifyEmailContent email="test@example.com" />);

        expect(screen.getByTestId('verify-submit-button')).toBeDisabled();
    });
});
