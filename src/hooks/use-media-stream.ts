
import { useState, useEffect, useCallback } from 'react';

export function useMediaStream(videoDeviceId: string, audioDeviceId: string) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getStream = useCallback(async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
                audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
            });
            setStream(newStream);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    }, [videoDeviceId, audioDeviceId]);

    useEffect(() => {
        getStream();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [getStream, stream]);

    return { stream, error };
}
