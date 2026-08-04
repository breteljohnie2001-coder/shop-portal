'use client';

import { useState, useEffect } from 'react';
import { X, Calculator, Lock } from 'lucide-react';

export interface EditableSaleItem {
    id: string;
    receiptNo: string;
    itemName: string;
    clientName: string;
    paymentMethod: 'MPESA' | 'Cash';
    unitPrice: number;
    quantity: number;
}

interface EditSaleModalProps {
    isOpen: boolean;
    sale: EditableSaleItem | null;
    onClose: () => void;
    onSave: (updatedSale: EditableSaleItem, reason: string) => void;
}

export default function EditSaleModal({ isOpen, sale, onClose, onSave }: EditSaleModalProps) {
    const [itemName, setItemName] = useState('');
    const [clientName, setClientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'Cash' >('MPESA');
    const [unitPrice, setUnitPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [receiptNo, setReceiptNo] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (sale) {
            setItemName(sale.itemName);
            setClientName(sale.clientName || '');
            setPaymentMethod(sale.paymentMethod || 'MPESA');
            setUnitPrice(sale.unitPrice);
            setQuantity(sale.quantity);
            setReceiptNo(sale.receiptNo);
            setReason('');
        }
    }, [sale]);

    if (!isOpen || !sale) return null;

    const calculatedTotal = unitPrice * quantity;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(
            {
                ...sale,
                itemName,
                clientName,
                paymentMethod,
                unitPrice, // retains original value
                quantity,  // retains original value
                receiptNo,
            },
            reason
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl space-y-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div>
                        <h3 className="text-base font-bold text-white">Edit Sale Record</h3>
                        <p className="text-[11px] text-stone-400">Receipt: <span className="font-mono text-stone-300">{sale.receiptNo}</span></p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Item Name & Receipt No */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="text-stone-400 font-medium">Item Sold</label>
                            <input
                                type="text"
                                required
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                            />
                        </div>
                        <div>
                            <label className="text-stone-400 font-medium">Receipt #</label>
                            <input
                                type="text"
                                required
                                value={receiptNo}
                                onChange={(e) => setReceiptNo(e.target.value)}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700 font-mono"
                            />
                        </div>
                    </div>

                    {/* Client Name & Payment Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-stone-400 font-medium">Client Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Jane Doe"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                            />
                        </div>
                        <div>
                            <label className="text-stone-400 font-medium">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as 'MPESA' | 'Cash')}
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                            >
                                <option value="MPESA">M-PESA</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                    </div>

                    {/* Quantity & Unit Price (Locked) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-stone-400 font-medium">Quantity Sold</label>
                                <span className="flex items-center gap-1 text-[10px] text-stone-500">
                                    <Lock className="h-3 w-3" /> Locked
                                </span>
                            </div>
                            <input
                                type="number" enterKeyHint="next"
                                value={quantity}
                                readOnly
                                disabled
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-900/50 px-3 py-2 text-stone-400 cursor-not-allowed font-mono select-none"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-stone-400 font-medium">Unit Price (KES)</label>
                                <span className="flex items-center gap-1 text-[10px] text-stone-500">
                                    <Lock className="h-3 w-3" /> Locked
                                </span>
                            </div>
                            <input
                                type="number" enterKeyHint="next"
                                value={unitPrice}
                                readOnly
                                disabled
                                className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-900/50 px-3 py-2 text-stone-400 cursor-not-allowed font-mono select-none"
                            />
                        </div>
                    </div>

                    {/* Calculated Total Live Display */}
                    <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                            <Calculator className="h-4 w-4 text-emerald-400" />
                            <span>Total Amount:</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                            KES {calculatedTotal.toLocaleString()}
                        </span>
                    </div>

                    {/* Reason for Correction */}
                    <div>
                        <label className="text-stone-400 font-medium">Reason for Sale Edit (Audit Log)</label>
                        <input
                            type="text" enterKeyHint="next"
                            required
                            placeholder="e.g. Wrong client name, mode of payment change..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full mt-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-white focus:outline-none focus:border-stone-700"
                        />
                    </div>

                    {/* Form Controls */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-stone-950 hover:bg-emerald-400 transition-all"
                        >
                            Save Sale Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}