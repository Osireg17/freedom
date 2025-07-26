import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqSection } from '../faq-section';

describe('FaqSection', () => {
    test('renders the FAQ section with correct heading', () => {
        render(<FaqSection />);

        expect(screen.getByTestId('pricing-faq-section')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-faq-heading')).toHaveTextContent('Frequently Asked Questions');
    });

    test('renders all FAQ items', () => {
        render(<FaqSection />);

        expect(screen.getByTestId('pricing-faq-item-0')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-faq-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-faq-item-2')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-faq-item-3')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-faq-item-4')).toBeInTheDocument();
    });

    test('displays all questions in the accordion', () => {
        render(<FaqSection />);

        expect(screen.getByText('How does the subscription billing work?')).toBeInTheDocument();
        expect(screen.getByText('Can I switch between plans?')).toBeInTheDocument();
        expect(screen.getByText('Is there a free trial for paid plans?')).toBeInTheDocument();
        expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
        expect(screen.getByText('Do you offer refunds?')).toBeInTheDocument();
    });

    test('expands and collapses accordion items when clicked', async () => {
        render(<FaqSection />);
        const user = userEvent.setup();

        // First FAQ item initially collapsed
        const firstQuestion = screen.getByText('How does the subscription billing work?');
        const firstAnswer = 'Subscriptions are billed monthly. You can cancel your subscription at any time, and your access will continue until the end of your current billing period. There are no hidden fees or long-term commitments.';

        // Answer should not be visible initially
        expect(screen.queryByText(firstAnswer)).not.toBeInTheDocument();

        // Click to expand
        await user.click(firstQuestion);
        expect(screen.getByText(firstAnswer)).toBeVisible();

        // Click to collapse again
        await user.click(firstQuestion);
        expect(screen.queryByText(firstAnswer)).not.toBeInTheDocument();
    });

    test('only one accordion item can be open at a time', async () => {
        render(<FaqSection />);
        const user = userEvent.setup();

        const firstQuestion = screen.getByText('How does the subscription billing work?');
        const secondQuestion = screen.getByText('Can I switch between plans?');

        // Open first item
        await user.click(firstQuestion);
        expect(screen.getByText(/Subscriptions are billed monthly/)).toBeVisible();

        // Open second item - should close the first
        await user.click(secondQuestion);
        expect(screen.getByText(/Yes, you can upgrade or downgrade/)).toBeVisible();
        expect(screen.queryByText(/Subscriptions are billed monthly/)).not.toBeInTheDocument();
    });
});