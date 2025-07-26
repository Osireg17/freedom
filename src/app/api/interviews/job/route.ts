// src/app/api/interviews/job/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';
import { tasks } from "@trigger.dev/sdk/v3";
import { logServerEvent } from '@/lib/error/logger';
import { db } from '@/lib/db';
import { ApiErrors } from '@/lib/error/api-error';
import { interviews } from '@/lib/db/schema';
import { withAxiom } from '@/lib/axiom/server';
import { generateJobInterviewQuestionsJob } from '../../../../../trigger/interviews/job';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { v4 as uuidv4 } from 'uuid';

// Define validation schema for the API request
const jobInterviewRequestSchema = z.object({
  jobTitle: z.string().min(2),
  companyName: z.string().min(2),
  jobDescription: z.string().min(50),
  yearsExperience: z.string().refine((val) => !isNaN(Number(val))),
  timeToAnswer: z.string().refine((val) => !isNaN(Number(val))),
  prepTime: z.string().refine((val) => !isNaN(Number(val))),
});

export const POST = withAxiom(async (req: NextRequest) => {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user
    ) {
      return NextResponse.json(ApiErrors.UNAUTHORIZED().toResponse(), { 
        status: 401 
      });
    }

    // Parse request body
    const body = await req.json();
    
    // Validate request data
    const validationResult = jobInterviewRequestSchema.safeParse(body);
    // Inside your POST handler
    if (!validationResult.success) {
    // Transform Zod issues into your API error format
    const errorDetails = validationResult.error.errors.map(error => ({
      message: error.message,
      path: error.path.join('.'),
      // Add any other fields required by ApiErrorDetails
    }));
  
    return NextResponse.json(
      ApiErrors.BAD_REQUEST('Invalid form data', errorDetails).toResponse(), 
      { status: 400 }
    );
  }
    
    const { jobTitle, companyName, jobDescription, yearsExperience, timeToAnswer, prepTime } = validationResult.data;
    
    // Create interview record in the database
    const interviewId = uuidv4();
    
    await db.insert(interviews).values({
      id: interviewId,
      userId: user.id,
      interviewType: 'ai',
      companyName,
      jobPosition: jobTitle,
      jobDescription,
      jobExperience: yearsExperience,
      timeToAnswer: parseInt(timeToAnswer),
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Trigger background job using Trigger.dev
    const handle = await tasks.trigger<typeof generateJobInterviewQuestionsJob>(
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
    
  } catch (error) {
    // Log and return error
    logServerEvent('error', 'Failed to create job interview', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      ApiErrors.INTERNAL_ERROR('Failed to create interview. Please try again.').toResponse(),
      { status: 500 }
    );
  }
});