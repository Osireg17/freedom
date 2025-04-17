// src/components/interviews/job/job-status-poller.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { toast } from 'sonner';

interface JobStatusPollerProps {
    interviewId: string;
    runId: string;
}

export default function JobStatusPoller({ interviewId, runId }: JobStatusPollerProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing');
    const router = useRouter();
    const { logError } = useErrorLogging();

    useEffect(() => {
        let mounted = true;
        let attempts = 0;
        const maxAttempts = 30; // Stop polling after 30 attempts (5 minutes)

        const checkStatus = async () => {
            try {
                if (attempts >= maxAttempts) {
                    setStatus('error');
                    toast.error("Interview generation is taking longer than expected. Please check back later.");
                    return;
                }

                attempts++;
                // Calculate progress percentage based on attempts (creates a progress animation)
                const initialProgress = 20; // Start at 20% (form submission was already ~20%)
                const maxProgress = 90; // Cap at 90% until we confirm completion
                const progressStep = (maxProgress - initialProgress) / maxAttempts;

                if (mounted) {
                    setProgress(Math.min(initialProgress + (attempts * progressStep), maxProgress));
                }

                // Fetch interview status
                const response = await fetch(`/api/interviews/${interviewId}/status?runId=${runId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch interview status: ${response.statusText}`);
                }

                const data = await response.json();

                if (mounted) {
                    if (data.status === 'completed') {
                        setStatus('completed');
                        setProgress(100);
                        // Navigate to the interview session after a short delay
                        setTimeout(() => {
                            router.push(`/interviews/job/${interviewId}`);
                        }, 1000);
                    } else if (data.status === 'error') {
                        setStatus('error');
                        toast.error(data.message || "Error generating interview questions");
                    } else {
                        // Continue polling
                        setTimeout(checkStatus, 10000); // Poll every 10 seconds
                    }
                }
            } catch (error) {
                logError(error, {
                    context: 'JobStatusPoller.checkStatus',
                    interviewId,
                    runId,
                });

                if (mounted) {
                    // If there's an error fetching status, still try again
                    setTimeout(checkStatus, 10000);
                }
            }
        };

        // Start polling
        checkStatus();

        return () => {
            mounted = false;
        };
    }, [interviewId, runId, router, logError]);

    return (
        <div className="w-full space-y-4" data-testid="job-status-poller">
            <Progress value={progress} className="h-2" aria-label="Interview generation progress" />
            <p className="text-center text-sm text-muted-foreground">
                {status === 'processing' && "Generating your personalized interview questions..."}
                {status === 'completed' && "Interview ready! Redirecting..."}
                {status === 'error' && "There was an issue generating your interview questions."}
            </p>
        </div>
    );
}