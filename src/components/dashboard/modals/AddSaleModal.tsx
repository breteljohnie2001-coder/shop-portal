'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    X,
    Smartphone,
    Banknote,
    ShoppingBag,
    Calculator,
    Plus,
    Trash2,
    Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface InventoryItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    sizes: string[] | null;
    colors: string[] | null;
}

interface SaleLine {
    id: string; // client-side key
    inventoryId: string;
    itemName: string;
    availableQty: number;
    sizes: string[] | null;
    colors: string[] | null;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
    unitPrice: number;
}

interface AddSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

export default function AddSaleModal({ isOpen, onClose, onSaveSuccess }: AddSaleModalProps) {
    const [clientName, setClientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Cash'>('M-Pesa');
    const [brandId, setBrandId] = useState<'brand_a' | 'brand_b' | null>(null);
    const [isBrandLocked, setIsBrandLocked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [lines, setLines] = useState<SaleLine[]>([]);

    // ─── Reset modal state on close/open ───────────────────────────────────────
    const resetForm = () => {
        setClientName('');
        setLines([]);
        setPaymentMethod('M-Pesa');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // ─── Load user brand + profile ──────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        async function init() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, assigned_brand')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'boss' || profile?.role === 'owner' || !profile?.assigned_brand) {
                    setBrandId('brand_a');
                    setIsBrandLocked(false);
                } else {
                    const assigned = String(profile.assigned_brand).toLowerCase() as 'brand_a' | 'brand_b';
                    setBrandId(assigned);
                    setIsBrandLocked(true);
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [isOpen]);

    // ─── Load inventory whenever brand changes ────────────────────────────────
    useEffect(() => {
        if (!isOpen || !brandId) return;

        async function loadInventory() {
            const { data, error } = await supabase
                .from('inventory')
                .select('id, name, price, quantity, sizes, colors')
                .eq('brand_id', brandId)
                .gt('quantity', 0)
                .order('name');

            if (error) {
                console.error('Inventory fetch error:', error.message);
                return;
            }

            setInventory(data || []);
            setLines([]); // Clear cart items when switching brand
        }

        loadInventory();
    }, [isOpen, brandId]);

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const totalAmount = useMemo(() => {
        return lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    }, [lines]);

    const addLine = () => {
        if (inventory.length === 0) return;

        const first = inventory[0];
        setLines((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                inventoryId: first.id,
                itemName: first.name,
                availableQty: first.quantity,
                sizes: first.sizes,
                colors: first.colors,
                selectedSize: first.sizes?.[0] ?? '',
                selectedColor: first.colors?.[0] ?? '',
                quantity: 1,
                unitPrice: Number(first.price),
            },
        ]);
    };

    const removeLine = (id: string) => {
        setLines((prev) => prev.filter((l) => l.id !== id));
    };

    const updateLine = (id: string, patch: Partial<SaleLine>) => {
        setLines((prev) =>
            prev.map((l) => {
                if (l.id !== id) return l;

                if (patch.inventoryId && patch.inventoryId !== l.inventoryId) {
                    const item = inventory.find((i) => i.id === patch.inventoryId);
                    if (!item) return l;

                    return {
                        ...l,
                        inventoryId: item.id,
                        itemName: item.name,
                        availableQty: item.quantity,
                        sizes: item.sizes,
                        colors: item.colors,
                        selectedSize: item.sizes?.[0] ?? '',
                        selectedColor: item.colors?.[0] ?? '',
                        unitPrice: Number(item.price),
                        quantity: Math.min(l.quantity, item.quantity),
                    };
                }

                if (patch.quantity !== undefined) {
                    patch.quantity = Math.max(1, Math.min(patch.quantity, l.availableQty));
                }

                return { ...l, ...patch };
            })
        );
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandId || lines.length === 0) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.rpc('create_sale_with_items', {
                p_customer_name: clientName.trim() || 'Walk-in Customer',
                p_payment_method: paymentMethod,
                p_brand_id: brandId,
                p_items: lines.map((l) => ({
                    inventory_id: l.inventoryId,
                    quantity: l.quantity,
                    size: l.selectedSize || null,
                    color: l.selectedColor || null,
                })),
            });

            if (error) throw error;

            resetForm();
            onSaveSuccess?.();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to record sale');
            console.error('Sale Submission Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0F0F10] p-6 shadow-2xl text-white space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-emerald-400" />
                        <h2 className="text-lg font-bold">Record Sale</h2>
                    </div>
                    <button type="button" onClick={handleClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Brand Selection */}
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                Target Brand
                            </label>
                            {isBrandLocked ? (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm font-medium">
                                    {brandId === 'brand_a' ? 'Bee Trendy' : 'Baddie'}
                                    <span className="ml-2 text-xs text-neutral-500">(locked)</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setBrandId('brand_a')}
                                        className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                            brandId === 'brand_a' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                                        }`}
                                    >
                                        Bee Trendy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBrandId('brand_b')}
                                        className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                            brandId === 'brand_b' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                                        }`}
                                    >
                                        Baddie
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Customer Field */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Customer Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Mumo Kitheka (optional: Default Walk-In)"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                            />
                        </div>

                        {/* Line Items */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-neutral-400">Items ({lines.length})</label>
                                <button
                                    type="button"
                                    onClick={addLine}
                                    disabled={inventory.length === 0}
                                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add item
                                </button>
                            </div>

                            {inventory.length === 0 && (
                                <p className="text-xs text-amber-400/80 py-2">No stock available for this brand.</p>
                            )}

                            {lines.map((line, idx) => (
                                <div key={line.id} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-neutral-500">Item {idx + 1}</span>
                                        <button type="button" onClick={() => removeLine(line.id)} className="text-neutral-500 hover:text-red-400">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <select
                                        value={line.inventoryId}
                                        onChange={(e) => updateLine(line.id, { inventoryId: e.target.value })}
                                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none"
                                    >
                                        {inventory.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} (stock: {item.quantity})
                                            </option>
                                        ))}
                                    </select>

                                    {/* Variant Selectors */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {line.sizes && line.sizes.length > 0 && (
                                            <div>
                                                <label className="text-[10px] text-neutral-500 mb-0.5 block">Size</label>
                                                <select
                                                    value={line.selectedSize}
                                                    onChange={(e) => updateLine(line.id, { selectedSize: e.target.value })}
                                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs"
                                                >
                                                    {line.sizes.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {line.colors && line.colors.length > 0 && (
                                            <div>
                                                <label className="text-[10px] text-neutral-500 mb-0.5 block">Colour</label>
                                                <select
                                                    value={line.selectedColor}
                                                    onChange={(e) => updateLine(line.id, { selectedColor: e.target.value })}
                                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs"
                                                >
                                                    {line.colors.map((c) => (
                                                        <option key={c} value={c}>
                                                            {c}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity and Pricing */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-neutral-500 mb-0.5 block">
                                                Qty (max {line.availableQty})
                                            </label>
                                            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden h-9">
                                                <button
                                                    type="button"
                                                    onClick={() => updateLine(line.id, { quantity: Math.max(1, line.quantity - 1) })}
                                                    className="w-9 h-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800 text-sm"
                                                >
                                                    −
                                                </button>
                                                <span className="flex-1 text-center text-xs font-mono">
                                                    {line.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateLine(line.id, {
                                                            quantity: Math.min(line.availableQty, line.quantity + 1),
                                                        })
                                                    }
                                                    className="w-9 h-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800 text-sm"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-neutral-500 mb-0.5 block">Unit Price</label>
                                            <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-300">
                                                KES {line.unitPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right text-[11px] text-neutral-400">
                                        Subtotal:{' '}
                                        <span className="font-mono text-emerald-400/80">
                                            KES {(line.quantity * line.unitPrice).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand Total */}
                        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs">
                                <Calculator className="h-4 w-4 text-emerald-400" />
                                Grand Total
                            </div>
                            <span className="font-mono text-sm font-bold text-emerald-400">
                                KES {totalAmount.toLocaleString()}
                            </span>
                        </div>

                        {/* Payment Selection */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Method</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('M-Pesa')}
                                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium border transition-all ${
                                        paymentMethod === 'M-Pesa'
                                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                            : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                                    }`}
                                >
                                    <Smartphone className="h-3.5 w-3.5" /> M-Pesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('Cash')}
                                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium border transition-all ${
                                        paymentMethod === 'Cash'
                                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                                            : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                                    }`}
                                >
                                    <Banknote className="h-3.5 w-3.5" /> Cash
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-1/2 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || lines.length === 0 || !brandId}
                                className="w-1/2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {isSubmitting ? 'Recording…' : 'Record Sale'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}