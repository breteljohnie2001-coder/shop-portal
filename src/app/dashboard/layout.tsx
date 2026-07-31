import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardLayoutClient from './DashboardLayoutClient';
import { AppUser } from '@/context/UserContext';

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: ReactNode;
}) {
    const supabase = await createClient();

    // 1. Fetch user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let appUser: AppUser | null = null;

    if (user) {
        // 2. Fetch profile brand settings on the server once
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, assigned_brand')
            .eq('id', user.id)
            .single();

        const role = profile?.role || 'employee';
        const assignedBrand = (profile?.assigned_brand as 'brand_a' | 'brand_b') || null;

        // Bosses or users without an assigned brand can switch brands freely
        const isBrandLocked = !(role === 'boss' || !assignedBrand);

        appUser = {
            id: user.id,
            email: user.email,
            name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'User',
            role,
            assignedBrand: isBrandLocked ? assignedBrand : 'brand_a',
            isBrandLocked,
        };
    }

    return (
        <DashboardLayoutClient user={appUser}>
            {children}
        </DashboardLayoutClient>
    );
}