// src/app/dashboard/DashboardLayoutClient.tsx
'use client';

import { ReactNode, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileDrawer from '@/components/ProfileDrawer';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface User {
    name: string;
    role: string;
    avatarUrl?: string;
}

export default function DashboardLayoutClient({
                                                  children,
                                                  user,
                                              }: {
    children: ReactNode;
    user: User | null;
}) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <main className="min-h-screen bg-[#0F0F10] text-white pb-28">
            <DashboardHeader
                user={user}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>

            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />

            <BottomNavigation />
        </main>
    );
}