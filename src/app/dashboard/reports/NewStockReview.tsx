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
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-rose-400" />
                        <h2 className="text-base font-bold text-white tracking-tight">
                            New Stock Review
                        </h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            ≤ 2 days · Low / Zero Movement
          </span>
                </div>

                <div className="mt-4 space-y-3">
                    {items.length > 0 ? (
                        items.map((item) => {
                            const brand = resolveBrand(item.brandId);

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 transition-all hover:border-neutral-700"
                                >
                                    {/* Image */}
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                                        {item.imageUrl ? (
                                            // Using unoptimized + fallback <img> pattern so it works
                                            // even if the domain is not yet in next.config.js
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                                onError={(e) => {
                                                    // hide broken image
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
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
                                            <span className="text-neutral-500">
                        {item.currentStock} in stock
                      </span>
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${brandBadgeClass(brand)}`}
                                            >
                        {brandLabel(brand)}
                      </span>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-400">
                      {item.qtySold === 0 ? '0 Sales' : `${item.qtySold} Sold`}
                    </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-neutral-500 italic py-4 text-center">
                            No sluggish new stock items found.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}