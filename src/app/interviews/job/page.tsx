// src/app/dashboard/interviews/job/page.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import JobInterviewForm from '@/components/interviews/job/job-interview-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Job Interview - AceYourHireVue',
    description: 'Practice interview questions based on a specific job description',
};

export default async function JobInterviewPage() {
    // Protect this route - only authenticated users can access it
    await protectRoute();

    return (
        <div className="container py-8 max-w-3xl mx-auto" data-testid="job-interview-page">
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-6"
                data-testid="back-button"
                aria-label="Back to interview types"
            >
                <Link href="/dashboard/interviews">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                </Link>
            </Button>

            <div className="flex flex-col gap-6">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold mb-2" data-testid="job-interview-page-heading">
                        Job Description Interview
                    </h1>
                    <p className="text-muted-foreground text-lg" data-testid="job-interview-page-description">
                        Practice interview questions based on a specific job description
                    </p>
                </div>

                <JobInterviewForm />
            </div>
        </div>
    );
}