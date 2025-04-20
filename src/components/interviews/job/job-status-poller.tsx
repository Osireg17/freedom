// src/components/interviews/job/job-status-poller.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
    interviewId: string;
    runId: string;
    intervalMs?: number;
};

type ApiResponse =
    | {
        interviewId: string;
        status: 'processing';
        message: string;
        questionsCount: number;
    }
    | {
        interviewId: string;
        status: 'completed';
        message: string;
        questionsCount: number;
    }
    | {
        interviewId: string;
        status: 'error';
        message: string;
        questionsCount: number;
    };

export default function JobStatusPoller({
    interviewId,
    runId,
    intervalMs = 3000,
}: Props) {
    const router = useRouter();
    const [apiState, setApiState] = useState<ApiResponse | null>(null);
    const [isError, setIsError] = useState(false);
    const timer = useRef<NodeJS.Timeout | null>(null);

    /** Clears the active interval (if any) */
    const clearTimer = () => {
        if (timer.current) clearInterval(timer.current);
    };

    /** Hit the status endpoint once */
    const pollOnce = async () => {
        try {
            const res = await fetch(
                `/api/interviews/${interviewId}/status?runId=${runId}`
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json: ApiResponse = await res.json();
            setApiState(json);

            switch (json.status) {
                case 'completed':
                    clearTimer();
                    // Push to the interview details page; tweak path if yours differs
                    router.push(`/interviews/job/${interviewId}`);
                    break;

                case 'error':
                    clearTimer();
                    setIsError(true);
                    break;

                default:
                    // keep polling
                    break;
            }
        } catch (error) {
            console.error('Error fetching interview status:', error);
            clearTimer();
            setIsError(true);
        }
    };

    /** kick off polling once—then set an interval */
    useEffect(() => {
        pollOnce(); // immediate call
        timer.current = setInterval(pollOnce, intervalMs);

        return () => clearTimer(); // cleanup on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId, runId]);

    // ---------- UI ----------
    if (isError)
        return (
            <Card className="p-4 flex flex-col items-center space-y-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-destructive text-sm">
                    {apiState?.message ??
                        'Something went wrong while generating your interview.'}
                </p>
                <Button variant="outline" onClick={() => router.refresh()}>
                    Retry
                </Button>
            </Card>
        );
}
