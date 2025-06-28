import { z } from 'zod';

// Schema for job interview payload validation
export const JobInterviewPayloadSchema = z.object({
  interviewId: z.string(),
  userId: z.string(),
  jobTitle: z.string().min(2),
  companyName: z.string().min(2),
  jobDescription: z.string().min(50),
  yearsExperience: z.number().min(0),
  timeToAnswer: z.number().min(30).max(300),
  prepTime: z.number().min(0).max(300),
});

export type JobInterviewPayload = z.infer<typeof JobInterviewPayloadSchema>;
