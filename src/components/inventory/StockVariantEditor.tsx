'use client';

import { useMemo } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

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

interface SizeQtyPair {
    size: string;
    quantity: number;
}

interface ColorGroup {
    color: string;
    sizes: SizeQtyPair[];
}

export default function StockVariantEditor({
                                               variants,
                                               onChange,
                                               disabled = false,
                                           }: StockVariantEditorProps) {
    // 1. Group flat variants array into UI color blocks
    const colorGroups = useMemo(() => {
        const groups: ColorGroup[] = [];

        variants.forEach((v) => {
            let group = groups.find(
                (g) => g.color.toLowerCase() === v.color.toLowerCase()
            );
            if (!group) {
                group = { color: v.color, sizes: [] };
                groups.push(group);
            }
            group.sizes.push({ size: v.size, quantity: v.quantity });
        });

        return groups;
    }, [variants]);

    // Helper to sync changes back to flat StockVariantInput[] format
    const updateFromGroups = (groups: ColorGroup[]) => {
        const flattened: StockVariantInput[] = [];
        groups.forEach((g) => {
            g.sizes.forEach((s) => {
                flattened.push({
                    color: g.color,
                    size: s.size,
                    quantity: s.quantity,
                });
            });
        });
        onChange(flattened);
    };

    // Add a new empty color block with 1 default size row
    const addColorGroup = () => {
        const newGroups = [
            ...colorGroups,
            { color: '', sizes: [{ size: '', quantity: 0 }] },
        ];
        updateFromGroups(newGroups);
    };

    // Remove an entire color group
    const removeColorGroup = (groupIndex: number) => {
        const newGroups = colorGroups.filter((_, i) => i !== groupIndex);
        updateFromGroups(newGroups);
    };

    // Update color name for a group
    const updateColorName = (groupIndex: number, newColor: string) => {
        const newGroups = colorGroups.map((g, i) =>
            i === groupIndex ? { ...g, color: newColor } : g
        );
        updateFromGroups(newGroups);
    };

    // Add a size row to a specific color group
    const addSizeToGroup = (groupIndex: number) => {
        const newGroups = colorGroups.map((g, i) => {
            if (i === groupIndex) {
                return {
                    ...g,
                    sizes: [...g.sizes, { size: '', quantity: 0 }],
                };
            }
            return g;
        });
        updateFromGroups(newGroups);
    };

    // Update specific size/quantity in a group
    const updateSizeInGroup = (
        groupIndex: number,
        sizeIndex: number,
        field: keyof SizeQtyPair,
        value: string | number
    ) => {
        const newGroups = colorGroups.map((g, gIdx) => {
            if (gIdx === groupIndex) {
                const updatedSizes = g.sizes.map((s, sIdx) =>
                    sIdx === sizeIndex ? { ...s, [field]: value } : s
                );
                return { ...g, sizes: updatedSizes };
            }
            return g;
        });
        updateFromGroups(newGroups);
    };

    // Remove a size row from a specific color group
    const removeSizeFromGroup = (groupIndex: number, sizeIndex: number) => {
        const newGroups = colorGroups
            .map((g, gIdx) => {
                if (gIdx === groupIndex) {
                    const updatedSizes = g.sizes.filter((_, sIdx) => sIdx !== sizeIndex);
                    return { ...g, sizes: updatedSizes };
                }
                return g;
            })
            .filter((g) => g.sizes.length > 0); // Cleanup empty color groups

        updateFromGroups(newGroups);
    };

    const totalQuantity = useMemo(
        () =>
            variants.reduce(
                (total, v) => total + Math.max(0, Number(v.quantity) || 0),
                0
            ),
        [variants]
    );

    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-white">Stock Breakdown</p>
                    <p className="mt-0.5 text-[10px] text-neutral-500">
                        Enter a color once, then add all sizes and quantities for it.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={addColorGroup}
                    disabled={disabled}
                    className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-[11px] font-medium text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
                >
                    <Plus className="h-3 w-3" />
                    Add Color
                </button>
            </div>

            {colorGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 px-3 py-6 text-center text-[11px] text-neutral-500">
                    No stock variants added yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {colorGroups.map((group, groupIdx) => (
                        <div
                            key={groupIdx}
                            className="rounded-xl border border-neutral-800/80 bg-neutral-950 p-3 space-y-3"
                        >
                            {/* Color Header */}
                            <div className="flex items-center justify-between gap-2 border-b border-neutral-800/60 pb-2.5">
                                <div className="flex items-center gap-2 flex-1">
                                    <Tag className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                    <input
                                        type="string" enterKeyHint="next"
                                        value={group.color}
                                        onChange={(e) => updateColorName(groupIdx, e.target.value)}
                                        placeholder="COLOUR (E.G. RED, NAVY BLUE)"
                                        disabled={disabled}
                                        className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white uppercase placeholder-neutral-500 focus:border-neutral-700 focus:outline-none disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeColorGroup(groupIdx)}
                                    disabled={disabled}
                                    title="Remove Color Group"
                                    className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-900 hover:text-rose-400 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Sizes under this Color */}
                            <div className="space-y-2 pl-1">
                                {group.sizes.map((sizeRow, sizeIdx) => (
                                    <div
                                        key={sizeIdx}
                                        className="grid grid-cols-[1fr_90px_auto] gap-2 items-center"
                                    >
                                        <div>
                                            {sizeIdx === 0 && (
                                                <label className="mb-1 block text-[10px] text-neutral-500">
                                                    Size
                                                </label>
                                            )}
                                            <input
                                                type="string" enterKeyHint="next"
                                                value={sizeRow.size}
                                                onChange={(e) =>
                                                    updateSizeInGroup(
                                                        groupIdx,
                                                        sizeIdx,
                                                        'size',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="M"
                                                disabled={disabled}
                                                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-white uppercase focus:border-neutral-700 focus:outline-none disabled:opacity-50"
                                            />
                                        </div>

                                        <div>
                                            {sizeIdx === 0 && (
                                                <label className="mb-1 block text-[10px] text-neutral-500">
                                                    Qty
                                                </label>
                                            )}
                                            <input
                                                type="number"
                                                enterKeyHint="done"
                                                min="0"
                                                value={sizeRow.quantity}
                                                onChange={(e) =>
                                                    updateSizeInGroup(
                                                        groupIdx,
                                                        sizeIdx,
                                                        'quantity',
                                                        e.target.value === '' ? 0 : Number(e.target.value)
                                                    )
                                                }
                                                disabled={disabled}
                                                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-xs text-white focus:border-neutral-700 focus:outline-none disabled:opacity-50"
                                            />
                                        </div>

                                        <div className={sizeIdx === 0 ? 'pt-4' : ''}>
                                            <button
                                                type="button"
                                                onClick={() => removeSizeFromGroup(groupIdx, sizeIdx)}
                                                disabled={disabled}
                                                className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Size to this Color Button */}
                            <button
                                type="button"
                                onClick={() => addSizeToGroup(groupIdx)}
                                disabled={disabled}
                                className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 pl-1"
                            >
                                <Plus className="h-3 w-3" />
                                Add size for this color
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Total */}
            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-[11px] text-neutral-500">Total Quantity</span>
                <span className="font-mono text-sm font-bold text-white">
          {totalQuantity}
        </span>
            </div>
        </div>
    );
}