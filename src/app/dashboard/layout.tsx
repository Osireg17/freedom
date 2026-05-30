// src/app/dashboard/layout.tsx
import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const authResult = await auth();
    console.log('[dashboard layout] auth result:', JSON.stringify(authResult));
    const { userId } = authResult;
    if (!userId) redirect('/sign-in');

    return (
        <div className='container py-8 max-w-4xl mx-auto' data-testid="dashboard-container">
            {children}
        </div>
    );
}