'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react'

interface Interview {
    id: string
    companyName: string | null
    jobPosition: string | null
    jobDescription: string | null
    interviewType: string
    createdAt: Date
}

interface Question {
    id: string
    questionNumber: number
    questionText: string
    questionType: string
}

interface Response {
    id: string
    interviewQuestionId: string
    audioDurationMs: number | null
    createdAt: Date
}

interface ResultsClientPageProps {
    interview: Interview
    questions: Question[]
    responses: Response[]
}

export default function ResultsClientPage({ interview, questions, responses }: ResultsClientPageProps) {
    const router = useRouter()

    const totalQuestions = questions.length
    const completedQuestions = responses.length
    const completionPercentage = Math.round((completedQuestions / totalQuestions) * 100)

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const totalResponseTime = responses.reduce((sum, response) => {
        return sum + (response.audioDurationMs || 0)
    }, 0)

    // Log results page data for debugging
    console.log('[ResultsClientPage] Rendering with data:', {
        interviewId: interview.id,
        totalQuestions,
        completedQuestions,
        completionPercentage,
        totalResponseTime,
        formattedResponseTime: formatDuration(totalResponseTime),
        questionTypes: questions.map(q => q.questionType),
        responseDurations: responses.map(r => r.audioDurationMs)
    })

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="text-center">
                        <div className="mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Interview Completed!
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {interview.jobPosition || 'Interview'} {interview.companyName && `at ${interview.companyName}`}
                            </p>
                        </div>

                        <Badge variant="secondary" className="text-sm">
                            {completionPercentage}% Complete
                        </Badge>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Questions Answered</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {completedQuestions}/{totalQuestions}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                All questions completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Total Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary flex items-center gap-2">
                                <Clock className="h-6 w-6" />
                                {formatDuration(totalResponseTime)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Across all questions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Interview Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                Complete
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Ready for review
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Overview */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Question Overview</CardTitle>
                        <CardDescription>
                            Summary of your responses to each question
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {questions.map((question) => {
                                const response = responses.find(r => r.interviewQuestionId === question.id)
                                return (
                                    <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                                {question.questionNumber}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-foreground">
                                                    {question.questionText}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Response time: {response ? formatDuration(response.audioDurationMs || 0) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle>What happens next?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-muted-foreground">
                            <p>
                                • Your responses have been submitted and recorded
                            </p>
                            <p>
                                • The hiring team will review your interview responses
                            </p>
                            <p>
                                • You will be contacted with feedback and next steps
                            </p>
                            <p>
                                • You can view this summary anytime from your dashboard
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}