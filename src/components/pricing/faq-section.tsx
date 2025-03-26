// src/components/pricing/faq-section.tsx
'use client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { useErrorLogging } from '@/hooks/use-error-logging';

export function FaqSection() {

    const { logError } = useErrorLogging();

    const faqs = [
        {
            question: 'How does the subscription billing work?',
            answer: 'Subscriptions are billed monthly. You can cancel your subscription at any time, and your access will continue until the end of your current billing period. There are no hidden fees or long-term commitments.',
        },
        {
            question: 'Can I switch between plans?',
            answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to the new features and be charged the prorated difference. When downgrading, the new rate will apply at the start of your next billing cycle.",
        },
        {
            question: 'Is there a free trial for paid plans?',
            answer: "We don't currently offer free trials for our paid plans, but our free tier gives you access to 3 practice interviews per month so you can experience the platform before subscribing.",
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal for subscription payments.',
        },
        {
            question: 'Do you offer refunds?',
            answer: "We don't normally provide refunds for subscription payments, but we evaluate exceptional circumstances on a case-by-case basis. Please contact our support team if you have any concerns.",
        },
    ];

    try {
        return (
            <div className="w-full" data-testid="pricing-faq-section">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2" data-testid="pricing-faq-heading">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Got questions about our pricing? Find answers to common inquiries below.
                    </p>
                </div>
                <Accordion type="single" collapsible className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            data-testid={`pricing-faq-item-${index}`}
                        >
                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        );
    } catch (error: unknown) {
        const errorString = error instanceof Error ? error.message : 'An error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;
        logError(error, {
            message: errorString,
            stack: errorStack,
            component: 'FaqSection'
        });

        // Return a simplified fallback UI
        return (
            <div className="w-full" data-testid="pricing-faq-section-error">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        We&apos;re experiencing an issue loading the FAQ section.
                        If you have questions, please <a href="/contact" className="text-primary hover:underline">contact our support team</a>.
                    </p>
                </div>
            </div>
        );
    }
}
