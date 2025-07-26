/**
 * @jest-environment jsdom
 */

import {
  storeDeviceSettings,
  getValidDeviceSettings,
  hasValidDeviceSettings,
  clearDeviceSettings,
  getSelectedCamera,
  getSelectedMicrophone,
  refreshDeviceSession,
  setActiveMediaStream,
  getActiveMediaStream,
  clearActiveMediaStream,
  isFreshSession,
  initializeSessionCleanup
} from '../device-session'

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock MediaStream
class MockMediaStream {
  active = true
  id = 'mock-stream-id'
  private tracks = [
    { stop: jest.fn(), kind: 'video' },
    { stop: jest.fn(), kind: 'audio' }
  ]
  
  getTracks() {
    return this.tracks
  }
  
  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video')
  }
  
  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio')
  }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

describe('Device Session Management', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    clearActiveMediaStream()
    jest.clearAllMocks()
  })

  describe('storeDeviceSettings', () => {
    it('should store device settings with session information', () => {
      const cameraId = 'camera-123'
      const microphoneId = 'microphone-456'
      
      storeDeviceSettings(cameraId, microphoneId)
      
      const storedData = localStorageMock.getItem('interview_device_session')
      expect(storedData).toBeTruthy()
      
      const parsed = JSON.parse(storedData!)
      expect(parsed.selectedCamera).toBe(cameraId)
      expect(parsed.selectedMicrophone).toBe(microphoneId)
      expect(parsed.sessionId).toBeTruthy()
      expect(parsed.timestamp).toBeTruthy()
      
      // Should also store individual items for backward compatibility
      expect(localStorageMock.getItem('selectedCamera')).toBe(cameraId)
      expect(localStorageMock.getItem('selectedMicrophone')).toBe(microphoneId)
    })

    it('should generate session ID if not exists', () => {
      storeDeviceSettings('cam1', 'mic1')
      
      const sessionId = sessionStorageMock.getItem('browser_session_id')
      expect(sessionId).toBeTruthy()
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]{9}$/)
    })
  })

  describe('getValidDeviceSettings', () => {
    it('should return valid device settings for current session', () => {
      const cameraId = 'camera-123'
      const microphoneId = 'microphone-456'
      
      storeDeviceSettings(cameraId, microphoneId)
      
      const settings = getValidDeviceSettings()
      expect(settings).toEqual({
        camera: cameraId,
        microphone: microphoneId
      })
    })

    it('should return null for expired session', () => {
      const cameraId = 'camera-123'
      const microphoneId = 'microphone-456'
      
      // Store settings with timestamp 25 hours ago
      const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000)
      const expiredSettings = {
        selectedCamera: cameraId,
        selectedMicrophone: microphoneId,
        sessionId: 'expired-session',
        timestamp: expiredTimestamp
      }
      
      localStorageMock.setItem('interview_device_session', JSON.stringify(expiredSettings))
      
      const settings = getValidDeviceSettings()
      expect(settings).toBeNull()
      
      // Should clean up expired settings
      expect(localStorageMock.getItem('interview_device_session')).toBeNull()
    })

    it('should return null for different session', () => {
      const cameraId = 'camera-123'
      const microphoneId = 'microphone-456'
      
      // Store settings with different session ID
      const differentSessionSettings = {
        selectedCamera: cameraId,
        selectedMicrophone: microphoneId,
        sessionId: 'different-session',
        timestamp: Date.now()
      }
      
      localStorageMock.setItem('interview_device_session', JSON.stringify(differentSessionSettings))
      
      const settings = getValidDeviceSettings()
      expect(settings).toBeNull()
    })

    it('should handle corrupted data gracefully', () => {
      localStorageMock.setItem('interview_device_session', 'invalid-json')
      
      const settings = getValidDeviceSettings()
      expect(settings).toBeNull()
      
      // Should clean up corrupted data
      expect(localStorageMock.getItem('interview_device_session')).toBeNull()
    })
  })

  describe('hasValidDeviceSettings', () => {
    it('should return true when valid settings exist', () => {
      storeDeviceSettings('camera-123', 'microphone-456')
      expect(hasValidDeviceSettings()).toBe(true)
    })

    it('should return false when no valid settings exist', () => {
      expect(hasValidDeviceSettings()).toBe(false)
    })
  })

  describe('clearDeviceSettings', () => {
    it('should clear all device-related storage', () => {
      storeDeviceSettings('camera-123', 'microphone-456')
      
      const mockStream = new MockMediaStream() as unknown as MediaStream
      setActiveMediaStream(mockStream)
      
      clearDeviceSettings()
      
      expect(localStorageMock.getItem('interview_device_session')).toBeNull()
      expect(localStorageMock.getItem('selectedCamera')).toBeNull()
      expect(localStorageMock.getItem('selectedMicrophone')).toBeNull()
      expect(getActiveMediaStream()).toBeNull()
    })
  })

  describe('getSelectedCamera and getSelectedMicrophone', () => {
    it('should return individual device IDs', () => {
      const cameraId = 'camera-123'
      const microphoneId = 'microphone-456'
      
      storeDeviceSettings(cameraId, microphoneId)
      
      expect(getSelectedCamera()).toBe(cameraId)
      expect(getSelectedMicrophone()).toBe(microphoneId)
    })

    it('should return null when no valid settings exist', () => {
      expect(getSelectedCamera()).toBeNull()
      expect(getSelectedMicrophone()).toBeNull()
    })
  })

  describe('refreshDeviceSession', () => {
    it('should update session ID for existing settings', () => {
      const cameraId = 'camera-123'
      const microphoneId = 'microphone-456'
      
      storeDeviceSettings(cameraId, microphoneId)
      
      // Store original state for verification
      
      // Create a new session ID manually first
      sessionStorageMock.setItem('browser_session_id', 'new-session-id')
      
      refreshDeviceSession()
      
      const updatedDataStr = localStorageMock.getItem('interview_device_session')
      expect(updatedDataStr).toBeTruthy()
      
      const updatedData = JSON.parse(updatedDataStr!)
      expect(updatedData.sessionId).toBe('new-session-id')
      expect(updatedData.selectedCamera).toBe(cameraId)
      expect(updatedData.selectedMicrophone).toBe(microphoneId)
    })

    it('should do nothing when no valid settings exist', () => {
      refreshDeviceSession()
      expect(localStorageMock.getItem('interview_device_session')).toBeNull()
    })
  })

  describe('Media Stream Management', () => {
    it('should store and retrieve active media stream', () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      
      setActiveMediaStream(mockStream)
      
      const retrievedStream = getActiveMediaStream()
      expect(retrievedStream).toBe(mockStream)
    })

    it('should return null for inactive stream', () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      Object.defineProperty(mockStream, 'active', { value: false, writable: true })
      
      setActiveMediaStream(mockStream)
      
      const retrievedStream = getActiveMediaStream()
      expect(retrievedStream).toBeNull()
    })

    it('should stop tracks when clearing stream', () => {
      const mockStream = new MockMediaStream() as unknown as MediaStream
      const stopSpy = jest.spyOn(mockStream.getTracks()[0], 'stop')
      
      setActiveMediaStream(mockStream)
      clearActiveMediaStream()
      
      expect(stopSpy).toHaveBeenCalled()
      expect(getActiveMediaStream()).toBeNull()
    })

    it('should replace existing stream when setting new one', () => {
      const oldStream = new MockMediaStream() as unknown as MediaStream
      const newStream = new MockMediaStream() as unknown as MediaStream
      const stopSpy = jest.spyOn(oldStream.getTracks()[0], 'stop')
      
      setActiveMediaStream(oldStream)
      setActiveMediaStream(newStream)
      
      expect(stopSpy).toHaveBeenCalled()
      expect(getActiveMediaStream()).toBe(newStream)
    })
  })

  describe('isFreshSession', () => {
    it('should return true for new session', () => {
      expect(isFreshSession()).toBe(true)
    })

    it('should return false for existing session', () => {
      sessionStorageMock.setItem('browser_session_id', 'existing-session')
      expect(isFreshSession()).toBe(false)
    })
  })

  describe('initializeSessionCleanup', () => {
    let mockAddEventListener: jest.SpyInstance
    let mockRemoveEventListener: jest.SpyInstance

    beforeEach(() => {
      mockAddEventListener = jest.spyOn(window, 'addEventListener')
      mockRemoveEventListener = jest.spyOn(window, 'removeEventListener')
    })

    afterEach(() => {
      mockAddEventListener.mockRestore()
      mockRemoveEventListener.mockRestore()
    })

    it('should register beforeunload event listener', () => {
      const cleanup = initializeSessionCleanup()
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      )
      
      if (cleanup) {
        cleanup()
        expect(mockRemoveEventListener).toHaveBeenCalledWith(
          'beforeunload',
          expect.any(Function)
        )
      }
    })

    it('should clear device settings on beforeunload', () => {
      storeDeviceSettings('camera-123', 'microphone-456')
      
      initializeSessionCleanup()
      
      // Simulate beforeunload event
      const beforeUnloadHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'beforeunload'
      )?.[1]
      
      expect(beforeUnloadHandler).toBeDefined()
      beforeUnloadHandler()
      
      expect(localStorageMock.getItem('interview_device_session')).toBeNull()
    })

    it('should return undefined in non-browser environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing non-browser environment
      delete global.window
      
      const cleanup = initializeSessionCleanup()
      expect(cleanup).toBeUndefined()
      
      global.window = originalWindow
    })
  })
})