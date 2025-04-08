// src/components/dashboard/streak-calendar.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
    practiceDates: string[]; // Array of dates when the user practiced (ISO strings)
    currentStreak: number;
}

export function StreakCalendar({ practiceDates, currentStreak }: StreakCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Convert practice dates to Date objects
    const practiceDateObjects = practiceDates.map(date => new Date(date));

    // Get the days in the current month
    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    // Get the day of the week of the first day of the month (0-6, where 0 is Sunday)
    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    // Generate the calendar days array with empty spaces for days before the first day of the month
    const calendarDays = Array(firstDayOfMonth).fill(null);

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    // Function to navigate to the previous month
    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Function to navigate to the next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Function to check if a specific day had practice
    const hasPractice = (day: number) => {
        if (!day) return false;

        return practiceDateObjects.some(date =>
            date.getDate() === day &&
            date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear()
        );
    };

    // Get month name and year
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();

    // Check if current month is the current calendar month
    const isCurrentMonth = new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

    return (
        <Card data-testid="streak-calendar-card">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center">
                        <Flame className="h-5 w-5 text-orange-500 mr-2" />
                        Practice Calendar
                    </CardTitle>
                    <div className="text-orange-500 font-medium text-sm flex items-center">
                        <span className="mr-1">{currentStreak}</span>
                        <span className="text-xs text-muted-foreground">day streak</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={previousMonth}
                        aria-label="Previous month"
                        data-testid="previous-month-button"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="font-medium">
                        {monthName} {year}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextMonth}
                        disabled={isCurrentMonth}
                        aria-label="Next month"
                        data-testid="next-month-button"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}

                    {calendarDays.map((day, index) => {
                        // Check if this day is today
                        const isToday = day &&
                            new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth.getMonth() &&
                            new Date().getFullYear() === currentMonth.getFullYear();

                        // Check if this day had practice
                        const practiced = day && hasPractice(day);

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "h-8 flex items-center justify-center rounded-full",
                                    day ? "cursor-pointer hover:bg-muted/50" : "",
                                    isToday ? "border border-primary" : "",
                                    practiced ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" : ""
                                )}
                                data-testid={day ? `calendar-day-${day}` : undefined}
                            >
                                {day && (
                                    <>
                                        {practiced && <Flame className="absolute h-3 w-3 text-orange-500 -mt-5" />}
                                        {day}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center text-xs text-muted-foreground mt-2 justify-center">
                    <div className="flex items-center mr-4">
                        <div className="w-3 h-3 rounded-full bg-orange-100 dark:bg-orange-950 mr-1"></div>
                        <span>Practice day</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full border border-primary mr-1"></div>
                        <span>Today</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}