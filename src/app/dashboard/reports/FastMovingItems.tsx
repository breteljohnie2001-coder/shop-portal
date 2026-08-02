'use client';

import { Flame } from 'lucide-react';
import { FastMovingItem } from '@/types/types';
import { resolveBrand, brandLabel, brandBadgeClass } from '@/lib/brands';

interface Props {
  items: FastMovingItem[];
}

export function FastMovingItems({ items }: Props) {
  return (
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
          {items.length > 0 ? (
            items.map((item, index) => {
              const brand = resolveBrand(item.brandId);
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
                        className={`mt-0.5 inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${brandBadgeClass(brand)}`}
                      >
                        {brandLabel(brand)}
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
  );
}