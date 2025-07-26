import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactPage from '../page';

// Mock the ContactForm component
jest.mock('@/components/contact/contact-form', () => {
    return function MockContactForm() {
        return <div data-testid="mocked-contact-form">Contact Form</div>;
    };
});

describe('ContactPage', () => {
    it('renders the contact page with correct heading', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-page')).toBeInTheDocument();
        expect(screen.getByTestId('contact-page-heading')).toHaveTextContent('Get in Touch');
    });

    it('renders the description text', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-page-description')).toBeInTheDocument();
        expect(screen.getByTestId('contact-page-description')).toHaveTextContent(
            'Have questions about AceYourHireVue'
        );
    });

    it('renders the contact form container', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-form-container')).toBeInTheDocument();
        expect(screen.getByTestId('mocked-contact-form')).toBeInTheDocument();
    });

    it('renders contact information section', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-info-container')).toBeInTheDocument();
        expect(screen.getByTestId('contact-info-heading')).toHaveTextContent('Contact Information');
    });

    it('displays the correct email information', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-email-info')).toBeInTheDocument();
        expect(screen.getByText('support@aceyourhirevue.com')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /send email to support/i })).toHaveAttribute(
            'href',
            'mailto:support@aceyourhirevue.com'
        );
    });

    it('displays the response time information', () => {
        render(<ContactPage />);

        expect(screen.getByTestId('contact-response-time')).toBeInTheDocument();
        expect(screen.getByText(/Response Time:/i)).toBeInTheDocument();
        expect(screen.getByText(/We aim to respond to all inquiries within 24 hours/i)).toBeInTheDocument();
    });
});