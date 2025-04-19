'use client';

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Define proper types for our question data
interface QuestionData {
    id: string
    interviewId: string
    questionNumber: number
    questionText: string
    questionType: string
    timeToAnswer: number
    prepTime: number
    totalQuestions: number
}



const VideoRecorder = dynamic(
    () => import('@/components/interviews/question-answering/video-recorder'),
    {
        ssr: false, // Prevents rendering on the server
        loading: () => ( // Optional: Shows while the component loads on the client
            <div className="flex h-[500px] items-center justify-center flex-col text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Loading Recorder...</p>
            </div>
        ),
    }
);

export default function QuestionAnswerPage() {
    const params = useParams()
    const router = useRouter()
    const { logError } = useErrorLogging()

    // Use proper typing for state variables
    const [question, setQuestion] = useState<QuestionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showFace, setShowFace] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [fetchComplete, setFetchComplete] = useState(false)

    // Use useCallback to memoize the fetch function
    const fetchQuestion = useCallback(async () => {
        if (fetchComplete) return // Prevent re-fetching if already complete

        try {
            setLoading(true)
            const interviewId = params.id
            const questionId = params.questionId

            if (!interviewId || !questionId) {
                setFetchError('Missing interview or question ID')
                setLoading(false)
                return
            }

            // Add a cache-busting parameter to prevent browser caching
            const response = await fetch(
                `/api/interviews/${interviewId}/questions/${questionId}?t=${Date.now()}`,
                { cache: 'no-store' }
            )

            if (!response.ok) {
                throw new Error(`Failed to fetch question: ${response.status}`)
            }

            const data = await response.json()
            setQuestion(data)
            setFetchComplete(true) // Mark fetch as complete to prevent re-fetching
        } catch (error) {
            logError(error, {
                context: 'QuestionAnswerPage.fetchQuestion',
                params
            })
            setFetchError(error instanceof Error ? error.message : 'Failed to load question')
        } finally {
            setLoading(false)
        }
    }, [params.id, params.questionId, logError, fetchComplete])

    // Use a proper dependency array in useEffect
    useEffect(() => {
        fetchQuestion()
    }, [fetchQuestion])

    // Show loading state
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                        data-testid="loading-spinner"></div>
                    <p className="text-muted-foreground">Loading question...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (fetchError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold mb-4">Error Loading Question</h2>
                    <p className="mb-6 text-muted-foreground">
                        {fetchError}
                    </p>
                    <Button onClick={() => router.back()} data-testid="error-back-button">Go Back</Button>
                </Card>
            </div>
        )
    }

    // Show not found state
    if (!question) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold mb-4">Question Not Found</h2>
                    <p className="mb-6 text-muted-foreground">
                        We couldn&apos;t find the question you&apos;re looking for.
                    </p>
                    <Button onClick={() => router.back()} data-testid="not-found-back-button">Go Back</Button>
                </Card>
            </div>
        )
    }

    // Main content - only render when we have question data
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-7xl bg-card rounded-lg shadow-xl overflow-hidden flex flex-col h-[85vh]" data-testid="question-answer-page">
                {/* Header with question number and controls */}
                <div className="bg-background border-b py-2 px-4 flex justify-between items-center flex-shrink-0">
                    <div className="text-sm font-medium">
                        Question {question.questionNumber} of {question.totalQuestions}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFace(!showFace)}
                        aria-label={showFace ? "Hide face" : "Show face"}
                        data-testid="toggle-face-button"
                    >
                        {showFace ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showFace ? "Hide Face" : "Show Face"}
                    </Button>
                </div>

                {/* Main content */}
                <div className="flex flex-1 overflow-hidden"> {/* Takes remaining vertical space */}
                    {/* Question panel */}
                    <div className="w-2/5  p-6 overflow-y-auto border-r flex flex-col"> {/* Added border-r */}
                        <div className="mb-4 bg-primary/10 px-3 py-1 rounded-full inline-block self-start">
                            <span className="text-sm font-medium text-primary">
                                {question.questionType.charAt(0).toUpperCase() + question.questionType.slice(1)}
                            </span>
                        </div>
                        <h1 className="text-xl font-semibold mb-6" data-testid="question-text">
                            {question.questionText}
                        </h1>
                        <div className="text-sm text-muted-foreground mt-auto"> {/* Pushes tips to bottom */}
                            <p className="mb-2 font-medium">Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Use the STAR method (Situation, Task, Action, Result)</li>
                                <li>Speak clearly and at a moderate pace</li>
                                <li>Use specific examples from your experience</li>
                            </ul>
                        </div>
                    </div>

                    {/* Video recording panel */}
                    <div className="w-3/5 bg-background flex flex-col"> {/* Stays the same */}
                        <VideoRecorder
                            interviewId={params.id as string}
                            questionId={params.questionId as string}
                            showFace={showFace}
                            prepTime={question.prepTime || 30}
                            maxResponseTime={question.timeToAnswer || 120}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}