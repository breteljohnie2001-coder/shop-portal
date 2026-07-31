'use client';

import { useState, useEffect } from 'react';

interface User {
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
    // State to handle client-side greeting calculation to prevent SSR hydration mismatches
    const [dynamicGreeting, setDynamicGreeting] = useState<string>('Welcome!');

    useEffect(() => {
        setDynamicGreeting(getTimeBasedGreeting());
    }, []);

    // Use explicit custom greeting prop if provided, otherwise fall back to dynamic greeting
    const displayGreeting = greeting || dynamicGreeting;

    return (
        <header className="sticky top-0 z-20 bg-black border-b border-gray-800">
            <div className="px-4 py-5 flex items-center justify-between">

                {/* LEFT SECTION: Avatar + Greeting/Name Column */}
                <div className="flex items-center gap-4">

                    {/* Avatar */}
                    <button
                        onClick={onProfileClick}
                        className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
                    >
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user?.name || 'User avatar'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-base font-semibold text-gray-200">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        )}
                    </button>

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

                    <span className="text-gray-600 font-light text-xl">|</span>

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