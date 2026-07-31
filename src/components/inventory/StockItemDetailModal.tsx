'use client';

import { X } from 'lucide-react';
import { StockItem } from '@/types/types';

interface StockItemDetailModalProps {
    isOpen: boolean;
    item: StockItem | null;
    onClose: () => void;
}

export default function StockItemDetailModal({
                                                 isOpen,
                                                 item,
                                                 onClose,
                                             }: StockItemDetailModalProps) {
    if (!isOpen || !item) return null;

    const groupedVariants = item.variants.reduce<
        Record<string, typeof item.variants>
    >((groups, variant) => {
        if (!groups[variant.color]) {
            groups[variant.color] = [];
        }

        groups[variant.color].push(variant);

        return groups;
    }, {});

    const totalVariantQuantity = item.variants.reduce(
        (total, variant) => total + variant.quantity,
        0
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-stone-800">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {item.name}
                        </h2>

                        <p className="text-xs text-stone-400 font-mono mt-1">
                            KES {item.price.toLocaleString()}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full bg-stone-800 p-2 text-stone-400 hover:bg-stone-700 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {item.variants.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-stone-800 p-8 text-center">
                            <p className="text-sm text-stone-500">
                                No detailed stock breakdown available.
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedVariants).map(
                            ([color, variants]) => (
                                <div key={color} className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                                        {color}
                                    </h3>

                                    <div className="overflow-hidden rounded-xl border border-stone-800">
                                        {variants.map((variant) => (
                                            <div
                                                key={variant.id}
                                                className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-stone-800"
                                            >
                                                <span className="text-sm text-stone-300">
                                                    {variant.size}
                                                </span>

                                                <span className="font-mono text-sm font-bold text-white">
                                                    {variant.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )
                    )}

                    <div className="flex items-center justify-between rounded-xl bg-stone-800/60 border border-stone-700/60 px-4 py-3">
                        <span className="text-sm font-semibold text-stone-300">
                            Total Stock
                        </span>

                        <span className="font-mono text-sm font-bold text-white">
                            {totalVariantQuantity}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}