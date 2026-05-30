import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withAxiom } from '@/lib/axiom/server';
import { auth } from '@clerk/nextjs/server';
import {
  wrapDatabaseOperation,
  AuthenticationError,
  AuthorizationError,
  assertFound,
} from '@/lib/error';

// Define cache configuration
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const GET = withAxiom(async (
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string; questionId: string }> }
) => {
  const { interviewId, questionId } = await params;

  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    throw new AuthenticationError('User must be authenticated to access questions');
  }

  // Get the interview
  const interview = await wrapDatabaseOperation(
    () => db.query.interviews.findFirst({
      where: eq(interviews.id, interviewId),
      columns: {
        userId: true,
        timeToAnswer: true
      }
    }),
    { operation: 'read', table: 'interviews' }
  );

  assertFound(interview, 'Interview', interviewId);

  // Check ownership
  if (interview.userId !== userId) {
    throw new AuthorizationError('You do not have permission to access this interview');
  }

  // Get the question
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

  // Get total number of questions in this interview
  const allQuestions = await wrapDatabaseOperation(
    () => db.query.interviewQuestions.findMany({
      where: eq(interviewQuestions.interviewId, interviewId),
      columns: { id: true }
    }),
    { operation: 'query', table: 'interview_questions' }
  );

  const totalQuestions = allQuestions.length;

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
});
