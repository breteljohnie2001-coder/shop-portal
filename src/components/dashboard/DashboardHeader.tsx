'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface User {
    id?: string;
    name: string;
    avatarUrl?: string;
}

interface DashboardHeaderProps {
    user: User | null;
    greeting?: string;
    onProfileClick?: () => void;
}

// Helper to determine time-based greeting
function getTimeBasedGreeting(): string {
    const hours = new Date().getHours();

    if (hours < 12) return 'Good Morning!';
    if (hours < 18) return 'Good Afternoon!';

    return 'Good Evening!';
}

export default function DashboardHeader({
                                            user,
                                            greeting,
                                            onProfileClick,
                                        }: DashboardHeaderProps) {

    const supabase = createClient();

    const [dynamicGreeting, setDynamicGreeting] = useState<string>('Welcome!');
    const [unreadCount, setUnreadCount] = useState(0);

    // Client-side greeting
    useEffect(() => {
        setDynamicGreeting(getTimeBasedGreeting());
    }, []);

    // Load + realtime notifications
    useEffect(() => {
        if (!user?.id) {
            setUnreadCount(0);
            return;
        }

        let channel: ReturnType<typeof supabase.channel> | null = null;

        const loadNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('id, is_read')
                .eq('recipient_id', user.id);

            if (error) {
                console.error(
                    'Notification fetch error:',
                    error
                );
                return;
            }

            const unread = (data || []).filter(
                (notification) => !notification.is_read
            ).length;

            setUnreadCount(unread);
        };

        loadNotifications();

        // Listen for new notifications in realtime
        channel = supabase
            .channel(`dashboard-notifications-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`,
                },
                () => {
                    setUnreadCount((current) => current + 1);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`,
                },
                () => {
                    loadNotifications();
                }
            )
            .subscribe();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user?.id]);

    const displayGreeting = greeting || dynamicGreeting;

    return (
        <header className="sticky top-0 z-20 bg-black border-b border-gray-800">
            <div className="px-4 py-5 flex items-center justify-between">

                {/* LEFT SECTION */}
                <div className="flex items-center gap-4">

                    {/* Avatar */}
                    <div className="relative shrink-0">

                        <button
                            onClick={onProfileClick}
                            className={`w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center hover:opacity-90 transition-all ${
                                unreadCount > 0
                                    ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black'
                                    : ''
                            }`}
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user?.name || 'User avatar'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-base font-semibold text-gray-200">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            )}
                        </button>

                        {/* Notification indicator */}
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md animate-pulse">
                                <Bell size={11} />
                            </span>
                        )}

                    </div>

                    {/* Text Column */}
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400 font-medium">
                            {displayGreeting}
                        </span>

                        <h2 className="text-lg font-bold text-white leading-tight">
                            {user?.name || 'Guest'}
                        </h2>
                    </div>

                </div>

                {/* RIGHT SECTION: Brand Logos */}
                <div className="flex items-center gap-4">

                    <button className="transition-opacity hover:opacity-100 opacity-100">
                        <img
                            src="/bee-trendy.png"
                            alt="Bee Trendy Collection"
                            className="h-10 w-auto"
                        />
                    </button>

                    <span className="text-gray-600 font-light text-xl">
                        |
                    </span>

                    <button className="transition-opacity hover:opacity-100 opacity-60">
                        <img
                            src="/baddyOnABudget.png"
                            alt="Baddie on a Budget Closet"
                            className="h-10 w-auto"
                        />
                    </button>

                </div>

            </div>
        </header>
    );
}