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

const mockMediaRecorder = {
    start: jest.fn(),
    stop: jest.fn(),
    state: 'inactive',
    ondataavailable: null,
    onstop: null,
};

// Mock MediaRecorder and AudioContext
const MockedMediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
(MockedMediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);
global.MediaRecorder = MockedMediaRecorder as any;

global.AudioContext = jest.fn().mockImplementation(() => ({
    createMediaStreamSource: jest.fn().mockReturnValue({ connect: jest.fn() }),
    createAnalyser: jest.fn().mockReturnValue({
        fftSize: 256,
        frequencyBinCount: 128,
        getByteFrequencyData: jest.fn(),
    }),
    close: jest.fn().mockResolvedValue(undefined),
}));

// Mock URL methods
Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: jest.fn().mockReturnValue('mock-video-url'),
});
Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: jest.fn(),
});

// Mock fetch
global.fetch = jest.fn();

// Mock webcam ref
const mockWebcamRef = {
    current: {
        stream: {
            getTracks: () => [{ stop: jest.fn() }],
            getVideoTracks: () => [{ stop: jest.fn() }],
            getAudioTracks: () => [{ stop: jest.fn() }]
        }
    }
};

// Mock Webcam component
jest.mock('react-webcam', () => {
    const MockWebcam = React.forwardRef<any, { onUserMedia?: () => void; onUserMediaError?: (error: Error) => void }>(
        ({ onUserMedia, onUserMediaError }, ref) => {
            // Set the ref to our mock
            React.useImperativeHandle(ref, () => mockWebcamRef.current);

            // Simulate webcam initialization
            React.useEffect(() => {
                const timer = setTimeout(() => {
                    if (onUserMedia) {
                        onUserMedia();
                    }
                }, 100);

                return () => clearTimeout(timer);
            }, [onUserMedia, onUserMediaError]);

            return <div data-testid="webcam-video" />;
        }
    );
    MockWebcam.displayName = 'MockWebcam';
    return MockWebcam;
});

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
        (deviceSession.getActiveMediaStream as jest.Mock).mockReturnValue(null);
        (deviceSession.getSelectedCamera as jest.Mock).mockReturnValue('test-camera');
        (deviceSession.getSelectedMicrophone as jest.Mock).mockReturnValue('test-mic');

        mockMediaRecorder.state = 'inactive';
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

            // Wait for webcam to initialize and preparation to start
            await waitFor(() => {
                expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText('Preparation Time')).toBeInTheDocument();
            }, { timeout: 2000 });

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

        it('uses existing media stream if available', async () => {
            const mockExistingStream = {
                getTracks: () => [{ stop: jest.fn() }],
                getVideoTracks: () => [{ stop: jest.fn() }],
                getAudioTracks: () => [{ stop: jest.fn() }]
            };
            (deviceSession.getActiveMediaStream as jest.Mock).mockReturnValue(mockExistingStream);
            (deviceSession.hasValidDeviceSettings as jest.Mock).mockReturnValue(true);

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
            });
        });
    });

    describe('User Flow: Happy Path', () => {
        it('completes the full recording and submission process', async () => {
            renderComponent();

            // Wait for webcam to be ready
            await waitFor(() => expect(screen.getByTestId('webcam-video')).toBeInTheDocument());

            // Wait for preparation phase to start automatically
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument(), { timeout: 2000 });
            act(() => { jest.advanceTimersByTime(5000); });

            // Countdown phase
            await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
            expect(screen.getByText('3')).toBeInTheDocument();
            act(() => { jest.advanceTimersByTime(3000); });

            // Recording phase
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            expect(mockMediaRecorder.start).toHaveBeenCalled();
            act(() => { jest.advanceTimersByTime(5000); });

            // Stop recording
            fireEvent.click(screen.getByTestId('stop-recording-button'));
            act(() => { mockMediaRecorder.onstop && mockMediaRecorder.onstop(); });

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

            // Wait for webcam to be ready and preparation to start
            await waitFor(() => expect(screen.getByTestId('webcam-video')).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument(), { timeout: 2000 });

            fireEvent.click(screen.getByTestId('skip-prep-button'));

            await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
        });

        it('allows re-recording a response', async () => {
            renderComponent();

            // Wait for webcam and preparation
            await waitFor(() => expect(screen.getByTestId('webcam-video')).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument(), { timeout: 2000 });

            // Go through recording and get to review
            act(() => { jest.advanceTimersByTime(8000); }); // Prep + Countdown
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));
            act(() => { mockMediaRecorder.onstop && mockMediaRecorder.onstop(); });

            // Review and retry
            await waitFor(() => expect(screen.getByTestId('retry-button')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('retry-button'));

            // Should go back to countdown
            await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
            expect(toast.error).not.toHaveBeenCalled();
        });

        it('disables retry after max attempts', async () => {
            renderComponent();

            // Wait for initial setup
            await waitFor(() => expect(screen.getByTestId('webcam-video')).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument(), { timeout: 2000 });

            // Simulate 3 retries
            for (let i = 0; i < 3; i++) {
                act(() => { jest.advanceTimersByTime(8000); });
                await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
                fireEvent.click(screen.getByTestId('stop-recording-button'));
                act(() => { mockMediaRecorder.onstop(); });
                await waitFor(() => expect(screen.getByTestId('retry-button')).toBeInTheDocument());
                fireEvent.click(screen.getByTestId('retry-button'));

                // Wait for webcam to reinitialize after retry
                await waitFor(() => expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument());
            }

            // Final recording
            act(() => { jest.advanceTimersByTime(3000); }); // Countdown
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));
            act(() => { mockMediaRecorder.onstop && mockMediaRecorder.onstop(); });

            // Check if retry is disabled
            await waitFor(() => {
                const retryButton = screen.getByTestId('retry-button');
                expect(retryButton).toBeDisabled();
                expect(retryButton).toHaveTextContent('Max retries reached');
            });
        });
    });

    describe('Error Handling', () => {
        it('handles webcam media error', async () => {
            // Override the Webcam mock for this test
            jest.doMock('react-webcam', () => {
                const ErrorWebcam = React.forwardRef<any, { onUserMediaError?: (error: Error) => void }>(
                    ({ onUserMediaError }) => {
                        React.useEffect(() => {
                            if (onUserMediaError) {
                                onUserMediaError(new Error('Test media error'));
                            }
                        }, [onUserMediaError]);
                        return <div data-testid="webcam-video" />;
                    }
                );
                ErrorWebcam.displayName = 'ErrorWebcam';
                return ErrorWebcam;
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Recording Error')).toBeInTheDocument();
                expect(toast.error).toHaveBeenCalledWith('Failed to access camera or microphone');
                expect(mockLogError).toHaveBeenCalled();
            });
        });

        it('handles recording initialization failure', async () => {
            (MockedMediaRecorder as any).mockImplementationOnce(() => {
                throw new Error('Failed to create MediaRecorder');
            });

            renderComponent();

            // Wait for webcam and preparation
            await waitFor(() => expect(screen.getByTestId('webcam-video')).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument(), { timeout: 2000 });

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

            // Wait for webcam and preparation
            await waitFor(() => expect(screen.getByTestId('webcam-video')).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText('Preparation Time')).toBeInTheDocument(), { timeout: 2000 });

            act(() => { jest.advanceTimersByTime(8000); });
            await waitFor(() => expect(screen.getByText('Recording Time')).toBeInTheDocument());
            fireEvent.click(screen.getByTestId('stop-recording-button'));
            act(() => { mockMediaRecorder.onstop && mockMediaRecorder.onstop(); });
            await waitFor(() => expect(screen.getByTestId('submit-button')).toBeInTheDocument());

            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to submit your response. Please try again.');
                expect(screen.getByTestId('submit-button')).not.toBeDisabled(); // Re-enabled after error
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
                expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
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
                expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
            });
        });
    });

    describe('Cleanup', () => {
        it('cleans up timers and object URLs on unmount', () => {
            const { unmount } = renderComponent();
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
            expect(cancelAnimationFrameSpy).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-video-url');
        });
    });
});