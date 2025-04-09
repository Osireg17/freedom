"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StreakCalendarProps {
    practiceDates: string[] // Array of dates when the user practiced (ISO strings)
    currentStreak: number
}

export function StreakCalendar({ practiceDates }: StreakCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const isSmallScreen = useMediaQuery("(max-width: 640px)")

    // Convert practice dates to Date objects
    const practiceDateObjects = practiceDates.map((date) => new Date(date))

    // Get the days in the current month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

    // Get the day of the week of the first day of the month (0-6, where 0 is Sunday)
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

    // Generate the calendar days array with empty spaces for days before the first day of the month
    const calendarDays = Array(firstDayOfMonth).fill(null)

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    // Function to navigate to the previous month
    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    // Function to navigate to the next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    // Function to check if a specific day had practice
    const hasPractice = (day: number) => {
        if (!day) return false

        return practiceDateObjects.some(
            (date) =>
                date.getDate() === day &&
                date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear(),
        )
    }

    // Get month name and year
    const monthName = currentMonth.toLocaleString("default", { month: isSmallScreen ? "short" : "long" })
    const year = currentMonth.getFullYear()

    // Check if current month is the current calendar month
    const isCurrentMonth =
        new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear()

    // Calculate cell size based on screen size
    const cellSize = isSmallScreen ? "h-7" : "h-8"
    const flameSize = isSmallScreen ? "h-2.5 w-2.5" : "h-3 w-3"
    const flamePosition = isSmallScreen ? "-mt-5" : "-mt-6"

    return (
        <div className="space-y-2" data-testid="streak-calendar-content">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousMonth}
                    aria-label="Previous month"
                    data-testid="previous-month-button"
                    className="h-7 w-7 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="font-medium text-sm">
                    {monthName} {year}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    disabled={isCurrentMonth}
                    aria-label="Next month"
                    data-testid="next-month-button"
                    className="h-7 w-7 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="font-medium text-muted-foreground text-[10px] sm:text-xs">
                        {day}
                    </div>
                ))}

                {calendarDays.map((day, index) => {
                    // Check if this day is today
                    const isToday =
                        day &&
                        new Date().getDate() === day &&
                        new Date().getMonth() === currentMonth.getMonth() &&
                        new Date().getFullYear() === currentMonth.getFullYear()

                    // Check if this day had practice
                    const practiced = day && hasPractice(day)

                    return (
                        <div
                            key={index}
                            className={cn(
                                "relative flex items-center justify-center rounded-full text-[11px] sm:text-xs",
                                cellSize,
                                day ? "cursor-pointer hover:bg-muted/50" : "",
                                isToday ? "border border-primary" : "",
                                practiced ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" : "",
                            )}
                            data-testid={day ? `calendar-day-${day}` : undefined}
                        >
                            {day && (
                                <>
                                    {practiced && <Flame className={`absolute ${flameSize} text-orange-500 ${flamePosition}`} />}
                                    {day}
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground justify-center gap-3 sm:gap-4 pt-1">
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-100 dark:bg-orange-950/40 mr-1"></div>
                    <span>Practice day</span>
                </div>
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full border border-primary mr-1"></div>
                    <span>Today</span>
                </div>
            </div>
        </div>
    )
}
