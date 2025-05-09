'use client';

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useErrorLogging } from '@/hooks/use-error-logging'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic';

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

// Import VideoRecorder with SSR disabled
const VideoRecorder = dynamic(
    () => import('@/components/interviews/question-answering/video-recorder'),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-1 h-full items-center justify-center flex-col text-center bg-background">
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

    const [question, setQuestion] = useState<QuestionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showFace, setShowFace] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [fetchComplete, setFetchComplete] = useState(false)

    // Fetch question data
    const fetchQuestion = useCallback(async () => {
        if (fetchComplete) return

        try {
            setLoading(true)
            const interviewId = params.interviewId
            const questionId = params.questionId

            if (!interviewId || !questionId) {
                setFetchError('Missing interview or question ID')
                setLoading(false)
                return
            }

            // Log the params for debugging
            console.log('Fetching question with params:', { interviewId, questionId });

            const response = await fetch(
                `/api/interviews/${interviewId}/questions/${questionId}?t=${Date.now()}`,
                { cache: 'default' }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(`Failed to fetch question: ${response.status}. ${errorData?.error?.message || ''}`)
            }

            const data = await response.json()
            setQuestion(data)
            setFetchComplete(true)
        } catch (error) {
            logError(error, {
                context: 'QuestionAnswerPage.fetchQuestion',
                params
            })
            setFetchError(error instanceof Error ? error.message : 'Failed to load question')
        } finally {
            setLoading(false)
        }
    }, [params, logError, fetchComplete])

    // Fetch question on component mount
    useEffect(() => {
        fetchQuestion()
    }, [fetchQuestion])

    // Loading state
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                        data-testid="loading-spinner"></div>
                    <p className="text-muted-foreground">Loading question...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (fetchError) {
        return (
            <div className="flex h-screen items-center justify-center bg-background p-4">
                <Card className="p-8 max-w-md text-center" data-testid="error-card">
                    <h2 className="text-xl font-bold mb-4 text-destructive-foreground">Error Loading Question</h2>
                    <p className="mb-6 text-muted-foreground">
                        {fetchError}
                    </p>
                    <Button onClick={() => router.back()} data-testid="error-back-button">Go Back</Button>
                </Card>
            </div>
        )
    }

    // Not found state
    if (!question) {
        return (
            <div className="flex h-screen items-center justify-center bg-background p-4">
                <Card className="p-8 max-w-md text-center" data-testid="not-found-card">
                    <h2 className="text-xl font-bold mb-4">Question Not Found</h2>
                    <p className="mb-6 text-muted-foreground">
                        We couldn&apos;t find the question you&apos;re looking for.
                    </p>
                    <Button onClick={() => router.back()} data-testid="not-found-back-button">Go Back</Button>
                </Card>
            </div>
        )
    }

    // Main content
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-7xl bg-card rounded-lg shadow-xl overflow-hidden flex flex-col h-[85vh]" data-testid="question-answer-page">
                {/* Header */}
                <div className="bg-background border-b py-2 px-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            aria-label="Go back"
                            data-testid="back-button"
                            className="mr-3 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                        <div className="text-sm font-medium text-foreground">
                            Question {question.questionNumber} of {question.totalQuestions}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFace(!showFace)}
                        aria-label={showFace ? "Hide face" : "Show face"}
                        data-testid="toggle-face-button"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {showFace ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showFace ? "Hide Face" : "Show Face"}
                    </Button>
                </div>

                {/* Main content - 2-column layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Question panel (Left) */}
                    <div className="w-2/5 p-6 overflow-y-auto border-r border-border flex flex-col bg-card">
                        {/* Question type badge */}
                        <div className="mb-4 bg-primary/10 px-3 py-1 rounded-full inline-block self-start">
                            <span className="text-sm font-medium text-primary">
                                {question.questionType.charAt(0).toUpperCase() + question.questionType.slice(1)}
                            </span>
                        </div>
                        <h1 className="text-xl font-semibold mb-6 text-foreground" data-testid="question-text">
                            {question.questionText}
                        </h1>
                        {/* Tips section */}
                        <div className="text-sm text-muted-foreground mt-auto">
                            <p className="mb-2 font-medium text-foreground">Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Use the STAR method (Situation, Task, Action, Result)</li>
                                <li>Speak clearly and at a moderate pace</li>
                                <li>Use specific examples from your experience</li>
                                <li>Keep eye contact with the camera (if shown)</li>
                                <li>Stay within the time limit</li>
                            </ul>
                        </div>
                    </div>

                    {/* Video recording panel (Right) */}
                    <div className="w-3/5 bg-background flex flex-col">
                        <VideoRecorder
                            interviewId={params.interviewId as string}
                            questionId={params.questionId as string}
                            showFace={showFace}
                            prepTime={question.prepTime ?? 30}
                            maxResponseTime={question.timeToAnswer ?? 120}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}