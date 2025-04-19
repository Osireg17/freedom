// src/app/api/interviews/[interviewId]/questions/[questionId]/response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ApiErrors } from '@/lib/error/api-error';
import { logServerEvent } from '@/lib/error/logger';
import { withAxiom } from '@/lib/axiom/server';
import { getCurrentUser } from '@/lib/actions/auth-actions';
import { v4 as uuidv4 } from 'uuid';


export const POST = withAxiom(async (
  req: NextRequest,
  { params }: { params: { interviewId: string; questionId: string } }
) => {
  try {
    const { interviewId, questionId } = params;
    
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
    
    // TODO: Upload video file to storage (Supabase)
    // For now, we'll simulate this step
    const audioUrl = `/api/storage/responses/${filename}`;
    
    // Create or update answer record
    const existingAnswer = await db.query.interviewAnswers.findFirst({
      where: and(
        eq(interviewAnswers.interviewId, interviewId),
        eq(interviewAnswers.interviewQuestionId, questionId)
      )
    });
    
    if (existingAnswer) {
      // Update existing answer
      await db.update(interviewAnswers)
        .set({
          redoAttemptNumber,
          audioUrl,
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
        audioUrl,
        audioDurationMs: responseTimeMs,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Trigger background job to process the response
    // This would be implemented with Trigger.dev in a real application
    // For now, we'll simulate this
    /*
    const handle = await tasks.trigger(
      "analyze-interview-response",
      {
        responseId,
        interviewId,
        questionId,
        userId: user.id,
        audioUrl
      }
    );
    */
    
    // Return success response
    return NextResponse.json({
      success: true,
      responseId,
      status: 'processing',
      message: 'Your response has been submitted and is being analyzed.'
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