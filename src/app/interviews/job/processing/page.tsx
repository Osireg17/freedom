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

    if (!interviewId || !runId) {
        return (
            <div className="container max-w-3xl mx-auto py-12">
                <Card className="p-8 text-center space-y-6">
                    <h1 className="text-2xl font-bold">Invalid Interview Request</h1>
                    <p className="text-muted-foreground">
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
        <div
            className="container max-w-3xl mx-auto py-12"
            data-testid="interview-processing-page"
        >
            <Card className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Generating Your Interview</h1>
                        <p className="text-muted-foreground max-w-md">
                            We&apos;re creating personalised interview questions based on the
                            job description you provided. This usually takes less than a
                            minute.
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <JobStatusPoller interviewId={interviewId} />
                </div>

                <div className="flex justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/interviews/job">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Interviews
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
