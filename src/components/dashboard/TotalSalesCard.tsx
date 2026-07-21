'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface TotalSalesCardProps {
    totalSales: number;
    percentageChange?: number;
    sparklineData?: { value: number }[];
}

// Default sparkline trend data if none is provided
const defaultSparkline = [
    { value: 20 },
    { value: 15 },
    { value: 18 },
    { value: 14 },
    { value: 10 },
    { value: 22 },
    { value: 19 },
    { value: 28 },
    { value: 24 },
    { value: 26 },
    { value: 12 },
    { value: 12 },
];

export default function TotalSalesCard({
                                           totalSales,
                                           percentageChange = 12,
                                           sparklineData = defaultSparkline,
                                       }: TotalSalesCardProps) {
    return (
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900 p-5 shadow-md transition-all duration-300 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40">
            {/* Top Row: Label & Percentage Badge */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Total Sales
                </p>

                {/* Percentage Growth Badge */}
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
                        {totalSales.toLocaleString()}
                    </h1>

                    <p className="mt-1 text-xs text-neutral-500">
                        Updated just now
                    </p>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="h-10 w-28 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#34D399" /* Emerald green line */
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}