'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    userRole: string;
}

export default function ProfileDrawer({
                                          isOpen,
                                          onClose,
                                          userEmail,
                                          userRole,
                                      }: ProfileDrawerProps) {
    const [notifications, setNotifications] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    if (!isOpen) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-sm">
            <div className="w-80 h-full bg-white p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-lg font-bold text-slate-800">Account Profile</h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="mt-6 space-y-3">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{userEmail}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Role</p>
                            <span className="inline-block mt-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                {userRole}
              </span>
                        </div>
                    </div>

                    <hr className="my-6 border-slate-100" />

                    {/* Preferences */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Low Stock Alerts</span>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                notifications ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                        >
              <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition"
                >
                    Sign Out
                </button>
            </div>

            {/* Backdrop tap area */}
            <div className="flex-1" onClick={onClose} />
        </div>
    );
}