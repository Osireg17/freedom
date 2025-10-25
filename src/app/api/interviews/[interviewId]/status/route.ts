// src/app/api/interviews/[interviewId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withAxiom } from '@/lib/axiom/server';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { runs } from '@trigger.dev/sdk/v3';
import {
  wrapDatabaseOperation,
  wrapExternalService,
  logServerEvent,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  assertFound,
} from '@/lib/error';

type RouteParams = {
  interviewId: string;
};

export const GET = withAxiom(async (
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) => {
  const resolvedParams = await params;
  const { interviewId } = resolvedParams;

  // Get runId from query parameters
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');

  if (!runId) {
    throw new ValidationError('Missing runId query parameter', {
      field: 'runId',
      issues: [{ path: 'runId', message: 'runId is required', code: 'required' }]
    });
  }

  // Get authenticated user
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError('User must be authenticated to check interview status');
  }

  // Fetch interview and verify ownership
  const interview = await wrapDatabaseOperation(
    () => db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      columns: { userId: true }
    }),
    { operation: 'read', table: 'interviews' }
  );

  assertFound(interview, 'Interview', interviewId);

  if (interview.userId !== user.id) {
    throw new AuthorizationError('You do not have permission to access this interview');
  }

  // Fetch the run status from Trigger.dev
  const runDetails = await wrapExternalService(
    'trigger.dev',
    () => runs.retrieve(runId),
    'retrieve-run-status'
  );

    // Determine status based on Trigger.dev run status
    let status: 'processing' | 'completed' | 'error' = 'processing';
    let message = 'Interview questions are being generated.';

    // Map Trigger.dev statuses (only use statuses present in the SDK union)
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
      case 'DEQUEUED':
      case 'WAITING':
      case 'PENDING_VERSION':
      case 'EXPIRED':
      case 'TIMED_OUT':
        status = 'processing';
        message = `Interview generation is currently: ${runDetails.status}.`;
        break;
      case 'CANCELED':
      case 'FAILED':
      case 'CRASHED':
      case 'SYSTEM_FAILURE':
        status = 'error';
        message = `Interview generation encountered an error: ${runDetails.status}.`;
        break;
      default:
        status = 'processing'; // Default to processing for unknown states
        message = 'Checking interview generation status...';
    }

    // Check questions count
    const questions = await wrapDatabaseOperation(
      () => db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
        columns: { id: true }
      }),
      { operation: 'query', table: 'interview_questions' }
    );

    const questionsCount = questions.length;

    // If Trigger.dev says completed but no questions found, report an error
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
    triggerDevRunStatus: runDetails.status
  });
});
