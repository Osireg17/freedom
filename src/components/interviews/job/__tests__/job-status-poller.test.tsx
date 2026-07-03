import { render, screen, waitFor, act } from '@testing-library/react';
import JobStatusPoller from '../job-status-poller';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';

const mockGetInterviewStatusApi = jest.fn();

// Mock dependencies
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
	toast: {
		error: jest.fn(),
	},
}));

const mockGetToken = jest.fn().mockResolvedValue('mock-token');

jest.mock('@/hooks/use-error-logging', () => ({
	useErrorLogging: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
	useAuth: () => ({
		getToken: mockGetToken,
	}),
}));

jest.mock('@/lib/client', () => {
	return jest.fn().mockImplementation(() => {
		return {
			interviews: {
				getInterviewStatusApi: mockGetInterviewStatusApi,
			},
		};
	});
});

describe('JobStatusPoller', () => {
	const mockRouter = { push: jest.fn(), refresh: jest.fn() };
	const mockLogError = jest.fn();

	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');

		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		(useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('renders with initial processing state', () => {
		mockGetInterviewStatusApi.mockResolvedValueOnce({ status: 'processing' });

		render(<JobStatusPoller interviewId="interview-123" />);

		expect(screen.getByTestId('job-status-poller')).toBeInTheDocument();
		expect(
			screen.getByText('Generating your personalized interview questions...')
		).toBeInTheDocument();
	});

	it('updates to completed state and redirects when status is completed', async () => {
		mockGetInterviewStatusApi.mockResolvedValueOnce({ status: 'completed' });

		render(<JobStatusPoller interviewId="interview-123" />);

		await waitFor(() => {
			expect(
				screen.getByText('Interview ready! Redirecting...')
			).toBeInTheDocument();
		});

		act(() => {
			jest.advanceTimersByTime(1000); // For the redirect timeout
		});

		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith(
				'/interviews/job/interview-123'
			);
		});
	});

	it('shows error state when API returns error status', async () => {
		mockGetInterviewStatusApi.mockResolvedValueOnce({
			status: 'error',
			message: 'Custom error message',
		});

		render(<JobStatusPoller interviewId="interview-123" />);

		await waitFor(() => {
			expect(
				screen.getByText(
					'There was an issue generating your interview questions.'
				)
			).toBeInTheDocument();
		});

		expect(toast.error).toHaveBeenCalledWith('Custom error message');
	});

	it('continues polling when status is still processing', async () => {
		mockGetInterviewStatusApi.mockResolvedValue({ status: 'processing' });

		render(<JobStatusPoller interviewId="interview-123" />);

		// First poll happens immediately
		await waitFor(() => {
			expect(mockGetInterviewStatusApi).toHaveBeenCalledTimes(1);
		});

		// Advance timers to trigger next poll
		act(() => {
			jest.advanceTimersByTime(3000);
		});

		await waitFor(() => {
			expect(mockGetInterviewStatusApi).toHaveBeenCalledTimes(2);
		});
	});

	it('handles fetch errors and continues polling', async () => {
		mockGetInterviewStatusApi
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce({ status: 'processing' });

		render(<JobStatusPoller interviewId="interview-123" />);

		await waitFor(() => {
			expect(mockLogError).toHaveBeenCalledWith(new Error('Network error'));
		});

		// Should try to poll again after error
		act(() => {
			jest.advanceTimersByTime(3000);
		});

		await waitFor(() => {
			expect(mockGetInterviewStatusApi).toHaveBeenCalledTimes(2);
		});
	});

	it('handles missing Clerk token explicitly', async () => {
		mockGetToken.mockResolvedValueOnce(null);

		render(<JobStatusPoller interviewId="interview-123" />);

		await waitFor(() => {
			expect(screen.getByText('Authentication session expired. Please sign in again.')).toBeInTheDocument();
		});

		expect(toast.error).toHaveBeenCalledWith('Session expired. Please sign in again.');
		expect(mockGetInterviewStatusApi).not.toHaveBeenCalled();
	});
});
