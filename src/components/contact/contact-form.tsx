'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import { FormError } from '@/components/error/form-error';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { sendContactEmail } from '@/lib/actions/contact-actions';
import { contactFormSchema, ContactFormValues } from '@/lib/schemas/contact-schema';

const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { logError } = useErrorLogging();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    async function onSubmit(data: ContactFormValues) {
        setIsSubmitting(true);
        setFormError(null);

        try {
            const result = await sendContactEmail(data);

            if (result.success) {
                toast.success('Message sent successfully! We\'ll be in touch soon.');
                form.reset();
            } else {
                setFormError(result.error || 'Failed to send message. Please try again.');
                toast.error(result.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            // Log the error to our error tracking service
            logError(error, {
                component: 'ContactForm',
                action: 'submit',
                formData: JSON.stringify(data)
            });

            setFormError('An unexpected error occurred. Please try again later.');
            toast.error('An unexpected error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div data-testid="contact-form">
            <FormError error={formError} />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    data-testid="contact-form-element"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your name"
                                            {...field}
                                            data-testid="contact-name-input"
                                            aria-label="Your full name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your email address"
                                            type="email"
                                            {...field}
                                            data-testid="contact-email-input"
                                            aria-label="Your email address"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger
                                            data-testid="contact-subject-select"
                                            aria-label="Select inquiry subject"
                                        >
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="general">General Inquiry</SelectItem>
                                        <SelectItem value="support">Technical Support</SelectItem>
                                        <SelectItem value="billing">Billing Question</SelectItem>
                                        <SelectItem value="enterprise">Enterprise Options</SelectItem>
                                        <SelectItem value="feedback">Product Feedback</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="How can we help you?"
                                        className="min-h-[150px]"
                                        {...field}
                                        data-testid="contact-message-textarea"
                                        aria-label="Your message"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={isSubmitting}
                        data-testid="contact-submit-button"
                        aria-label="Send message"
                    >
                        {isSubmitting ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Send Message
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default ContactForm;