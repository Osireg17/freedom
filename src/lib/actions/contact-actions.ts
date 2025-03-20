'use server';

import { Resend } from 'resend';
import { ContactEmail } from '@/components/emails/contact-email';
import { contactFormSchema, type ContactFormValues } from '@/lib/schemas/contact-schema';

// Initialize Resend with API key
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// Map of subject values to readable titles
const subjectMap: Record<string, string> = {
  'general': 'General Inquiry',
  'support': 'Technical Support',
  'billing': 'Billing Question',
  'enterprise': 'Enterprise Options',
  'feedback': 'Product Feedback',
};

export async function sendContactEmail(formData: ContactFormValues) {
  try {
    // Validate form data
    const validatedFields = contactFormSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid form data. Please check your inputs and try again.'
      };
    }
    
    const { name, email, subject, message } = validatedFields.data;
    const subjectTitle = subjectMap[subject] || 'Contact Form Submission';
    
    // Send email using Resend
    const result = await resend.emails.send({
      from: 'AceYourHireVue <contact@aceyourhirevue.com>',
      to: ['support@aceyourhirevue.com'],
      replyTo: email,
      subject: `[Contact Form] ${subjectTitle} from ${name}`,
      react: ContactEmail({ 
        name, 
        email, 
        subject: subjectTitle, 
        message 
      }),
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: 'AceYourHireVue <no-reply@aceyourhirevue.com>',
      to: [email],
      subject: 'We received your message - AceYourHireVue',
      react: ContactEmail({ 
        name, 
        email, 
        subject: 'Thank you for contacting us', 
        message: 'We have received your message and will get back to you as soon as possible. This is an automated response, please do not reply to this email.',
        isConfirmation: true
      }),
    });
    
    if (result.error) {
      console.error('Error sending email:', result.error);
      return {
        success: false,
        error: 'Failed to send email. Please try again later.'
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Contact form action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    };
  }
}