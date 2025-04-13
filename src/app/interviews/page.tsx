// src/app/dashboard/interviews/page.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import InterviewTypesSelector from '@/components/interviews/interviews-types-selector';


export const metadata: Metadata = {
    title: 'Interview Types - AceYourHireVue',
    description: 'Select the type of interview you want to practice',
};

export default async function InterviewsPage() {
    // Protect this route - only authenticated users can access it
    await protectRoute();

    return (
        <div className="container py-8 max-w-5xl mx-auto" data-testid="interviews-page">
            <div className="flex flex-col gap-6">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold mb-2" data-testid="interviews-page-heading">
                        Practice Interviews
                    </h1>
                    <p className="text-muted-foreground text-lg" data-testid="interviews-page-description">
                        Select the type of interview you want to practice
                    </p>
                </div>

                <InterviewTypesSelector />
            </div>
        </div>
    );
}