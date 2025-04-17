import { render, screen } from '@testing-library/react';
import ErrorPage from '../page';

describe('ErrorPage', () => {
    it('renders the error page with generic error by default', () => {
        render(<ErrorPage searchParams={{}} />);

        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByTestId('error-page-title')).toHaveTextContent('Something Went Wrong');
        expect(screen.getByTestId('error-page-message')).toHaveTextContent('An unexpected error occurred.');
    });

    it('renders verification failed error when specified', () => {
        render(<ErrorPage searchParams={{ code: 'verification_failed' }} />);

        expect(screen.getByTestId('error-page-title')).toHaveTextContent('Verification Failed');
        expect(screen.getByTestId('error-page-message')).toHaveTextContent('We couldn\'t verify your email.');
        expect(screen.getByTestId('error-page-sign-in-button')).toBeInTheDocument();
    });

    it('renders callback error when specified', () => {
        render(<ErrorPage searchParams={{ code: 'callback_error' }} />);

        expect(screen.getByTestId('error-page-title')).toHaveTextContent('Authentication Error');
        expect(screen.getByTestId('error-page-message')).toHaveTextContent('An error occurred during the authentication process.');
    });

    it('displays custom error message when provided', () => {
        const customMessage = 'This is a custom error message';
        render(<ErrorPage searchParams={{ message: customMessage }} />);

        expect(screen.getByTestId('error-page-message')).toHaveTextContent(customMessage);
    });

    it('renders navigation buttons', () => {
        render(<ErrorPage searchParams={{}} />);

        expect(screen.getByTestId('error-page-back-button')).toBeInTheDocument();
        expect(screen.getByTestId('error-page-home-button')).toBeInTheDocument();
    });

    it('does not render sign-in button for non-verification errors', () => {
        render(<ErrorPage searchParams={{ code: 'session_expired' }} />);

        expect(screen.queryByTestId('error-page-sign-in-button')).not.toBeInTheDocument();
    });
});