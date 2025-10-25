'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { Mic, Camera as CameraIcon, Loader2 } from 'lucide-react'
import { storeDeviceSettings, setActiveMediaStream, getSelectedCamera, getSelectedMicrophone } from '@/lib/device-session'
import Webcam from 'react-webcam'

interface DeviceSetupModalProps {
    open: boolean
    onComplete: () => void
}

export default function DeviceSetupModal({ open, onComplete }: DeviceSetupModalProps) {
    const { logError } = useErrorLogging()
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
    const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
    const [selectedCamera, setSelectedCamera] = useState<string>('')
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
    const [isReady, setIsReady] = useState(false)

    const webcamRef = useRef<Webcam>(null)

    // Get devices when modal opens
    useEffect(() => {
        if (!open) return

        const initDevices = async () => {
            try {
                // Request permission to enumerate devices with labels
                const permStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

                const devices = await navigator.mediaDevices.enumerateDevices()
                const videoDevices = devices.filter(d => d.kind === 'videoinput')
                const audioDevices = devices.filter(d => d.kind === 'audioinput')

                setCameras(videoDevices)
                setMicrophones(audioDevices)

                // Use existing selections or default to first device
                const currentCamera = getSelectedCamera()
                const currentMic = getSelectedMicrophone()

                setSelectedCamera(currentCamera || videoDevices[0]?.deviceId || '')
                setSelectedMicrophone(currentMic || audioDevices[0]?.deviceId || '')

                // Stop permission stream
                permStream.getTracks().forEach(t => t.stop())
            } catch (error) {
                logError(error, { context: 'DeviceSetupModal.initDevices' })
                toast.error('Failed to access devices. Please grant camera and microphone permissions.')
            }
        }

        initDevices()
    }, [open, logError])

    const handleConfirm = () => {
        if (!selectedCamera || !selectedMicrophone) {
            toast.error('Please select both camera and microphone')
            return
        }

        // Get the stream from the webcam
        const stream = webcamRef.current?.stream

        if (!stream) {
            toast.error('Stream not ready. Please wait a moment.')
            return
        }

        console.log('[DeviceSetupModal] Saving settings and stream:', {
            camera: selectedCamera.substring(0, 8) + '...',
            microphone: selectedMicrophone.substring(0, 8) + '...',
            streamId: stream.id
        })

        // Store device settings and stream
        storeDeviceSettings(selectedCamera, selectedMicrophone)
        setActiveMediaStream(stream)

        onComplete()
    }

    return (
        <Dialog open={open} onOpenChange={() => {/* Prevent closing by clicking outside */}}>
            <DialogContent
                className="sm:max-w-3xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Camera & Microphone Settings</DialogTitle>
                    <DialogDescription>
                        Select your preferred camera and microphone for the interview.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    {/* Device Controls */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="camera-select" className="flex items-center gap-2">
                                <CameraIcon className="h-4 w-4" />
                                Camera
                            </Label>
                            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                                <SelectTrigger id="camera-select">
                                    <SelectValue placeholder="Select camera" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cameras.map(cam => (
                                        <SelectItem key={cam.deviceId} value={cam.deviceId}>
                                            {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mic-select" className="flex items-center gap-2">
                                <Mic className="h-4 w-4" />
                                Microphone
                            </Label>
                            <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                                <SelectTrigger id="mic-select">
                                    <SelectValue placeholder="Select microphone" />
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

                        <p className="text-sm text-muted-foreground pt-2">
                            Your selected devices will be used throughout the interview.
                        </p>
                    </div>

                    {/* Video Preview */}
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            {selectedCamera && selectedMicrophone ? (
                                <Webcam
                                    ref={webcamRef}
                                    audio={true}
                                    videoConstraints={{
                                        deviceId: { exact: selectedCamera },
                                        width: 1280,
                                        height: 720
                                    }}
                                    audioConstraints={{
                                        deviceId: { exact: selectedMicrophone }
                                    }}
                                    muted
                                    className="w-full h-full object-cover"
                                    onUserMedia={() => setIsReady(true)}
                                    onUserMediaError={(err) => {
                                        console.error('[DeviceSetupModal] Stream error:', err)
                                        logError(err, { context: 'DeviceSetupModal.webcam' })
                                        setIsReady(false)
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        onClick={handleConfirm}
                        disabled={!isReady || !selectedCamera || !selectedMicrophone}
                        size="lg"
                        data-testid="confirm-devices-button"
                    >
                        {isReady ? 'Confirm Devices' : (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting up...
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
