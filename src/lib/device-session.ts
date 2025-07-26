'use client'

interface DeviceSettings {
  selectedCamera: string | null
  selectedMicrophone: string | null
  sessionId: string
  timestamp: number
}

// Global stream storage for session persistence
let activeMediaStream: MediaStream | null = null

const DEVICE_SESSION_KEY = 'interview_device_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Generate a unique session ID for this browser session
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get the current browser session ID (creates one if doesn't exist)
 */
function getCurrentSessionId(): string {
  let sessionId = sessionStorage.getItem('browser_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('browser_session_id', sessionId)
  }
  return sessionId
}

/**
 * Store device settings with session information
 */
export function storeDeviceSettings(camera: string, microphone: string): void {
  const settings: DeviceSettings = {
    selectedCamera: camera,
    selectedMicrophone: microphone,
    sessionId: getCurrentSessionId(),
    timestamp: Date.now()
  }
  
  console.log('[DeviceSession] Storing device settings:', {
    cameraId: camera.substring(0, 8) + '...',
    microphoneId: microphone.substring(0, 8) + '...',
    sessionId: settings.sessionId.substring(0, 16) + '...',
    timestamp: new Date(settings.timestamp).toISOString()
  })
  
  localStorage.setItem(DEVICE_SESSION_KEY, JSON.stringify(settings))
  
  // Also store individual items for backward compatibility
  localStorage.setItem('selectedCamera', camera)
  localStorage.setItem('selectedMicrophone', microphone)
}

/**
 * Get stored device settings if they're still valid for this session
 */
export function getValidDeviceSettings(): { camera: string; microphone: string } | null {
  try {
    const stored = localStorage.getItem(DEVICE_SESSION_KEY)
    if (!stored) {
      console.log('[DeviceSession] No stored device settings found')
      return null
    }

    const settings: DeviceSettings = JSON.parse(stored)
    const currentSessionId = getCurrentSessionId()
    const now = Date.now()

    // Check if session is still valid
    const sessionValid = settings.sessionId === currentSessionId
    const timeValid = (now - settings.timestamp) < SESSION_DURATION
    const ageMinutes = Math.round((now - settings.timestamp) / (1000 * 60))

    console.log('[DeviceSession] Validating device settings:', {
      sessionValid,
      timeValid,
      ageMinutes,
      hasCamera: !!settings.selectedCamera,
      hasMicrophone: !!settings.selectedMicrophone
    })

    if (sessionValid && timeValid && settings.selectedCamera && settings.selectedMicrophone) {
      console.log('[DeviceSession] Using valid existing device settings')
      return {
        camera: settings.selectedCamera,
        microphone: settings.selectedMicrophone
      }
    }

    // If invalid, clean up old settings
    console.log('[DeviceSession] Device settings invalid, cleaning up')
    clearDeviceSettings()
    return null
  } catch (error) {
    console.error('[DeviceSession] Error reading device settings:', error)
    clearDeviceSettings()
    return null
  }
}

/**
 * Check if device settings are configured for this session
 */
export function hasValidDeviceSettings(): boolean {
  return getValidDeviceSettings() !== null
}

/**
 * Clear device settings (on session end or expiration)
 */
export function clearDeviceSettings(): void {
  localStorage.removeItem(DEVICE_SESSION_KEY)
  localStorage.removeItem('selectedCamera')
  localStorage.removeItem('selectedMicrophone')
  clearActiveMediaStream()
}

/**
 * Get individual device IDs for backward compatibility
 */
export function getSelectedCamera(): string | null {
  const settings = getValidDeviceSettings()
  return settings?.camera || null
}

export function getSelectedMicrophone(): string | null {
  const settings = getValidDeviceSettings()
  return settings?.microphone || null
}

/**
 * Force refresh device settings (useful for testing or manual reset)
 */
export function refreshDeviceSession(): void {
  const settings = getValidDeviceSettings()
  if (settings) {
    // Refresh the session with current browser session
    storeDeviceSettings(settings.camera, settings.microphone)
  }
}

/**
 * Initialize session cleanup listeners
 * Call this once when the app initializes
 */
export function initializeSessionCleanup(): (() => void) | void {
  if (typeof window === 'undefined') return

  // Clear device settings when the tab is closed or refreshed
  const handleBeforeUnload = () => {
    // Clear device settings but preserve the session ID for potential return
    clearDeviceSettings()
  }

  // Clear when navigating away or closing tab
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

/**
 * Check if this is a fresh browser session (useful for debugging)
 */
export function isFreshSession(): boolean {
  return !sessionStorage.getItem('browser_session_id')
}

/**
 * Store active media stream for session persistence
 */
export function setActiveMediaStream(stream: MediaStream | null): void {
  // Clean up existing stream if replacing
  if (activeMediaStream && activeMediaStream !== stream) {
    console.log('[DeviceSession] Replacing existing media stream')
    activeMediaStream.getTracks().forEach(track => track.stop())
  }
  
  if (stream) {
    console.log('[DeviceSession] Setting active media stream:', {
      streamId: stream.id,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length,
      active: stream.active
    })
  } else {
    console.log('[DeviceSession] Clearing active media stream')
  }
  
  activeMediaStream = stream
}

/**
 * Get active media stream if it exists and is valid
 */
export function getActiveMediaStream(): MediaStream | null {
  // Check if stream is still active (not ended)
  if (activeMediaStream && activeMediaStream.active) {
    console.log('[DeviceSession] Returning active media stream:', {
      streamId: activeMediaStream.id,
      active: activeMediaStream.active
    })
    return activeMediaStream
  }
  
  // Clean up inactive stream
  if (activeMediaStream) {
    console.log('[DeviceSession] Cleaning up inactive media stream')
    activeMediaStream = null
  }
  
  console.log('[DeviceSession] No active media stream available')
  return null
}

/**
 * Clear active media stream
 */
export function clearActiveMediaStream(): void {
  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach(track => track.stop())
    activeMediaStream = null
  }
}