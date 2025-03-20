import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface ContactEmailProps {
    name: string;
    email: string;
    subject: string;
    message: string;
    isConfirmation?: boolean;
}

export function ContactEmail({
    name,
    email,
    subject,
    message,
    isConfirmation = false,
}: ContactEmailProps) {
    const previewText = isConfirmation
        ? `Thanks for contacting AceYourHireVue, ${name}!`
        : `New contact form submission from ${name}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white font-sans">
                    <Container className="mx-auto py-5 px-5 max-w-md">
                        <Section className="mt-8">
                            <Heading className="text-2xl font-bold text-slate-800 mb-0">
                                {isConfirmation ? 'Thank you for contacting us!' : 'New Contact Form Submission'}
                            </Heading>
                            <Text className="text-slate-500 mt-2 mb-4">
                                {isConfirmation
                                    ? `Hi ${name}, we've received your message and will respond within 24 hours.`
                                    : `You've received a new contact form submission from ${name}.`}
                            </Text>
                            <Hr className="border-slate-200 my-4" />
                        </Section>

                        <Section className="mt-4">
                            <Heading className="text-base font-semibold text-slate-700 mb-2">
                                Contact Details
                            </Heading>
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                <Text className="text-sm text-slate-700 mb-0">
                                    <strong>Name:</strong> {name}
                                </Text>
                                <Text className="text-sm text-slate-700 mb-0">
                                    <strong>Email:</strong>{' '}
                                    <Link href={`mailto:${email}`} className="text-blue-600 no-underline">
                                        {email}
                                    </Link>
                                </Text>
                                <Text className="text-sm text-slate-700 mb-0">
                                    <strong>Subject:</strong> {subject}
                                </Text>
                            </div>
                        </Section>

                        <Section className="mt-6">
                            <Heading className="text-base font-semibold text-slate-700 mb-2">
                                Message
                            </Heading>
                            <div className="border border-slate-200 rounded-lg p-4 bg-white">
                                <Text className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {message}
                                </Text>
                            </div>
                        </Section>

                        {isConfirmation && (
                            <Section className="mt-8">
                                <div className="border-t border-slate-200 pt-4">
                                    <Text className="text-sm text-slate-500 mb-0">
                                        If you have any further questions, feel free to reply to this email or visit our{' '}
                                        <Link
                                            href="https://aceyourhirevue.com/support"
                                            className="text-blue-600 no-underline"
                                        >
                                            support center
                                        </Link>
                                        .
                                    </Text>
                                </div>
                            </Section>
                        )}

                        <Section className="mt-8 text-center text-xs text-slate-400">
                            <Text className="mb-0">
                                © {new Date().getFullYear()} AceYourHireVue. All rights reserved.
                            </Text>
                            <Text className="mb-0">
                                Kingfisher court, Newbury, Berkshire RG14 5SJ
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

export default ContactEmail;