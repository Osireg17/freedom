import * as z from 'zod';

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name must be less than 100 characters long.' }),
  
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .min(5, { message: 'Email must be at least 5 characters long.' })
    .max(100, { message: 'Email must be less than 100 characters long.' }),
  
  subject: z
    .string()
    .min(1, { message: 'Please select a subject.' }),
  
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters long.' })
    .max(1000, { message: 'Message must be less than 1000 characters long.' }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;