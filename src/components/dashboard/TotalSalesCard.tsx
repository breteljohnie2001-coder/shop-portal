'use client';

import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import TotalSalesBreakdownModal from './modals/TotalSalesBreakdownModal';

interface TotalSalesCardProps {
    totalSales: number;
    brandASales?: number;
    brandBSales?: number;
    expenses?: number;
    percentageChange?: number;
    sparklineData?: { value: number }[];
}

export default function TotalSalesCard({
                                           totalSales,
                                           brandASales = 0,
                                           brandBSales = 0,
                                           expenses = 0,
                                           percentageChange = 12,
                                           sparklineData = [],
                                       }: TotalSalesCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate Net Sales for Today
    const grossSales = totalSales > 0 ? totalSales : (brandASales + brandBSales);
    const netTotalSales = grossSales - expenses;

    return (
        <>
            <section
                onClick={() => setIsModalOpen(true)}
                className="group cursor-pointer rounded-2xl border border-neutral-800/80 bg-neutral-900 p-5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40"
            >
                {/* Top Row: Label & Percentage Badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors group-hover:text-neutral-300">
                            Today's Net Sales
                        </p>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                            Today
                        </span>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        <span>↑ {percentageChange}%</span>
                    </div>
                </div>

                {/* Bottom Row: Amount & Sparkline Chart */}
                <div className="mt-4 flex items-end justify-between gap-4">
                    {/* Sales Amount Column */}
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 font-mono">
                            <span className="text-sm font-semibold text-neutral-400 mr-2 font-sans">
                                KES
                            </span>
                            {netTotalSales.toLocaleString()}
                        </h1>

                        <p className="mt-1 text-xs text-neutral-500 transition-colors group-hover:text-emerald-400">
                            Click for today's breakdown →
                        </p>
                    </div>

                    {/* Mini Sparkline Chart */}
                    <div className="h-10 w-28 shrink-0 pointer-events-none">
                        {sparklineData.length > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sparklineData}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#34D399"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            {/* Breakdown Modal */}
            <TotalSalesBreakdownModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                brandASales={brandASales}
                brandBSales={brandBSales}
                expenses={expenses}
            />
        </>
    );
}