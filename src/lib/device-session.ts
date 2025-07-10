'use client'

interface DeviceSettings {
  selectedCamera: string | null
  selectedMicrophone: string | null
  sessionId: string
  timestamp: number
}

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
    if (!stored) return null

    const settings: DeviceSettings = JSON.parse(stored)
    const currentSessionId = getCurrentSessionId()
    const now = Date.now()

    // Check if session is still valid
    const sessionValid = settings.sessionId === currentSessionId
    const timeValid = (now - settings.timestamp) < SESSION_DURATION

    if (sessionValid && timeValid && settings.selectedCamera && settings.selectedMicrophone) {
      return {
        camera: settings.selectedCamera,
        microphone: settings.selectedMicrophone
      }
    }

    // If invalid, clean up old settings
    clearDeviceSettings()
    return null
  } catch (error) {
    console.error('Error reading device settings:', error)
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