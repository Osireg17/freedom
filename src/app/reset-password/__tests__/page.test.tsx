import React from 'react';
import { render, screen } from '@testing-library/react';
import ResetPasswordPage from '../page';

// Mock the reset password form component
jest.mock('@/components/auth/reset-password-form', () => {
    return function MockResetPasswordForm() {
        return <div data-testid="reset-password-form">Reset Password Form</div>;
    };
});

describe('ResetPasswordPage', () => {
    it('renders the reset password page', () => {
        render(<ResetPasswordPage />);

        // Check if the page container is rendered
        expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
    });

    it('displays the correct heading', () => {
        render(<ResetPasswordPage />);

        // Check if the heading is rendered
        expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
    });

    it('displays the instruction text', () => {
        render(<ResetPasswordPage />);

        // Check if the instruction paragraph is rendered
        expect(screen.getByText(/Create a new password for your account/i)).toBeInTheDocument();
    });

    it('renders the ResetPasswordForm component', () => {
        render(<ResetPasswordPage />);

        // Check if the form component is rendered
        expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
    });
});