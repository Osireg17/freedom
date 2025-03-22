// src/app/contact/page.tsx
import { Metadata } from 'next';
import { Mail } from 'lucide-react';

// Import error handling components
import ErrorBoundary from '@/components/error/error-boundary';
import { logServerError } from '@/lib/error/logger';
import ContactForm from '@/components/contact/contact-form';

export const metadata: Metadata = {
    title: 'Contact Us - AceYourHireVue',
    description: 'Get in touch with the AceYourHireVue team for information, support, or feedback',
};

const ContactPage = () => {
    try {
        return (
            <div className="container py-12 md:py-20" data-testid="contact-page">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1
                        className="text-4xl font-bold mb-4"
                        data-testid="contact-page-heading"
                    >
                        Get in Touch
                    </h1>
                    <p
                        className="text-xl text-muted-foreground mx-auto max-w-2xl"
                        data-testid="contact-page-description"
                    >
                        Have questions about AceYourHireVue? Want to learn more about our enterprise options?
                        Fill out the form below and our team will respond within 24 hours.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
                    {/* Contact Form with Error Boundary */}
                    <div
                        className="md:col-span-2 order-2 md:order-1"
                        data-testid="contact-form-container"
                    >
                        <ErrorBoundary
                            fallback={
                                <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-md">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        Contact Form Unavailable
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        We&apos;re experiencing technical difficulties with our contact form.
                                        Please email us directly at{' '}
                                        <a
                                            href="mailto:support@aceyourhirevue.com"
                                            className="text-primary hover:underline"
                                        >
                                            support@aceyourhirevue.com
                                        </a>.
                                    </p>
                                </div>
                            }
                        >
                            <ContactForm />
                        </ErrorBoundary>
                    </div>

                    {/* Contact Information */}
                    <div
                        className="order-1 md:order-2"
                        data-testid="contact-info-container"
                    >
                        <div className="bg-muted/50 p-6 rounded-lg border space-y-6">
                            <h2
                                className="text-xl font-semibold"
                                data-testid="contact-info-heading"
                            >
                                Contact Information
                            </h2>

                            <div className="space-y-4">
                                <div
                                    className="flex items-start gap-3"
                                    data-testid="contact-email-info"
                                >
                                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Email</h3>
                                        <a
                                            href="mailto:support@aceyourhirevue.com"
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                            aria-label="Send email to support"
                                        >
                                            support@aceyourhirevue.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="pt-4 border-t"
                                data-testid="contact-response-time"
                            >
                                <p className="text-sm text-muted-foreground">
                                    <strong>Response Time:</strong> We aim to respond to all inquiries within 24 hours during business days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        // Log any errors during page rendering
        logServerError(error instanceof Error ? error : new Error('Unknown error in ContactPage'), {
            component: 'ContactPage',
            path: '/contact'
        });

        // Re-throw to let Next.js error page handle it
        throw error;
    }
}

export default ContactPage;