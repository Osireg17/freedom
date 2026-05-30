// src/app/interviews/job/[id]/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, interviewAnswers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Check, Lock } from 'lucide-react';
import { QuestionButton, QuickStartButton } from './client-wrapper';


export async function generateMetadata() {
    return {
        title: 'Job Interview - AceYourHireVue',
        description: 'Practice your interview with personalised questions',
    };
}

export default async function InterviewPage({ params }: { params: Promise<{ interviewId: string }> }) {
    // Protect this route
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Not authenticated');
    }

    const resolvedParams = await params;
    const interviewId = resolvedParams.interviewId;

    // Get the interview
    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
    });

    if (!interview) {
        return notFound();
    }

    // Check if the interview belongs to the user
    if (interview.userId !== userId) {
        return notFound();
    }

    // Get the interview questions
    const questions = await db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
        orderBy: (interviewQuestions, { asc }) => [asc(interviewQuestions.questionNumber)],
    });

    if (questions.length === 0) {
        return notFound();
    }

    // Get all responses for this interview to determine which questions have been answered
    const responses = await db.query.interviewAnswers.findMany({
        where: eq(interviewAnswers.interviewId, interviewId),
        orderBy: (interviewAnswers, { asc }) => [asc(interviewAnswers.createdAt)],
    });

    // Create a map of questionId -> response for easy lookup
    const responseMap = new Map(responses.map(response => [response.interviewQuestionId, response]));

    // Determine which questions have been answered
    const questionsWithStatus = questions.map((question, index) => {
        const hasResponse = responseMap.has(question.id);
        const isAccessible = index === 0 || responseMap.has(questions[index - 1].id);

        return {
            ...question,
            hasResponse,
            isAccessible,
            response: responseMap.get(question.id) || null
        };
    });

    // Find the first unanswered question
    const firstUnansweredQuestion = questionsWithStatus.find(q => !q.hasResponse && q.isAccessible);

    // If all questions are answered, allow access to all
    const allQuestionsAnswered = questionsWithStatus.every(q => q.hasResponse);

    return (
        <div className="container py-8 max-w-4xl mx-auto" data-testid="interview-page">
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-6"
                aria-label="Back to dashboard"
            >
                <Link href="/dashboard">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{interview.jobPosition} Interview</h1>
                <p className="text-muted-foreground">
                    {interview.companyName} • {questions.length} questions
                </p>
                <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Progress: {responses.length} / {questions.length} questions completed</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(responses.length / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {firstUnansweredQuestion && !allQuestionsAnswered && (
                <Card className="p-4 mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-sm font-medium">
                                Continue with Question {firstUnansweredQuestion.questionNumber}
                            </span>
                        </div>
                        <QuickStartButton 
                            interviewId={interview.id} 
                            questionId={firstUnansweredQuestion.id} 
                        />
                    </div>
                </Card>
            )}

            {allQuestionsAnswered && (
                <Card className="p-4 mb-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Interview completed! All questions have been submitted and are now locked.
                            </span>
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href={`/interviews/job/${interview.id}/results`}>
                                View Results
                            </Link>
                        </Button>
                    </div>
                </Card>
            )}

            <div className="space-y-6">
                {questionsWithStatus.map((question, index) => {
                    const isLocked = !question.isAccessible && !allQuestionsAnswered;
                    const isCompleted = question.hasResponse;

                    return (
                        <Card
                            key={question.id}
                            className={`p-6 transition-all duration-200 ${
                                isCompleted
                                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50'
                                    : isLocked 
                                        ? 'opacity-60 bg-muted/50' 
                                        : question.isAccessible 
                                            ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/30'
                                            : ''
                            }`}
                            data-testid={`interview-question-${index + 1}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full ${isCompleted
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : question.isAccessible
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            {isCompleted && <Check className="h-3 w-3" />}
                                            {isLocked && <Lock className="h-3 w-3" />}
                                            Question {index + 1}
                                        </span>
                                    </div>
                                    {isCompleted && (
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            Completed & Locked
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {question.questionType.charAt(0).toUpperCase() + question.questionType.slice(1)}
                                </div>
                            </div>

                            <p className={`text-lg mb-6 ${isLocked ? 'text-muted-foreground' : ''}`}>
                                {question.questionText}
                            </p>

                            <QuestionButton
                                interviewId={interview.id}
                                questionId={question.id}
                                questionNumber={index + 1}
                                isLocked={isLocked}
                                isCompleted={isCompleted}
                            >
                                {isLocked ? (
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Complete Previous Questions
                                    </div>
                                ) : isCompleted ? (
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Question Completed
                                    </div>
                                ) : (
                                    `Start Question ${index + 1}`
                                )}
                            </QuestionButton>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}