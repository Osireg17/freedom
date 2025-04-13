// src/app/interviews/job/page.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Briefcase, Building, Clock, ListChecks, HelpCircle } from 'lucide-react';
import JobInterviewForm from '@/components/interviews/job/job-interview-form';

export const metadata: Metadata = {
    title: 'Job Interview - AceYourHireVue',
    description: 'Practice interview questions based on a specific job description',
};

export default async function JobInterviewPage() {
    // Protect this route - only authenticated users can access it
    await protectRoute();

    return (
        <div className="container py-8 max-w-4xl mx-auto" data-testid="job-interview-page">
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

            <div className="flex flex-col gap-8">
                {/* Hero section with illustration */}
                <div className="text-center relative">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold mt-14 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70" data-testid="job-interview-page-heading">
                        Job-Based Interview Practice
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="job-interview-page-description">
                        Create a personalized interview based on a specific job description to practice
                        answering targeted questions that match the role you&apos;re applying for.
                    </p>
                </div>

                {/* How It Works section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                            <Building className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Paste Job Description</h3>
                        <p className="text-muted-foreground text-sm">Enter the job details exactly as posted to get the most relevant interview questions.</p>
                    </div>

                    <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                            <ListChecks className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">AI Generates Questions</h3>
                        <p className="text-muted-foreground text-sm">Our AI analyzes the job requirements and creates relevant technical and behavioral questions.</p>
                    </div>

                    <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                            <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Practice & Receive Feedback</h3>
                        <p className="text-muted-foreground text-sm">Record your answers and get detailed feedback on your responses to improve your interview skills.</p>
                    </div>
                </div>

                {/* Tips for better results */}
                <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                    <div className="flex items-start">
                        <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Tips for the best results</h3>
                            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside ml-1">
                                <li>Include the complete job description to get the most relevant questions</li>
                                <li>Specify your years of experience accurately to match question difficulty</li>
                                <li>Set realistic answer times based on the complexity of the role</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form container with shadow and animation */}
                <div className="bg-background rounded-xl border shadow-lg animate-fadeIn transition-all hover:shadow-xl">
                    <div className="p-6 border-b bg-muted/30 rounded-t-xl">
                        <h2 className="text-2xl font-semibold">Create Your Job Interview</h2>
                        <p className="text-muted-foreground">Enter the details of the job you&apos;re applying for</p>
                    </div>
                    <div className="p-6">
                        <JobInterviewForm />
                    </div>
                </div>
            </div>
        </div>
    );
}