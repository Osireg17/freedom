// src/app/dashboard/interviews/resume/page.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import ResumeInterviewForm from '@/components/interviews/resume/resume-interview-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Resume Interview - AceYourHireVue',
    description: 'Practice interview questions tailored to your resume and experience',
};

export default async function ResumeInterviewPage() {
    // Protect this route - only authenticated users can access it
    await protectRoute();

    return (
        <div className="container py-8 max-w-3xl mx-auto" data-testid="resume-interview-page">
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-6"
                data-testid="back-button"
                aria-label="Back to interview types"
            >
                <Link href="/interviews">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                </Link>
            </Button>

            <div className="flex flex-col gap-6">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold mb-2" data-testid="resume-interview-page-heading">
                        Resume-Based Interview
                    </h1>
                    <p className="text-muted-foreground text-lg" data-testid="resume-interview-page-description">
                        Practice interview questions tailored to your resume and experience
                    </p>
                </div>

                <ResumeInterviewForm />
            </div>
        </div>
    );
}