'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
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

    if (!isOpen || !item) return null;

    const addVariant = () => {
        setVariants((prev) => [
            ...prev,
            {
                color: '',
                size: '',
                quantity: 0,
            },
        ]);
    };

    const updateVariant = (
        index: number,
        field: keyof EditableStockVariant,
        value: string | number
    ) => {
        setVariants((prev) =>
            prev.map((variant, i) =>
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
        setVariants((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const totalVariantQuantity = variants.reduce(
        (total, variant) => total + Math.max(0, Number(variant.quantity) || 0),
        0
    );

    const hasVariants = variants.length > 0;

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
                quantity: Math.max(
                    0,
                    Number(variant.quantity) || 0
                ),
            }))
            .filter(
                (variant) =>
                    variant.color.length > 0 &&
                    variant.size.length > 0
            );

        const finalQuantity =
            cleanedVariants.length > 0
                ? cleanedVariants.reduce(
                    (total, variant) => total + variant.quantity,
                    0
                )
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
                    <h3 className="text-base font-bold text-white">
                        Edit Record
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-stone-400 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 text-xs"
                >
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
                                {hasVariants
                                    ? 'Total Quantity'
                                    : 'Quantity'}
                            </label>

                            <input
                                type="number"
                                min="0"
                                required
                                value={
                                    hasVariants
                                        ? totalVariantQuantity
                                        : quantity
                                }
                                disabled={hasVariants}
                                onChange={(e) =>
                                    setQuantity(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700 font-mono disabled:opacity-60"
                            />

                            {hasVariants && (
                                <p className="mt-1 text-[10px] text-stone-500">
                                    Calculated from color/size stock.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-stone-400 font-medium">
                                Price (KES)
                            </label>

                            <input
                                type="number"
                                min="0"
                                required
                                value={price}
                                onChange={(e) =>
                                    setPrice(
                                        Number(e.target.value)
                                    )
                                }
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
                                    Define the available size and quantity for each colour.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1.5 text-[11px] text-stone-200 hover:bg-stone-700"
                            >
                                <Plus className="h-3 w-3" />
                                Add
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-stone-800 px-3 py-5 text-center text-[11px] text-stone-500">
                                No color/size breakdown added.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {variants.map((variant, index) => (
                                    <div
                                        key={
                                            variant.id ??
                                            `new-${index}`
                                        }
                                        className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-end"
                                    >
                                        <div>
                                            <label className="text-[10px] text-stone-500">
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
                                                className="w-full mt-1 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-stone-500">
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
                                                className="w-full mt-1 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-stone-500">
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
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-full mt-1 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-stone-700"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeVariant(index)
                                            }
                                            className="h-9 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 text-rose-400 hover:bg-rose-500/20"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
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
                                    <option value="M-Pesa">
                                        M-Pesa
                                    </option>
                                    <option value="Cash">
                                        Cash
                                    </option>
                                    <option value="Card">
                                        Card
                                    </option>
                                    <option value="Bank Transfer">
                                        Bank Transfer
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-stone-400 font-medium">
                                    Client Name
                                </label>

                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) =>
                                        setClientName(e.target.value)
                                    }
                                    className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                                />
                            </div>
                        </div>
                    )}

                    {/* SKU */}
                    {item.sku !== undefined && (
                        <div>
                            <label className="text-stone-400 font-medium">
                                SKU Code
                            </label>

                            <input
                                type="text"
                                value={sku}
                                onChange={(e) =>
                                    setSku(e.target.value)
                                }
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
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
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