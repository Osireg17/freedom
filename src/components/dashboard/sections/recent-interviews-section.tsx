// src/components/dashboard/sections/recent-interviews-section.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { InterviewCard } from '../cards/interview-card';


export interface Interview {
    id: string;
    title: string;
    type: 'job' | 'custom' | 'resume'; // Must be exactly "job", "custom", or "resume"
    date: string;
    score: number;
    topStrength: string;
}

interface RecentInterviewsSectionProps {
    interviews: Interview[];
}

export function RecentInterviewsSection({ interviews }: RecentInterviewsSectionProps) {
    return (
        <Card data-testid="recent-interviews-section">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Recent Interviews</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                    data-testid="view-all-interviews-button"
                >
                    View all <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid gap-4">
                    {interviews.length > 0 ? (
                        interviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                interview={interview}
                            />
                        ))
                    ) : (
                        <div className="text-center p-6">
                            <p className="text-muted-foreground">No recent interviews. Start practicing to see your history here!</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}