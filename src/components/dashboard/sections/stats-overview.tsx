// src/components/dashboard/sections/stats-overview.tsx
'use client';

import {
    CheckCircle2,
    Clock,
    BarChart2,
} from 'lucide-react';

interface StatsOverviewProps {
    stats: {
        completedInterviews: number;
        inProgressInterviews: number;
        averageScore: number;
    };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    // Determine score color based on value
    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-amber-600';
        return 'text-red-600';
    };

    // Generate score grade based on average
    const getScoreGrade = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="stats-overview"
        >
            {/* Completed Interviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Interviews</p>
                    <h3 className="text-2xl font-bold">{stats.completedInterviews}</h3>
                </div>
            </div>

            {/* In Progress Interviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <h3 className="text-2xl font-bold">{stats.inProgressInterviews}</h3>
                </div>
            </div>

            {/* Average Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <BarChart2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <div className="flex items-center gap-2">
                        <h3 className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                            {stats.averageScore}%
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            {getScoreGrade(stats.averageScore)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}