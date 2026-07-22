'use client';

import { X, Calculator, ArrowUpRight, ArrowDownRight, Minus, Plus, Equal } from 'lucide-react';

interface TotalSalesBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandASales: number;
    brandBSales: number;
    expenses?: number;
}

export default function TotalSalesBreakdownModal({
                                                     isOpen,
                                                     onClose,
                                                     brandASales,
                                                     brandBSales,
                                                     expenses = 0,
                                                 }: TotalSalesBreakdownModalProps) {
    if (!isOpen) return null;

    const grossSales = brandASales + brandBSales;
    const netTotal = grossSales - expenses;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Box */}
            <div
                className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl shadow-black/90 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Calculator className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Revenue Breakdown</h2>
                            <p className="text-xs text-neutral-400">Total earnings calculation</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Calculation List */}
                <div className="my-6 space-y-3">
                    {/* Brand A */}
                    <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                                <Plus className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-200">Bee Trendy Collection</p>
                                <p className="text-[11px] text-neutral-500">Brand A Sales</p>
                            </div>
                        </div>
                        <p className="font-mono text-sm font-semibold text-neutral-200">
                            <span className="text-xs text-neutral-500 mr-1">KES</span>
                            {brandASales.toLocaleString()}
                        </p>
                    </div>

                    {/* Brand B */}
                    <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                                <Plus className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-200">Baddie on a Budget</p>
                                <p className="text-[11px] text-neutral-500">Brand B Sales</p>
                            </div>
                        </div>
                        <p className="font-mono text-sm font-semibold text-neutral-200">
                            <span className="text-xs text-neutral-500 mr-1">KES</span>
                            {brandBSales.toLocaleString()}
                        </p>
                    </div>

                    {/* Subtotal / Gross Revenue */}
                    <div className="flex items-center justify-between px-3.5 py-1 text-xs text-neutral-400">
                        <span>Combined Gross Revenue</span>
                        <span className="font-mono font-medium text-neutral-300">
                            KES {grossSales.toLocaleString()}
                        </span>
                    </div>

                    {/* Expenses (If any) */}
                    <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-400">
                                <Minus className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-200">Total Expenses</p>
                                <p className="text-[11px] text-neutral-500">Deductions</p>
                            </div>
                        </div>
                        <p className="font-mono text-sm font-semibold text-rose-400">
                            <span className="text-xs text-rose-500/80 mr-1">- KES</span>
                            {expenses.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Net Total Summary Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Equal className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                Net Total Sales
                            </span>
                        </div>
                        <span className="text-[11px] text-emerald-400/80">Final Calculated</span>
                    </div>

                    <p className="mt-2 text-2xl font-bold font-mono text-white">
                        <span className="text-sm font-sans text-emerald-400 mr-2">KES</span>
                        {netTotal.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}