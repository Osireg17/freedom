'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { toast } from 'sonner';
import { Camera, Loader2, VideoOff, Settings } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import Client, { Local } from '@/lib/client';
import {
    hasValidDeviceSettings,
    getActiveMediaStream,
    storeDeviceSettings,
    setActiveMediaStream,
    getSelectedCamera,
    getSelectedMicrophone,
    clearDeviceSettings,
    clearActiveMediaStream,
} from '@/lib/device-session';
import DeviceSetupModal from '@/components/interviews/device/device-setup-modal';
import InterviewIntroModal from '@/components/interviews/interview-intro-modal';

interface VideoRecorderProps {
    interviewId: string;
    questionId: string;
    questionNumber: number;
    totalQuestions: number;
    showFace: boolean;
    prepTime: number;
    maxResponseTime: number;
}

type RecorderStatus =
    | 'idle'
    | 'preparing'
    | 'countdown'
    | 'recording'
    | 'reviewing'
    | 'submitting'
    | 'error';

export default function VideoRecorder({
    interviewId,
    questionId,
    questionNumber,
    totalQuestions,
    showFace,
    prepTime,
    maxResponseTime,
}: VideoRecorderProps) {
    const router = useRouter();
    const { logError } = useErrorLogging();
    const { getToken } = useAuth();

    // Core state
    const [status, setStatus] = useState<RecorderStatus>('idle');
    const [prepTimeRemaining, setPrepTimeRemaining] = useState(prepTime);
    const [recordTimeRemaining, setRecordTimeRemaining] = useState(maxResponseTime);
    const [prepProgress, setPrepProgress] = useState(0);
    const [recordProgress, setRecordProgress] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(3);
    const [redoAttempts, setRedoAttempts] = useState(0);

    // Modal state
    const [showIntroModal, setShowIntroModal] = useState(false);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [webcamKey, setWebcamKey] = useState(0); // Force remount on device change

    // Device state
    const [webcamReady, setWebcamReady] = useState(false);

    // Refs
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const prepTimerRef = useRef<NodeJS.Timeout | null>(null);
    const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize devices on first load
    useEffect(() => {
        const init = async () => {
            try {
                // Check if we already have devices from session
                if (hasValidDeviceSettings()) {
                    console.log('[VideoRecorder] Using existing device settings');
                    return;
                }

                // Auto-detect default devices
                console.log('[VideoRecorder] Auto-detecting devices...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                // Get device IDs
                const videoTrack = stream.getVideoTracks()[0];
                const audioTrack = stream.getAudioTracks()[0];
                const cameraId = videoTrack?.getSettings().deviceId;
                const micId = audioTrack?.getSettings().deviceId;

                if (cameraId && micId) {
                    console.log('[VideoRecorder] Auto-detected:', {
                        camera: cameraId.substring(0, 8) + '...',
                        mic: micId.substring(0, 8) + '...',
                    });
                    storeDeviceSettings(cameraId, micId);
                }

                // Stop the detection stream - react-webcam will create its own
                stream.getTracks().forEach((t) => t.stop());
            } catch (error) {
                console.error('[VideoRecorder] Auto-detect failed:', error);
                logError(error, { context: 'VideoRecorder.init' });
                toast.error('Failed to access camera/microphone. Please check permissions.');
                setStatus('error');
            }
        };

        init();
    }, [logError]);

    // Show device setup modal on mount if no valid settings exist
    useEffect(() => {
        if (!hasValidDeviceSettings()) {
            console.log('[VideoRecorder] No valid device settings, showing device setup modal');
            setShowDeviceModal(true);
        }
    }, []);

    // Show intro modal when webcam is ready
    useEffect(() => {
        if (status === 'idle' && webcamReady && !showIntroModal) {
            console.log('[VideoRecorder] Webcam ready, showing intro modal');
            setShowIntroModal(true);
        }
    }, [status, webcamReady, showIntroModal]);

    // Webcam event handlers
    const handleWebcamReady = useCallback(() => {
        console.log('[VideoRecorder] Webcam ready');

        // Save the stream for session persistence
        const stream = webcamRef.current?.stream;
        if (stream) {
            setActiveMediaStream(stream);
            console.log('[VideoRecorder] Stream saved:', {
                streamId: stream.id,
                videoTracks: stream.getVideoTracks().length,
                audioTracks: stream.getAudioTracks().length,
            });
        }

        setWebcamReady(true);
    }, []);

    const handleWebcamError = useCallback(
        (error: string | DOMException) => {
            console.error('[VideoRecorder] Webcam error:', error);
            logError(error, { context: 'VideoRecorder.webcam' });
            toast.error('Failed to access camera or microphone');
            setStatus('error');
        },
        [logError]
    );

    // Intro modal handlers
    const handleStartInterview = useCallback(() => {
        console.log('[VideoRecorder] Starting interview from intro modal');
        setShowIntroModal(false);
        // Start prep timer
        startPrepTimer();
    }, [prepTime]);

    const handleCloseIntro = useCallback(() => {
        console.log('[VideoRecorder] User closed intro modal');
        setShowIntroModal(false);
        // Don't start timer - user can click the button when ready
    }, []);

    // Device modal handlers
    const handleOpenSettings = useCallback(() => {
        // Stop the current webcam stream
        if (webcamRef.current?.stream) {
            webcamRef.current.stream.getTracks().forEach((track) => track.stop());
        }

        // Clear stored device settings and active stream
        clearDeviceSettings();
        clearActiveMediaStream();

        setShowDeviceModal(true);
    }, []);

    const handleDeviceChange = useCallback(() => {
        setShowDeviceModal(false);

        // Force webcam to remount with new devices
        setWebcamKey((prev) => prev + 1);
        setWebcamReady(false);

        toast.success('Devices updated');
    }, []);

    // Timer functions
    const startPrepTimer = () => {
        setStatus('preparing');
        setPrepTimeRemaining(prepTime);
        setPrepProgress(0);

        if (prepTimerRef.current) clearInterval(prepTimerRef.current);

        prepTimerRef.current = setInterval(() => {
            setPrepTimeRemaining((prev) => {
                const newTime = prev - 1;
                setPrepProgress(((prepTime - newTime) / prepTime) * 100);

                if (newTime <= 0) {
                    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                    startCountdown();
                    return 0;
                }
                return newTime;
            });
        }, 1000);
    };

    const startCountdown = () => {
        setStatus('countdown');
        setCountdown(3);

        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        countdownTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
                const newCount = prev - 1;
                if (newCount <= 0) {
                    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                    startRecording();
                    return 0;
                }
                return newCount;
            });
        }, 1000);
    };

    const startRecording = useCallback(() => {
        setStatus('recording');
        setRecordTimeRemaining(maxResponseTime);
        setRecordProgress(0);
        chunksRef.current = [];

        const stream = webcamRef.current?.stream;
        if (!stream) {
            toast.error('Camera not ready');
            setStatus('error');
            return;
        }

        try {
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus',
            });

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
                setRecordedVideoURL(URL.createObjectURL(blob));
                setStatus('reviewing');
            };

            mediaRecorderRef.current = recorder;
            recorder.start();

            // Start timer
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);

            recordTimerRef.current = setInterval(() => {
                setRecordTimeRemaining((prev) => {
                    const newTime = prev - 1;
                    setRecordProgress(((maxResponseTime - newTime) / maxResponseTime) * 100);

                    if (newTime <= 0) {
                        stopRecording();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        } catch (error) {
            logError(error, { context: 'VideoRecorder.startRecording' });
            toast.error('Failed to start recording');
            setStatus('error');
        }
    }, [maxResponseTime, logError]);

    const stopRecording = () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        } else {
            setStatus('reviewing');
        }
    };

    const retryRecording = () => {
        const MAX_REDOS = 3;
        if (redoAttempts >= MAX_REDOS) {
            toast.error(`Maximum retries (${MAX_REDOS}) reached`);
            return;
        }

        setRedoAttempts((prev) => prev + 1);

        // Cleanup
        if (recordedVideoURL) {
            URL.revokeObjectURL(recordedVideoURL);
            setRecordedVideoURL(null);
        }
        setRecordedBlob(null);
        chunksRef.current = [];

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;

        // Clear timers
        if (prepTimerRef.current) clearInterval(prepTimerRef.current);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        // Restart countdown
        setTimeout(() => startCountdown(), 500);
    };

    const submitRecording = async () => {
        if (!recordedBlob) {
            toast.error('No recording available');
            return;
        }

        setStatus('submitting');

        try {
            const duration = Math.min(maxResponseTime, maxResponseTime - recordTimeRemaining);
            const token = await getToken();
            const responseTimeMs = Math.round(duration * 1000);
            
            const url = `${Local}/interviews/${interviewId}/questions/${questionId}/response?responseTimeMs=${responseTimeMs}&redoAttemptNumber=${redoAttempts}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'video/webm',
                },
                body: recordedBlob,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Server error: ${response.status}. ${errorData?.error?.message || ''}`
                );
            }

            toast.success('Response submitted!');
            router.push(`/interviews/job/${interviewId}`);
        } catch (error) {
            logError(error, { context: 'VideoRecorder.submitRecording' });
            setStatus('reviewing');
            toast.error('Failed to submit. Please try again.');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            if (recordedVideoURL) URL.revokeObjectURL(recordedVideoURL);
        };
    }, [recordedVideoURL]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get current device constraints
    const videoConstraints = getSelectedCamera()
        ? { deviceId: { exact: getSelectedCamera()! }, width: 1280, height: 720 }
        : { width: 1280, height: 720 };

    const audioConstraints = getSelectedMicrophone()
        ? { deviceId: { exact: getSelectedMicrophone()! } }
        : true;

    return (
        <>
            <InterviewIntroModal
                open={showIntroModal}
                onStart={handleStartInterview}
                onClose={handleCloseIntro}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                prepTime={prepTime}
                responseTime={maxResponseTime}
            />

            <DeviceSetupModal open={showDeviceModal} onComplete={handleDeviceChange} />

            <div className="flex flex-col h-full p-6" data-testid="video-recorder">
                {/* Timer Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">
                            {status === 'preparing' && 'Preparation Time'}
                            {status === 'countdown' && 'Get Ready'}
                            {status === 'recording' && 'Recording Time'}
                            {status === 'reviewing' && 'Recording Complete'}
                            {status === 'submitting' && 'Submitting...'}
                            {status === 'error' && 'Error'}
                            {status === 'idle' && 'Ready to Begin'}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-bold" data-testid="time-display">
                                {status === 'preparing' && formatTime(prepTimeRemaining)}
                                {status === 'countdown' && countdown}
                                {status === 'recording' && formatTime(recordTimeRemaining)}
                            </div>
                            {(status === 'preparing' ||
                                status === 'recording' ||
                                status === 'idle') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleOpenSettings}
                                        className="h-7 w-7 p-0"
                                        data-testid="device-settings-button"
                                        title="Change camera or microphone"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                )}
                        </div>
                    </div>
                    {(status === 'preparing' || status === 'recording') && (
                        <Progress
                            value={status === 'preparing' ? prepProgress : recordProgress}
                            className="h-2"
                        />
                    )}
                </div>

                {/* Video Area */}
                <div className="flex-1 flex flex-col items-center justify-center bg-muted rounded-lg overflow-hidden relative mb-4">
                    {(status === 'reviewing' || status === 'submitting') && recordedVideoURL ? (
                        // Show recorded video
                        <video
                            src={recordedVideoURL}
                            controls
                            className="w-full h-full object-contain bg-black"
                            data-testid="review-video"
                        />
                    ) : status === 'error' ? (
                        // Show error
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <VideoOff className="h-16 w-16 text-destructive mb-4" />
                            <p className="font-semibold text-destructive">Recording Error</p>
                            <p className="text-sm text-muted-foreground">
                                Check your camera/microphone permissions and try again.
                            </p>
                            <Button variant="outline" onClick={retryRecording} className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        // Show webcam
                        <div className="relative w-full h-full bg-black">
                            <Webcam
                                key={webcamKey}
                                ref={webcamRef}
                                audio={true}
                                videoConstraints={videoConstraints}
                                audioConstraints={audioConstraints}
                                muted
                                className={
                                    showFace
                                        ? 'w-full h-full object-cover'
                                        : 'w-full h-full object-cover opacity-0 absolute'
                                }
                                data-testid="webcam-video"
                                onUserMedia={handleWebcamReady}
                                onUserMediaError={handleWebcamError}
                            />

                            {!webcamReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="text-center p-4 bg-background/80 rounded-lg">
                                        <Loader2 className="h-12 w-12 mx-auto text-muted-foreground animate-spin mb-2" />
                                        <p className="text-muted-foreground">Connecting...</p>
                                    </div>
                                </div>
                            )}

                            {!showFace && webcamReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="text-center p-4 bg-background/80 rounded-lg">
                                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">
                                            Camera active (preview hidden)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {status === 'countdown' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div
                                        className="text-9xl font-bold text-white animate-pulse"
                                        data-testid="countdown-overlay"
                                    >
                                        {countdown}
                                    </div>
                                </div>
                            )}

                            {status === 'recording' && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 px-3 py-1 rounded-full">
                                    <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                                    <span className="text-sm font-medium text-white">REC</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center">
                    {status === 'idle' && webcamReady && (
                        <Button
                            onClick={handleStartInterview}
                            size="lg"
                            data-testid="manual-start-button"
                        >
                            Start Interview
                        </Button>
                    )}

                    {status === 'preparing' && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                                startCountdown();
                            }}
                            data-testid="skip-prep-button"
                        >
                            Skip Preparation ({prepTimeRemaining}s)
                        </Button>
                    )}

                    {status === 'countdown' && (
                        <div className="flex items-center justify-center">
                            <div
                                className="text-5xl font-bold text-primary animate-pulse"
                                data-testid="countdown-display"
                            >
                                {countdown}
                            </div>
                        </div>
                    )}

                    {status === 'recording' && (
                        <Button
                            onClick={stopRecording}
                            variant="destructive"
                            data-testid="stop-recording-button"
                        >
                            Stop Recording
                        </Button>
                    )}

                    {status === 'reviewing' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={retryRecording}
                                disabled={redoAttempts >= 3}
                                data-testid="retry-button"
                            >
                                {redoAttempts < 3
                                    ? `Record Again (${3 - redoAttempts} left)`
                                    : 'Max retries reached'}
                            </Button>
                            <Button onClick={submitRecording} data-testid="submit-button">
                                Submit Response
                            </Button>
                        </>
                    )}

                    {status === 'submitting' && (
                        <Button size="lg" disabled>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
