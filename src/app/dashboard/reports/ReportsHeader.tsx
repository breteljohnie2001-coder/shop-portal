'use client';

import { Calendar } from 'lucide-react';
import { BrandKey } from '@/lib/brands';

interface ReportsHeaderProps {
    selectedDate: string;
    brandFilter: BrandKey;
    onBrandChange: (brand: BrandKey) => void;
}

export function ReportsHeader({
                                  selectedDate,
                                  brandFilter,
                                  onBrandChange,
                              }: ReportsHeaderProps) {
    return (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-6">

            {/* Left Side: Title & Subtitle */}
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Performance & Inventory Reports
                    </h1>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400">
                Effective Aug 1
            </span>
                </div>
                <p className="mt-1.5 text-xs text-neutral-400">
                    Unified sales metrics, fast-moving items, and stock movement analysis
                </p>
            </div>

            {/* Right Side: Actions (Date & Toggle) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">

                {/* Date */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900/50 border border-neutral-800 px-4 py-2 text-xs text-neutral-300 font-mono">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>{selectedDate}</span>
                </div>

                {/* Brand Toggle */}
                <div className="flex items-center rounded-xl border border-neutral-800/80 bg-neutral-950 p-1 gap-1">
                    <button
                        onClick={() => onBrandChange('bee_trendy')}
                        className={`flex-1 sm:flex-none rounded-lg px-4 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                            brandFilter === 'bee_trendy'
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                        }`}
                    >
                        Bee Trendy Collection
                    </button>
                    <button
                        onClick={() => onBrandChange('baddie')}
                        className={`flex-1 sm:flex-none rounded-lg px-4 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                            brandFilter === 'baddie'
                                ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                        }`}
                    >
                        Baddie on a Budget
                    </button>
                </div>

            </div>
        </div>
    );
}