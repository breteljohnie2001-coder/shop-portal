'use client';

import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { createClient } from '@supabase/supabase-js'; // Assuming supabase client is set up
import ProfileDrawer from '@/components/ProfileDrawer';

// Placeholder for real Supabase client (configure in lib/supabase.ts)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
    email: string;
    role: 'Boss' | 'Employee A' | 'Employee B';
}

interface Transaction {
    id: number;
    type: 'sale' | 'stock' | 'expense';
    item: string;
    amount: number;
    brand: 'A' | 'B';
    timestamp: string;
    created_by: string;
}

function ActionButton({ label, icon, onClick, color = 'bg-blue-600' }: {
    label: string;
    icon: string;
    onClick: () => void;
    color?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center py-4 ${color} text-white rounded-3xl shadow active:scale-95 transition-transform`}
        >
            <div className="text-3xl mb-2">{icon}</div>
            <span className="text-sm font-semibold">{label}</span>
        </button>
    );
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'home' | 'insights'>('home');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalSales, setTotalSales] = useState(42500);
    const [brandASales, setBrandASales] = useState(28000);
    const [brandBSales, setBrandBSales] = useState(14500);

    // Mock auth - replace with real Supabase auth
    useEffect(() => {
        const mockUser: User = {
            email: 'boss@email.com',
            role: 'Boss'
        };
        setUser(mockUser);

        // Fetch recent activity (placeholder)
        setTransactions([
            { id: 1, type: 'sale', item: 'Product X - Size M', amount: 1250, brand: 'A', timestamp: '2m ago', created_by: 'boss@email.com' },
            { id: 2, type: 'stock', item: 'Restock Y', amount: 500, brand: 'B', timestamp: '15m ago', created_by: 'employeeB@email.com' },
            { id: 3, type: 'expense', item: 'Marketing', amount: -320, brand: 'A', timestamp: '1h ago', created_by: 'boss@email.com' },
        ]);
    }, []);

    const handlers = useSwipeable({
        onSwipedLeft: () => setActiveTab('insights'),
        onSwipedRight: () => setActiveTab('home'),
        trackMouse: false,
    });

    const openModal = (type: 'sale' | 'stock' | 'expense') => {
        alert(`Opening ${type} modal - implement form with Supabase insert here`);
        // TODO: Implement modal with brand selector based on role
    };

    const getBrandColor = (brand: 'A' | 'B') => brand === 'A' ? 'bg-emerald-500' : 'bg-rose-500';

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 overflow-hidden">
            {/* Top Bar */}
            <div className="sticky top-0 bg-white border-b z-20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow"
                    >
                        {user?.email?.[0]?.toUpperCase() || 'B'}
                    </button>
                    <div>
                        <p className="font-semibold text-sm">{user?.email}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                </div>

                <div className="flex gap-2 text-xs font-medium">
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Brand A</div>
                    <div className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full">Brand B</div>
                </div>
            </div>

            <div {...handlers} className="px-4 pt-4">
                {/* HOME SCREEN */}
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        {/* Total Combined Sales Card */}
                        <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-black p-6 text-white shadow-xl">
                            <p className="text-sm opacity-75">Total Combined Sales</p>
                            <h1 className="text-5xl font-bold mt-2 tracking-tighter">${totalSales.toLocaleString()}</h1>

                            <div className="mt-6 flex gap-4">
                                <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                        <span className="text-xs opacity-75">Brand A</span>
                                    </div>
                                    <p className="text-2xl font-semibold mt-1">${brandASales.toLocaleString()}</p>
                                </div>
                                <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                                        <span className="text-xs opacity-75">Brand B</span>
                                    </div>
                                    <p className="text-2xl font-semibold mt-1">${brandBSales.toLocaleString()}</p>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="grid grid-cols-3 gap-3">
                            <ActionButton
                                label="Record Sale"
                                icon="💰"
                                onClick={() => openModal('sale')}
                            />
                            <ActionButton
                                label="Add Stock"
                                icon="📦"
                                onClick={() => openModal('stock')}
                                color="bg-emerald-600"
                            />
                            <ActionButton
                                label="Log Expense"
                                icon="📉"
                                onClick={() => openModal('expense')}
                                color="bg-amber-600"
                            />
                        </section>

                        {/* Live Activity Feed */}
                        <section className="bg-white rounded-3xl p-5 shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">Live Activity</h3>
                                <button className="text-blue-600 text-sm">See all</button>
                            </div>

                            <div className="space-y-4">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex items-start justify-between border-b pb-3 last:border-none">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block w-5 h-5 rounded-full text-xs flex items-center justify-center text-white ${getBrandColor(tx.brand)}`}>
                                                    {tx.brand}
                                                </span>
                                                <span className="font-medium capitalize">{tx.type}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-0.5">{tx.item}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">{tx.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* INSIGHTS SCREEN */}
                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold px-1">Insights</h2>

                        {/* Revenue Share */}
                        <div className="bg-white rounded-3xl p-6 shadow">
                            <h3 className="font-semibold mb-4">Brand Revenue Share</h3>
                            <div className="flex items-center gap-8">
                                <div className="flex-1">
                                    <div className="h-2 bg-emerald-500 rounded-full mb-2"></div>
                                    <p className="text-center font-medium">Brand A <span className="text-emerald-600">66%</span></p>
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 bg-rose-500 rounded-full mb-2"></div>
                                    <p className="text-center font-medium">Brand B <span className="text-rose-600">34%</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Health */}
                        <div className="bg-white rounded-3xl p-6 shadow">
                            <h3 className="font-semibold mb-4">Inventory Health</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>Low Stock Alerts</div>
                                    <div className="text-orange-600 font-medium">3 items</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>Dead Stock</div>
                                    <div className="text-red-600 font-medium">2 products</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>Total Shelf Value</div>
                                    <div className="font-semibold">$18,450</div>
                                </div>
                            </div>
                        </div>

                        {/* Sales Trend (Placeholder Chart) */}
                        <div className="bg-white rounded-3xl p-6 shadow">
                            <h3 className="font-semibold mb-4">Sales Trend (Last 7 Days)</h3>
                            <div className="h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-2xl flex items-end justify-around p-4">
                                {/* Simple bars */}
                                {[45, 62, 38, 75, 55, 80, 68].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1">
                                        <div className="w-full bg-blue-500 rounded-t" style={{ height: `${h}%` }}></div>
                                        <div className="text-[10px] text-gray-500">D{i+1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Drawer */}
            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                userEmail={user?.email || ''}
                userRole={user?.role || ''}
            />
        </div>
    );
}