'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface EditableItem {
    id: string;
    name: string;
    price: number;
    sku?: string;
    quantity: number;
    // Extended POS properties
    paymentMethod?: 'M-Pesa' | 'Cash' | 'Card' | 'Bank Transfer';
    clientName?: string;
    purchasedAt?: string; // Time string for display/edit e.g., '14:30'
}

interface EditModalProps {
    isOpen: boolean;
    item: EditableItem | null;
    onClose: () => void;
    onSave: (updatedItem: EditableItem, reason: string) => void;
}

export default function EditStockModal({ isOpen, item, onClose, onSave }: EditModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Cash' | 'Card' | 'Bank Transfer'>('M-Pesa');
    const [clientName, setClientName] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name);
            setPrice(item.price);
            setSku(item.sku || '');
            setQuantity(item.quantity);
            setPaymentMethod(item.paymentMethod || 'M-Pesa');
            setClientName(item.clientName || 'Walk-in Customer');
            setReason('');
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(
            {
                ...item,
                name,
                price,
                sku,
                quantity,
                paymentMethod,
                clientName,
            },
            reason
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h3 className="text-base font-bold text-white">Edit Record</h3>
                    <button type="button" onClick={onClose} className="p-1 text-stone-400 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="text-stone-400 font-medium">Item / Description Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-stone-400 font-medium">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700 font-mono"
                            />
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

                    {/* Sales Specific Metadata Fields */}
                    {item.paymentMethod && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-stone-400 font-medium">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                                >
                                    <option value="M-Pesa">M-Pesa</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-stone-400 font-medium">Client Name</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                                />
                            </div>
                        </div>
                    )}

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

                    <div>
                        <label className="text-stone-400 font-medium">Reason for Edit (Audit Log)</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Corrected wrong payment method, updated customer..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                        />
                    </div>

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