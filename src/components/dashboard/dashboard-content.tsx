// src/components/dashboard/dashboard-content.tsx
'use client';

import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardContentProps {
    user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
    const firstName = user.user_metadata?.firstName || 'User';

    return (
        <div className="space-y-6 max-w-full" data-testid="dashboard-home">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome to your AceYourHireVue dashboard, {firstName}
            </p>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Here&apos;s how to begin your interview practice</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>Choose an option below to start practicing for your interviews:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Create a new practice session based on a job description</li>
                            <li>Upload your resume to generate tailored questions</li>
                            <li>Select questions from our interview library</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}