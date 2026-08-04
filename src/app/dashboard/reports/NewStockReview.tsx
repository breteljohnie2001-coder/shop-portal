'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { NewStockReviewItem } from '@/types/types';
import { resolveBrand, brandLabel, brandBadgeClass } from '@/lib/brands';

interface Props {
    items: NewStockReviewItem[];
}

export function NewStockReview({ items }: Props) {
    return (
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-rose-400" />
                        <h2 className="text-base font-bold text-white tracking-tight">
                            New Stock Review
                        </h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full shrink-0">
                ≤ 2 days · Low / Zero Movement
            </span>
                </div>

                {/* Stock Items List */}
                <div className="mt-4 space-y-3">
                    {items.length > 0 ? (
                        items.map((item) => {
                            const brand = resolveBrand(item.brandId);

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 transition-all hover:border-neutral-700"
                                >
                                    {/* Product Thumbnail */}
                                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 mt-0.5">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[9px] text-neutral-600 font-mono">
                                                NO IMG
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Details */}
                                    <div className="min-w-0 flex-1">
                                        {/* Row 1: Item Name & Brand Badge */}
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                            <p
                                                className="text-sm font-semibold text-neutral-100 truncate min-w-0 flex-1"
                                                title={item.name}
                                            >
                                                {item.name}
                                            </p>
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 ${brandBadgeClass(brand)}`}
                                            >
                                        {brandLabel(brand)}
                                    </span>
                                        </div>

                                        {/* Row 2: Date, Stock, and Sales Badge (All in one line) */}
                                        <div className="flex items-center gap-2 mt-1 min-w-0">
                                    <span className="text-[11px] text-neutral-400 shrink-0">
                                        Added {item.addedDate}
                                    </span>
                                            <span className="text-neutral-700 text-[10px] shrink-0">•</span>
                                            <span className="text-[11px] text-neutral-500 shrink-0 font-mono">
                                        {item.currentStock} in stock
                                    </span>

                                            {/* Sales Count Badge aligned to the far right */}
                                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400 shrink-0 ml-auto">
                                        {item.qtySold === 0 ? '0 Sales' : `${item.qtySold} Sold`}
                                    </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-neutral-500 italic py-6 text-center">
                            No sluggish new stock items found.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}