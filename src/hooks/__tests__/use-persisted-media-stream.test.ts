/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { usePersistedMediaStream } from '../use-persisted-media-stream'
import * as deviceSession from '@/lib/device-session'

// Mock the device session module
jest.mock('@/lib/device-session', () => ({
  getActiveMediaStream: jest.fn(),
  setActiveMediaStream: jest.fn(),
}))

// Mock MediaStream
class MockMediaStream {
  active = true
  id = 'mock-stream-id'
  private tracks = [
    { 
      stop: jest.fn(), 
      kind: 'video',
      getSettings: () => ({ deviceId: 'camera-123' })
    },
    { 
      stop: jest.fn(), 
      kind: 'audio',
      getSettings: () => ({ deviceId: 'microphone-456' })
    }
  ]
  
  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video')
  }
  
  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio')
  }
  
  getTracks() {
    return this.tracks
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn()
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
})

// Mock console.log and console.error
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

const mockedDeviceSession = deviceSession as jest.Mocked<typeof deviceSession>

describe('usePersistedMediaStream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserMedia.mockClear()
    mockedDeviceSession.getActiveMediaStream.mockReturnValue(null)
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
    mockConsoleError.mockRestore()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      expect(result.current.stream).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.requestStream).toBe('function')
      expect(typeof result.current.clearStream).toBe('function')
    })

    it('should auto-request stream when autoRequest is true', async () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(mockStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ 
          videoDeviceId: 'camera-123',
          audioDeviceId: 'microphone-456',
          autoRequest: true 
        })
      )
      
      expect(result.current.loading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.stream).toBe(mockStream)
      expect(mockedDeviceSession.setActiveMediaStream).toHaveBeenCalledWith(mockStream)
    })

    it('should not auto-request stream when autoRequest is false', () => {
      renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      expect(mockGetUserMedia).not.toHaveBeenCalled()
    })
  })

  describe('existing stream reuse', () => {
    it('should reuse existing stream with matching devices', async () => {
      const existingStream = new MockMediaStream() as unknown as MediaStream
      mockedDeviceSession.getActiveMediaStream.mockReturnValue(existingStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ 
          videoDeviceId: 'camera-123',
          audioDeviceId: 'microphone-456',
          autoRequest: true 
        })
      )
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.stream).toBe(existingStream)
      expect(mockGetUserMedia).not.toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Reusing existing media stream')
    })

    it('should request new stream when existing stream has wrong video device', async () => {
      const existingStream = new MockMediaStream() as unknown as MediaStream
      // Override the video track settings
      existingStream.getVideoTracks()[0].getSettings = () => ({ deviceId: 'wrong-camera' })
      
      mockedDeviceSession.getActiveMediaStream.mockReturnValue(existingStream)
      
      const newStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(newStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ 
          videoDeviceId: 'camera-123',
          audioDeviceId: 'microphone-456',
          autoRequest: true 
        })
      )
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(mockGetUserMedia).toHaveBeenCalled()
      expect(result.current.stream).toBe(newStream)
      expect(mockConsoleLog).toHaveBeenCalledWith('Existing stream does not match requirements, requesting new stream')
    })

    it('should request new stream when existing stream has wrong audio device', async () => {
      const existingStream = new MockMediaStream() as unknown as MediaStream
      // Override the audio track settings
      existingStream.getAudioTracks()[0].getSettings = () => ({ deviceId: 'wrong-microphone' })
      
      mockedDeviceSession.getActiveMediaStream.mockReturnValue(existingStream)
      
      const newStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(newStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ 
          videoDeviceId: 'camera-123',
          audioDeviceId: 'microphone-456',
          autoRequest: true 
        })
      )
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(mockGetUserMedia).toHaveBeenCalled()
      expect(result.current.stream).toBe(newStream)
    })
  })

  describe('stream constraints', () => {
    it('should use correct constraints with device IDs', async () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(mockStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ 
          videoDeviceId: 'camera-123',
          audioDeviceId: 'microphone-456'
        })
      )
      
      await act(async () => {
        await result.current.requestStream()
      })
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { 
          deviceId: { exact: 'camera-123' }, 
          width: 1280, 
          height: 720, 
          facingMode: 'user' 
        },
        audio: { deviceId: { exact: 'microphone-456' } }
      })
    })

    it('should use default constraints without device IDs', async () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(mockStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      await act(async () => {
        await result.current.requestStream()
      })
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      })
    })
  })

  describe('error handling', () => {
    it('should handle getUserMedia errors', async () => {
      const error = new Error('Permission denied')
      mockGetUserMedia.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      await act(async () => {
        await result.current.requestStream()
      })
      
      expect(result.current.error).toBe('Permission denied')
      expect(result.current.stream).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Media stream error:', error)
    })

    it('should handle non-Error exceptions', async () => {
      mockGetUserMedia.mockRejectedValueOnce('String error')
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      await act(async () => {
        await result.current.requestStream()
      })
      
      expect(result.current.error).toBe('Failed to access camera/microphone')
      expect(result.current.stream).toBeNull()
    })
  })

  describe('stream cleanup', () => {
    it('should clear stream and stop tracks', async () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(mockStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      await act(async () => {
        await result.current.requestStream()
      })
      
      expect(result.current.stream).toBe(mockStream)
      
      act(() => {
        result.current.clearStream()
      })
      
      expect(result.current.stream).toBeNull()
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled()
      expect(mockStream.getTracks()[1].stop).toHaveBeenCalled()
      expect(mockedDeviceSession.setActiveMediaStream).toHaveBeenCalledWith(null)
    })

    it('should handle clearing when no stream exists', () => {
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      act(() => {
        result.current.clearStream()
      })
      
      expect(result.current.stream).toBeNull()
      expect(mockedDeviceSession.setActiveMediaStream).toHaveBeenCalledWith(null)
    })
  })

  describe('device ID changes', () => {
    it('should request new stream when device IDs change', async () => {
      const firstStream = new MockMediaStream() as unknown as MediaStream
      const secondStream = new MockMediaStream() as unknown as MediaStream
      
      mockGetUserMedia
        .mockResolvedValueOnce(firstStream)
        .mockResolvedValueOnce(secondStream)
      
      const { result, rerender } = renderHook(
        ({ videoDeviceId, audioDeviceId }) => 
          usePersistedMediaStream({ videoDeviceId, audioDeviceId, autoRequest: true }),
        {
          initialProps: { 
            videoDeviceId: 'camera-123', 
            audioDeviceId: 'microphone-456' 
          }
        }
      )
      
      await waitFor(() => {
        expect(result.current.stream).toBe(firstStream)
      })
      
      rerender({ 
        videoDeviceId: 'camera-789', 
        audioDeviceId: 'microphone-456' 
      })
      
      await waitFor(() => {
        expect(result.current.stream).toBe(secondStream)
      })
      
      expect(mockGetUserMedia).toHaveBeenCalledTimes(2)
    })
  })

  describe('loading state', () => {
    it('should manage loading state correctly', async () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      mockGetUserMedia.mockResolvedValueOnce(mockStream)
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      expect(result.current.loading).toBe(false)
      
      act(() => {
        result.current.requestStream()
      })
      
      expect(result.current.loading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.stream).toBe(mockStream)
    })

    it('should set loading to false on error', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Failed'))
      
      const { result } = renderHook(() => 
        usePersistedMediaStream({ autoRequest: false })
      )
      
      act(() => {
        result.current.requestStream()
      })
      
      expect(result.current.loading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.error).toBeTruthy()
    })
  })
})