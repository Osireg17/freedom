import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ApiErrors } from '@/lib/error/api-error';
import { logServerEvent } from '@/lib/error/logger';
import { withAxiom } from '@/lib/axiom/server';
import { getCurrentUser } from '@/lib/actions/auth-actions';

// Define cache configuration
export const dynamic = 'force-dynamic'; // Default to dynamic rendering
export const revalidate = 60; // Revalidate cache every 60 seconds

export const GET = withAxiom(async (
  req: NextRequest, // Now we need the request for caching headers
  { params }: { params: Promise<{ interviewId: string; questionId: string }> }
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
    
    // Get the interview
    const interview = await db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      columns: { 
        userId: true,
        timeToAnswer: true 
      }
    });
    
    if (!interview) {
      return NextResponse.json(
        ApiErrors.NOT_FOUND('Interview', interviewId).toResponse(), 
        { status: 404 }
      );
    }
    
    // Check ownership
    if (interview.userId !== user.id) {
      return NextResponse.json(
        ApiErrors.FORBIDDEN('You do not have permission to access this interview').toResponse(), 
        { status: 403 }
      );
    }
    
    // Get the question
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
    
    // Get total number of questions in this interview
    const totalQuestions = await db.query.interviewQuestions.findMany({
      where: eq(interviewQuestions.interviewId, interviewId),
      columns: { id: true }
    }).then(questions => questions.length);
    
    // Create the response
    const response = NextResponse.json({
      id: question.id,
      interviewId: question.interviewId,
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      questionType: question.questionType,
      timeToAnswer: interview.timeToAnswer,
      prepTime: 30, // Default prep time, can be customized
      totalQuestions
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'max-age=60, s-maxage=60, stale-while-revalidate=300');
    
    return response;
    
  } catch (error) {
    // Log and return error
    logServerEvent('error', 'Failed to get question', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      ApiErrors.INTERNAL_ERROR('Failed to get question data.').toResponse(),
      { status: 500 }
    );
  }
});