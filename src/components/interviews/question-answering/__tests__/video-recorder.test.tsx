/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import VideoRecorder from '../video-recorder'

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() })
}))

jest.mock('@/hooks/use-error-logging', () => ({
    useErrorLogging: () => ({ logError: jest.fn() })
}))

const mockGetSelectedCamera = jest.fn(() => 'camera1')
const mockGetSelectedMicrophone = jest.fn(() => 'mic1')
const mockHasValidDeviceSettings = jest.fn(() => false)
const mockGetActiveMediaStream = jest.fn(() => null)

jest.mock('@/lib/device-session', () => ({
    getSelectedCamera: () => mockGetSelectedCamera(),
    getSelectedMicrophone: () => mockGetSelectedMicrophone(),
    hasValidDeviceSettings: () => mockHasValidDeviceSettings(),
    getActiveMediaStream: () => mockGetActiveMediaStream()
}))

const toastError = jest.fn()
const toastSuccess = jest.fn()
jest.mock('sonner', () => ({
    toast: {
        error: (...args: unknown[]) => toastError(...args),
        success: (...args: unknown[]) => toastSuccess(...args)
    }
}))

jest.mock('lucide-react', () => ({
    Camera: () => <div data-testid="icon-camera" />,
    Loader2: () => <div data-testid="icon-loader" />,
    VideoOff: () => <div data-testid="icon-videooff" />
}))

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/progress', () => ({
    Progress: ({ value, ...props }: any) => <div data-testid="progress" data-value={value} {...props} />
}))

// MediaStream mock (if not present)
class MockTrack { stop = jest.fn() }
class MockMediaStream {
    private tracks: any[]
    constructor() { this.tracks = [new MockTrack(), new MockTrack()] }
    getTracks() { return this.tracks }
}
; (global as any).MediaStream = (global as any).MediaStream || MockMediaStream

// MediaRecorder mock
class MockMediaRecorder {
    stream: any
    options: any
    state: string = 'inactive'
    ondataavailable: ((e: any) => void) | null = null
    onstop: (() => void) | null = null
    constructor(stream: any, options: any) {
        this.stream = stream
        this.options = options
    }
    start() {
        this.state = 'recording'
    }
    stop() {
        this.state = 'inactive'
        // Simulate dataavailable then stop
        if (this.ondataavailable) {
            const blob = new Blob(['dummy'], { type: 'video/webm' })
            this.ondataavailable({ data: blob, size: blob.size })
        }
        if (this.onstop) this.onstop()
    }
}
; (global as any).MediaRecorder = MockMediaRecorder

// URL mocks
const revokeSpy = jest.fn()
const createSpy = jest.fn(() => 'blob:mock-video')
Object.defineProperty(global, 'URL', {
    value: {
        createObjectURL: createSpy,
        revokeObjectURL: revokeSpy
    }
})

// react-webcam mock
jest.mock('react-webcam', () => {
    // eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
    const Webcam = React.forwardRef<any, any>((props: any, ref) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = new (global as any).MediaStream()
        React.useImperativeHandle(ref, () => ({ stream }))
        setTimeout(() => { props.onUserMedia?.(stream) }, 0)
        return <div data-testid="mock-webcam" />
    })
    return Webcam
})

beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockHasValidDeviceSettings.mockReturnValue(false)
    mockGetActiveMediaStream.mockReturnValue(null)
})

afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
})

// Helper: drive component to 'reviewing' state with a finished recording
async function driveToReview() {
    render(
        <VideoRecorder
            interviewId="int1"
            questionId="q1"
            showFace={true}
            prepTime={5}
            maxResponseTime={10}
        />
    )

    // Allow webcam onUserMedia callback
    await act(async () => {
        jest.advanceTimersByTime(0)
    })

    // Autostart prep after 200ms (since selected devices exist)
    await act(async () => {
        jest.advanceTimersByTime(210)
    })

    // Should be in preparing state (skip button visible)
    const skipBtn = await screen.findByTestId('skip-prep-button')
    fireEvent.click(skipBtn)

    // Now countdown (3 -> 0 over 3s)
    await act(async () => {
        jest.advanceTimersByTime(3000)
    })

    // Recording state (Stop button visible)
    const stopBtn = await screen.findByTestId('stop-recording-button')
    fireEvent.click(stopBtn)

    // Wait for review video to appear (onstop executed)
    await waitFor(() => {
        expect(screen.getByTestId('review-video')).toBeInTheDocument()
    })
}

test('retryRecording resets state and starts a new countdown', async () => {
    await driveToReview()

    // Initial retry button label
    const retryButton = screen.getByTestId('retry-button')
    expect(retryButton).toHaveTextContent('Record Again (3 left)')

    // Click retry
    fireEvent.click(retryButton)

    // redoAttempts increment -> label updates (still in reviewing until timeout)
    await waitFor(() => {
        expect(retryButton).toHaveTextContent('Record Again (2 left)')
    })

    // Recorded video URL revoked and element removed
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-video')
    expect(screen.queryByTestId('review-video')).not.toBeInTheDocument()

    // Countdown starts after 500ms delay
    await act(async () => {
        jest.advanceTimersByTime(500)
    })

    // Countdown display present (value 3 initially)
    await waitFor(() => {
        expect(screen.getByTestId('countdown-display')).toHaveTextContent('3')
    })
})

test('retryRecording enforces MAX_REDOS limit and disables button after third retry', async () => {
    await driveToReview()

    const performRetryCycle = async (expectedRemaining: number) => {
        const retryBtn = screen.getByTestId('retry-button')
        expect(retryBtn).toHaveTextContent(`Record Again (${expectedRemaining} left)`)
        fireEvent.click(retryBtn)
        await act(async () => {
            jest.advanceTimersByTime(500) // delay to start countdown
        })
        await act(async () => {
            jest.advanceTimersByTime(3000) // countdown 3s
        })
        // Stop new recording quickly
        const stopBtn = await screen.findByTestId('stop-recording-button')
        fireEvent.click(stopBtn)
        await waitFor(() => expect(screen.getByTestId('review-video')).toBeInTheDocument())
    }

    // First retry (remaining 3 -> then 2 left after increment)
    await performRetryCycle(3)
    // Second retry
    await performRetryCycle(2)
    // Third retry
    await performRetryCycle(1)

    // Now redoAttempts = 3, button disabled
    const retryBtnFinal = screen.getByTestId('retry-button')
    expect(retryBtnFinal).toHaveTextContent('Max retries reached')
    expect(retryBtnFinal).toBeDisabled()

    // Further click does nothing
    fireEvent.click(retryBtnFinal)
    expect(toastError).not.toHaveBeenCalled() // guard: function not entered due to disabled
})