// src/components/dashboard/sections/action-center.tsx
'use client';

import { PlusCircle, PlayCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ActionCenterProps {
    ongoingInterview?: {
        id: string;
        title: string;
        progress: number;
        totalQuestions: number;
    };
}

export function ActionCenter({ ongoingInterview }: ActionCenterProps) {
    // Calculate progress percentage if there's an ongoing interview
    const progressPercentage = ongoingInterview
        ? (ongoingInterview.progress / ongoingInterview.totalQuestions) * 100
        : 0;

    return (
        <Card data-testid="action-center">
            <CardHeader>
                <CardTitle className="text-xl">Ready to practice?</CardTitle>
                <CardDescription>Start a new interview or continue where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {ongoingInterview && (
                    <div
                        className="mb-6 p-5 border rounded-lg bg-muted/50"
                        data-testid="ongoing-interview-banner"
                    >
                        <h3 className="font-medium text-lg mb-2">{ongoingInterview.title}</h3>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Progress</span>
                                <span>{ongoingInterview.progress} of {ongoingInterview.totalQuestions} questions</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" aria-label={`Interview progress: ${ongoingInterview.progress} of ${ongoingInterview.totalQuestions} questions`} />
                        </div>
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full sm:w-auto"
                            data-testid="continue-interview-button"
                            aria-label="Continue your ongoing interview"
                        >
                            <PlayCircle className="mr-2 h-5 w-5" /> Continue Interview
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col items-center gap-3"
                        data-testid="new-job-interview-button"
                        aria-label="Create a new job-based interview"
                    >
                        <PlusCircle className="h-6 w-6" />
                        <div className="text-center">
                            <div className="font-medium text-base">Job Interview</div>
                            <div className="text-sm text-muted-foreground">Based on job description</div>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col items-center gap-3"
                        data-testid="new-resume-interview-button"
                        aria-label="Create a new resume-based interview"
                    >
                        <PlusCircle className="h-6 w-6" />
                        <div className="text-center">
                            <div className="font-medium text-base">Resume Interview</div>
                            <div className="text-sm text-muted-foreground">Based on your resume</div>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col items-center gap-3"
                        data-testid="new-custom-interview-button"
                        aria-label="Create a custom practice interview"
                    >
                        <PlusCircle className="h-6 w-6" />
                        <div className="text-center">
                            <div className="font-medium text-base">Custom Practice</div>
                            <div className="text-sm text-muted-foreground">Choose your questions</div>
                        </div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}