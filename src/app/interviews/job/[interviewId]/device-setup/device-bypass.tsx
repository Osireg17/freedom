'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasValidDeviceSettings } from '@/lib/device-session'

interface DeviceBypassProps {
    interviewId: string
    questionId: string
    children: React.ReactNode
}

export default function DeviceBypass({ interviewId, questionId, children }: DeviceBypassProps) {
    const router = useRouter()

    useEffect(() => {
        // Check if device settings are already configured for this session
        if (hasValidDeviceSettings()) {
            // Skip device setup and go directly to the question
            router.replace(`/interviews/job/${interviewId}/questions/${questionId}`)
        }
    }, [interviewId, questionId, router])

    // If device settings exist, don't render anything (we're redirecting)
    // If they don't exist, render the device setup component
    return <>{children}</>
}