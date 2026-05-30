// src/app/dashboard/page.tsx
import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/layout/dashboard-layout';
import Client, { Local } from '@/lib/client';

export const metadata: Metadata = {
    title: 'Dashboard - AceYourHireVue',
    description: 'Manage your interview practice sessions and track your progress',
};

export default async function DashboardPage() {
    const { userId, getToken } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const client = new Client(Local, {
        auth: async () => ({ authorization: `Bearer ${await getToken()}` })
    });

    try {
        const user = await client.users.getUser(userId);
        return (
            <DashboardLayout user={{ firstName: user.firstName, lastName: user.lastName }} />
        );
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        return <div>Error fetching user data</div>;
    }
}