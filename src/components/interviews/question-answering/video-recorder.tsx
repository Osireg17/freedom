'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRecordWebcam } from 'react-record-webcam'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { toast } from 'sonner'
import { Camera, Loader2, VideoOff } from 'lucide-react'
import { getSelectedCamera, getSelectedMicrophone, hasValidDeviceSettings } from '@/lib/device-session'

interface VideoRecorderProps {
    interviewId: string
    questionId: string
    showFace: boolean
    prepTime: number
    maxResponseTime: number
}

type RecorderStatus =
    | 'idle'
    | 'preparing'
    | 'countdown'
    | 'recording'
    | 'reviewing'
    | 'submitting'
    | 'error'

export default function VideoRecorder({
    interviewId,
    questionId,
    showFace,
    prepTime,
    maxResponseTime
}: VideoRecorderProps) {
    const router = useRouter()
    const { logError } = useErrorLogging()
    const [status, setStatus] = useState<RecorderStatus>('idle')
    const [prepTimeRemaining, setPrepTimeRemaining] = useState(prepTime)
    const [recordTimeRemaining, setRecordTimeRemaining] = useState(maxResponseTime)
    const [prepProgress, setPrepProgress] = useState(0)
    const [recordProgress, setRecordProgress] = useState(0)
    const [countdown, setCountdown] = useState(3)
    const [redoAttempts, setRedoAttempts] = useState(0)
    const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null)

    const prepTimerRef = useRef<NodeJS.Timeout | null>(null)
    const recordTimerRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Configure react-record-webcam options
    const recordWebcamOptions = {
        options: {
            fileName: `interview-${interviewId}-question-${questionId}`,
            fileType: 'webm' as const,
            timeSlice: 1000,
        },
        mediaRecorderOptions: {
            mimeType: 'video/webm;codecs=vp8,opus'
        },
        mediaStreamConstraints: {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                deviceId: getSelectedCamera() || undefined
            },
            audio: {
                deviceId: getSelectedMicrophone() || undefined
            }
        }
    }

    const {
        createRecording,
        openCamera,
        startRecording,
        stopRecording,
        cancelRecording,
        activeRecordings = [],
        errorMessage
    } = useRecordWebcam(recordWebcamOptions)

    const findRecordingById = useCallback((id: string | null) => {
        if (!id || !Array.isArray(activeRecordings)) {
            return null
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return activeRecordings.find((r: any) => r.id === id) || null
    }, [activeRecordings])

    // Initialize recording session
    useEffect(() => {
        const initializeRecordingSession = async () => {
            try {
                setStatus('preparing')

                // ✅ Create recording with selected devices
                const selectedCamera = getSelectedCamera()
                const selectedMicrophone = getSelectedMicrophone()

                const recording = await createRecording(selectedCamera || undefined, selectedMicrophone || undefined)
                if (recording) {
                    setCurrentRecordingId(recording.id)
                    await openCamera(recording.id)

                    // Start prep timer after camera is ready
                    const hasDeviceSettings = selectedCamera && selectedMicrophone
                    const delay = hasDeviceSettings ? 200 : 1000

                    setTimeout(() => {
                        startPrepTimer()
                    }, delay)
                }
            } catch (error) {
                logError(error, {
                    context: 'VideoRecorder.initializeRecordingSession',
                    interviewId,
                    questionId
                })
                setStatus('error')
                toast.error('Failed to initialize camera. Please check your permissions.')
            }
        }

        if (status === 'idle') {
            initializeRecordingSession()
        }
    }, [status, interviewId, questionId, logError])

    // Start preparation timer
    const startPrepTimer = useCallback(() => {
        setStatus('preparing')
        setPrepTimeRemaining(prepTime)
        setPrepProgress(0)

        if (prepTimerRef.current) clearInterval(prepTimerRef.current)

        prepTimerRef.current = setInterval(() => {
            setPrepTimeRemaining(prev => {
                const newTime = prev - 1
                setPrepProgress(((prepTime - newTime) / prepTime) * 100)

                if (newTime <= 0) {
                    if (prepTimerRef.current) clearInterval(prepTimerRef.current)
                    startCountdown()
                    return 0
                }
                return newTime
            })
        }, 1000)
    }, [prepTime])

    // Start the 3-2-1 countdown before recording
    const startCountdown = useCallback(() => {
        setStatus('countdown')
        setCountdown(3)

        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)

        countdownTimerRef.current = setInterval(() => {
            setCountdown(prev => {
                const newCount = prev - 1
                if (newCount <= 0) {
                    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
                    initializeRecording()
                    return 0
                }
                return newCount
            })
        }, 1000)
    }, [])

    // Initialize recording after countdown
    const initializeRecording = useCallback(async () => {
        if (!currentRecordingId) {
            toast.error('Recording session not initialized')
            setStatus('error')
            return
        }

        try {
            setStatus('recording')
            setRecordTimeRemaining(maxResponseTime)
            setRecordProgress(0)

            await startRecording(currentRecordingId)

            // Set up the recording timer
            if (recordTimerRef.current) clearInterval(recordTimerRef.current)

            recordTimerRef.current = setInterval(() => {
                setRecordTimeRemaining(prev => {
                    const newTime = prev - 1
                    setRecordProgress(((maxResponseTime - newTime) / maxResponseTime) * 100)

                    if (newTime <= 0) {
                        handleStopRecording()
                        return 0
                    }
                    return newTime
                })
            }, 1000)

        } catch (error) {
            logError(error, {
                context: 'VideoRecorder.initializeRecording',
                interviewId,
                questionId
            })
            setStatus('error')
            toast.error('Failed to start recording. Please check your camera permissions.')
        }
    }, [currentRecordingId, interviewId, questionId, logError, maxResponseTime])

    // Function to stop recording
    const handleStopRecording = useCallback(async () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current)

        if (currentRecordingId) {
            try {
                await stopRecording(currentRecordingId)
                setStatus('reviewing')
            } catch (error) {
                logError(error, {
                    context: 'VideoRecorder.handleStopRecording',
                    interviewId,
                    questionId
                })
                setStatus('error')
                toast.error('Failed to stop recording')
            }
        } else {
            setStatus('reviewing')
        }
    }, [currentRecordingId, stopRecording, logError, interviewId, questionId])

    // Function to retry recording
    const retryRecording = useCallback(async () => {
        const MAX_REDOS = 3

        if (redoAttempts >= MAX_REDOS) {
            toast.error(`Maximum number of retries (${MAX_REDOS}) reached. Please submit your current response.`)
            return
        }

        setRedoAttempts(prev => prev + 1)

        try {
            // Cancel current recording if exists
            if (currentRecordingId) {
                await cancelRecording(currentRecordingId)
            }

            // Clear any existing timers
            [prepTimerRef, recordTimerRef, countdownTimerRef].forEach(ref => {
                if (ref.current) {
                    clearInterval(ref.current)
                    ref.current = null
                }
            })

            // Create new recording session
            const selectedCamera = getSelectedCamera()
            const selectedMicrophone = getSelectedMicrophone()

            const recording = await createRecording(selectedCamera || undefined, selectedMicrophone || undefined)
            if (recording) {
                setCurrentRecordingId(recording.id)
                await openCamera(recording.id)

                // Start countdown after a brief delay
                setTimeout(() => {
                    startCountdown()
                }, 500)
            }
        } catch (error) {
            logError(error, {
                context: 'VideoRecorder.retryRecording',
                interviewId,
                questionId
            })
            setStatus('error')
            toast.error('Error restarting recording. Please refresh the page and try again.')
        }
    }, [redoAttempts, currentRecordingId, cancelRecording, createRecording, openCamera, startCountdown, logError, interviewId, questionId])

    // Function to submit the recording
    const submitRecording = useCallback(async () => {
        if (!currentRecordingId) {
            toast.error('No recording available to submit')
            return
        }

        setStatus('submitting')

        try {
            // Ensure we're using the correct interview ID for submission
            if (!interviewId) {
                throw new Error('Missing interview ID for submission')
            }

            // Get the recorded blob from react-record-webcam
            const recording = findRecordingById(currentRecordingId)
            if (!recording || !recording.blob) {
                throw new Error('Recording data not available')
            }

            const formData = new FormData()
            formData.append('videoResponse', recording.blob, 'answer.webm')
            const recordedDuration = Math.min(maxResponseTime, maxResponseTime - recordTimeRemaining)
            formData.append('responseTimeMs', (recordedDuration * 1000).toString())
            formData.append('redoAttemptNumber', redoAttempts.toString())

            const response = await fetch(
                `/api/interviews/${interviewId}/questions/${questionId}/response`,
                {
                    method: 'POST',
                    body: formData
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(`Server responded with status: ${response.status}. ${errorData?.error?.message || ''}`)
            }

            toast.success('Response submitted successfully!')
            router.push(`/interviews/job/${interviewId}`)
        } catch (error) {
            logError(error, {
                context: 'VideoRecorder.submitRecording',
                interviewId,
                questionId
            })
            setStatus('reviewing')
            toast.error('Failed to submit your response. Please try again.')
        }
    }, [currentRecordingId, interviewId, questionId, findRecordingById, maxResponseTime, recordTimeRemaining, redoAttempts, router, logError])

    // Format time as MM:SS
    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            [prepTimerRef, recordTimerRef, countdownTimerRef].forEach(ref => {
                if (ref.current) clearInterval(ref.current)
            })

            // Cancel recording if still active
            if (currentRecordingId) {
                cancelRecording(currentRecordingId).catch(console.error)
            }
        }
    }, [currentRecordingId, cancelRecording])

    // Render timer and progress bar
    const renderTimerAndProgress = () => {
        let displayTime = ''
        let progressValue = 0
        let timerLabel = 'Ready to Begin'

        if (status === 'preparing') {
            timerLabel = 'Preparation Time'
            displayTime = formatTime(prepTimeRemaining)
            progressValue = prepProgress
        } else if (status === 'countdown') {
            timerLabel = 'Get Ready'
            displayTime = `${countdown}`
            progressValue = 0
        } else if (status === 'recording') {
            timerLabel = 'Recording Time'
            displayTime = formatTime(recordTimeRemaining)
            progressValue = recordProgress
        } else if (status === 'reviewing' || status === 'submitting') {
            timerLabel = 'Recording Complete'
        } else if (status === 'error') {
            timerLabel = 'Error Occurred'
        }

        return (
            <div className="mb-6" data-testid="timer-progress-container">
                <div className="flex justify-between items-center mb-2">
                    <div
                        className="text-sm font-medium"
                        data-testid="timer-label"
                        aria-label={`Timer status: ${timerLabel}`}
                    >
                        {timerLabel}
                    </div>
                    <div
                        className="text-sm font-bold"
                        data-testid="time-display"
                        aria-label={`Time remaining: ${displayTime}`}
                    >
                        {displayTime}
                    </div>
                </div>
                {(status === 'preparing' || status === 'recording') && (
                    <Progress
                        value={progressValue}
                        className="h-2"
                        aria-label={`Time progress: ${Math.round(progressValue)}% complete`}
                        data-testid="progress-bar"
                    />
                )}
            </div>
        )
    }

    // Render the video display area
    const renderVideoArea = () => {
        // ✅ Use safe recording finder with activeRecordings
        const recording = findRecordingById(currentRecordingId)

        // Show recorded video in review mode
        if ((status === 'reviewing' || status === 'submitting') && recording?.previewRef?.current) {
            return (
                <video
                    ref={recording.previewRef}
                    controls
                    className="w-full h-full object-contain bg-black"
                    data-testid="review-video"
                    aria-label="Recorded video for review"
                />
            )
        }

        // Show error state
        if (status === 'error' || errorMessage) {
            return (
                <div
                    className="flex flex-col items-center justify-center h-full text-center p-4"
                    data-testid="error-display"
                    role="alert"
                    aria-label="Recording error occurred"
                >
                    <VideoOff className="h-16 w-16 text-destructive mb-4" aria-hidden="true" />
                    <p className="font-semibold text-destructive">Recording Error</p>
                    <p className="text-sm text-muted-foreground">
                        {errorMessage || 'An error occurred with the camera or microphone. Please check your permissions and try again.'}
                    </p>
                    <Button
                        variant="outline"
                        onClick={retryRecording}
                        className="mt-4"
                        data-testid="error-retry-button"
                        aria-label="Try recording again"
                    >
                        Try Again
                    </Button>
                </div>
            )
        }

        // Show webcam preview
        const isWebcamReady = recording?.webcamRef?.current

        return (
            <>
                <div className="relative w-full h-full bg-black" data-testid="video-container">
                    {recording?.webcamRef && (
                        <video
                            ref={recording.webcamRef}
                            autoPlay
                            muted
                            playsInline
                            className={showFace ? "w-full h-full object-cover" : "w-full h-full object-cover opacity-0 absolute"}
                            data-testid="webcam-video"
                            aria-label={showFace ? "Live camera preview" : "Camera active but hidden"}
                        />
                    )}

                    {/* Show loading state when webcam is not ready */}
                    {!isWebcamReady && (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            data-testid="loading-display"
                        >
                            <div className="text-center p-4 bg-background/80 rounded-lg">
                                <Loader2 className="h-16 w-16 mx-auto text-muted-foreground animate-spin" aria-hidden="true" />
                                <p className="mt-2 text-muted-foreground">
                                    {hasValidDeviceSettings()
                                        ? 'Connecting to your selected camera...'
                                        : 'Connecting to camera...'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Show placeholder overlay when camera preview is hidden */}
                    {!showFace && isWebcamReady && (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            data-testid="camera-hidden-overlay"
                        >
                            <div className="text-center p-4 bg-background/80 rounded-lg">
                                <Camera className="h-16 w-16 mx-auto text-muted-foreground" aria-hidden="true" />
                                <p className="mt-2 text-muted-foreground">
                                    Camera is active but preview is hidden
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Countdown overlay */}
                    {status === 'countdown' && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/50"
                            data-testid="countdown-overlay"
                            aria-label={`Recording starts in ${countdown} seconds`}
                        >
                            <div className="text-9xl font-bold text-white animate-pulse">
                                {countdown}
                            </div>
                        </div>
                    )}
                </div>

                {status === 'recording' && (
                    <div
                        className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 px-3 py-1 rounded-full"
                        data-testid="recording-indicator"
                        aria-label="Currently recording"
                    >
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" aria-hidden="true"></div>
                        <span className="text-sm font-medium">Recording</span>
                    </div>
                )}
            </>
        )
    }

    // Render control buttons
    const renderControls = () => {
        switch (status) {
            case 'preparing':
                return (
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (prepTimerRef.current) clearInterval(prepTimerRef.current)
                            startCountdown()
                        }}
                        data-testid="skip-prep-button"
                        aria-label={`Skip preparation time, ${prepTimeRemaining} seconds remaining`}
                    >
                        Skip Preparation ({prepTimeRemaining}s)
                    </Button>
                )
            case 'countdown':
                return (
                    <div
                        className="flex items-center justify-center"
                        data-testid="countdown-display-container"
                    >
                        <div
                            className="text-5xl font-bold text-primary animate-pulse"
                            data-testid="countdown-display"
                            aria-label={`Recording starts in ${countdown} seconds`}
                        >
                            {countdown}
                        </div>
                    </div>
                )
            case 'recording':
                return (
                    <Button
                        onClick={handleStopRecording}
                        variant="destructive"
                        data-testid="stop-recording-button"
                        aria-label="Stop current recording"
                    >
                        Stop Recording
                    </Button>
                )
            case 'reviewing':
                const MAX_REDOS = 3
                const remainingRedos = MAX_REDOS - redoAttempts
                const canRetry = redoAttempts < MAX_REDOS

                return (
                    <>
                        <Button
                            variant="outline"
                            onClick={retryRecording}
                            disabled={!canRetry}
                            data-testid="retry-button"
                            aria-label={canRetry ? `Record again, ${remainingRedos} attempts remaining` : 'Maximum retries reached'}
                        >
                            {canRetry ? `Record Again (${remainingRedos} left)` : 'Max retries reached'}
                        </Button>
                        <Button
                            onClick={submitRecording}
                            data-testid="submit-button"
                            aria-label="Submit your recorded response"
                        >
                            Submit Response
                        </Button>
                    </>
                )
            case 'submitting':
                return (
                    <Button
                        size="lg"
                        disabled
                        data-testid="submitting-button"
                        aria-label="Submitting your response"
                    >
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Submitting...
                    </Button>
                )
            default:
                return null
        }
    }

    // Log information about the current props for debugging
    useEffect(() => {
        console.log('VideoRecorder props:', { interviewId, questionId, showFace, prepTime, maxResponseTime });
        console.log('Active recordings:', activeRecordings);
    }, [interviewId, questionId, showFace, prepTime, maxResponseTime, activeRecordings]);

    return (
        <div
            className="flex flex-col h-full p-6"
            data-testid="video-recorder"
            role="main"
            aria-label="Video recording interface for interview response"
        >
            {renderTimerAndProgress()}

            <div className="flex-1 flex flex-col items-center justify-center bg-muted rounded-lg overflow-hidden relative mb-4">
                {renderVideoArea()}
            </div>

            <div className="mt-6 flex gap-4 justify-center" data-testid="controls-container">
                {renderControls()}
            </div>
        </div>
    )
}