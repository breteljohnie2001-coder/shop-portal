'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { WeeklyBrandPerformance } from '@/types/types';

interface Props {
    data: WeeklyBrandPerformance[];
}

export function WeeklyBrandChart({ data }: Props) {
    return (
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
                    <BarChart data={data} barGap={6}>
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
                            formatter={(value) => [
                                `KES ${Number(value ?? 0).toLocaleString()}`,
                                '',
                            ]}
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
    );
}