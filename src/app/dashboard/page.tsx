// src/app/dashboard/page.tsx
import { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/layout/dashboard-layout';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardPage() {
    const authResult = await auth();
    console.log('[dashboard] auth result:', JSON.stringify(authResult));
    const { userId } = authResult;
    if (!userId) redirect('/sign-in');

    const clerkUser = await currentUser();

    return <DashboardLayout user={{ firstName: clerkUser?.firstName ?? null, lastName: clerkUser?.lastName ?? null }} />;
}