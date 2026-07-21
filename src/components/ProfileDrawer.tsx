'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';

interface User {
    name: string;
    role: string;
}

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function ProfileDrawer({
                                          isOpen,
                                          onClose,
                                          user,
                                      }: ProfileDrawerProps) {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogout = async () => {
        setLoading(true);

        await supabase.auth.signOut();

        router.push('/login');
    };

    return (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm">
            {/* Drawer */}
            <aside className="flex h-full w-80 flex-col justify-between bg-white shadow-2xl animate-in slide-in-from-left duration-200">
                {/* Content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Profile
                        </h2>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 transition hover:bg-neutral-100"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* User */}
                    <div className="mt-10 flex flex-col items-center">
                        <button
                            className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 text-2xl font-semibold text-white"
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </button>

                        <h3 className="mt-5 text-xl font-semibold text-neutral-900">
                            {user?.name}
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            {user?.role}
                        </p>
                    </div>

                    <div className="my-10 border-t border-neutral-200" />

                    {/* Future Settings */}
                    <div className="space-y-2">
                        <button className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-neutral-100">
              <span className="text-sm font-medium text-neutral-700">
                Account
              </span>

                            <span className="text-neutral-400">&gt;</span>
                        </button>

                        <button className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-neutral-100">
              <span className="text-sm font-medium text-neutral-700">
                Settings
              </span>

                            <span className="text-neutral-400">&gt;</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-200 p-6">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </div>
            </aside>

            {/* Backdrop */}
            <button
                onClick={onClose}
                className="flex-1"
                aria-label="Close profile drawer"
            />
        </div>
    );
}