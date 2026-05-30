import React from 'react';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import DeviceSelector from '@/components/interviews/device/device-selector';

interface DeviceSetupPageProps {
    params: {
        interviewId: string
    }
}

export default async function DeviceSetupPage({ params }: DeviceSetupPageProps) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Not authenticated');
    }
    const interviewId = params.interviewId;

    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
    });

    if (!interview || interview.userId !== userId) {
        return notFound();
    }

    const questions = await db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
        orderBy: (interviewQuestions, { asc }) => [asc(interviewQuestions.questionNumber)],
    });

    if (questions.length === 0) {
        return notFound();
    }

    // Get all responses for this interview to determine the next unanswered question
    const responses = await db.query.interviewAnswers.findMany({
        where: eq(interviewAnswers.interviewId, interviewId),
    });

    // Create a map of questionId -> response for easy lookup
    const responseMap = new Map(responses.map(response => [response.interviewQuestionId, response]));

    // Find the first unanswered question, or default to first question
    const firstUnansweredQuestion = questions.find(q => !responseMap.has(q.id));
    const questionId = firstUnansweredQuestion?.id || questions[0].id;

    return (
        <div className="h-screen">
            <DeviceSelector interviewId={interviewId} />
        </div>
    );
}
