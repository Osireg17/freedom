// File: app/api/interviews/[interviewId]/questions/[questionId]/response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withAxiom } from '@/lib/axiom/server';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from "@trigger.dev/sdk/v3";
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';
import { recordInterviewTask } from '../../../../../../../../trigger/interviews/record';
import {
  wrapDatabaseOperation,
  wrapExternalService,
  logServerEvent,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  assertFound,
} from '@/lib/error';

export const POST = withAxiom(async (
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string; questionId: string }> }
) => {
  const { interviewId, questionId } = await params;

  // Get authenticated user
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError('User must be authenticated to submit responses');
  }

  // Get the interview and verify ownership
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

  // Verify the question exists
  const question = await wrapDatabaseOperation(
    () => db.query.interviewQuestions.findFirst({
      where: and(
        eq(interviewQuestions.interviewId, interviewId),
        eq(interviewQuestions.id, questionId)
      )
    }),
    { operation: 'read', table: 'interview_questions' }
  );

  assertFound(question, 'Question', questionId);

  // Process form data
  const formData = await req.formData();
  const videoResponse = formData.get('videoResponse') as File | null;
  const responseTimeMsStr = formData.get('responseTimeMs') as string | null;
  const redoAttemptNumberStr = formData.get('redoAttemptNumber') as string | null;

  if (!videoResponse) {
    throw new ValidationError('Video response is required', {
      field: 'videoResponse',
      issues: [{ path: 'videoResponse', message: 'Video file is required', code: 'required' }]
    });
  }

  if (!responseTimeMsStr || isNaN(parseInt(responseTimeMsStr))) {
    throw new ValidationError('Valid response time is required', {
      field: 'responseTimeMs',
      issues: [{ path: 'responseTimeMs', message: 'Must be a valid number', code: 'invalid_type' }]
    });
  }

  const responseTimeMs = parseInt(responseTimeMsStr);
  const redoAttemptNumber = redoAttemptNumberStr ? parseInt(redoAttemptNumberStr) : 0;

  // Generate unique IDs
  const responseId = uuidv4();
  const filename = `${responseId}.webm`;
  const filePath = `interviews/${user.id}/${interviewId}/${filename}`;

  // Upload video to Supabase
  const audioBuffer = await videoResponse.arrayBuffer();

  await wrapExternalService(
    'supabase-storage',
    async () => {
      const { error: uploadError } = await supabaseAdmin.storage
        .from('interview-responses')
        .upload(filePath, audioBuffer, {
          contentType: 'audio/webm',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }
    },
    'upload-interview-response'
  );

  // Create or update answer record
  const existingAnswer = await wrapDatabaseOperation(
    () => db.query.interviewAnswers.findFirst({
      where: and(
        eq(interviewAnswers.interviewId, interviewId),
        eq(interviewAnswers.interviewQuestionId, questionId)
      )
    }),
    { operation: 'read', table: 'interview_answers' }
  );

  const finalResponseId = existingAnswer ? existingAnswer.id : responseId;

  if (existingAnswer) {
    await wrapDatabaseOperation(
      () => db.update(interviewAnswers)
        .set({
          redoAttemptNumber,
          audioUrl: filePath,
          audioDurationMs: responseTimeMs,
          updatedAt: new Date()
        })
        .where(eq(interviewAnswers.id, existingAnswer.id)),
      { operation: 'update', table: 'interview_answers' }
    );
  } else {
    await wrapDatabaseOperation(
      () => db.insert(interviewAnswers).values({
        id: responseId,
        interviewId,
        interviewQuestionId: questionId,
        redoAttemptNumber,
        audioUrl: filePath,
        audioDurationMs: responseTimeMs,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      { operation: 'create', table: 'interview_answers' }
    );
  }

  // Create signed URL
  const signedUrlResult = await wrapExternalService(
    'supabase-storage',
    () => supabaseAdmin.storage
      .from('interview-responses')
      .createSignedUrl(filePath, 3600),
    'create-signed-url'
  );

  // Trigger background processing
  const handle = await wrapExternalService(
    'trigger.dev',
    () => tasks.trigger<typeof recordInterviewTask>(
      "record-interview-task",
      {
        responseId: finalResponseId,
        interviewId,
        questionId,
        userId: user.id,
        audioPath: filePath
      }
    ),
    'record-interview-task'
  );

  logServerEvent('info', 'Interview response submitted', {
    responseId: finalResponseId,
    interviewId,
    questionId,
    userId: user.id,
    runId: handle.id
  });

  return NextResponse.json({
    success: true,
    responseId: finalResponseId,
    status: 'processing',
    message: 'Your response has been submitted and is being analyzed.',
    runId: handle.id,
    audioUrl: signedUrlResult.data?.signedUrl
  });
});
