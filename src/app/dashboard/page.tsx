// src/app/dashboard/page.tsx
import { Metadata } from 'next';
import { protectRoute } from '@/lib/actions/auth-actions';
import DashboardLayout from '@/components/dashboard/layout/dashboard-layout';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardPage() {
    // This will redirect to sign-in if the user is not authenticated
    const user = await protectRoute();

    return <DashboardLayout user={user} />;
}