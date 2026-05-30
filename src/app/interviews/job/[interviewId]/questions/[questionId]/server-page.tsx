import React from 'react';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, AlertTriangle } from 'lucide-react';

interface QuestionServerPageProps {
    interviewId: string;
    questionId: string;
}

export default async function QuestionServerPage({ interviewId, questionId }: QuestionServerPageProps) {
    // Protect this route
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Not authenticated');
    }

    // Get the interview
    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
    });

    if (!interview || interview.userId !== userId) {
        return notFound();
    }

    // Get all questions for this interview
    const questions = await db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
        orderBy: (interviewQuestions, { asc }) => [asc(interviewQuestions.questionNumber)],
    });

    // Find the current question
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) {
        return notFound();
    }

    // Get all responses for this interview
    const responses = await db.query.interviewAnswers.findMany({
        where: eq(interviewAnswers.interviewId, interviewId),
    });

    // Create a map of questionId -> response for easy lookup
    const responseMap = new Map(responses.map(response => [response.interviewQuestionId, response]));

    // Check if this question is accessible
    const currentQuestionIndex = questions.findIndex(q => q.id === questionId);
    const hasResponse = responseMap.has(questionId);
    const isAccessible = currentQuestionIndex === 0 || responseMap.has(questions[currentQuestionIndex - 1].id);

    // If question already has a response, redirect back to interview overview
    if (hasResponse) {
        redirect(`/interviews/job/${interviewId}`);
    }

    // If question is not accessible, redirect to the first unanswered question
    if (!isAccessible) {
        // Find the first unanswered question that is accessible
        const firstUnansweredQuestion = questions.find((q, index) => {
            const questionHasResponse = responseMap.has(q.id);
            const questionIsAccessible = index === 0 || responseMap.has(questions[index - 1].id);
            return !questionHasResponse && questionIsAccessible;
        });

        if (firstUnansweredQuestion) {
            redirect(`/interviews/job/${interviewId}/questions/${firstUnansweredQuestion.id}`);
        } else {
            redirect(`/interviews/job/${interviewId}`);
        }
    }

    // If we get here, the question is accessible, return null to continue to client component
    return null;
}

export function QuestionAccessDenied({ interviewId, questionNumber }: { interviewId: string; questionNumber: number }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="p-8 max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>
                <h2 className="text-xl font-bold mb-4">Question Locked</h2>
                <p className="text-muted-foreground mb-6">
                    You need to complete the previous questions before accessing Question {questionNumber}.
                </p>
                <div className="flex gap-3">
                    <Button variant="outline" asChild className="flex-1">
                        <Link href={`/interviews/job/${interviewId}`}>
                            Back to Interview
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}