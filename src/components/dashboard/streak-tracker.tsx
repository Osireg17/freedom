// src/components/dashboard/streak-tracker.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreakTrackerProps {
    currentStreak: number;
    highestStreak: number;
    nextMilestone: number;
    lastPracticeDate: string;
}

export function StreakTracker({
    currentStreak,
    highestStreak,
    nextMilestone,
    lastPracticeDate
}: StreakTrackerProps) {
    // Calculate progress towards the next milestone
    const progress = Math.min(100, (currentStreak / nextMilestone) * 100);

    // Format the last practice date
    const lastPractice = new Date(lastPracticeDate);
    const formattedDate = lastPractice.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    // Determine if the streak is at risk (no practice today)
    const today = new Date();
    const isAtRisk = lastPractice.toDateString() !== today.toDateString();

    return (
        <Card data-testid="streak-tracker-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                    <Flame className="h-5 w-5 text-orange-500 mr-2" />
                    Practice Streak
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Current Streak</div>
                    </div>

                    <div className="text-center">
                        <div className="text-xl font-semibold">{highestStreak}</div>
                        <div className="text-xs text-muted-foreground">Highest</div>
                    </div>

                    <div className="text-center">
                        <div className="text-xl font-semibold">{nextMilestone}</div>
                        <div className="text-xs text-muted-foreground">Next Goal</div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span>Progress to {nextMilestone} days</span>
                        <span className="font-medium">{currentStreak}/{nextMilestone}</span>
                    </div>
                    <Progress value={progress} className="h-2" aria-label={`Streak progress: ${currentStreak} of ${nextMilestone} days`} />
                </div>

                {isAtRisk ? (
                    <div className="mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
                            data-testid="practice-today-button"
                            aria-label="Practice today to maintain your streak"
                        >
                            <Flame className="h-4 w-4 mr-2" />
                            Practice today to maintain streak
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Last practice: {formattedDate}</span>
                    </div>
                )}

                {currentStreak >= 5 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-2 flex items-center text-xs">
                        <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-amber-800 dark:text-amber-300">
                            {currentStreak >= 30 ? "Amazing dedication! You're a pro!" :
                                currentStreak >= 15 ? "Great consistency! Keep it up!" :
                                    "You're on a roll! 5+ day streak!"}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}