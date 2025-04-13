'use client';

import Link from 'next/link';
import { Briefcase, FileText, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InterviewTypeCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    testId: string;
    comingSoon?: boolean;
}

function InterviewTypeCard({
    title,
    description,
    icon,
    href,
    testId,
    comingSoon = false
}: InterviewTypeCardProps) {
    return (
        <Card
            className="p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
            data-testid={testId}
        >
            <div className="mb-4 p-3 bg-primary/10 rounded-full">
                {icon}
            </div>
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">{title}</h2>
                {comingSoon && (
                    <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                        data-testid={`${testId}-coming-soon-badge`}
                    >
                        Coming Soon
                    </Badge>
                )}
            </div>
            <p className="text-muted-foreground mb-6">{description}</p>
            <Button
                className="mt-auto w-full"
                asChild={!comingSoon}
                variant={comingSoon ? "outline" : "default"}
                disabled={comingSoon}
                data-testid={`${testId}-button`}
                aria-label={comingSoon ? `${title} (coming soon)` : `Start ${title}`}
            >
                {comingSoon ? (
                    <span>Coming Soon</span>
                ) : (
                    <Link href={href}>Get Started</Link>
                )}
            </Button>
        </Card>
    );
}

export default function InterviewTypesSelector() {
    return (
        <div
            className="grid md:grid-cols-3 gap-6"
            data-testid="interview-types-selector"
        >
            <InterviewTypeCard
                title="Job Interview"
                description="Practice interview questions based on a specific job description"
                icon={<Briefcase className="h-8 w-8 text-primary" />}
                href="/dashboard/interviews/job"
                testId="job-interview-card"
            />

            <InterviewTypeCard
                title="Resume Interview"
                description="Practice interview questions tailored to your resume and experience"
                icon={<FileText className="h-8 w-8 text-primary" />}
                href="/dashboard/interviews/resume"
                testId="resume-interview-card"
            />

            <InterviewTypeCard
                title="Custom Interview"
                description="Create a custom interview with questions you select"
                icon={<ListChecks className="h-8 w-8 text-primary" />}
                href="/dashboard/interviews/custom"
                testId="custom-interview-card"
                comingSoon={true}
            />
        </div>
    );
}