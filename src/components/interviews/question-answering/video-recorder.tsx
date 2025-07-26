'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { toast } from 'sonner'
import { Camera, Loader2, VideoOff } from 'lucide-react'
import { getSelectedCamera, getSelectedMicrophone, hasValidDeviceSettings, getActiveMediaStream } from '@/lib/device-session'

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
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(3)
    const [redoAttempts, setRedoAttempts] = useState(0)
    const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints | null>(null)
    const [webcamKey, setWebcamKey] = useState(0)
    const [webcamReady, setWebcamReady] = useState(false)

    const webcamRef = useRef<Webcam>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<BlobPart[]>([])
    const prepTimerRef = useRef<NodeJS.Timeout | null>(null)
    const recordTimerRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
    const audioAnalyserRef = useRef<AnalyserNode | null>(null)
    const audioDataRef = useRef<Uint8Array | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const audioStreamRef = useRef<MediaStream | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    useEffect(() => {
        // Check if we have a persisted stream from device setup
        const existingStream = getActiveMediaStream()

        if (existingStream && hasValidDeviceSettings()) {
            console.log('Using persisted media stream from device setup')
            // Use the existing stream directly
            setWebcamReady(true)
            return
        }

        // Use session-based device settings for new stream
        const selectedCamera = getSelectedCamera()
        const selectedMicrophone = getSelectedMicrophone()

        const constraints: MediaTrackConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user'
        }

        if (selectedCamera) {
            constraints.deviceId = { exact: selectedCamera }
        }

        setVideoConstraints(constraints)
        setWebcamKey(prev => prev + 1)
        setWebcamReady(false)

        if (selectedMicrophone) {
            console.log('Selected microphone ID:', selectedMicrophone)
        }
    }, [])

    // Set up webcam constraints
    const audioConstraints = {
        deviceId: getSelectedMicrophone() ? { exact: getSelectedMicrophone()! } : undefined
    }

    // Automatically start the preparation timer after component mounts and webcam is ready
    useEffect(() => {
        if (status === 'idle' && videoConstraints && webcamReady) {
            // Use session-based device settings to determine delay
            const hasDeviceSettings = getSelectedCamera() && getSelectedMicrophone()
            // Shorter delay if device settings already exist (faster transition from device setup)
            const delay = hasDeviceSettings ? 200 : 1000

            const timer = setTimeout(() => {
                startPrepTimer()
            }, delay)
            return () => clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoConstraints, status, webcamReady])

    // Start preparation timer
    const startPrepTimer = () => {
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
    }

    // Start the 3-2-1 countdown before recording
    const startCountdown = () => {
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
    }

    // Initialize recording after countdown
    const initializeRecording = useCallback(() => {
        if (audioStreamRef.current) {
            audioStreamRef.current = null
        }
        setStatus('recording')
        setRecordTimeRemaining(maxResponseTime)
        setRecordProgress(0)
        chunksRef.current = []

        if (!webcamRef.current?.stream) {
            toast.error('Microphone access is required to record')
            setStatus('error')
            return
        }

        try {
            // Get the stream from webcam
            const stream = webcamRef.current.stream
            audioStreamRef.current = stream

            // Create and configure the MediaRecorder
            const options = { mimeType: 'video/webm;codecs=vp9,opus' }
            const recorder = new MediaRecorder(stream, options)

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' })
                setRecordedBlob(blob)
                const videoURL = URL.createObjectURL(blob)
                setRecordedVideoURL(videoURL)
                setStatus('reviewing')
            }

            // Start recording
            mediaRecorderRef.current = recorder
            recorder.start()

            // Set up the recording timer
            if (recordTimerRef.current) clearInterval(recordTimerRef.current)

            recordTimerRef.current = setInterval(() => {
                setRecordTimeRemaining(prev => {
                    const newTime = prev - 1
                    setRecordProgress(((maxResponseTime - newTime) / maxResponseTime) * 100)

                    if (newTime <= 0) {
                        stopRecording()
                        return 0
                    }
                    return newTime
                })
            }, 1000)

            // Begin monitoring audio levels
            setupAudioAnalysis(stream)

        } catch (error) {
            logError(error, {
                context: 'VideoRecorder.initializeRecording',
                interviewId,
                questionId
            })
            setStatus('error')
            toast.error('Failed to start recording. Please check your camera permissions.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId, questionId, logError, maxResponseTime])

    // Function to set up audio analysis for visualizing audio levels
    const setupAudioAnalysis = (stream: MediaStream) => {
        try {
            // Create audio context if it doesn't exist
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext()
            }

            const audioContext = audioContextRef.current

            // Create a media stream source
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)

            audioAnalyserRef.current = analyser
            audioDataRef.current = new Uint8Array(analyser.frequencyBinCount)

            const updateAudioLevel = () => {
                if (!audioAnalyserRef.current || !audioDataRef.current) return

                audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current)
                let sum = 0
                for (let i = 0; i < audioDataRef.current.length; i++) {
                    sum += audioDataRef.current[i]
                }
                const average = sum / audioDataRef.current.length
                const normalizedLevel = Math.min(100, Math.max(0, average * 2))
                // setAudioLevel(normalizedLevel) // Removed for now as audio level indicator is disabled

                animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
            }

            updateAudioLevel()
        } catch (error) {
            logError(error, {
                context: 'VideoRecorder.setupAudioAnalysis',
                interviewId
            })
            console.error('Error setting up audio analysis:', error)
        }
    }

    // Function to stop recording
    const stopRecording = () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current)

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            // Note: 'onstop' handler will set the status to 'reviewing'
        } else {
            setStatus('reviewing')
        }

        // Clean up audio monitoring
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }

    // Function to retry recording
    const retryRecording = () => {
        const MAX_REDOS = 3

        if (redoAttempts >= MAX_REDOS) {
            toast.error(`Maximum number of retries (${MAX_REDOS}) reached. Please submit your current response.`)
            return
        }

        setRedoAttempts(prev => prev + 1)

        try {
            // Release old recording URL
            if (recordedVideoURL) {
                URL.revokeObjectURL(recordedVideoURL)
                setRecordedVideoURL(null)
            }

            // Clear recording data
            setRecordedBlob(null)
            chunksRef.current = []

            // Stop any existing recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop()
            }
            mediaRecorderRef.current = null

            if (webcamRef.current?.stream) {
                const stream = webcamRef.current.stream;
                if (stream instanceof MediaStream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }

            // Clear any existing timers
            if (prepTimerRef.current) {
                clearInterval(prepTimerRef.current)
                prepTimerRef.current = null
            }
            if (recordTimerRef.current) {
                clearInterval(recordTimerRef.current)
                recordTimerRef.current = null
            }
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current)
                countdownTimerRef.current = null
            }

            // Clean up audio monitoring
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }

            // Reset audio context if needed
            if (audioAnalyserRef.current) {
                audioAnalyserRef.current = null
            }

            // Force webcam to reinitialize by updating the key
            setWebcamKey(prev => prev + 1)
            setWebcamReady(false)

            // Force a small delay before starting countdown
            // This helps ensure the webcam and audio contexts have time to reset
            setTimeout(() => {
                startCountdown()
            }, 500)
        } catch (error) {
            console.error('Error in retry recording:', error)
            setStatus('error')
            toast.error('Error restarting recording. Please refresh the page and try again.')
        }
    }

    // Function to submit the recording
    const submitRecording = async () => {
        if (!recordedBlob) {
            toast.error('No recording available to submit')
            return
        }

        setStatus('submitting')

        try {
            // Ensure we're using the correct interview ID for submission
            if (!interviewId) {
                throw new Error('Missing interview ID for submission')
            }

            const formData = new FormData()
            formData.append('videoResponse', recordedBlob, 'answer.webm')
            const recordedDuration = Math.min(maxResponseTime, maxResponseTime - recordTimeRemaining)
            formData.append('responseTimeMs', (recordedDuration * 1000).toString())
            formData.append('redoAttemptNumber', redoAttempts.toString())

            // Use the interviewId from props
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
    }

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (prepTimerRef.current) clearInterval(prepTimerRef.current)
            if (recordTimerRef.current) clearInterval(recordTimerRef.current)
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

            if (audioContextRef.current) {
                audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e))
                audioContextRef.current = null
            }

            if (recordedVideoURL) {
                URL.revokeObjectURL(recordedVideoURL)
            }
        }
    }, [recordedVideoURL])

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
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">{timerLabel}</div>
                    <div className="text-sm font-bold" data-testid="time-display">
                        {displayTime}
                    </div>
                </div>
                {(status === 'preparing' || status === 'recording') && (
                    <Progress value={progressValue} className="h-2" aria-label="Time progress" />
                )}
            </div>
        )
    }

    // Render the video display area
    const renderVideoArea = () => {
        // Show recorded video in review mode
        if ((status === 'reviewing' || status === 'submitting') && recordedVideoURL) {
            return (
                <video
                    src={recordedVideoURL}
                    controls
                    className="w-full h-full object-contain bg-black"
                    data-testid="review-video"
                />
            )
        }

        // Show error state
        if (status === 'error') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <VideoOff className="h-16 w-16 text-destructive mb-4" />
                    <p className="font-semibold text-destructive">Recording Error</p>
                    <p className="text-sm text-muted-foreground">
                        An error occurred with the camera or microphone. Please check your permissions and try again.
                    </p>
                    <Button variant="outline" onClick={retryRecording} className="mt-4">Try Again</Button>
                </div>
            )
        }

        // Show webcam or placeholder based on showFace
        return (
            <>
                <div className="relative w-full h-full bg-black">
                    {/* Check for existing stream first, then render Webcam component */}
                    {(() => {
                        const existingStream = getActiveMediaStream()

                        if (existingStream && hasValidDeviceSettings()) {
                            // Use existing stream with a video element
                            return (
                                <video
                                    ref={(video) => {
                                        if (video && existingStream) {
                                            video.srcObject = existingStream
                                            video.play().catch(console.error)
                                            // Set webcamRef.current.stream for compatibility
                                            if (webcamRef.current) {
                                                (webcamRef.current as WebcamRef).stream = existingStream
                                            }
                                        }
                                    }}
                                    muted={true}
                                    autoPlay
                                    playsInline
                                    className={showFace ? "w-full h-full object-cover" : "w-full h-full object-cover opacity-0 absolute"}
                                    data-testid="webcam-video"
                                />
                            )
                        }

                        // Fallback to Webcam component for new streams
                        return videoConstraints && (
                            <Webcam
                                key={webcamKey}
                                audio={true}
                                audioConstraints={audioConstraints}
                                ref={webcamRef}
                                videoConstraints={videoConstraints}
                                muted={true}
                                className={showFace ? "w-full h-full object-cover" : "w-full h-full object-cover opacity-0 absolute"}
                                data-testid="webcam-video"
                                onUserMedia={() => {
                                    console.log('Webcam ready - user media obtained')
                                    setWebcamReady(true)
                                }}
                                onUserMediaError={(error) => {
                                    logError(error, {
                                        context: 'VideoRecorder.webcam',
                                        interviewId
                                    })
                                    setStatus('error')
                                    setWebcamReady(false)
                                    toast.error('Failed to access camera or microphone')
                                }}
                            />
                        )
                    })()}

                    {/* Show loading state when videoConstraints is not yet set or webcam not ready */}
                    {(() => {
                        const existingStream = getActiveMediaStream()
                        const hasExistingStream = existingStream && hasValidDeviceSettings()

                        // Don't show loading if we have an existing stream
                        if (hasExistingStream) return null

                        // Show loading if no video constraints or webcam not ready
                        if (!videoConstraints || !webcamReady) {
                            return (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-4 bg-background/80 rounded-lg">
                                        <Loader2 className="h-16 w-16 mx-auto text-muted-foreground animate-spin" />
                                        <p className="mt-2 text-muted-foreground">
                                            {!videoConstraints
                                                ? 'Initializing camera...'
                                                : hasValidDeviceSettings()
                                                    ? 'Connecting to your selected camera...'
                                                    : 'Connecting to camera...'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )
                        }

                        return null
                    })()}

                    {/* Show placeholder overlay when camera preview is hidden */}
                    {!showFace && (videoConstraints || (getActiveMediaStream() && hasValidDeviceSettings())) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center p-4 bg-background/80 rounded-lg">
                                <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">
                                    Camera is active but preview is hidden
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Countdown overlay */}
                    {status === 'countdown' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-9xl font-bold text-white animate-pulse" data-testid="countdown-overlay">
                                {countdown}
                            </div>
                        </div>
                    )}
                </div>

                {status === 'recording' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 px-3 py-1 rounded-full">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-medium">Recording</span>
                    </div>
                )}
            </>
        )
    }

    // Render audio level indicator
    // const renderAudioIndicator = () => {
    //     if (status !== 'recording') return null

    //     return (
    //         <div className="mt-4">
    //             <div className="flex items-center gap-2 mb-1">
    //                 <Mic className="h-4 w-4 text-muted-foreground" />
    //                 <span className="text-sm text-muted-foreground">Microphone Level</span>
    //             </div>
    //             <div className="h-2 bg-muted rounded-full overflow-hidden">
    //                 <div
    //                     className="h-full bg-green-500 transition-all duration-100"
    //                     style={{ width: `${audioLevel}%` }}
    //                 ></div>
    //             </div>
    //         </div>
    //     )
    // }

    // Render control buttons
    const renderControls = () => {
        switch (status) {
            case 'preparing':
                return (
                    <Button variant="outline" onClick={() => {
                        if (prepTimerRef.current) clearInterval(prepTimerRef.current)
                        startCountdown()
                    }} data-testid="skip-prep-button">
                        Skip Preparation ({prepTimeRemaining}s)
                    </Button>
                )
            case 'countdown':
                return (
                    <div className="flex items-center justify-center">
                        <div className="text-5xl font-bold text-primary animate-pulse" data-testid="countdown-display">
                            {countdown}
                        </div>
                    </div>
                )
            case 'recording':
                return (
                    <Button onClick={stopRecording} variant="destructive" data-testid="stop-recording-button">
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
                        >
                            {canRetry ? `Record Again (${remainingRedos} left)` : 'Max retries reached'}
                        </Button>
                        <Button onClick={submitRecording} data-testid="submit-button">
                            Submit Response
                        </Button>
                    </>
                )
            case 'submitting':
                return (
                    <Button size="lg" disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
    }, [interviewId, questionId, showFace, prepTime, maxResponseTime]);

    return (
        <div className="flex flex-col h-full p-6" data-testid="video-recorder">
            {renderTimerAndProgress()}

            <div className="flex-1 flex flex-col items-center justify-center bg-muted rounded-lg overflow-hidden relative mb-4">
                {renderVideoArea()}
            </div>

            <div className="mt-6 flex gap-4 justify-center">
                {renderControls()}
            </div>
        </div>
    )
}