// src/components/dashboard/interview-summary-card.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import {
    Briefcase,
    FileText,
    ListChecks,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewSummaryCardProps {
    interview: {
        id: string;
        title: string;
        type: 'job' | 'resume' | 'custom';
        date: string;
        score: number;
        topStrength: string;
    };
}

export function InterviewSummaryCard({ interview }: InterviewSummaryCardProps) {
    // Format the date as "x days/hours ago"
    const formattedDate = formatDistanceToNow(new Date(interview.date), { addSuffix: true });

    // Get the appropriate icon based on interview type
    const IconComponent = interview.type === 'job' ? Briefcase :
        interview.type === 'resume' ? FileText :
            ListChecks;

    // Determine color based on score
    const scoreColor = interview.score >= 85 ? 'text-green-600' :
        interview.score >= 75 ? 'text-amber-600' :
            'text-red-600';

    return (
        <Card className="overflow-hidden group hover:shadow-md transition-shadow" data-testid={`interview-card-${interview.id}`}>
            <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                    <div className={`w-2 flex-shrink-0 ${scoreColor.replace('text-', 'bg-').replace('-600', '-100 dark:bg-opacity-20')}`} />

                    <div className="p-4 flex-grow">
                        <div className="flex items-start gap-3 mb-2">
                            <div className={`mt-0.5 p-2 rounded-full ${interview.type === 'job' ? 'bg-blue-100 text-blue-600' : interview.type === 'resume' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'} dark:bg-opacity-20`}>
                                <IconComponent className="h-4 w-4" />
                            </div>

                            <div>
                                <h3 className="font-medium text-sm line-clamp-1" title={interview.title}>
                                    {interview.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Score</div>
                                    <div className={`font-bold ${scoreColor}`}>{interview.score}%</div>
                                </div>

                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Top Strength</div>
                                    <div className="flex items-center text-sm">
                                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                        {interview.topStrength}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`View feedback for ${interview.title}`}
                                data-testid={`view-feedback-button-${interview.id}`}
                            >
                                <span className="mr-1 text-xs">Feedback</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}