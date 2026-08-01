'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    PackageX,
    AlertTriangle,
    History,
    Calendar,
    ArrowDownRight,
    Sparkles,
    Flame,
    Loader2,
} from 'lucide-react';
import { useReportsData } from '@/hooks/useReportsData';

export default function ReportsPage() {
    const [selectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const { reportsData, loading } = useReportsData(selectedDate);

    if (loading || !reportsData) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    const {
        weeklyPerformance,
        top3FastMoving,
        newStockReview,
        restockingItems,
        slowest3Items,
        changeLogs,
    } = reportsData;

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Performance & Inventory Reports
                        </h1>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Effective Aug 1
                        </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                        Unified sales metrics, fast-moving items, and stock movement analysis
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{selectedDate}</span>
                    </div>
                </div>
            </div>

            {/* SECTION 1: Brand Comparison Chart */}
            <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                    <div>
                        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            Weekly Brand Performance
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            Daily sales comparison between brands
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="text-amber-400">Bee Trendy</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                            <span className="text-purple-400">Baddie Budget</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyPerformance} barGap={6}>
                            <XAxis
                                dataKey="day"
                                stroke="#737373"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#737373"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#171717',
                                    borderColor: '#262626',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                                formatter={(value) => [`KES ${Number(value ?? 0).toLocaleString()}`, '']}
                            />
                            <Bar
                                dataKey="beeTrendy"
                                name="Bee Trendy"
                                fill="#F59E0B"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="baddie"
                                name="Baddie Budget"
                                fill="#C084FC"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* GRID: Daily Fast-Moving & New Stock Review */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 2. Daily Fast-Moving Items Report */}
                <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                            <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4 text-amber-400" />
                                <h2 className="text-base font-bold text-white tracking-tight">
                                    Daily Fast-Moving Items
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                Top 3 Ranked
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            {top3FastMoving.length > 0 ? (
                                top3FastMoving.map((item, index) => {
                                    const rankBadge = [
                                        'bg-amber-400/20 text-amber-300 border-amber-400/40',
                                        'bg-neutral-300/20 text-neutral-200 border-neutral-300/40',
                                        'bg-amber-700/20 text-amber-500 border-amber-700/40',
                                    ][index];

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 transition-all hover:border-neutral-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold ${rankBadge}`}
                                                >
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">
                                                        {item.name}
                                                    </p>
                                                    <span
                                                        className={`mt-0.5 inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                                            item.brandId.includes('bee') || item.brandId === 'a'
                                                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                                                : 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                                                        }`}
                                                    >
                                                        {item.brandId.includes('bee') || item.brandId === 'a' ? 'Bee Trendy' : 'Baddie'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-mono text-xs font-semibold text-emerald-400">
                                                    {item.qtySold} units sold
                                                </p>
                                                <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
                                                    KES {item.revenue.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-neutral-500 italic py-4 text-center">
                                    No sales recorded for today.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. New Stock Review (Slow / Dead Arrivals) */}
                <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-rose-400" />
                                <h2 className="text-base font-bold text-white tracking-tight">
                                    New Stock Review
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                Low / Zero Movement
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            {newStockReview.length > 0 ? (
                                newStockReview.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 transition-all hover:border-neutral-700"
                                    >
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-[9px] text-neutral-600 font-mono">
                                                    NO IMG
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-100 truncate">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                                                <span>Added {item.addedDate}</span>
                                                <span>•</span>
                                                <span className="text-neutral-500">{item.currentStock} in stock</span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-400">
                                                {item.qtySold === 0 ? '0 Sales' : `${item.qtySold} Sold`}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-neutral-500 italic py-4 text-center">
                                    No sluggish new stock items found.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* SECTION 4: Weekly Saturday Stock Audit */}
            <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2">
                        <PackageX className="h-4 w-4 text-amber-400" />
                        <h2 className="text-base font-bold text-white tracking-tight">
                            Weekly Saturday Stock Audit
                        </h2>
                    </div>
                    <span className="text-xs font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                        Every Saturday Evening
                    </span>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Restock Urgency */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Needs Restocking (High Demand / Low Stock)
                        </h3>

                        <div className="space-y-2">
                            {restockingItems.length > 0 ? (
                                restockingItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
                                    >
                                        <div>
                                            <p className="font-medium text-neutral-200">{item.name}</p>
                                            <p className="text-[10px] text-neutral-400 mt-0.5">
                                                Brand {item.brandId.includes('bee') || item.brandId === 'a' ? 'Bee Trendy' : 'Baddie'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-amber-400">
                                                {item.currentStock} left
                                            </p>
                                            <p className="text-[10px] text-neutral-500">
                                                Threshold: {item.threshold}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-neutral-500 italic py-2">
                                    All inventory thresholds healthy.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Slowest Moving Items */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            Top 3 Slowest-Moving Items of the Week
                        </h3>

                        <div className="space-y-2">
                            {slowest3Items.length > 0 ? (
                                slowest3Items.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-neutral-500 font-mono text-[11px]">
                                                0{idx + 1}.
                                            </span>
                                            <p className="font-medium text-neutral-200">{item.name}</p>
                                        </div>
                                        <span className="font-mono text-neutral-400">
                                            {item.qtySold} sales this week
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-neutral-500 italic py-2">
                                    No stock sales data available for ranking.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: Changes Logs */}
            <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-emerald-400" />
                        <h2 className="text-base font-bold text-white tracking-tight">
                            Changes Logs & Audit Trail
                        </h2>
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">Real-time updates</span>
                </div>

                <div className="mt-4 overflow-x-auto">
                    {changeLogs.length > 0 ? (
                        <table className="w-full text-left text-xs">
                            <thead>
                            <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                                <th className="pb-3 pt-1 font-semibold">Time</th>
                                <th className="pb-3 pt-1 font-semibold">User</th>
                                <th className="pb-3 pt-1 font-semibold">Action</th>
                                <th className="pb-3 pt-1 font-semibold text-right">Details</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60">
                            {changeLogs.map((log) => (
                                <tr key={log.id} className="group hover:bg-neutral-950/40">
                                    <td className="py-3 font-mono text-neutral-500">{log.time}</td>
                                    <td className="py-3 font-medium text-neutral-200">{log.user}</td>
                                    <td className="py-3 text-neutral-300">{log.action}</td>
                                    <td className="py-3 text-right font-mono text-neutral-400 group-hover:text-emerald-400 transition-colors">
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-xs text-neutral-500 italic py-4 text-center">
                            No recent audit logs recorded.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}