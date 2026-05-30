// src/app/api/interviews/job/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tasks } from "@trigger.dev/sdk/v3";
import { db } from '@/lib/db';
import { interviews } from '@/lib/db/schema';
import { withAxiom } from '@/lib/axiom/server';
import { generateJobInterviewQuestionsJob } from '../../../../../trigger/interviews/job';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import {
  wrapDatabaseOperation,
  wrapExternalService,
  logServerEvent,
  AuthenticationError,
} from '@/lib/error';

// Define validation schema for the API request
const jobInterviewRequestSchema = z.object({
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  yearsExperience: z.string().refine((val) => !isNaN(Number(val)), 'Years of experience must be a number'),
  timeToAnswer: z.string().refine((val) => !isNaN(Number(val)), 'Time to answer must be a number'),
  prepTime: z.string().refine((val) => !isNaN(Number(val)), 'Prep time must be a number'),
});

type JobInterviewRequest = z.infer<typeof jobInterviewRequestSchema>;

export const POST = withAxiom(async (req: NextRequest) => {
  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError('User must be authenticated to create interviews');
  }

  // Parse and validate request body (Zod throws on validation failure)
  const body: unknown = await req.json();
  const validatedData: JobInterviewRequest = jobInterviewRequestSchema.parse(body);

  const { jobTitle, companyName, jobDescription, yearsExperience, timeToAnswer, prepTime } = validatedData;

  // Create interview record in the database
  const interviewId = uuidv4();

  await wrapDatabaseOperation(
    () => db.insert(interviews).values({
      id: interviewId,
      userId: userId,
      interviewType: 'ai',
      companyName,
      jobPosition: jobTitle,
      jobDescription,
      jobExperience: yearsExperience,
      timeToAnswer: parseInt(timeToAnswer),
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    { operation: 'create', table: 'interviews' }
  );

  // Trigger background job using Trigger.dev
  const handle = await wrapExternalService(
    'trigger.dev',
    () => tasks.trigger<typeof generateJobInterviewQuestionsJob>(
      "generate-job-interview-questions",
      {
        interviewId,
        userId: user.id,
        jobTitle,
        companyName,
        jobDescription,
        yearsExperience: parseInt(yearsExperience),
        timeToAnswer: parseInt(timeToAnswer),
        prepTime: parseInt(prepTime),
      }
    ),
    'generate-job-interview-questions'
  );

  // Log successful request
  logServerEvent('info', 'Job interview creation initiated', {
    userId: user.id,
    interviewId,
    jobRunId: handle.id
  });

  // Return success response with the interview ID
  return NextResponse.json({
    success: true,
    interviewId,
    status: 'processing',
    message: 'Your interview is being created. You will be notified when it is ready.',
    runId: handle.id
  });
});
