// src/components/interviews/job/job-status-poller.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
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

    // Use a ref to track the polling interval
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // Use a ref to track component mount state
    const isMountedRef = useRef<boolean>(true);
    // Use attempt counter with ref so it persists between renders
    const attemptsRef = useRef<number>(0);

    useEffect(() => {
        const maxAttempts = 30; // Stop polling after 30 attempts
        const pollingInterval = 10000; // Poll every 10 seconds

        // Set initial progress
        setProgress(20); // Start at 20%

        // Define the polling function
        const checkStatus = async () => {
            try {
                if (!isMountedRef.current || attemptsRef.current >= maxAttempts) {
                    if (isMountedRef.current && attemptsRef.current >= maxAttempts) {
                        setStatus('error');
                        toast.error("Interview generation is taking longer than expected. Please check back later.");
                    }
                    return;
                }

                // Increment the attempt counter
                attemptsRef.current++;

                // Calculate progress percentage (create a progress animation)
                const initialProgress = 20; // Start at 20%
                const maxProgress = 90; // Cap at 90% until completion
                const progressStep = (maxProgress - initialProgress) / maxAttempts;

                if (isMountedRef.current) {
                    setProgress(Math.min(initialProgress + (attemptsRef.current * progressStep), maxProgress));
                }

                // Fetch interview status
                const response = await fetch(`/api/interviews/${interviewId}/status?runId=${runId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch interview status: ${response.statusText}`);
                }

                const data = await response.json();

                if (!isMountedRef.current) return;

                if (data.status === 'completed') {
                    // Clear the interval to stop polling
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    setStatus('completed');
                    setProgress(100);

                    // Navigate to the interview session after a short delay
                    const redirectTimeout = setTimeout(() => {
                        if (isMountedRef.current) {
                            router.push(`/interviews/job/${interviewId}`);
                        }
                    }, 1000);

                    // Clean up the timeout if component unmounts
                    return () => clearTimeout(redirectTimeout);

                } else if (data.status === 'error') {
                    // Clear the interval to stop polling
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    setStatus('error');
                    toast.error(data.message || "Error generating interview questions");
                }
                // If still processing, polling will continue via the interval

            } catch (error) {
                if (!isMountedRef.current) return;

                logError(error, {
                    context: 'JobStatusPoller.checkStatus',
                    interviewId,
                    runId,
                });

                // We don't need to set up more polling here as it's handled by the interval
            }
        };

        // Run initial check
        checkStatus();

        // Set up polling interval
        intervalRef.current = setInterval(checkStatus, pollingInterval);

        // Cleanup function
        return () => {
            isMountedRef.current = false;

            // Clear the interval when unmounting
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
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