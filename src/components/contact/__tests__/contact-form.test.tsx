import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../contact-form';

// Mock the modules
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('@/lib/actions/contact-actions', () => ({
    sendContactEmail: jest.fn()
}));

jest.mock('../../../hooks/use-error-logging', () => ({
    useErrorLogging: () => ({
        logError: jest.fn()
    })
}));

describe('ContactForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the contact form', () => {
        render(<ContactForm />);

        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
        expect(screen.getByTestId('contact-name-input')).toBeInTheDocument();
        expect(screen.getByTestId('contact-email-input')).toBeInTheDocument();
        expect(screen.getByTestId('contact-subject-select')).toBeInTheDocument();
        expect(screen.getByTestId('contact-message-textarea')).toBeInTheDocument();
        expect(screen.getByTestId('contact-submit-button')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        const user = userEvent.setup();
        render(<ContactForm />);

        // Click the submit button without filling any fields
        await user.click(screen.getByTestId('contact-submit-button'));

        // Look for the specific validation error messages from your schema
        await waitFor(() => {
            expect(screen.getByText('Name must be at least 2 characters long.')).toBeInTheDocument();
            expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
            expect(screen.getByText('Please select a subject.')).toBeInTheDocument();
            expect(screen.getByText('Message must be at least 10 characters long.')).toBeInTheDocument();
        });
    });
});