'use client';

import React from 'react';

interface HeaderProps {
    userEmail: string;
    onOpenProfile: () => void;
    activeTab: 'home' | 'insights';
    setActiveTab: (tab: 'home' | 'insights') => void;
}

export default function Header({
                                   userEmail,
                                   onOpenProfile,
                                   activeTab,
                                   setActiveTab,
                               }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md">
            {/* Left: Avatar Profile Trigger */}
            <button
                onClick={onOpenProfile}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                title="Open Profile"
            >
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </button>

            {/* Center: Dual Brand Identifier */}
            <div className="flex items-center gap-3">
        <span className="text-sm font-bold tracking-tight text-emerald-600">
          BRAND A
        </span>
                <span className="h-3 w-[1px] bg-slate-300" />
                <span className="text-sm font-bold tracking-tight text-rose-500">
          BRAND B
        </span>
            </div>

            {/* Right: Quick Tab Indicator Toggle */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`rounded-md px-3 py-1 transition ${
                        activeTab === 'home'
                            ? 'bg-white font-semibold text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    Home
                </button>
                <button
                    onClick={() => setActiveTab('insights')}
                    className={`rounded-md px-3 py-1 transition ${
                        activeTab === 'insights'
                            ? 'bg-white font-semibold text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    Insights
                </button>
            </div>
        </header>
    );
}