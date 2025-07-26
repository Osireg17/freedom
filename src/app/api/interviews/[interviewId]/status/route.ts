// src/app/api/interviews/[interviewId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ApiErrors } from '@/lib/error/api-error';
import { logServerEvent } from '@/lib/error/logger';
import { withAxiom } from '@/lib/axiom/server';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { runs } from '@trigger.dev/sdk/v3'; // Import the runs module

type RouteParams = {
  interviewId: string;
};

export const GET = withAxiom(async (req: NextRequest, 
  { params }: { params: Promise<RouteParams> }) => { 
  try {
    const resolvedParams = await params;
    const { interviewId } = resolvedParams;

    // Get runId from query parameters
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json(
        ApiErrors.BAD_REQUEST('Missing runId query parameter').toResponse(),
        { status: 400 }
      );
    }
    
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(ApiErrors.UNAUTHORIZED().toResponse(), { 
        status: 401 
      });
    }
    
    // Optional: You might still want to fetch the interview to ensure it belongs to the user
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      columns: { userId: true } // Only fetch necessary columns
    });
    
    if (!interview) {
      return NextResponse.json(
        ApiErrors.NOT_FOUND('Interview', interviewId).toResponse(), 
        { status: 404 }
      );
    }
    
    if (interview.userId !== user.id) {
      return NextResponse.json(
        ApiErrors.FORBIDDEN('You do not have permission to access this interview').toResponse(), 
        { status: 403 }
      );
    }

    // Fetch the run status from Trigger.dev
    const runDetails = await runs.retrieve(runId);

    // Determine status based on Trigger.dev run status
    let status: 'processing' | 'completed' | 'error' = 'processing';
    let message = 'Interview questions are being generated.';

    // Map Trigger.dev statuses
    switch (runDetails.status) {
      case 'COMPLETED':
        if (runDetails.isSuccess) {
          status = 'completed';
          message = 'Interview questions have been generated successfully.';
        } else {
          status = 'error';
          message = 'Interview generation failed.';
        }
        break;
      case 'DELAYED':
      case 'QUEUED':
      case 'EXECUTING':
      case 'REATTEMPTING':
      case 'FROZEN':
        status = 'processing';
        message = `Interview generation is currently: ${runDetails.status}.`;
        break;
      case 'CANCELED':
      case 'FAILED':
      case 'CRASHED':
      case 'INTERRUPTED':
      case 'SYSTEM_FAILURE':
        status = 'error';
        message = `Interview generation encountered an error: ${runDetails.status}.`;
        break;
      default:
        status = 'processing'; // Default to processing for unknown states
        message = 'Checking interview generation status...';
    }

    // Check questions count - still useful to know if they exist, especially for 'completed'
    const questionsCount = await db.query.interviewQuestions.findMany({
      where: eq(interviewQuestions.interviewId, interviewId),
      columns: { id: true } // Only count, don't need full data
    }).then(questions => questions.length);

    // If Trigger.dev says completed but no questions found, maybe report an error or different status?
    if (status === 'completed' && questionsCount === 0) {
        status = 'error';
        message = 'Interview generation completed, but no questions were found in the database. Please check logs.';
        logServerEvent('warn', 'Interview generation completed but no questions found', {
            interviewId,
            runId,
            triggerDevStatus: runDetails.status
        });
    }
    
    return NextResponse.json({
      interviewId,
      status,
      message,
      questionsCount,
      triggerDevRunStatus: runDetails.status // Optionally include the raw Trigger.dev status
    });
    
  } catch (error) {
    // Log and return error
    logServerEvent('error', 'Failed to get interview status', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Distinguish between API errors and Trigger.dev errors if possible
    if (error instanceof Error && error.message.includes('Could not find run with id')) {
         return NextResponse.json(
            ApiErrors.NOT_FOUND('Trigger.dev Run', String(error)).toResponse(), // Assuming runId is in error message or extract it
            { status: 404 }
         );
    }

    return NextResponse.json(
      ApiErrors.INTERNAL_ERROR('Failed to get interview status.').toResponse(),
      { status: 500 }
    );
  }
});