'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { useAuth } from '@clerk/nextjs';
import Client, { Local } from '@/lib/client';

type Props = {
    interviewId: string;
    intervalMs?: number;
};

type ApiResponse = {
    status: 'processing' | 'completed' | 'error';
    message?: string;
};

export default function JobStatusPoller({
    interviewId,
    intervalMs = 3000,
}: Props) {
    const router = useRouter();
    const [status, setStatus] = useState<
        'processing' | 'completed' | 'error'
    >('processing');
    const [message, setMessage] = useState(
        'Generating your personalized interview questions...'
    );
    const timer = useRef<NodeJS.Timeout | null>(null);
    const { logError } = useErrorLogging();
    const { getToken } = useAuth();

    const clearTimer = () => {
        if (timer.current) {
            clearInterval(timer.current);
            timer.current = null;
        }
    };

    const pollOnce = async () => {
        try {
            const client = new Client(Local, {
                auth: async () => ({ authorization: `Bearer ${await getToken()}` })
            });

            const json = await client.interviews.getInterviewStatusApi(interviewId);

            switch (json.status) {
                case 'completed':
                    clearTimer();
                    setStatus('completed');
                    setMessage('Interview ready! Redirecting...');
                    setTimeout(() => {
                        router.push(`/interviews/job/${interviewId}`);
                    }, 1000);
                    break;

                case 'error':
                    clearTimer();
                    setStatus('error');
                    setMessage(
                        'There was an issue generating your interview questions.'
                    );
                    if (json.message) {
                        toast.error(json.message);
                    }
                    break;

                case 'processing':
                default:
                    // keep polling
                    break;
            }
        } catch (error) {
            logError(error as Error);
            // On network error, we want to keep polling.
            // The tests expect this behavior.
        }
    };

    useEffect(() => {
        pollOnce(); // immediate call
        timer.current = setInterval(pollOnce, intervalMs);

        return () => clearTimer(); // cleanup on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId, intervalMs]);

    if (status === 'error') {
        return (
            <Card
                data-testid="job-status-poller"
                className="p-4 flex flex-col items-center space-y-3"
            >
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-destructive text-sm">{message}</p>
                <Button variant="outline" onClick={() => router.refresh()}>
                    Retry
                </Button>
            </Card>
        );
    }

    if (status === 'completed') {
        return (
            <Card
                data-testid="job-status-poller"
                className="p-4 flex flex-col items-center space-y-3"
            >
                <CheckCircle className="h-6 w-6 text-green-500" />
                <p>{message}</p>
            </Card>
        );
    }

    return (
        <Card
            data-testid="job-status-poller"
            className="p-4 flex flex-col items-center space-y-3"
        >
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
            <p>{message}</p>
        </Card>
    );
}
