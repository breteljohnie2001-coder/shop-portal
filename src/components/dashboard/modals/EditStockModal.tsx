'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { StockVariant } from '@/types/types';

export interface EditableStockVariant extends Omit<StockVariant, 'id'> {
    id?: string;
}

export interface EditableItem {
    id: string;
    name: string;
    price: number;
    sku?: string;
    quantity: number;

    // New stock breakdown
    variants?: EditableStockVariant[];

    // Extended POS properties
    paymentMethod?: 'M-Pesa' | 'Cash' | 'Card' | 'Bank Transfer';
    clientName?: string;
    purchasedAt?: string;
}

interface EditModalProps {
    isOpen: boolean;
    item: EditableItem | null;
    onClose: () => void;
    onSave: (updatedItem: EditableItem, reason: string) => void | Promise<void>;
}

interface GroupedVariantSize {
    id?: string;
    size: string;
    quantity: number;
}

interface ColorGroup {
    color: string;
    sizes: GroupedVariantSize[];
}

export default function EditStockModal({
                                           isOpen,
                                           item,
                                           onClose,
                                           onSave,
                                       }: EditModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState(0);

    const [paymentMethod, setPaymentMethod] = useState<
        'M-Pesa' | 'Cash' | 'Card' | 'Bank Transfer'
    >('M-Pesa');

    const [clientName, setClientName] = useState('');
    const [reason, setReason] = useState('');

    const [variants, setVariants] = useState<EditableStockVariant[]>([]);

    useEffect(() => {
        if (!item) return;

        setName(item.name);
        setPrice(item.price);
        setSku(item.sku || '');
        setQuantity(item.quantity);
        setPaymentMethod(item.paymentMethod || 'M-Pesa');
        setClientName(item.clientName || 'Walk-in Customer');
        setReason('');

        setVariants(
            (item.variants ?? []).map((variant) => ({
                id: variant.id,
                color: variant.color,
                size: variant.size,
                quantity: variant.quantity,
            }))
        );
    }, [item]);

    // Group flat variants array into UI color blocks
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
            group.sizes.push({ id: v.id, size: v.size, quantity: v.quantity });
        });

        return groups;
    }, [variants]);

    // Sync color groups back to state
    const updateFromGroups = (groups: ColorGroup[]) => {
        const flattened: EditableStockVariant[] = [];
        groups.forEach((g) => {
            g.sizes.forEach((s) => {
                flattened.push({
                    id: s.id,
                    color: g.color,
                    size: s.size,
                    quantity: s.quantity,
                });
            });
        });
        setVariants(flattened);
    };

    const addColorGroup = () => {
        const newGroups = [
            ...colorGroups,
            { color: '', sizes: [{ size: '', quantity: 0 }] },
        ];
        updateFromGroups(newGroups);
    };

    const removeColorGroup = (groupIndex: number) => {
        const newGroups = colorGroups.filter((_, i) => i !== groupIndex);
        updateFromGroups(newGroups);
    };

    const updateColorName = (groupIndex: number, newColor: string) => {
        const newGroups = colorGroups.map((g, i) =>
            i === groupIndex ? { ...g, color: newColor } : g
        );
        updateFromGroups(newGroups);
    };

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

    const updateSizeInGroup = (
        groupIndex: number,
        sizeIndex: number,
        field: keyof GroupedVariantSize,
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

    const removeSizeFromGroup = (groupIndex: number, sizeIndex: number) => {
        const newGroups = colorGroups
            .map((g, gIdx) => {
                if (gIdx === groupIndex) {
                    const updatedSizes = g.sizes.filter((_, sIdx) => sIdx !== sizeIndex);
                    return { ...g, sizes: updatedSizes };
                }
                return g;
            })
            .filter((g) => g.sizes.length > 0);

        updateFromGroups(newGroups);
    };

    const totalVariantQuantity = variants.reduce(
        (total, variant) => total + Math.max(0, Number(variant.quantity) || 0),
        0
    );

    const hasVariants = variants.length > 0;

    if (!isOpen || !item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            return;
        }

        const cleanedVariants = variants
            .map((variant) => ({
                ...variant,
                color: variant.color.trim(),
                size: variant.size.trim(),
                quantity: Math.max(0, Number(variant.quantity) || 0),
            }))
            .filter(
                (variant) => variant.color.length > 0 && variant.size.length > 0
            );

        const finalQuantity =
            cleanedVariants.length > 0
                ? cleanedVariants.reduce((total, variant) => total + variant.quantity, 0)
                : quantity;

        onSave(
            {
                ...item,
                name: name.trim(),
                price,
                sku,
                quantity: finalQuantity,
                paymentMethod,
                clientName,
                variants: cleanedVariants,
            },
            reason.trim()
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h3 className="text-base font-bold text-white">Edit Record</h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-stone-400 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Name */}
                    <div>
                        <label className="text-stone-400 font-medium">
                            Item / Description Name
                        </label>

                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                        />
                    </div>

                    {/* Quantity + Price */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-stone-400 font-medium">
                                {hasVariants ? 'Total Quantity' : 'Quantity'}
                            </label>

                            <input
                                type="number"
                                min="0"
                                required
                                value={hasVariants ? totalVariantQuantity : quantity}
                                disabled={hasVariants}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700 font-mono disabled:opacity-60"
                            />

                            {hasVariants && (
                                <p className="mt-1 text-[10px] text-stone-500">
                                    Calculated from color/size stock.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-stone-400 font-medium">Price (KES)</label>

                            <input
                                type="number"
                                min="0"
                                required
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700 font-mono"
                            />
                        </div>
                    </div>

                    {/* Stock Breakdown */}
                    <div className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-white">
                                    Stock Breakdown
                                </p>
                                <p className="text-[10px] text-stone-500 mt-0.5">
                                    Enter a color once, then add all sizes and quantities for it.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addColorGroup}
                                className="flex items-center gap-1 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1.5 text-[11px] text-stone-200 hover:bg-stone-700"
                            >
                                <Plus className="h-3 w-3" />
                                Add Color
                            </button>
                        </div>

                        {colorGroups.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-stone-800 px-3 py-5 text-center text-[11px] text-stone-500">
                                No color/size breakdown added.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {colorGroups.map((group, groupIdx) => (
                                    <div
                                        key={groupIdx}
                                        className="rounded-xl border border-stone-800/80 bg-stone-900 p-3 space-y-3"
                                    >
                                        {/* Color Header */}
                                        <div className="flex items-center justify-between gap-2 border-b border-stone-800/60 pb-2.5">
                                            <div className="flex items-center gap-2 flex-1">
                                                <Tag className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                                <input
                                                    type="text"
                                                    value={group.color}
                                                    onChange={(e) =>
                                                        updateColorName(groupIdx, e.target.value)
                                                    }
                                                    placeholder="COLOUR (E.G. RED, NAVY BLUE)"
                                                    className="w-full rounded-md border border-stone-800 bg-stone-950 px-2.5 py-1.5 text-xs font-medium text-white uppercase placeholder-stone-500 focus:border-stone-700 focus:outline-none"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeColorGroup(groupIdx)}
                                                title="Remove Color Group"
                                                className="rounded-md p-1.5 text-stone-500 hover:bg-stone-950 hover:text-rose-400 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* Sizes under this Color */}
                                        <div className="space-y-2 pl-1">
                                            {group.sizes.map((sizeRow, sizeIdx) => (
                                                <div
                                                    key={sizeRow.id ?? `size-${sizeIdx}`}
                                                    className="grid grid-cols-[1fr_90px_auto] gap-2 items-center"
                                                >
                                                    <div>
                                                        {sizeIdx === 0 && (
                                                            <label className="mb-1 block text-[10px] text-stone-500">
                                                                Size
                                                            </label>
                                                        )}
                                                        <input
                                                            type="text"
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
                                                            className="w-full rounded-lg border border-stone-800 bg-stone-950 px-2.5 py-1.5 text-xs text-white uppercase focus:border-stone-700 focus:outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        {sizeIdx === 0 && (
                                                            <label className="mb-1 block text-[10px] text-stone-500">
                                                                Qty
                                                            </label>
                                                        )}
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={sizeRow.quantity}
                                                            onChange={(e) =>
                                                                updateSizeInGroup(
                                                                    groupIdx,
                                                                    sizeIdx,
                                                                    'quantity',
                                                                    e.target.value === ''
                                                                        ? 0
                                                                        : Number(e.target.value)
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-stone-800 bg-stone-950 px-2.5 py-1.5 font-mono text-xs text-white focus:border-stone-700 focus:outline-none"
                                                        />
                                                    </div>

                                                    <div className={sizeIdx === 0 ? 'pt-4' : ''}>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSizeFromGroup(groupIdx, sizeIdx)
                                                            }
                                                            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20"
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
                                            className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 pl-1"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add size for this color
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sales Specific Metadata */}
                    {item.paymentMethod && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-stone-400 font-medium">
                                    Payment Method
                                </label>

                                <select
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value as
                                                | 'M-Pesa'
                                                | 'Cash'
                                                | 'Card'
                                                | 'Bank Transfer'
                                        )
                                    }
                                    className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                                >
                                    <option value="M-Pesa">M-Pesa</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-stone-400 font-medium">
                                    Client Name
                                </label>

                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                                />
                            </div>
                        </div>
                    )}

                    {/* SKU */}
                    {item.sku !== undefined && (
                        <div>
                            <label className="text-stone-400 font-medium">SKU Code</label>

                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700 font-mono"
                            />
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="text-stone-400 font-medium">
                            Reason for Edit (Audit Log)
                        </label>

                        <input
                            type="text"
                            required
                            placeholder="e.g. Corrected stock quantity..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-stone-700"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-stone-950 hover:bg-emerald-400 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}