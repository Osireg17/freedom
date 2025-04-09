// src/components/dashboard/sections/welcome-section.tsx
'use client';

import { Award } from 'lucide-react';

interface WelcomeSectionProps {
    firstName: string;
    lastName: string;
    stats: {
        completedInterviews: number;
        inProgressInterviews: number;
        averageScore: number;
    };
    streakCount: number;
}

export function WelcomeSection({ firstName, lastName, stats, streakCount }: WelcomeSectionProps) {

    return (
        <div className="space-y-3" data-testid="welcome-section">
            <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {firstName} {lastName && ` ${lastName}`}!
            </h1>
            <div className="flex flex-wrap gap-4 items-center">
                <p className="text-muted-foreground text-lg">
                    You&apos;ve completed <span className="font-medium text-foreground">{stats.completedInterviews}</span> interviews
                    with an average score of <span className="font-medium text-foreground">{stats.averageScore}%</span>
                </p>
                {streakCount > 0 && (
                    <div
                        className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full text-base"
                        data-testid="practice-streak"
                    >
                        <Award className="h-5 w-5" />
                        <span className="font-medium">{streakCount} day streak!</span>
                    </div>
                )}
            </div>
        </div>
    );
}