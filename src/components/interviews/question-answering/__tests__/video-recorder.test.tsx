import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import VideoRecorder from '../video-recorder';
import { useErrorLogging } from '@/hooks/use-error-logging';
import * as deviceSession from '@/lib/device-session';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock('@/hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn(),
}));

jest.mock('@/lib/device-session');

// Mock react-record-webcam
const mockRecording = {
    id: 'test-recording-id',
    blob: new Blob(['test'], { type: 'video/webm' }),
    webcamRef: { current: document.createElement('video') },
    previewRef: { current: document.createElement('video') },
    status: 'IDLE'
};

const mockUseRecordWebcam = {
    createRecording: jest.fn().mockResolvedValue(mockRecording),
    openCamera: jest.fn().mockResolvedValue(undefined),
    startRecording: jest.fn().mockResolvedValue(undefined),
    stopRecording: jest.fn().mockResolvedValue(undefined),
    cancelRecording: jest.fn().mockResolvedValue(undefined),
    download: jest.fn(),
    recordings: [mockRecording],
    errorMessage: null
};

jest.mock('react-record-webcam', () => ({
    useRecordWebcam: jest.fn(() => mockUseRecordWebcam),
}));

// Mock fetch
global.fetch = jest.fn();

describe('VideoRecorder', () => {
    const mockRouter = { push: jest.fn() };
    const mockLogError = jest.fn();
    const defaultProps = {
        interviewId: 'test-interview-id',
        questionId: 'test-question-id',
        showFace: true,
        prepTime: 5,
        maxResponseTime: 10,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError });

        // Set up default device session mocks
        (deviceSession.hasValidDeviceSettings as jest.Mock).mockReturnValue(true);
        (deviceSession.getSelectedCamera as jest.Mock).mockReturnValue('test-camera');
        (deviceSession.getSelectedMicrophone as jest.Mock).mockReturnValue('test-mic');

        // Reset react-record-webcam mocks
        mockUseRecordWebcam.createRecording.mockResolvedValue(mockRecording);
        mockUseRecordWebcam.openCamera.mockResolvedValue(undefined);
        mockUseRecordWebcam.startRecording.mockResolvedValue(undefined);
        mockUseRecordWebcam.stopRecording.mockResolvedValue(undefined);
        mockUseRecordWebcam.errorMessage = null;
        mockUseRecordWebcam.recordings = [mockRecording];
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    const renderComponent = (props = {}) => {
        return render(<VideoRecorder {...defaultProps} {...props} />);
    };

    describe('Rendering and Initialization', () => {
        it('renders the video recorder and starts preparation', async () => {
            renderComponent();

            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();

            // Wait for initialization and preparation to start
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
                expect(mockUseRecordWebcam.openCamera).toHaveBeenCalledWith(mockRecording.id);
            });

            act(() => { jest.advanceTimersByTime(1000); });

            await waitFor(() => {
                expect(screen.getByText('Preparation Time')).toBeInTheDocument();
            });

            expect(screen.getByTestId('time-display')).toHaveTextContent('00:05');
        });

        it('shows webcam preview when showFace is true', async () => {
            renderComponent({ showFace: true });

            await waitFor(() => {
                expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByText('Camera is active but preview is hidden')).not.toBeInTheDocument();
            });
        });

        it('hides webcam preview when showFace is false', async () => {
            renderComponent({ showFace: false });

            await waitFor(() => {
                expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText('Camera is active but preview is hidden')).toBeInTheDocument();
            });
        });
    });

    describe('User Flow: Happy Path', () => {
        it('completes the full recording and submission process', async () => {
            renderComponent();

            // Wait for initialization
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(1000); });

            // Wait for preparation phase to start
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument());
            act(() => { jest.advanceTimersByTime(5000); });

            // Countdown phase
            await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
            expect(screen.getByText('3')).toBeInTheDocument();
            act(() => { jest.advanceTimersByTime(3000); });

            // Recording phase
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            expect(mockUseRecordWebcam.startRecording).toHaveBeenCalledWith(mockRecording.id);
            act(() => { jest.advanceTimersByTime(5000); });

            // Stop recording
            fireEvent.click(screen.getByTestId('stop-recording-button'));

            await waitFor(() => {
                expect(mockUseRecordWebcam.stopRecording).toHaveBeenCalledWith(mockRecording.id);
            });

            // Review phase
            await waitFor(() => expect(screen.getByTestId('review-video')).toBeInTheDocument());
            expect(screen.getByTestId('submit-button')).toBeInTheDocument();

            // Submission
            (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => expect(screen.getByText('Submitting...')).toBeInTheDocument());
            await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Response submitted successfully!'));
            expect(mockRouter.push).toHaveBeenCalledWith(`/interviews/job/${defaultProps.interviewId}`);
        });
    });

    describe('Controls and Interactions', () => {
        it('allows skipping preparation', async () => {
            renderComponent();

            // Wait for initialization and preparation to start
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(1000); });
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument());

            fireEvent.click(screen.getByTestId('skip-prep-button'));

            await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
        });

        it('allows re-recording a response', async () => {
            renderComponent();

            // Wait for initialization and preparation
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(1000); });
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument());

            // Go through recording and get to review
            act(() => { jest.advanceTimersByTime(8000); }); // Prep + Countdown
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));

            // Review and retry
            await waitFor(() => expect(screen.getByTestId('retry-button')).toBeInTheDocument());

            // Reset mocks for new recording
            const newMockRecording = { ...mockRecording, id: 'new-recording-id' };
            mockUseRecordWebcam.createRecording.mockResolvedValueOnce(newMockRecording);
            
            fireEvent.click(screen.getByTestId('retry-button'));

            // Should create new recording and go to countdown
            await waitFor(() => {
                expect(mockUseRecordWebcam.cancelRecording).toHaveBeenCalledWith(mockRecording.id);
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalledTimes(2);
            });

            act(() => { jest.advanceTimersByTime(500); });
            await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
            expect(toast.error).not.toHaveBeenCalled();
        });

        it('disables retry after max attempts', async () => {
            renderComponent();

            // Wait for initial setup
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(1000); });
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument());

            // Simulate 3 retries
            for (let i = 0; i < 3; i++) {
                act(() => { jest.advanceTimersByTime(8000); });
                await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
                fireEvent.click(screen.getByTestId('stop-recording-button'));
                await waitFor(() => expect(screen.getByTestId('retry-button')).toBeInTheDocument());
                
                // Create new recording for retry
                const retryRecording = { ...mockRecording, id: `retry-${i}` };
                mockUseRecordWebcam.createRecording.mockResolvedValueOnce(retryRecording);
                
                fireEvent.click(screen.getByTestId('retry-button'));
                act(() => { jest.advanceTimersByTime(500); });
                await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
            }

            // Final recording
            act(() => { jest.advanceTimersByTime(3000); }); // Countdown
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));

            // Check if retry is disabled
            await waitFor(() => {
                const retryButton = screen.getByTestId('retry-button');
                expect(retryButton).toBeDisabled();
                expect(retryButton).toHaveTextContent('Max retries reached');
            });
        });
    });

    describe('Error Handling', () => {
        it('handles camera initialization error', async () => {
            mockUseRecordWebcam.createRecording.mockRejectedValueOnce(new Error('Camera access denied'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Recording Error')).toBeInTheDocument();
                expect(toast.error).toHaveBeenCalledWith('Failed to initialize camera. Please check your permissions.');
                expect(mockLogError).toHaveBeenCalled();
            });
        });

        it('handles recording error from react-record-webcam', async () => {
            mockUseRecordWebcam.errorMessage = 'Recording failed';

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Recording Error')).toBeInTheDocument();
                expect(screen.getByText('Recording failed')).toBeInTheDocument();
            });
        });

        it('handles recording start failure', async () => {
            mockUseRecordWebcam.startRecording.mockRejectedValueOnce(new Error('Failed to start recording'));

            renderComponent();

            // Wait for initialization and go through prep/countdown
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(8000); }); // Prep + Countdown

            await waitFor(() => {
                expect(screen.getByText('Recording Error')).toBeInTheDocument();
                expect(toast.error).toHaveBeenCalledWith('Failed to start recording. Please check your camera permissions.');
                expect(mockLogError).toHaveBeenCalled();
            });
        });

        it('handles submission failure', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: { message: 'Server error' } })
            });

            renderComponent();

            // Go through full flow to submission
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(8000); }); // Prep + Countdown
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));
            await waitFor(() => expect(screen.getByTestId('submit-button')).toBeInTheDocument());

            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to submit your response. Please try again.');
                expect(screen.getByTestId('submit-button')).not.toBeDisabled(); // Re-enabled after error
            });
        });

        it('handles missing recording data during submission', async () => {
            // Mock empty recordings array
            mockUseRecordWebcam.recordings = [];

            renderComponent();

            // Go through to submission
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            act(() => { jest.advanceTimersByTime(8000); });
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));
            await waitFor(() => expect(screen.getByTestId('submit-button')).toBeInTheDocument());

            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to submit your response. Please try again.');
            });
        });
    });

    describe('Device Session Integration', () => {
        it('uses device session settings when available', async () => {
            (deviceSession.hasValidDeviceSettings as jest.Mock).mockReturnValue(true);
            (deviceSession.getSelectedCamera as jest.Mock).mockReturnValue('custom-camera-id');
            (deviceSession.getSelectedMicrophone as jest.Mock).mockReturnValue('custom-mic-id');

            renderComponent();

            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            expect(deviceSession.getSelectedCamera).toHaveBeenCalled();
            expect(deviceSession.getSelectedMicrophone).toHaveBeenCalled();
        });

        it('handles missing device settings gracefully', async () => {
            (deviceSession.hasValidDeviceSettings as jest.Mock).mockReturnValue(false);
            (deviceSession.getSelectedCamera as jest.Mock).mockReturnValue(null);
            (deviceSession.getSelectedMicrophone as jest.Mock).mockReturnValue(null);

            renderComponent();

            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });
        });
    });

    describe('Cleanup', () => {
        it('cleans up timers and cancels recording on unmount', async () => {
            const { unmount } = renderComponent();
            
            await waitFor(() => {
                expect(mockUseRecordWebcam.createRecording).toHaveBeenCalled();
            });

            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
            expect(mockUseRecordWebcam.cancelRecording).toHaveBeenCalledWith(mockRecording.id);
        });
    });
});