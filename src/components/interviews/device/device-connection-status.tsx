'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { CheckCircle, Loader2, AlertCircle, Camera, Mic } from 'lucide-react'
import { getSelectedCamera, getSelectedMicrophone, hasValidDeviceSettings, setActiveMediaStream } from '@/lib/device-session'

interface DeviceConnectionStatusProps {
    interviewId: string
    questionId: string
}

type ConnectionStatus = 'pending' | 'connecting' | 'connected' | 'error'

interface ConnectionStep {
    name: string
    status: ConnectionStatus
    icon: React.ReactNode
    errorMessage?: string
}

export default function DeviceConnectionStatus({ interviewId, questionId }: DeviceConnectionStatusProps) {
    const router = useRouter()
    const { logError } = useErrorLogging()
    
    const [cameraStatus, setCameraStatus] = useState<ConnectionStatus>('pending')
    const [microphoneStatus, setMicrophoneStatus] = useState<ConnectionStatus>('pending')
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [canProceed, setCanProceed] = useState(false)
    const [showProceedButton, setShowProceedButton] = useState(false)

    // Check if we have valid device settings
    useEffect(() => {
        if (!hasValidDeviceSettings()) {
            toast.error('Device settings not found. Please select your camera and microphone again.')
            router.push(`/interviews/job/${interviewId}/setup`)
            return
        }
        
        // Start the connection process
        startConnectionProcess()
    }, [interviewId, router])

    const startConnectionProcess = useCallback(async () => {
        console.log('[DeviceConnection] Starting connection process...')
        
        const selectedCamera = getSelectedCamera()
        const selectedMicrophone = getSelectedMicrophone()
        
        if (!selectedCamera || !selectedMicrophone) {
            toast.error('Device settings not found. Please select your camera and microphone again.')
            router.push(`/interviews/job/${interviewId}/setup`)
            return
        }

        try {
            // Step 1: Connect to camera
            setCameraStatus('connecting')
            console.log('[DeviceConnection] Connecting to camera...')
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    deviceId: { exact: selectedCamera },
                    width: 1280,
                    height: 720
                },
                audio: { 
                    deviceId: { exact: selectedMicrophone }
                }
            })

            console.log('[DeviceConnection] Camera connected successfully')
            setCameraStatus('connected')
            
            // Small delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Step 2: Test microphone
            setMicrophoneStatus('connecting')
            console.log('[DeviceConnection] Testing microphone...')
            
            // Test audio by checking if we have audio tracks
            const audioTracks = stream.getAudioTracks()
            if (audioTracks.length === 0) {
                throw new Error('No audio tracks found in stream')
            }
            
            // Test that audio track is working
            const audioTrack = audioTracks[0]
            if (!audioTrack.enabled) {
                throw new Error('Audio track is not enabled')
            }
            
            console.log('[DeviceConnection] Microphone connected successfully')
            setMicrophoneStatus('connected')
            setMediaStream(stream)
            
            // Store the stream for the video recorder
            setActiveMediaStream(stream)
            
            // Small delay for visual feedback, then show proceed button
            await new Promise(resolve => setTimeout(resolve, 500))
            setCanProceed(true)
            setShowProceedButton(true)
            
        } catch (error) {
            console.error('[DeviceConnection] Connection failed:', error)
            logError(error, { 
                context: 'DeviceConnectionStatus.startConnectionProcess',
                selectedCamera: selectedCamera?.substring(0, 8) + '...',
                selectedMicrophone: selectedMicrophone?.substring(0, 8) + '...'
            })
            
            // Determine which step failed
            if (cameraStatus === 'connecting') {
                setCameraStatus('error')
                toast.error('Failed to connect to camera. Please check permissions.')
            } else if (microphoneStatus === 'connecting') {
                setMicrophoneStatus('error')
                toast.error('Failed to connect to microphone. Please check permissions.')
            }
        }
    }, [interviewId, router, logError, cameraStatus, microphoneStatus])

    const handleProceed = () => {
        if (canProceed && mediaStream) {
            console.log('[DeviceConnection] Proceeding to video recorder with connected stream')
            router.push(`/interviews/job/${interviewId}/questions/${questionId}`)
        }
    }

    const handleRetry = () => {
        // Reset states
        setCameraStatus('pending')
        setMicrophoneStatus('pending')
        setCanProceed(false)
        setShowProceedButton(false)
        
        // Clean up existing stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
            setMediaStream(null)
        }
        
        // Restart connection process
        startConnectionProcess()
    }

    const handleBackToSetup = () => {
        // Clean up stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
        }
        router.push(`/interviews/job/${interviewId}/setup`)
    }

    const getStatusIcon = (status: ConnectionStatus) => {
        switch (status) {
            case 'pending':
                return <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
            case 'connecting':
                return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            case 'connected':
                return <CheckCircle className="w-6 h-6 text-green-500" />
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />
        }
    }

    const connectionSteps: ConnectionStep[] = [
        {
            name: 'Connecting to camera',
            status: cameraStatus,
            icon: <Camera className="w-5 h-5" />
        },
        {
            name: 'Connecting to microphone',
            status: microphoneStatus,
            icon: <Mic className="w-5 h-5" />
        }
    ]

    const hasError = cameraStatus === 'error' || microphoneStatus === 'error'

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Connecting to Your Devices</h1>
                    <p className="text-muted-foreground">
                        Please wait while we connect to your selected camera and microphone
                    </p>
                </div>

                <div className="space-y-4">
                    {connectionSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                {step.icon}
                            </div>
                            
                            <div className="flex-1">
                                <div className="font-medium">{step.name}</div>
                                {step.status === 'connecting' && (
                                    <div className="text-sm text-muted-foreground">Please wait...</div>
                                )}
                                {step.status === 'connected' && (
                                    <div className="text-sm text-green-600">Connected successfully!</div>
                                )}
                                {step.status === 'error' && (
                                    <div className="text-sm text-red-600">
                                        {step.errorMessage || 'Connection failed'}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-shrink-0">
                                {getStatusIcon(step.status)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    {showProceedButton && canProceed && (
                        <Button 
                            onClick={handleProceed}
                            size="lg"
                            className="w-full"
                            data-testid="proceed-button"
                        >
                            Start Interview
                        </Button>
                    )}
                    
                    {hasError && (
                        <>
                            <Button 
                                onClick={handleRetry}
                                variant="outline"
                                size="lg"
                                className="w-full"
                                data-testid="retry-button"
                            >
                                Try Again
                            </Button>
                            <Button 
                                onClick={handleBackToSetup}
                                variant="ghost"
                                size="lg"
                                className="w-full"
                                data-testid="back-to-setup-button"
                            >
                                Back to Device Setup
                            </Button>
                        </>
                    )}
                </div>

                {!hasError && !showProceedButton && (
                    <div className="text-center text-sm text-muted-foreground">
                        This usually takes just a few seconds...
                    </div>
                )}
            </div>
        </div>
    )
}