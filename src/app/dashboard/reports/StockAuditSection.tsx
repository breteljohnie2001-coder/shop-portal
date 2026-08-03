'use client';

import { PackageX, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { RestockAlertItem, SlowMovingItem } from '@/types/types';
import { resolveBrand, brandLabel } from '@/lib/brands';

interface Props {
    restocking: RestockAlertItem[];
    slowest: SlowMovingItem[];
}

export function StockAuditSection({ restocking, slowest }: Props) {
    return (
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                <div className="flex items-center gap-2">
                    <PackageX className="h-4 w-4 text-amber-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                        Weekly Saturday Stock Audit
                    </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
          Saturday from 4:00 PM
        </span>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restock */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Needs Restocking (High Demand / Low Stock)
                    </h3>

                    <div className="space-y-2">
                        {restocking.length > 0 ? (
                            restocking.map((item) => {
                                const brand = resolveBrand(item.brandId);
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
                                    >
                                        <div>
                                            <p className="font-medium text-neutral-200">{item.name}</p>
                                            <p className="text-[10px] text-neutral-400 mt-0.5">
                                                {brandLabel(brand)}
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
                                );
                            })
                        ) : (
                            <p className="text-xs text-neutral-500 italic py-2">
                                All inventory thresholds healthy.
                            </p>
                        )}
                    </div>
                </div>

                {/* Slowest */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        Top 3 Slowest-Moving Items of the Week
                    </h3>

                    <div className="space-y-2">
                        {slowest.length > 0 ? (
                            slowest.map((item, idx) => (
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
    );
}