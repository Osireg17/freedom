'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { toast } from 'sonner'
import { Mic, Camera, Loader2, VideoOff } from 'lucide-react'

interface VideoRecorderProps {
    interviewId: string
    questionId: string
    showFace: boolean
    prepTime: number
    maxResponseTime: number
}

// Combine hook status with custom states
type RecorderStatus =
    | 'idle'
    | 'preparing'
    | 'acquiring_media'
    | 'recording'
    | 'stopping'
    | 'stopped' // Hook status, implies reviewing is possible
    | 'reviewing' // Custom state after stopped and blob is ready
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
    const [audioLevel, setAudioLevel] = useState(0)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const prepTimerRef = useRef<NodeJS.Timeout | null>(null)
    const recordTimerRef = useRef<NodeJS.Timeout | null>(null)
    const audioAnalyserRef = useRef<AnalyserNode | null>(null)
    const audioDataRef = useRef<Uint8Array | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null) // Ref for AudioContext
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null) // Ref for source node
    const animationFrameRef = useRef<number | null>(null); // Ref for animation frame


    // --- react-media-recorder Hook ---
    const {
        status: hookStatus,
        startRecording: hookStartRecording,
        stopRecording: hookStopRecording,
        mediaBlobUrl,
        previewStream,
        clearBlobUrl: hookClearBlobUrl,
        error: hookError, // e.g., "permission_denied"
    } = useReactMediaRecorder({
        video: true,
        audio: true,
        onStop: (_blobUrl, blob) => {
            setRecordedBlob(blob)
            setStatus('reviewing') // Move to review state once stopped and blob is available
        },
        askPermissionOnMount: false, // Ask permission when user clicks start
    })
    // --- End Hook ---

    // Effect to map hook status and error to our component's status
    useEffect(() => {
        if (hookError) {
            logError(new Error(`react-media-recorder error: ${hookError}`), {
                context: 'VideoRecorder.hookError',
                hookError,
            })
            setStatus('error')
            switch (hookError) {
                case 'permission_denied':
                    toast.error(
                        'Camera/Microphone permission denied. Please grant access in browser settings.'
                    )
                    break
                case 'no_specified_media_found':
                    toast.error('No camera/microphone found.')
                    break
                default:
                    toast.error(
                        `Recording error: ${hookError}. Please try again.`
                    )
            }
            // Reset relevant states if needed
            setRecordedBlob(null)
            if (prepTimerRef.current) clearInterval(prepTimerRef.current)
            if (recordTimerRef.current) clearInterval(recordTimerRef.current)
        } else {
            // Map hook status, but don't overwrite custom states like 'preparing', 'reviewing', 'submitting'
            if (
                hookStatus !== 'idle' &&
                hookStatus !== 'stopped' &&
                status !== 'preparing' &&
                status !== 'reviewing' &&
                status !== 'submitting'
            ) {
                setStatus(hookStatus as RecorderStatus) // Map directly for 'acquiring_media', 'recording', 'stopping'
            } else if (hookStatus === 'idle' && status !== 'idle' && status !== 'submitting' && status !== 'preparing') {
                // If hook goes idle unexpectedly (e.g., after clearBlobUrl) and we weren't preparing/submitting, reset to idle
                // Avoid resetting if we are intentionally in 'preparing' or 'submitting'
                setStatus('idle');
            }
        }
    }, [hookStatus, hookError, logError, status])


    // Function to monitor audio levels using the previewStream
    const monitorAudioLevels = useCallback(() => {
        if (!previewStream || !audioContextRef.current || status !== 'recording') return;

        // Disconnect previous source if exists
        if (audioSourceRef.current) {
            audioSourceRef.current.disconnect();
        }
        // Stop previous animation frame if exists
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        try {
            // Ensure AudioContext is running
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const audioSource = audioContextRef.current.createMediaStreamSource(previewStream);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            audioSource.connect(analyser);

            audioAnalyserRef.current = analyser;
            audioSourceRef.current = audioSource; // Store the source node
            audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);

            const updateAudioLevel = () => {
                if (!audioAnalyserRef.current || !audioDataRef.current || status !== 'recording') {
                    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                    return;
                }

                audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current);
                let sum = 0;
                for (let i = 0; i < audioDataRef.current.length; i++) {
                    sum += audioDataRef.current[i];
                }
                const average = sum / audioDataRef.current.length;
                const normalizedLevel = Math.min(100, Math.max(0, average * 2));
                setAudioLevel(normalizedLevel);

                animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };
            updateAudioLevel();
        } catch (err) {
            logError(err, { context: 'VideoRecorder.monitorAudioLevels.setup' });
            console.error("Error setting up audio analyser:", err);
            // Attempt to clean up
            if (audioSourceRef.current) audioSourceRef.current.disconnect();
            audioAnalyserRef.current = null;
            audioSourceRef.current = null;
        }
    }, [previewStream, status, logError]);


    // Effect to setup and tear down audio monitoring based on stream and status
    useEffect(() => {
        if (status === 'recording' && previewStream && !audioContextRef.current) {
            // Create AudioContext only once
            audioContextRef.current = new AudioContext();
        }

        if (status === 'recording' && previewStream && audioContextRef.current) {
            monitorAudioLevels();
        }

        // Cleanup function
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (audioSourceRef.current) {
                audioSourceRef.current.disconnect();
                audioSourceRef.current = null;
            }
            // Don't close the AudioContext here, let it persist
            audioAnalyserRef.current = null;
        };
    }, [status, previewStream, monitorAudioLevels]);


    // Effect for video preview using the hook's previewStream
    useEffect(() => {
        if (videoRef.current && previewStream) {
            videoRef.current.srcObject = previewStream
        }
        // Clean up srcObject when previewStream changes or component unmounts
        // to prevent memory leaks
        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [previewStream])

    // Function to start preparation timer
    const startPrepTimer = () => {
        setStatus('preparing')
        setPrepTimeRemaining(prepTime)
        setPrepProgress(0)
        if (prepTimerRef.current) clearInterval(prepTimerRef.current) // Clear existing timer

        prepTimerRef.current = setInterval(() => {
            setPrepTimeRemaining(prev => {
                const newTime = prev - 1
                setPrepProgress(((prepTime - newTime) / prepTime) * 100)

                if (newTime <= 0) {
                    if (prepTimerRef.current) clearInterval(prepTimerRef.current)
                    initiateRecording() // Start recording via hook
                    return 0
                }
                return newTime
            })
        }, 1000)
    }

    // Function to initiate recording via the hook and start recording timer
    const initiateRecording = () => {
        if (status === 'recording' || status === 'acquiring_media') return // Already recording or trying
        hookStartRecording() // Request permission and start recording
        // Status will change to 'acquiring_media' then 'recording' via useEffect mapping hookStatus
        setRecordTimeRemaining(maxResponseTime)
        setRecordProgress(0)
        if (recordTimerRef.current) clearInterval(recordTimerRef.current) // Clear existing timer

        recordTimerRef.current = setInterval(() => {
            setRecordTimeRemaining(prev => {
                const newTime = prev - 1
                setRecordProgress(((maxResponseTime - newTime) / maxResponseTime) * 100)

                if (newTime <= 0) {
                    finishRecording() // Stop recording via hook
                    return 0
                }
                return newTime
            })
        }, 1000)
    }

    // Function to stop recording via the hook
    const finishRecording = () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current)
        // Check hook status to prevent stopping if already stopped/idle
        if (hookStatus === 'recording' || hookStatus === 'paused') {
            hookStopRecording()
            // Status will change to 'stopping' then 'stopped' via useEffect
            // onStop callback will set status to 'reviewing'
        }
        // Clean up audio monitoring immediately on stop request
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioSourceRef.current) audioSourceRef.current.disconnect();
        audioAnalyserRef.current = null;
        audioSourceRef.current = null;
        setAudioLevel(0); // Reset audio level display
    }

    // Function to handle starting the process
    const handleStart = () => {
        // Reset state before starting
        setRecordedBlob(null)
        hookClearBlobUrl() // Ensure any previous blob URL is cleared

        if (prepTime > 0) {
            startPrepTimer()
        } else {
            initiateRecording()
        }
    }

    // Function to handle skipping preparation
    const handleSkipPrep = () => {
        if (prepTimerRef.current) clearInterval(prepTimerRef.current)
        initiateRecording()
    }


    // Function to submit recording
    const submitRecording = async () => {
        if (!recordedBlob) {
            toast.error('No recording available to submit.')
            logError(new Error('Submit attempted without recordedBlob'), {
                context: 'VideoRecorder.submitRecording',
            })
            setStatus('reviewing') // Go back to review state
            return
        }

        setStatus('submitting')

        try {
            const formData = new FormData()
            formData.append('videoResponse', recordedBlob, 'answer.webm')
            // Calculate actual recorded time, cap at maxResponseTime
            const recordedDuration = Math.min(maxResponseTime, maxResponseTime - recordTimeRemaining);
            formData.append('responseTimeMs', (recordedDuration * 1000).toString())
            formData.append('redoAttemptNumber', '0') // TODO: Implement retry count logic if needed

            const response = await fetch(
                `/api/interviews/${interviewId}/questions/${questionId}/response`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) // Try to get error details
                throw new Error(`Server responded with status: ${response.status}. ${errorData?.error?.message || ''}`)
            }

            toast.success('Response submitted successfully!')
            router.push(`/interviews/job/${interviewId}`) // Navigate after success
            // No need to reset status here as we are navigating away
        } catch (error) {
            logError(error, {
                context: 'VideoRecorder.submitRecording',
                interviewId,
                questionId,
            })
            setStatus('reviewing') // Revert to reviewing state on error
            toast.error('Failed to submit your response. Please try again.')
        }
    }

    // Function to retry recording
    const retryRecording = () => {
        hookClearBlobUrl() // Clears blob URL and resets hook status to idle
        setRecordedBlob(null)
        setStatus('idle') // Reset component state fully to idle
        // Timers are already cleared by finishRecording or will be cleared by useEffect cleanup
        if (prepTimerRef.current) clearInterval(prepTimerRef.current)
        if (recordTimerRef.current) clearInterval(recordTimerRef.current)
        // Also clean up audio monitoring refs
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioSourceRef.current) audioSourceRef.current.disconnect();
        audioAnalyserRef.current = null;
        audioSourceRef.current = null;
        setAudioLevel(0);
    }

    // Clean up timers and audio context on unmount
    useEffect(() => {
        return () => {
            if (prepTimerRef.current) clearInterval(prepTimerRef.current)
            if (recordTimerRef.current) clearInterval(recordTimerRef.current)
            // Clean up audio monitoring resources
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioSourceRef.current) {
                audioSourceRef.current.disconnect();
                audioSourceRef.current = null; // Clear ref
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
                audioContextRef.current = null; // Clear ref
            }
            // No need to call hookStopRecording here as the hook might manage its own cleanup
            // Revoke blob URL if component unmounts during review
            if (mediaBlobUrl) {
                URL.revokeObjectURL(mediaBlobUrl);
            }
        }
    }, [mediaBlobUrl]) // Add mediaBlobUrl dependency for revoke


    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // --- Render Logic ---
    const renderTimerAndProgress = () => {
        let displayTime = ''
        let progressValue = 0
        let timerLabel = 'Ready to Begin'

        if (status === 'preparing') {
            timerLabel = 'Preparation Time'
            displayTime = formatTime(prepTimeRemaining)
            progressValue = prepProgress
        } else if (status === 'recording') {
            timerLabel = 'Recording Time'
            displayTime = formatTime(recordTimeRemaining)
            progressValue = recordProgress
        } else if (status === 'reviewing' || status === 'stopped' || status === 'submitting') {
            timerLabel = 'Recording Complete'
        } else if (status === 'acquiring_media') {
            timerLabel = 'Getting ready...'
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

    const renderVideoArea = () => {
        // Show review video if available
        if ((status === 'reviewing' || status === 'submitting') && mediaBlobUrl) {
            return (
                <video
                    src={mediaBlobUrl}
                    controls
                    className="w-full h-full object-contain"
                    data-testid="review-video"
                />
            )
        }

        // Show permission denied message
        if (status === 'error' && hookError === 'permission_denied') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <VideoOff className="h-16 w-16 text-destructive mb-4" />
                    <p className="font-semibold text-destructive">Permission Denied</p>
                    <p className="text-sm text-muted-foreground">
                        Access to camera and microphone was denied. Please grant permission in your browser settings and refresh the page or click &quot;Record Again&quot;.
                    </p>
                </div>
            );
        }
        // Show error message for other errors
        if (status === 'error') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <VideoOff className="h-16 w-16 text-destructive mb-4" />
                    <p className="font-semibold text-destructive">Recording Error</p>
                    <p className="text-sm text-muted-foreground">
                        An error occurred: {hookError}. Please try again.
                    </p>
                    <Button variant="outline" onClick={retryRecording} className="mt-4">Try Again</Button>
                </div>
            )
        }

        // Show live preview or placeholder
        return (
            <>
                {showFace && previewStream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted // Preview should be muted
                        playsInline
                        className="w-full h-full object-cover"
                        data-testid="preview-video"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4 bg-background/80 rounded-lg">
                            <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">
                                {previewStream && !showFace ? "Camera is active but preview is hidden" :
                                    status === 'idle' ? "Click Start Answering" :
                                        status === 'acquiring_media' ? "Requesting permissions..." :
                                            "Camera Preview"}
                            </p>
                        </div>
                    </div>
                )}
                {status === 'recording' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 px-3 py-1 rounded-full">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-medium">Recording</span>
                    </div>
                )}
            </>
        )
    }

    const renderAudioIndicator = () => {
        if (status !== 'recording' && status !== 'preparing') return null; // Show during prep too? Maybe just recording.

        return (
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Microphone Level</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden" data-testid="audio-level-indicator">
                    <div
                        className="h-full bg-green-500 transition-all duration-100"
                        style={{ width: `${audioLevel}%` }}
                    ></div>
                </div>
            </div>
        )
    }


    const renderControls = () => {
        switch (status) {
            case 'idle':
                return (
                    <Button size="lg" onClick={handleStart} data-testid="start-button">
                        Start Answering
                    </Button>
                )
            case 'preparing':
                return (
                    <Button variant="outline" onClick={handleSkipPrep} data-testid="skip-prep-button">
                        Skip Preparation ({prepTimeRemaining}s)
                    </Button>
                )
            case 'acquiring_media':
                return (
                    <Button size="lg" disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Camera...
                    </Button>
                )
            case 'recording':
                return (
                    <Button onClick={finishRecording} variant="destructive" data-testid="stop-recording-button">
                        Stop Recording
                    </Button>
                )
            case 'stopping':
                return (
                    <Button size="lg" disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Stopping...
                    </Button>
                )
            case 'reviewing': // Custom state after stopped
            case 'stopped': // Hook state, show review controls if blob url exists
                if (!mediaBlobUrl) return null; // Should not happen if in reviewing state, but safeguard
                return (
                    <>
                        <Button variant="outline" onClick={retryRecording} data-testid="retry-button">
                            Record Again
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
            case 'error':
                // Show retry button for permission errors specifically handled in video area
                if (hookError !== 'permission_denied') {
                    return (
                        <Button variant="outline" onClick={retryRecording} data-testid="retry-button">
                            Try Again
                        </Button>
                    )
                }
                return null; // Buttons are handled inside renderVideoArea for permission error
            default:
                return null
        }
    }

    return (
        <div className="flex flex-col h-full p-6" data-testid="video-recorder">
            {renderTimerAndProgress()}

            <div className="flex-1 flex flex-col items-center justify-center bg-muted rounded-lg overflow-hidden relative mb-4">
                {renderVideoArea()}
            </div>

            {renderAudioIndicator()}

            <div className="mt-6 flex gap-4 justify-center">
                {renderControls()}
            </div>
        </div>
    )
}