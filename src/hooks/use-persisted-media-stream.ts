'use client'

import { useState, useEffect, useCallback } from 'react'
import { getActiveMediaStream, setActiveMediaStream } from '@/lib/device-session'

interface UsePersistedMediaStreamProps {
  videoDeviceId?: string
  audioDeviceId?: string
  autoRequest?: boolean
}

interface UsePersistedMediaStreamReturn {
  stream: MediaStream | null
  loading: boolean
  error: string | null
  requestStream: () => Promise<void>
  clearStream: () => void
}

export function usePersistedMediaStream({
  videoDeviceId,
  audioDeviceId,
  autoRequest = true
}: UsePersistedMediaStreamProps): UsePersistedMediaStreamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestStream = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // First, check if we have a persisted stream that matches our requirements
      const existingStream = getActiveMediaStream()
      
      if (existingStream) {
        // Verify the stream has the right tracks
        const videoTracks = existingStream.getVideoTracks()
        const audioTracks = existingStream.getAudioTracks()
        
        // Check if existing stream matches our device requirements
        const videoMatches = !videoDeviceId || 
          (videoTracks.length > 0 && 
           videoTracks[0].getSettings().deviceId === videoDeviceId)
        
        const audioMatches = !audioDeviceId || 
          (audioTracks.length > 0 && 
           audioTracks[0].getSettings().deviceId === audioDeviceId)

        if (videoMatches && audioMatches) {
          console.log('Reusing existing media stream')
          setStream(existingStream)
          setLoading(false)
          return
        } else {
          console.log('Existing stream does not match requirements, requesting new stream')
        }
      }

      // Request new stream if no suitable existing stream
      const constraints: MediaStreamConstraints = {
        video: videoDeviceId 
          ? { deviceId: { exact: videoDeviceId }, width: 1280, height: 720, facingMode: 'user' }
          : { width: 1280, height: 720, facingMode: 'user' },
        audio: audioDeviceId 
          ? { deviceId: { exact: audioDeviceId } }
          : true
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      setActiveMediaStream(newStream)
      console.log('Created new media stream')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera/microphone'
      setError(errorMessage)
      console.error('Media stream error:', err)
    } finally {
      setLoading(false)
    }
  }, [videoDeviceId, audioDeviceId])

  const clearStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setActiveMediaStream(null)
  }, [stream])

  // Auto-request stream on mount or when device IDs change
  useEffect(() => {
    if (autoRequest) {
      requestStream()
    }

    return () => {
      // Don't automatically clean up the stream on unmount
      // as we want to persist it across components
    }
  }, [autoRequest, requestStream])

  return {
    stream,
    loading,
    error,
    requestStream,
    clearStream
  }
}