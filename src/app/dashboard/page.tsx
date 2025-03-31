// src/app/dashboard/page.tsx
import DashboardContent from '@/components/dashboard/dashboard-content';
import { protectRoute } from '@/lib/actions/auth-actions';


export default async function DashboardPage() {
    // This will redirect to sign-in if the user is not authenticated
    const user = await protectRoute();

    return <DashboardContent user={user} />;
}