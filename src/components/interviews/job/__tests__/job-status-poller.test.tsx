import { render, screen, waitFor, act } from '@testing-library/react';
import JobStatusPoller from '../job-status-poller';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn()
    }
}));

jest.mock('../../../../hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn()
}));

describe('JobStatusPoller', () => {
    const mockRouter = { push: jest.fn() };
    const mockLogError = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });

        // Mock fetch
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders with initial processing state', () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'processing' })
        });

        render(<JobStatusPoller interviewId="interview-123" runId="run-456" />);

        expect(screen.getByTestId('job-status-poller')).toBeInTheDocument();
        expect(screen.getByText('Generating your personalized interview questions...')).toBeInTheDocument();
    });

    it('updates to completed state and redirects when status is completed', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'completed' })
        });

        render(<JobStatusPoller interviewId="interview-123" runId="run-456" />);

        await waitFor(() => {
            expect(screen.getByText('Interview ready! Redirecting...')).toBeInTheDocument();
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(mockRouter.push).toHaveBeenCalledWith('/interviews/job/interview-123');
    });

    it('shows error state when API returns error status', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'error', message: 'Custom error message' })
        });

        render(<JobStatusPoller interviewId="interview-123" runId="run-456" />);

        await waitFor(() => {
            expect(screen.getByText('There was an issue generating your interview questions.')).toBeInTheDocument();
        });

        expect(toast.error).toHaveBeenCalledWith('Custom error message');
    });

    it('continues polling when status is still processing', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'processing' })
        });

        render(<JobStatusPoller interviewId="interview-123" runId="run-456" />);

        // First poll happens immediately
        expect(global.fetch).toHaveBeenCalledTimes(1);

        // Advance timers to trigger next poll
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles fetch errors and continues polling', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<JobStatusPoller interviewId="interview-123" runId="run-456" />);

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalled();
        });

        // Should try to poll again after error
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});