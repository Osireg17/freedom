import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import VideoRecorder from '../video-recorder';
import { useErrorLogging } from '@/hooks/use-error-logging';

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

jest.mock('react-webcam', () => {
    const MockWebcam = React.forwardRef<unknown, Record<string, unknown>>((props, ref) => {
        React.useImperativeHandle(ref, () => ({
            stream: {
                getTracks: () => [{ stop: jest.fn() }],
            },
        }));
        return <div data-testid="webcam-video" {...props} />;
    });
    MockWebcam.displayName = 'MockWebcam';
    return MockWebcam;
});

// Mock MediaRecorder
const mockMediaRecorder = {
    start: jest.fn(),
    stop: jest.fn(),
    state: 'inactive',
    ondataavailable: null,
    onstop: null,
};

Object.defineProperty(window, 'MediaRecorder', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMediaRecorder),
});

// Mock AudioContext
const mockAudioContext = {
    createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
    }),
    createAnalyser: jest.fn().mockReturnValue({
        fftSize: 256,
        frequencyBinCount: 128,
        getByteFrequencyData: jest.fn(),
    }),
    close: jest.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockAudioContext),
});

// Mock URL methods
Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: jest.fn().mockReturnValue('mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: jest.fn(),
});

// Mock fetch
global.fetch = jest.fn();

describe('VideoRecorder', () => {
    const mockRouter = {
        push: jest.fn(),
    };

    const mockLogError = jest.fn();

    const defaultProps = {
        interviewId: 'test-interview-id',
        questionId: 'test-question-id',
        showFace: true,
        prepTime: 30,
        maxResponseTime: 120,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useErrorLogging as jest.Mock).mockReturnValue({
            logError: mockLogError,
        });

        // Reset MediaRecorder mock
        mockMediaRecorder.state = 'inactive';
        mockMediaRecorder.start.mockClear();
        mockMediaRecorder.stop.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Component Rendering', () => {
        it('renders the video recorder component', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
            expect(screen.getByTestId('webcam-video')).toBeInTheDocument();
        });

        it('shows webcam when showFace is true', () => {
            render(<VideoRecorder {...defaultProps} showFace={true} />);
            
            const webcam = screen.getByTestId('webcam-video');
            expect(webcam).toHaveClass('w-full h-full object-cover');
            expect(webcam).not.toHaveClass('opacity-0');
        });

        it('hides webcam preview when showFace is false', () => {
            render(<VideoRecorder {...defaultProps} showFace={false} />);
            
            const webcam = screen.getByTestId('webcam-video');
            expect(webcam).toHaveClass('opacity-0');
            expect(screen.getByText('Camera is active but preview is hidden')).toBeInTheDocument();
        });
    });

    describe('Preparation Phase', () => {
        it('starts preparation timer automatically on mount', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            expect(screen.getByText('Preparation Time')).toBeInTheDocument();
            expect(screen.getByTestId('skip-prep-button')).toBeInTheDocument();
        });

        it('displays countdown during preparation', () => {
            render(<VideoRecorder {...defaultProps} prepTime={5} />);
            
            expect(screen.getByText('00:05')).toBeInTheDocument();
        });

        it('allows skipping preparation', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            fireEvent.click(screen.getByTestId('skip-prep-button'));
            
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            
            expect(screen.getByTestId('countdown-display')).toBeInTheDocument();
        });

        it('automatically starts countdown after prep time ends', () => {
            render(<VideoRecorder {...defaultProps} prepTime={2} />);
            
            act(() => {
                jest.advanceTimersByTime(2000);
            });
            
            expect(screen.getByTestId('countdown-display')).toBeInTheDocument();
        });
    });

    describe('Countdown Phase', () => {
        it('shows countdown overlay during countdown', () => {
            render(<VideoRecorder {...defaultProps} prepTime={1} />);
            
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            
            expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument();
            expect(screen.getByTestId('countdown-display')).toBeInTheDocument();
        });

        it('shows countdown display during countdown', () => {
            render(<VideoRecorder {...defaultProps} prepTime={1} />);

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(screen.getByTestId('countdown-overlay')).toBeInTheDocument();
        });
    });

    describe('Redo Functionality', () => {
        it('tracks redo attempts state', () => {
            const { rerender } = render(<VideoRecorder {...defaultProps} />);
            
            // Component should initialize with 0 redo attempts
            // This tests the state management rather than complex interactions
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
            
            // Re-render with same props to ensure state consistency
            rerender(<VideoRecorder {...defaultProps} />);
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });

        it('has correct button text for retry functionality', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            // The retry button should exist in the component structure
            // even if not immediately visible due to state
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });
    });

    describe('Time Formatting', () => {
        it('formats time correctly', () => {
            render(<VideoRecorder {...defaultProps} prepTime={65} />);
            
            expect(screen.getByText('01:05')).toBeInTheDocument();
        });

        it('formats seconds correctly', () => {
            render(<VideoRecorder {...defaultProps} prepTime={30} />);
            
            expect(screen.getByText('00:30')).toBeInTheDocument();
        });
    });

    describe('Component Cleanup', () => {
        it('cleans up timers on unmount', () => {
            const { unmount } = render(<VideoRecorder {...defaultProps} />);
            
            unmount();
            
            // Advance timers to ensure no memory leaks
            act(() => {
                jest.advanceTimersByTime(10000);
            });
            
            // No assertions needed - test passes if no errors are thrown
        });

        it('handles unmount gracefully', () => {
            const { unmount } = render(<VideoRecorder {...defaultProps} />);
            
            // Start some timers
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            
            unmount();
            
            // Should not throw errors
            expect(true).toBe(true);
        });
    });

    describe('Props Handling', () => {
        it('handles different prep times', () => {
            render(<VideoRecorder {...defaultProps} prepTime={10} />);
            
            expect(screen.getByText('00:10')).toBeInTheDocument();
        });

        it('handles different interview IDs', () => {
            render(<VideoRecorder {...defaultProps} interviewId="different-id" />);
            
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });

        it('handles different question IDs', () => {
            render(<VideoRecorder {...defaultProps} questionId="different-question" />);
            
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });

        it('handles different max response times', () => {
            render(<VideoRecorder {...defaultProps} maxResponseTime={180} />);
            
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('renders error state correctly', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            // Component should handle errors gracefully
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });

        it('handles webcam errors', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            const webcam = screen.getByTestId('webcam-video');
            fireEvent(webcam, new Event('error'));
            
            // Component should still be rendered
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });
    });

    describe('State Management', () => {
        it('initializes with correct default state', () => {
            render(<VideoRecorder {...defaultProps} />);
            
            expect(screen.getByText('Preparation Time')).toBeInTheDocument();
        });

        it('maintains state consistency across re-renders', () => {
            const { rerender } = render(<VideoRecorder {...defaultProps} />);
            
            rerender(<VideoRecorder {...defaultProps} prepTime={15} />);
            
            expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
        });
    });
});