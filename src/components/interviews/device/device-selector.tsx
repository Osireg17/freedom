'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { Mic } from 'lucide-react'
import { storeDeviceSettings, setActiveMediaStream } from '@/lib/device-session'

interface DeviceSelectorProps {
    interviewId: string
}

export default function DeviceSelector({ interviewId }: DeviceSelectorProps) {
    const router = useRouter()
    const { logError } = useErrorLogging()
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
    const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
    const [selectedCamera, setSelectedCamera] = useState<string>('')
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
    const [audioLevel, setAudioLevel] = useState(0)
    const webcamRef = useRef<Webcam>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const dataArrayRef = useRef<Uint8Array | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    const getDevices = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoInputs = devices.filter(device => device.kind === 'videoinput')
            const audioInputs = devices.filter(device => device.kind === 'audioinput')

            setCameras(videoInputs)
            setMicrophones(audioInputs)

            if (videoInputs.length > 0 && !selectedCamera) {
                setSelectedCamera(videoInputs[0].deviceId)
            }
            if (audioInputs.length > 0 && !selectedMicrophone) {
                setSelectedMicrophone(audioInputs[0].deviceId)
            }

            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            logError(error, { context: 'DeviceSelector.getDevices' })
            toast.error('Could not list your cameras and microphones. Please grant permission to your camera and microphone.')
        }
    }, [logError, selectedCamera, selectedMicrophone])

    useEffect(() => {
        getDevices()
    }, [getDevices])

    const setupAudioAnalysis = useCallback(async () => {
        if (!selectedMicrophone) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: selectedMicrophone } },
                video: false
            });

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
            const audioContext = audioContextRef.current;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            analyserRef.current = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

            const updateAudioLevel = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                let sum = 0;
                for (let i = 0; i < dataArrayRef.current.length; i++) {
                    sum += dataArrayRef.current[i];
                }
                const average = sum / dataArrayRef.current.length;
                const normalizedLevel = Math.min(100, Math.max(0, average * 2));
                setAudioLevel(normalizedLevel);

                animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };

            updateAudioLevel();

            return () => {
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }
            };
        } catch (error) {
            logError(error, { context: 'DeviceSelector.setupAudioAnalysis' });
            toast.error('Failed to start microphone analysis.');
        }
    }, [selectedMicrophone, logError]);

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        setupAudioAnalysis().then((cleanupFn) => {
            cleanup = cleanupFn;
        });
        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    }, [setupAudioAnalysis]);

    const handleProceed = () => {
        if (!selectedCamera || !selectedMicrophone) {
            toast.error('Please select a camera and a microphone to continue.')
            return
        }

        console.log('[DeviceSelector] Proceeding to video recorder...')
        const startTime = performance.now()

        // Store device settings with session management
        storeDeviceSettings(selectedCamera, selectedMicrophone)

        // Store the current webcam stream for reuse in the interview page
        if (webcamRef.current?.stream) {
            console.log('[DeviceSelector] Storing active stream for reuse:', {
                streamId: webcamRef.current.stream.id,
                videoTracks: webcamRef.current.stream.getVideoTracks().length,
                audioTracks: webcamRef.current.stream.getAudioTracks().length,
                active: webcamRef.current.stream.active
            })
            setActiveMediaStream(webcamRef.current.stream)
        } else {
            console.warn('[DeviceSelector] No webcam stream available to store!')
        }

        const setupTime = performance.now() - startTime
        console.log(`[DeviceSelector] Device setup completed in ${setupTime.toFixed(2)}ms`)

        router.push(`/interviews/job/${interviewId}/device-setup/connect`)
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            <h1 className="text-2xl font-bold mb-6">Camera and Microphone Setup</h1>
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="camera-select">Camera</Label>
                        <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                            <SelectTrigger id="camera-select" data-testid="camera-select">
                                <SelectValue placeholder="Select a camera" />
                            </SelectTrigger>
                            <SelectContent>
                                {cameras.map(camera => (
                                    <SelectItem key={camera.deviceId} value={camera.deviceId}>
                                        {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microphone-select">Microphone</Label>
                        <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                            <SelectTrigger id="microphone-select" data-testid="microphone-select">
                                <SelectValue placeholder="Select a microphone" />
                            </SelectTrigger>
                            <SelectContent>
                                {microphones.map(mic => (
                                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                                        {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Mic className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Microphone Level</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-100"
                                style={{ width: `${audioLevel}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="bg-muted rounded-lg overflow-hidden aspect-video">
                    {selectedCamera && (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            videoConstraints={{ deviceId: { exact: selectedCamera }, width: 1280, height: 720 }}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            </div>
            <div className="mt-8">
                <Button onClick={handleProceed} size="lg">Proceed to Interview</Button>
            </div>
        </div>
    )
}
