// src/app/interviews/job/processing/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import JobStatusPoller from '@/components/interviews/job/job-status-poller';

export default function InterviewProcessingPage() {
    const searchParams = useSearchParams();
    const interviewId = searchParams.get('interviewId');
    const runId = searchParams.get('runId');

    console.log(searchParams.toString());

    console.log('Interview ID:', interviewId);
    console.log('Run ID:', runId);

    if (!interviewId || !runId) {
        return (
            <div className="container max-w-3xl mx-auto py-12">
                <Card className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Interview Request</h1>
                    <p className="mb-6 text-muted-foreground">
                        The interview request is missing required parameters.
                    </p>
                    <Button asChild>
                        <Link href="/interviews">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Interviews
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-3xl mx-auto py-12" data-testid="interview-processing-page">
            <Card className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full mb-2">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    </div>

                    <h1 className="text-2xl font-bold">Generating Your Interview</h1>

                    <p className="text-muted-foreground max-w-md mx-auto">
                        We&apos;re creating personalised interview questions based on the job description you provided.
                        This usually takes less than a minute.
                    </p>

                    <div className="w-full max-w-md mt-6">
                        <JobStatusPoller interviewId={interviewId} runId={runId} />
                    </div>

                    <div className="mt-8">
                        <Button variant="outline" asChild>
                            <Link href="/interviews/job">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Interviews
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}