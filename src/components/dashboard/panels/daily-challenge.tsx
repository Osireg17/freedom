// src/components/dashboard/panels/daily-challenge.tsx
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Daily Challenge</CardTitle>
                    <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-medium">
                        New
                    </div>
                </div>
                <CardDescription>Practice one question each day</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-start gap-3 mb-3">
                        <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{dailyQuestion.question}</p>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground mt-3">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mr-2">
                            {dailyQuestion.category}
                        </span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{Math.floor(dailyQuestion.timeLimit / 60)}:{(dailyQuestion.timeLimit % 60).toString().padStart(2, '0')} time limit</span>
                    </div>
                </div>

                <Button
                    className="w-full"
                    data-testid="attempt-challenge-button"
                    aria-label="Attempt today's challenge question"
                >
                    Attempt Challenge
                </Button>
            </CardContent>
        </Card>
    );
}