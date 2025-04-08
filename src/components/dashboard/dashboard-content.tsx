/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/dashboard-content.tsx
'use client';

import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, PlayCircle, Award } from 'lucide-react';
import { DailyChallenge } from './daily-challenge';
import { PracticeRecommendation } from './practice-recommendation';
import { RecentPerformanceChart } from './recent-performance-chart';
import { SubscriptionBanner } from './subscription-banner';
import { RecentInterviewsSection } from './recent-interview';

interface DashboardContentProps {
    user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {

    // Define mock data directly in the component
    const mockData = {
        stats: {
            completedInterviews: 8,
            inProgressInterviews: 1,
            averageScore: 82,
        },
        recentInterviews: [
            {
                id: 'int-1',
                title: 'Frontend Developer at Tech Co',
                type: 'job',
                date: '2025-04-01T14:30:00',
                score: 87,
                topStrength: 'Technical Knowledge',
            },
            {
                id: 'int-2',
                title: 'Software Engineer Practice',
                type: 'custom',
                date: '2025-03-28T10:15:00',
                score: 82,
                topStrength: 'Communication',
            },
            {
                id: 'int-3',
                title: 'Resume-Based Interview',
                type: 'resume',
                date: '2025-03-22T16:45:00',
                score: 78,
                topStrength: 'Problem Solving',
            },
        ],
        performanceData: [78, 75, 80, 82, 79, 84, 87],
        recommendations: [
            {
                id: 'rec-1',
                title: 'Improve Result Description',
                description: 'Focus on quantifying the outcomes of your actions',
                category: 'STAR Method',
            },
            {
                id: 'rec-2',
                title: 'Reduce Filler Words',
                description: 'Practice speaking with fewer "um"s and "uh"s',
                category: 'Speech Pattern',
            },
        ],
        subscription: {
            tier: 'free',
            interviewsRemaining: 3,
            nextReset: '2025-05-01T00:00:00',
        },
        streakCount: 3,
        ongoingInterview: {
            id: 'int-1',
            title: 'Frontend Developer at Tech Co',
            progress: 2,
            totalQuestions: 5,
        },
    };

    // Extract first name from user metadata
    const firstName = user.user_metadata?.firstName || 'there';

    return (
        <div className="space-y-8" data-testid="dashboard-content-container">
            <WelcomeSection
                firstName={firstName}
                stats={mockData.stats}
                streakCount={mockData.streakCount}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <ActionCenter ongoingInterview={mockData.ongoingInterview} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Performance</CardTitle>
                            <CardDescription>Your interview scores from the last 7 sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentPerformanceChart data={mockData.performanceData} />
                        </CardContent>
                    </Card>

                    <RecentInterviewsSection interviews={mockData.recentInterviews} />
                </div>

                <div className="space-y-6">
                    <SubscriptionBanner subscription={mockData.subscription} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Practice Recommendations</CardTitle>
                            <CardDescription>Focus on these areas to improve</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockData.recommendations.map((recommendation: any) => (
                                <PracticeRecommendation
                                    key={recommendation.id}
                                    recommendation={recommendation}
                                />
                            ))}
                        </CardContent>
                    </Card>

                    <DailyChallenge />
                </div>
            </div>
        </div>
    );
}

// Welcome section with stats
function WelcomeSection({ firstName, stats, streakCount }: { firstName: string, stats: any, streakCount: number }) {
    return (
        <div className="space-y-2" data-testid="welcome-section">
            <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {firstName}
            </h1>
            <div className="flex flex-wrap gap-4 items-center">
                <p className="text-muted-foreground">
                    You&lsquo;ve completed <span className="font-medium text-foreground">{stats.completedInterviews}</span> interviews
                    with an average score of <span className="font-medium text-foreground">{stats.averageScore}%</span>
                </p>
                {streakCount > 0 && (
                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full text-sm" data-testid="practice-streak">
                        <Award className="h-4 w-4" />
                        <span>{streakCount} day streak!</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Action center component
function ActionCenter({ ongoingInterview }: { ongoingInterview: any }) {
    return (
        <Card data-testid="action-center">
            <CardHeader>
                <CardTitle>Ready to practice?</CardTitle>
                <CardDescription>Start a new interview or continue where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {ongoingInterview && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted/50" data-testid="ongoing-interview-banner">
                        <h3 className="font-medium mb-1">{ongoingInterview.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            {ongoingInterview.progress} of {ongoingInterview.totalQuestions} questions completed
                        </p>
                        <Button variant="default" className="w-full sm:w-auto" data-testid="continue-interview-button" aria-label="Continue your ongoing interview">
                            <PlayCircle className="mr-2 h-4 w-4" /> Continue Interview
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="new-job-interview-button" aria-label="Create a new job-based interview">
                        <PlusCircle className="h-5 w-5" />
                        <div className="text-center">
                            <div className="font-medium">Job Interview</div>
                            <div className="text-xs text-muted-foreground">Based on job description</div>
                        </div>
                    </Button>

                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="new-resume-interview-button" aria-label="Create a new resume-based interview">
                        <PlusCircle className="h-5 w-5" />
                        <div className="text-center">
                            <div className="font-medium">Resume Interview</div>
                            <div className="text-xs text-muted-foreground">Based on your resume</div>
                        </div>
                    </Button>

                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="new-custom-interview-button" aria-label="Create a custom practice interview">
                        <PlusCircle className="h-5 w-5" />
                        <div className="text-center">
                            <div className="font-medium">Custom Practice</div>
                            <div className="text-xs text-muted-foreground">Choose your questions</div>
                        </div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
