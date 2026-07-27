'use client';

import { useMemo, useState } from 'react';
import ActivityItem from './ActivityItem';
import { Clock, CalendarCheck, CalendarDays } from 'lucide-react';

export interface Transaction {
    id: number | string;
    type: 'sale' | 'stock' | 'expense';
    item: string;
    amount: number;
    brand: string;
    timestamp: string; // ISO String (e.g. "2026-07-26T10:30:00Z")
}

interface ActivityFeedProps {
    transactions: Transaction[];
}

export default function ActivityFeed({ transactions }: ActivityFeedProps) {
    const [showOnlyToday, setShowOnlyToday] = useState<boolean>(true);

    // Safe date comparator
    const filteredTransactions = useMemo(() => {
        if (!showOnlyToday) return transactions;

        const today = new Date();

        return transactions.filter((tx) => {
            const txDate = new Date(tx.timestamp);
            if (isNaN(txDate.getTime())) return true; // Show if date format can't be parsed

            return (
                txDate.getDate() === today.getDate() &&
                txDate.getMonth() === today.getMonth() &&
                txDate.getFullYear() === today.getFullYear()
            );
        });
    }, [transactions, showOnlyToday]);

    return (
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 backdrop-blur-md">
            {/* Header with Title & Filter Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                        Recent Activity
                    </h2>
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                        {filteredTransactions.length}
                    </span>
                </div>

                {/* Filter Switcher: Today vs All */}
                <div className="flex items-center gap-1 rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                    <button
                        type="button"
                        onClick={() => setShowOnlyToday(true)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            showOnlyToday
                                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                                : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <CalendarCheck className="h-3 w-3" />
                        Today
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowOnlyToday(false)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            !showOnlyToday
                                ? 'bg-neutral-800 text-white shadow-sm'
                                : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <CalendarDays className="h-3 w-3" />
                        All
                    </button>
                </div>
            </div>

            {/* List or Empty State */}
            <div className="mt-4 space-y-2.5">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                        <ActivityItem key={transaction.id} {...transaction} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800/60 text-neutral-500 mb-2">
                            <Clock className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-medium text-neutral-400">
                            {showOnlyToday
                                ? 'No activity logged today yet.'
                                : 'No recent activity found.'}
                        </p>
                        <p className="text-[11px] text-neutral-600 mt-0.5">
                            Sales, stock additions, and expenses will appear here.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}