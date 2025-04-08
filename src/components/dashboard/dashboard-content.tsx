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
import { StreakTracker } from './streak-tracker';
import { StreakCalendar } from './streak-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        // Add streak data for the StreakTracker component
        streakData: {
            currentStreak: 3,
            highestStreak: 7,
            nextMilestone: 5,
            lastPracticeDate: '2025-04-08T09:30:00',
        },
        // Add practice history for the StreakCalendar
        practiceDates: [
            '2025-04-08T09:30:00',
            '2025-04-07T15:45:00',
            '2025-04-06T10:20:00',
            '2025-04-02T14:30:00',
            '2025-03-28T11:15:00',
            '2025-03-25T16:40:00',
            '2025-03-22T09:10:00',
            '2025-03-20T16:35:00',
            '2025-03-15T13:45:00',
        ],
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
        <div className="space-y-10" data-testid="dashboard-content-container">
            <WelcomeSection
                firstName={firstName}
                stats={mockData.stats}
                streakCount={mockData.streakCount}
            />

            {/* Reorganize layout with more vertical spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main content area - wider on large screens */}
                <div className="lg:col-span-8 space-y-8">
                    <ActionCenter ongoingInterview={mockData.ongoingInterview} />

                    <Card className="p-2">
                        <CardHeader className="pb-4">
                            <CardTitle>Recent Performance</CardTitle>
                            <CardDescription>Your interview scores from the last 7 sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="py-4">
                            <div className="h-96">
                                <RecentPerformanceChart data={mockData.performanceData} />
                            </div>
                        </CardContent>
                    </Card>

                    <RecentInterviewsSection interviews={mockData.recentInterviews} />
                </div>

                {/* Right sidebar - narrower on large screens */}
                <div className="lg:col-span-4 space-y-8">
                    <SubscriptionBanner subscription={mockData.subscription} />

                    {/* Streak section with tabs for different views */}
                    <Card>
                        <Tabs defaultValue="tracker" className="w-full" data-testid="streak-tabs">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between mb-3">
                                    <CardTitle className="text-lg">Practice Streak</CardTitle>
                                    <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-full text-sm" data-testid="streak-counter">
                                        <Award className="h-4 w-4" />
                                        <span className="text-base">{mockData.streakData.currentStreak} day streak</span>
                                    </div>
                                </div>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="tracker" data-testid="tracker-tab-trigger" aria-label="View streak progress">Progress</TabsTrigger>
                                    <TabsTrigger value="calendar" data-testid="calendar-tab-trigger" aria-label="View practice calendar">Calendar</TabsTrigger>
                                </TabsList>
                            </CardHeader>
                            <CardContent className="pt-6 pb-4">
                                <TabsContent value="tracker" data-testid="tracker-tab-content">
                                    <StreakTracker
                                        currentStreak={mockData.streakData.currentStreak}
                                        highestStreak={mockData.streakData.highestStreak}
                                        nextMilestone={mockData.streakData.nextMilestone}
                                        lastPracticeDate={mockData.streakData.lastPracticeDate}
                                    />
                                </TabsContent>
                                <TabsContent value="calendar" data-testid="calendar-tab-content">
                                    <StreakCalendar
                                        practiceDates={mockData.practiceDates}
                                        currentStreak={mockData.streakData.currentStreak}
                                    />
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg">Practice Recommendations</CardTitle>
                            <CardDescription>Focus on these areas to improve</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 py-2">
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
        <div className="space-y-3" data-testid="welcome-section">
            <h1 className="text-4xl font-bold tracking-tight">
                Welcome back, {firstName}
            </h1>
            <div className="flex flex-wrap gap-4 items-center">
                <p className="text-muted-foreground text-lg">
                    You&apos;ve completed <span className="font-medium text-foreground">{stats.completedInterviews}</span> interviews
                    with an average score of <span className="font-medium text-foreground">{stats.averageScore}%</span>
                </p>
                {streakCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full text-base" data-testid="practice-streak">
                        <Award className="h-5 w-5" />
                        <span className="font-medium">{streakCount} day streak!</span>
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
                <CardTitle className="text-xl">Ready to practice?</CardTitle>
                <CardDescription>Start a new interview or continue where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {ongoingInterview && (
                    <div className="mb-6 p-5 border rounded-lg bg-muted/50" data-testid="ongoing-interview-banner">
                        <h3 className="font-medium text-lg mb-2">{ongoingInterview.title}</h3>
                        <p className="text-muted-foreground mb-4">
                            {ongoingInterview.progress} of {ongoingInterview.totalQuestions} questions completed
                        </p>
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