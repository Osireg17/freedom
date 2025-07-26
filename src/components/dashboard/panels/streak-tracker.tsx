"use client"

import { Calendar, Flame, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StreakTrackerProps {
    currentStreak: number
    highestStreak: number
    nextMilestone: number
    lastPracticeDate: string
}

export function StreakTracker({ currentStreak, highestStreak, nextMilestone, lastPracticeDate }: StreakTrackerProps) {
    const isSmallScreen = useMediaQuery("(max-width: 640px)")

    // Calculate progress towards the next milestone
    const progress = Math.min(100, (currentStreak / nextMilestone) * 100)

    // Format the last practice date
    const lastPractice = new Date(lastPracticeDate)
    const formattedDate = lastPractice.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    })

    // Determine if the streak is at risk (no practice today)
    const today = new Date()
    const isAtRisk = lastPractice.toDateString() !== today.toDateString()

    return (
        <div className="space-y-3" data-testid="streak-tracker-content">
            <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-500">{currentStreak}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Current Streak</div>
                </div>

                <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold">{highestStreak}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Highest</div>
                </div>

                <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold">{nextMilestone}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Next Goal</div>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] sm:text-xs">
                    <span>Progress to {nextMilestone} days</span>
                    <span className="font-medium">
                        {currentStreak}/{nextMilestone}
                    </span>
                </div>
                <Progress
                    value={progress}
                    className="h-2"
                    aria-label={`Streak progress: ${currentStreak} of ${nextMilestone} days`}
                />
            </div>

            {isAtRisk ? (
                <div className="mt-2">
                    <Button
                        variant="outline"
                        size={isSmallScreen ? "sm" : "default"}
                        className="w-full px-2 py-1 border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/30 text-xs sm:text-sm"
                        data-testid="practice-today-button"
                        aria-label="Practice today to maintain your streak"
                    >
                        <Flame
                            className="h-4 w-4 mr-1.5 flex-shrink-0 text-orange-500 dark:text-orange-400"
                            aria-hidden="true"
                            focusable="false"
                            role="img"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            strokeWidth="2"
                            stroke="currentColor"
                            strokeLinecap="round"
                        />
                        Practice today
                    </Button>
                </div>

            ) : (
                <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Last practice: {formattedDate}</span>
                </div>
            )}

            {currentStreak >= 5 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-1.5 sm:p-2 flex items-center text-[10px] sm:text-xs">
                    <Trophy className="h-3.5 w-3.5 text-amber-500 mr-1.5 flex-shrink-0" />
                    <span className="text-amber-800 dark:text-amber-300">
                        {currentStreak >= 30
                            ? "Amazing dedication! You're a pro!"
                            : currentStreak >= 15
                                ? "Great consistency! Keep it up!"
                                : "You're on a roll! 5+ day streak!"}
                    </span>
                </div>
            )}
        </div>
    )
}
