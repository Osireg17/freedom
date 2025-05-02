import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ApiErrors } from '@/lib/error/api-error';
import { logServerEvent } from '@/lib/error/logger';
import { withAxiom } from '@/lib/axiom/server';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from "@trigger.dev/sdk/v3";
import { createClient } from '@/lib/supabase/server';
import { recordInterviewTask } from '../../../../../../../../trigger/interviews/record';


export const POST = withAxiom(async (
  req: NextRequest,
  { params }: { params: { interviewId: string; questionId: string } }
) => {
  try {
    const { interviewId, questionId } = await params;
    
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(ApiErrors.UNAUTHORIZED().toResponse(), { 
        status: 401 
      });
    }
    
    // Get the interview and verify ownership
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      columns: { userId: true }
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
    
    // Verify the question exists
    const question = await db.query.interviewQuestions.findFirst({
      where: and(
        eq(interviewQuestions.interviewId, interviewId),
        eq(interviewQuestions.id, questionId)
      )
    });
    
    if (!question) {
      return NextResponse.json(
        ApiErrors.NOT_FOUND('Question', questionId).toResponse(), 
        { status: 404 }
      );
    }
    
    // Process form data
    const formData = await req.formData();
    const videoResponse = formData.get('videoResponse') as File;
    const responseTimeMs = parseInt(formData.get('responseTimeMs') as string);
    const redoAttemptNumber = parseInt(formData.get('redoAttemptNumber') as string);
    
    if (!videoResponse) {
      return NextResponse.json(
        ApiErrors.BAD_REQUEST('Video response is required').toResponse(),
        { status: 400 }
      );
    }
    
    // Generate unique IDs
    const responseId = uuidv4();
    const filename = `${responseId}.webm`;
    
    // Initialize Supabase client
    const supabase = await createClient();

    // Upload video to Supabase storage
    const audioBuffer = await videoResponse.arrayBuffer();
    const filePath = `interviews/${user.id}/${interviewId}/${filename}`;
    
    const { error: uploadError } = await supabase.storage
      .from('interview-responses')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/webm',
      });

    if (uploadError) {
      logServerEvent('error', 'Failed to upload interview response', {
        error: uploadError.message,
        interviewId,
        questionId,
      });
      
      return NextResponse.json(
        ApiErrors.INTERNAL_ERROR('Failed to upload your response. Please try again.').toResponse(),
        { status: 500 }
      );
    }

    // Create or update answer record
    const existingAnswer = await db.query.interviewAnswers.findFirst({
      where: and(
        eq(interviewAnswers.interviewId, interviewId),
        eq(interviewAnswers.interviewQuestionId, questionId)
      )
    });
    
    const finalResponseId = existingAnswer ? existingAnswer.id : responseId;
    
    if (existingAnswer) {
      // Update existing answer
      await db.update(interviewAnswers)
        .set({
          redoAttemptNumber,
          audioUrl: filePath,
          audioDurationMs: responseTimeMs,
          updatedAt: new Date()
        })
        .where(eq(interviewAnswers.id, existingAnswer.id));
    } else {
      // Create new answer
      await db.insert(interviewAnswers).values({
        id: responseId,
        interviewId,
        interviewQuestionId: questionId,
        redoAttemptNumber,
        audioUrl: filePath,
        audioDurationMs: responseTimeMs,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Trigger background job to process the response
    const handle = await tasks.trigger<typeof recordInterviewTask>(
      "record-interview-task",
      {
        responseId: finalResponseId,
        interviewId,
        questionId,
        userId: user.id,
        audioPath: filePath
      }
    );
    
    // Return success response
    return NextResponse.json({
      success: true,
      responseId: finalResponseId,
      status: 'processing',
      message: 'Your response has been submitted and is being analyzed.',
      runId: handle.id
    });
    
  } catch (error) {
    // Log and return error
    logServerEvent('error', 'Failed to submit question response', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      ApiErrors.INTERNAL_ERROR('Failed to submit your response. Please try again.').toResponse(),
      { status: 500 }
    );
  }
});