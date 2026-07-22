'use client';

import { ReactNode, useState } from 'react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileDrawer from '@/components/ProfileDrawer';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface User {
    name: string;
    role: string;
}

export default function DashboardLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const user: User = {
        name: 'Alex',
        role: 'Owner',
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-28">
            <DashboardHeader
                user={user}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <div className="mx-auto max-w-5xl px-6 py-6">
                {children}
            </div>

            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />

            <BottomNavigation />
        </main>
    );
}