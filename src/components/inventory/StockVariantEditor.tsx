'use client';

import { Plus, Trash2 } from 'lucide-react';

export interface StockVariantInput {
    color: string;
    size: string;
    quantity: number;
}

interface StockVariantEditorProps {
    variants: StockVariantInput[];
    onChange: (variants: StockVariantInput[]) => void;
    disabled?: boolean;
}

export default function StockVariantEditor({
                                               variants,
                                               onChange,
                                               disabled = false,
                                           }: StockVariantEditorProps) {
    const addVariant = () => {
        onChange([
            ...variants,
            {
                color: '',
                size: '',
                quantity: 0,
            },
        ]);
    };

    const updateVariant = (
        index: number,
        field: keyof StockVariantInput,
        value: string | number
    ) => {
        onChange(
            variants.map((variant, i) =>
                i === index
                    ? {
                        ...variant,
                        [field]: value,
                    }
                    : variant
            )
        );
    };

    const removeVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index));
    };

    const totalQuantity = variants.reduce(
        (total, variant) =>
            total + Math.max(0, Number(variant.quantity) || 0),
        0
    );

    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-white">
                        Stock Breakdown
                    </p>

                    <p className="mt-0.5 text-[10px] text-neutral-500">
                        Add each colour, size and quantity separately.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={addVariant}
                    disabled={disabled}
                    className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-[11px] text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
                >
                    <Plus className="h-3 w-3" />
                    Add
                </button>
            </div>

            {variants.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 px-3 py-5 text-center text-[11px] text-neutral-500">
                    No stock combinations added yet.
                </div>
            ) : (
                <div className="space-y-2">
                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-end"
                        >
                            <div>
                                <label className="text-[10px] text-neutral-500">
                                    Colour
                                </label>

                                <input
                                    type="text"
                                    value={variant.color}
                                    onChange={(e) =>
                                        updateVariant(
                                            index,
                                            'color',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Red"
                                    disabled={disabled}
                                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-neutral-700 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-neutral-500">
                                    Size
                                </label>

                                <input
                                    type="text"
                                    value={variant.size}
                                    onChange={(e) =>
                                        updateVariant(
                                            index,
                                            'size',
                                            e.target.value
                                        )
                                    }
                                    placeholder="M"
                                    disabled={disabled}
                                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-neutral-700 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-neutral-500">
                                    Qty
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={variant.quantity}
                                    onChange={(e) =>
                                        updateVariant(
                                            index,
                                            'quantity',
                                            e.target.value === ''
                                                ? 0
                                                : Number(e.target.value)
                                        )
                                    }
                                    disabled={disabled}
                                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-700 disabled:opacity-50"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                disabled={disabled}
                                className="h-9 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-[11px] text-neutral-500">
                    Total Quantity
                </span>

                <span className="font-mono text-sm font-bold text-white">
                    {totalQuantity}
                </span>
            </div>
        </div>
    );
}