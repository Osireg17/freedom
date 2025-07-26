'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { hasValidDeviceSettings } from '@/lib/device-session'

interface QuestionButtonProps {
    interviewId: string
    questionId: string
    questionNumber: number
    isLocked: boolean
    isCompleted: boolean
    children: React.ReactNode
}

export function QuestionButton({ 
    interviewId, 
    questionId, 
    questionNumber, 
    isLocked, 
    isCompleted,
    children 
}: QuestionButtonProps) {
    const [hasDeviceSession, setHasDeviceSession] = useState<boolean | null>(null)

    useEffect(() => {
        // Check if device settings exist for this session
        setHasDeviceSession(hasValidDeviceSettings())
    }, [])

    // Show loading state while checking session
    if (hasDeviceSession === null) {
        return (
            <Button
                className="w-full"
                disabled={true}
                variant="outline"
            >
                Loading...
            </Button>
        )
    }

    const buttonContent = children
    const shouldDisable = isLocked || isCompleted
    const canUseAsChild = !shouldDisable

    // Determine the href based on whether device setup is needed
    const href = hasDeviceSession 
        ? `/interviews/job/${interviewId}/questions/${questionId}`
        : `/interviews/job/${interviewId}/device-setup`

    return (
        <Button
            className="w-full"
            disabled={shouldDisable}
            variant={isCompleted ? "secondary" : "default"}
            asChild={canUseAsChild}
            data-testid={`start-question-${questionNumber}-button`}
        >
            {shouldDisable ? (
                buttonContent
            ) : (
                <Link href={href}>
                    {buttonContent}
                </Link>
            )}
        </Button>
    )
}

interface QuickStartButtonProps {
    interviewId: string
    questionId: string
}

export function QuickStartButton({ interviewId, questionId }: QuickStartButtonProps) {
    const [hasDeviceSession, setHasDeviceSession] = useState<boolean | null>(null)

    useEffect(() => {
        setHasDeviceSession(hasValidDeviceSettings())
    }, [])

    if (hasDeviceSession === null) {
        return (
            <Button size="sm" disabled>
                Loading...
            </Button>
        )
    }

    const href = hasDeviceSession 
        ? `/interviews/job/${interviewId}/questions/${questionId}`
        : `/interviews/job/${interviewId}/device-setup`

    return (
        <Button size="sm" asChild>
            <Link href={href}>
                Quick Start
            </Link>
        </Button>
    )
}