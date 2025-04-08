// src/components/dashboard/daily-challenge.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock } from "lucide-react";

export function DailyChallenge() {
    // In a real implementation, fetch from API
    const dailyQuestion = {
        question: "Tell me about a time when you had to adapt to a significant change at work or school.",
        category: "Adaptability",
        timeLimit: 120 // in seconds
    };

    return (
        <Card data-testid="daily-challenge-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Daily Challenge</CardTitle>
                    <div className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-medium">
                        New
                    </div>
                </div>
                <CardDescription>Practice one question each day</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="rounded-lg border p-3 bg-muted/50">
                    <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{dailyQuestion.question}</p>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mr-2">
                            {dailyQuestion.category}
                        </span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{Math.floor(dailyQuestion.timeLimit / 60)}:{(dailyQuestion.timeLimit % 60).toString().padStart(2, '0')} time limit</span>
                    </div>
                </div>

                <Button
                    className="w-full"
                    variant="secondary"
                    data-testid="attempt-challenge-button"
                    aria-label="Attempt today's challenge question"
                >
                    Attempt Challenge
                </Button>
            </CardContent>
        </Card>
    );
}