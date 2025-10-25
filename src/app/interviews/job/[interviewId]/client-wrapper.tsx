'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
    const buttonContent = children
    const shouldDisable = isLocked || isCompleted
    const canUseAsChild = !shouldDisable

    // Always navigate directly to questions page
    // Device setup modal will show automatically in VideoRecorder if needed
    const href = `/interviews/job/${interviewId}/questions/${questionId}`

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
    // Always navigate directly to questions page
    // Device setup modal will show automatically in VideoRecorder if needed
    const href = `/interviews/job/${interviewId}/questions/${questionId}`

    return (
        <Button size="sm" asChild>
            <Link href={href}>
                Quick Start
            </Link>
        </Button>
    )
}