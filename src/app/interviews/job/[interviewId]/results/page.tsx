import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ResultsClientPage from './client-page'

interface ResultsPageProps {
    params: { interviewId: string }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
    const interviewId = params.interviewId

    console.log('[ResultsPage] Loading results for interview:', interviewId)

    try {
        // Fetch interview data
        const interview = await db
            .select()
            .from(interviews)
            .where(eq(interviews.id, interviewId))
            .limit(1)

        if (interview.length === 0) {
            console.log('[ResultsPage] Interview not found:', interviewId)
            notFound()
        }

        console.log('[ResultsPage] Interview found:', {
            id: interview[0].id,
            companyName: interview[0].companyName,
            jobPosition: interview[0].jobPosition,
            status: interview[0].status
        })

        // Fetch all questions for this interview
        const questions = await db
            .select()
            .from(interviewQuestions)
            .where(eq(interviewQuestions.interviewId, interviewId))

        // Fetch all responses for this interview
        const responses = await db
            .select()
            .from(interviewAnswers)
            .where(eq(interviewAnswers.interviewId, interviewId))

        console.log('[ResultsPage] Data loaded:', {
            questionsCount: questions.length,
            responsesCount: responses.length,
            questionIds: questions.map(q => q.id),
            responseQuestionIds: responses.map(r => r.interviewQuestionId)
        })

        // Check if all questions are completed
        const allQuestionsCompleted = questions.length > 0 && responses.length === questions.length

        if (!allQuestionsCompleted) {
            console.log('[ResultsPage] Interview not completed:', {
                questionsCount: questions.length,
                responsesCount: responses.length,
                missingResponses: questions.filter(q =>
                    !responses.some(r => r.interviewQuestionId === q.id)
                ).map(q => q.id)
            })
            notFound() // Redirect to 404 if not all questions are completed
        }

        console.log('[ResultsPage] Rendering completed interview results')

        return (
            <Suspense fallback={<div>Loading results...</div>}>
                <ResultsClientPage
                    interview={interview[0]}
                    questions={questions}
                    responses={responses}
                />
            </Suspense>
        )
    } catch (error) {
        console.error('[ResultsPage] Error loading interview results:', {
            interviewId,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        })
        notFound()
    }
}