// src/app/interviews/job/[id]/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { protectRoute } from '@/lib/actions/auth-actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';


export async function generateMetadata() {
    return {
        title: 'Job Interview - AceYourHireVue',
        description: 'Practice your interview with personalised questions',
    };
}

export default async function InterviewPage({ params }: { params: Promise<{ interviewId: string }> }) {
    // Protect this route
    const user = await protectRoute();

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
    if (interview.userId !== user.id) {
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
            </div>

            <div className="space-y-6">
                {questions.map((question, index) => (
                    <Card
                        key={question.id}
                        className="p-6"
                        data-testid={`interview-question-${index + 1}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-primary/10 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-primary">Question {index + 1}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {question.questionType.charAt(0).toUpperCase() + question.questionType.slice(1)}
                            </div>
                        </div>

                        <p className="text-lg mb-6">{question.questionText}</p>

                        <Button
                            className="w-full"
                            asChild
                            data-testid={`start-question-${index + 1}-button`}
                        >
                            <Link href={`/interviews/job/${interview.id}/questions/${question.id}`}>
                                Start Answering
                            </Link>
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}