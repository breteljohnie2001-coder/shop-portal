// src/app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: ReactNode;
}) {
    const supabase = await createClient();

    // Fetch active authenticated user from Supabase
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Map Supabase metadata to your UI user object shape
    const formattedUser = user
        ? {
            name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'User',
            role: user.user_metadata?.role || 'Owner',
        }
        : null;

    return (
        <DashboardLayoutClient user={formattedUser}>
            {children}
        </DashboardLayoutClient>
    );
}