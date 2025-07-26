import { render, screen } from '@testing-library/react';
import ErrorPage from '../page';

describe('ErrorPage', () => {
    // Because ErrorPage is an async component, we need to await it before rendering
    const renderComponent = async (searchParams: { code?: string; message?: string }) => {
        const page = await ErrorPage({ searchParams: Promise.resolve(searchParams) });
        render(page);
    };

    it('renders the error page with generic error by default', async () => {
        await renderComponent({});

        expect(screen.getByTestId('error-page')).toBeInTheDocument();
        expect(screen.getByTestId('error-page-title')).toHaveTextContent('Something Went Wrong');
        expect(screen.getByTestId('error-page-message')).toHaveTextContent(
            'An unexpected error occurred. Please try again or contact support if the problem persists.'
        );
    });

    it('renders verification failed error when specified', async () => {
        await renderComponent({ code: 'verification_failed' });

        expect(screen.getByTestId('error-page-title')).toHaveTextContent('Verification Failed');
        expect(screen.getByTestId('error-page-message')).toHaveTextContent(
            "We couldn't verify your email. The link may have expired or already been used."
        );
        expect(screen.getByTestId('error-page-sign-in-button')).toBeInTheDocument();
    });

    it('renders callback error when specified', async () => {
        await renderComponent({ code: 'callback_error' });

        expect(screen.getByTestId('error-page-title')).toHaveTextContent('Authentication Error');
        expect(screen.getByTestId('error-page-message')).toHaveTextContent(
            'An error occurred during the authentication process. Please try again.'
        );
    });

    it('displays custom error message when provided', async () => {
        const customMessage = 'This is a custom error message';
        await renderComponent({ message: customMessage });

        expect(screen.getByTestId('error-page-message')).toHaveTextContent(customMessage);
    });

    it('renders navigation buttons', async () => {
        await renderComponent({});

        expect(screen.getByTestId('error-page-back-button')).toBeInTheDocument();
        expect(screen.getByTestId('error-page-home-button')).toBeInTheDocument();
    });

    it('does not render sign-in button for non-verification errors', async () => {
        await renderComponent({ code: 'session_expired' });

        expect(screen.queryByTestId('error-page-sign-in-button')).not.toBeInTheDocument();
    });
});
