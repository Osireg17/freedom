'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Video, Mic, Timer, CheckCircle } from 'lucide-react'

interface InterviewIntroModalProps {
    open: boolean
    onStart: () => void
    onClose?: () => void
    questionNumber: number
    totalQuestions: number
    prepTime: number
    responseTime: number
}

export default function InterviewIntroModal({
    open,
    onStart,
    onClose,
    questionNumber,
    totalQuestions,
    prepTime,
    responseTime
}: InterviewIntroModalProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen && onClose) {
            onClose()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Question {questionNumber} of {totalQuestions}
                    </DialogTitle>
                    <DialogDescription>
                        You&apos;re about to start your interview question. Here&apos;s what to expect:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <Timer className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Preparation Time</p>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ll have {formatTime(prepTime)} to read and think about the question
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Recording Time</p>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ll have up to {formatTime(responseTime)} to record your answer
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <Mic className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">One Take</p>
                            <p className="text-sm text-muted-foreground">
                                You can re-record up to 3 times if needed
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Tips for Success</p>
                            <p className="text-sm text-muted-foreground">
                                Use the STAR method, speak clearly, and be specific with examples
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <Button
                        onClick={onStart}
                        size="lg"
                        className="w-full sm:w-auto"
                        data-testid="start-interview-button"
                    >
                        Start Interview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
