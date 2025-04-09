'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Flame } from 'lucide-react';



import { useMediaQuery } from '@/hooks/use-media-query';
import { StreakCalendar } from './streak-calendar';
import { StreakTracker } from './streak-tracker';

interface StreakPanelProps {
    streakData: {
        currentStreak: number;
        highestStreak: number;
        nextMilestone: number;
        lastPracticeDate: string;
    };
    practiceDates: string[];
}

export function StreakPanel({ streakData, practiceDates }: StreakPanelProps) {
    const isSmallScreen = useMediaQuery("(max-width: 640px)");

    return (
        <Card data-testid="streak-panel" className="overflow-hidden">
            <Tabs defaultValue="tracker" className="w-full" data-testid="streak-tabs">
                <CardHeader className={`pb-2 ${isSmallScreen ? 'px-3' : ''}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3`}>
                        <CardTitle className="text-base font-semibold">Practice Streak</CardTitle>
                        <div
                            className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full text-sm self-start"
                            data-testid="streak-counter"
                        >
                            <Flame className="h-4 w-4" />
                            <span className="font-medium">{streakData.currentStreak} day streak</span>
                        </div>
                    </div>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="tracker"
                            data-testid="tracker-tab-trigger"
                            aria-label="View streak progress"
                        >
                            Progress
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            data-testid="calendar-tab-trigger"
                            aria-label="View practice calendar"
                        >
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className={`pt-4 pb-2 ${isSmallScreen ? 'px-3' : ''}`}>
                    <TabsContent value="tracker" data-testid="tracker-tab-content">
                        <StreakTracker
                            currentStreak={streakData.currentStreak}
                            highestStreak={streakData.highestStreak}
                            nextMilestone={streakData.nextMilestone}
                            lastPracticeDate={streakData.lastPracticeDate}
                        />
                    </TabsContent>
                    <TabsContent value="calendar" data-testid="calendar-tab-content">
                        <StreakCalendar
                            practiceDates={practiceDates}
                            currentStreak={streakData.currentStreak}
                        />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}
