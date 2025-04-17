import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '../page';

// Mock the ForgotPasswordForm component
jest.mock('@/components/auth/forgot-password-form', () => {
    return function MockForgotPasswordForm() {
        return <div data-testid="forgot-password-form">Mocked Forgot Password Form</div>;
    };
});

describe('ForgotPasswordPage', () => {
    it('renders the page with correct title and description', () => {
        render(<ForgotPasswordPage />);

        expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
        expect(screen.getByText('Forgot Password')).toBeInTheDocument();
        expect(
            screen.getByText('Enter your email address and we\'ll send you a link to reset your password')
        ).toBeInTheDocument();
    });

    it('renders the ForgotPasswordForm component', () => {
        render(<ForgotPasswordPage />);

        expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
    });

    it('has the correct layout classes for responsive design', () => {
        render(<ForgotPasswordPage />);

        const container = screen.getByTestId('forgot-password-page');
        expect(container).toHaveClass('container', 'flex', 'h-screen', 'w-full', 'flex-col', 'items-center', 'justify-center');

        const formContainer = container.querySelector('div.mx-auto');
        expect(formContainer).toHaveClass('mx-auto', 'flex', 'w-full', 'flex-col', 'justify-center', 'space-y-6', 'sm:w-[350px]');
    });
});