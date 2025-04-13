// src/app/dashboard/interviews/job/page.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';

export const metadata: Metadata = {
    title: 'Job Interview - AceYourHireVue',
    description: 'Practice interview questions based on a specific job description',
};

export default async function JobInterviewPage() {
    // Protect this route - only authenticated users can access it
    await protectRoute();

    return (
        <>
            {/* Welcome to Job Interview */}

            {/* Brief description as to how it work */}

            {/* Button to get start that will take them to the form */}

        </>
    );
}