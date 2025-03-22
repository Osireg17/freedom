import { render, screen } from '@testing-library/react';
import ContactPage from '../page';

jest.mock('@/components/contact/contact-form', () => ({
    ContactForm: () => <div data-testid="mocked-contact-form">Contact form mocked</div>,
}));

jest.mock('lucide-react', () => ({
    Mail: () => <div data-testid="mocked-mail-icon">Mail icon mocked</div>,
}));

describe('ContactPage', () => {
    it('renders the contact page with correct heading', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-page')).toBeInTheDocument();
        expect(screen.getByTestId('contact-page-heading')).toHaveTextContent('Get in Touch');
    });

    it('renders the page description', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-page-description')).toBeInTheDocument();
        expect(screen.getByTestId('contact-page-description')).toHaveTextContent(
            'Have questions about AceYourHireVue? Want to learn more about our enterprise options?'
        );
    });

    it('renders the contact form component', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-form-container')).toBeInTheDocument();
        expect(screen.getByTestId('mocked-contact-form')).toBeInTheDocument();
    });

    it('renders the contact information section', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-info-container')).toBeInTheDocument();
        expect(screen.getByTestId('contact-info-heading')).toHaveTextContent('Contact Information');
    });

    it('displays the correct email contact information', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-email-info')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();

        const emailLink = screen.getByRole('link', { name: /send email to support/i });
        expect(emailLink).toHaveAttribute('href', 'mailto:support@aceyourhirevue.com');
        expect(emailLink).toHaveTextContent('support@aceyourhirevue.com');
    });

    it('displays the response time information', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-response-time')).toBeInTheDocument();
        expect(screen.getByText(/response time:/i)).toBeInTheDocument();
        expect(screen.getByText(/we aim to respond to all inquiries within 24 hours/i)).toBeInTheDocument();
    });
});