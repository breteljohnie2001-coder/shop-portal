'use client';

import { X, ArrowUpRight, ShoppingBag, Package } from 'lucide-react';

export interface PurchasedProduct {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface SaleItem {
    id: string;
    customerName: string;
    amount: number;
    date: string;
    items: PurchasedProduct[];
}

interface SalesListModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandName: string;
    logoUrl: string;
    totalSales: number;
    sales: SaleItem[];
}

export default function SalesListModal({
                                           isOpen,
                                           onClose,
                                           brandName,
                                           logoUrl,
                                           totalSales,
                                           sales,
                                       }: SalesListModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* Modal Box */}
            <div
                className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl shadow-black/80 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={logoUrl}
                            alt={brandName}
                            className="h-8 w-auto object-contain"
                        />
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-white">{brandName} Sales</h2>
                            <p className="text-xs text-neutral-400">Detailed transaction breakdown</p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Summary Banner */}
                <div className="my-5 flex items-center justify-between rounded-xl bg-neutral-950 p-4 border border-neutral-800/60">
                    <div>
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Sales Revenue</span>
                        <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                            <span className="text-xs font-sans text-neutral-400 mr-1.5">KES</span>
                            {totalSales.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Orders</span>
                        <p className="text-xl font-bold font-mono text-white mt-0.5">{sales.length}</p>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-neutral-800">
                    {sales.length === 0 ? (
                        <div className="py-12 text-center text-neutral-500">
                            <ShoppingBag className="mx-auto h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm">No recent transactions found for this brand.</p>
                        </div>
                    ) : (
                        sales.map((sale) => (
                            <div
                                key={sale.id}
                                className="rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-950"
                            >
                                {/* Top Row: Customer Info & Order Total */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 font-semibold text-xs shrink-0">
                                            {sale.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-200">{sale.customerName}</p>
                                            <p className="text-[11px] text-neutral-500">{sale.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold font-mono text-neutral-100">
                                            <span className="text-[10px] font-sans text-neutral-500 mr-1">KES</span>
                                            {sale.amount.toLocaleString()}
                                        </p>
                                        <ArrowUpRight className="h-4 w-4 text-neutral-600" />
                                    </div>
                                </div>

                                {/* Bottom Row: Purchased Items with Individual Item Prices */}
                                <div className="mt-3 pt-2.5 border-t border-neutral-900/80 flex flex-wrap gap-2">
                                    {sale.items.map((prod) => (
                                        <div
                                            key={prod.id}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800/50 px-2.5 py-1 text-xs text-neutral-300 border border-neutral-800"
                                        >
                                            <Package className="h-3 w-3 text-neutral-500 shrink-0" />
                                            <span className="font-medium text-neutral-200">{prod.name}</span>
                                            <span className="text-neutral-500 font-mono">x{prod.quantity}</span>
                                            <span className="text-neutral-600">|</span>
                                            <span className="font-mono text-emerald-400/90 text-[11px]">
                                                KES {prod.price.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}