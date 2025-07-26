import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useErrorLogging } from '@/hooks/use-error-logging'
import DeviceSelector from '../device-selector'

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
    },
}))

jest.mock('@/hooks/use-error-logging', () => ({
    useErrorLogging: jest.fn(),
}))

jest.mock('react-webcam', () => {
    return React.forwardRef<HTMLVideoElement>((props, ref) => (
        <video ref={ref} data-testid="webcam" {...props} />
    ))
})

// Mock Web APIs
const mockGetUserMedia = jest.fn()
const mockEnumerateDevices = jest.fn()
const mockAudioContext = {
    createMediaStreamSource: jest.fn(),
    createAnalyser: jest.fn(),
    close: jest.fn(),
    state: 'running',
}
const mockAnalyser = {
    fftSize: 256,
    frequencyBinCount: 128,
    connect: jest.fn(),
    getByteFrequencyData: jest.fn(),
}
const mockStream = {
    getTracks: jest.fn(() => [{ stop: jest.fn() }]),
}

Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: mockEnumerateDevices,
    },
    writable: true,
})

global.AudioContext = jest.fn(() => mockAudioContext) as any
global.requestAnimationFrame = jest.fn((cb) => {
    cb()
    return 1
})
global.cancelAnimationFrame = jest.fn()

const mockPush = jest.fn()
const mockLogError = jest.fn()

describe('DeviceSelector', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
            ; (useErrorLogging as jest.Mock).mockReturnValue({ logError: mockLogError })

        mockGetUserMedia.mockResolvedValue(mockStream)
        mockEnumerateDevices.mockResolvedValue([
            { deviceId: 'camera1', kind: 'videoinput', label: 'Camera 1' },
            { deviceId: 'camera2', kind: 'videoinput', label: 'Camera 2' },
            { deviceId: 'mic1', kind: 'audioinput', label: 'Microphone 1' },
            { deviceId: 'mic2', kind: 'audioinput', label: 'Microphone 2' },
        ])

        mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser)
        mockAudioContext.createMediaStreamSource.mockReturnValue({ connect: jest.fn() })
        mockAnalyser.getByteFrequencyData.mockImplementation((array) => {
            array.fill(50)
        })

        Storage.prototype.setItem = jest.fn()
    })

    it('renders device selector with title', () => {
        render(<DeviceSelector interviewId="123" questionId="456" />)

        expect(screen.getByText('Camera and Microphone Setup')).toBeInTheDocument()
        expect(screen.getByText('Proceed to Interview')).toBeInTheDocument()
    })

    it('loads and displays available devices', async () => {
        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: true })
            expect(mockEnumerateDevices).toHaveBeenCalled()
        })
    })

    it('handles device enumeration error', async () => {
        mockGetUserMedia.mockRejectedValue(new Error('Permission denied'))

        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalledWith(
                expect.any(Error),
                { context: 'DeviceSelector.getDevices' }
            )
            expect(toast.error).toHaveBeenCalledWith(
                'Could not list your cameras and microphones. Please grant permission to your camera and microphone.'
            )
        })
    })

    it('selects camera and updates webcam', async () => {
        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(screen.getByTestId('webcam')).toBeInTheDocument()
        })
    })

    it('handles proceed button click with valid selection', async () => {
        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(mockEnumerateDevices).toHaveBeenCalled()
        })

        const proceedButton = screen.getByText('Proceed to Interview')
        fireEvent.click(proceedButton)

        expect(Storage.prototype.setItem).toHaveBeenCalledWith('selectedCamera', 'camera1')
        expect(Storage.prototype.setItem).toHaveBeenCalledWith('selectedMicrophone', 'mic1')
        expect(mockPush).toHaveBeenCalledWith('/interviews/job/123/questions/456')
    })

    it('shows error when proceeding without device selection', () => {
        mockEnumerateDevices.mockResolvedValue([])

        render(<DeviceSelector interviewId="123" questionId="456" />)

        const proceedButton = screen.getByText('Proceed to Interview')
        fireEvent.click(proceedButton)

        expect(toast.error).toHaveBeenCalledWith(
            'Please select a camera and a microphone to continue.'
        )
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles audio analysis setup error', async () => {
        mockGetUserMedia
            .mockResolvedValueOnce(mockStream) // First call for device enumeration
            .mockRejectedValueOnce(new Error('Audio access denied')) // Second call for audio analysis

        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(mockLogError).toHaveBeenCalledWith(
                expect.any(Error),
                { context: 'DeviceSelector.setupAudioAnalysis' }
            )
            expect(toast.error).toHaveBeenCalledWith('Failed to start microphone analysis.')
        })
    })

    it('changes selected camera', async () => {
        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(mockEnumerateDevices).toHaveBeenCalled()
        })

        const cameraSelect = screen.getByTestId('camera-select')
        fireEvent.click(cameraSelect)

        const camera2Option = screen.getByText('Camera 2')
        fireEvent.click(camera2Option)

        expect(cameraSelect).toHaveTextContent('Camera 2')
    })

    it('changes selected microphone', async () => {
        render(<DeviceSelector interviewId="123" questionId="456" />)

        await waitFor(() => {
            expect(mockEnumerateDevices).toHaveBeenCalled()
        })

        const micSelect = screen.getByTestId('microphone-select')
        fireEvent.click(micSelect)

        const mic2Option = screen.getByText('Microphone 2')
        fireEvent.click(mic2Option)

        expect(micSelect).toHaveTextContent('Microphone 2')
    })
})