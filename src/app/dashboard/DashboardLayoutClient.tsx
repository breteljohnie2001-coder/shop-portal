'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileDrawer from '@/components/ProfileDrawer';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { UserProvider, AppUser } from '@/context/UserContext';

export default function DashboardLayoutClient({
                                                  children,
                                                  user,
                                              }: {
    children: ReactNode;
    user: AppUser | null;
}) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Initialize QueryClient once per session instance
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes cache
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider user={user}>
                <main className="min-h-screen bg-[#0F0F10] text-white pb-28">
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
            </UserProvider>
        </QueryClientProvider>
    );
}