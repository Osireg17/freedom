// src/components/dashboard/layout/dashboard-content.tsx
'use client';

import { User } from '@supabase/supabase-js';

import { StreakPanel } from '../panels/streak-panel';
import { SubscriptionPanel } from '../panels/subscription-panel';
import { ActionCenter } from '../sections/action-center';
import { PerformanceChart } from '../sections/performance-chart';
import { StatsOverview } from '../sections/stats-overview';
import { WelcomeSection } from '../sections/welcome-section';
import { Interview, RecentInterviewsSection } from '../sections/recent-interviews-section';
import { DailyChallenge } from '../panels/daily-challenge';


interface DashboardContentProps {
    user: User;
    children?: React.ReactNode;
}


// Mock data for the dashboard
const MOCK_DATA = {
    stats: {
        completedInterviews: 8,
        inProgressInterviews: 1,
        averageScore: 82,
    },
    recentInterviews: [
        {
            id: "1",
            title: "Google Interview",
            type: 'job',
            date: "2023-06-15",
            score: 85,
            topStrength: "Problem Solving"
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
    ] as Interview[],
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
    streakData: {
        currentStreak: 3,
        highestStreak: 7,
        nextMilestone: 5,
        lastPracticeDate: '2025-04-08T09:30:00',
    },
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



export default function DashboardContent({ user, children }: DashboardContentProps) {
    const firstName = user.user_metadata?.firstName || 'there';

    // If there are children, render them instead of the default dashboard
    if (children) {
        return <>{children}</>;
    }

    return (
        <div className="space-y-8" data-testid="dashboard-content-container">
            {/* Welcome Section with User Stats */}
            <WelcomeSection
                firstName={firstName}
                stats={MOCK_DATA.stats}
                streakCount={MOCK_DATA.streakCount}
            />

            {/* Action Center for Quick Access */}
            <ActionCenter ongoingInterview={MOCK_DATA.ongoingInterview} />

            {/* Stats Overview */}
            <StatsOverview stats={MOCK_DATA.stats} />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left and Middle Column (spans 2 columns on XL screens) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Performance Chart */}
                    <PerformanceChart data={MOCK_DATA.performanceData} />

                    {/* Recent Interviews */}
                    <RecentInterviewsSection
                        interviews={MOCK_DATA.recentInterviews}
                    />
                </div>

                {/* Right Column (Panels) */}
                <div className="space-y-8">
                    {/* Subscription Status */}
                    <SubscriptionPanel subscription={MOCK_DATA.subscription} />

                    {/* Streak Tracker */}
                    <StreakPanel
                        streakData={MOCK_DATA.streakData}
                        practiceDates={MOCK_DATA.practiceDates}
                    />

                    {/* Daily Challenge */}
                    <DailyChallenge />
                </div>
            </div>
        </div>
    );
}