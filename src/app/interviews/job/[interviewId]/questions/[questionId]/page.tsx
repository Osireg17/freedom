import React from 'react';
import QuestionServerPage from './server-page';
import QuestionAnswerClient from './client-page';

interface QuestionAnswerPageProps {
    params: Promise<{ interviewId: string; questionId: string }>;
}

export default async function QuestionAnswerPage({ params }: QuestionAnswerPageProps) {
    const { interviewId, questionId } = await params;
    
    // Check access permissions first
    await QuestionServerPage({ interviewId, questionId });
    
    // If we get here, access is allowed, render the client component
    return <QuestionAnswerClient />;
}