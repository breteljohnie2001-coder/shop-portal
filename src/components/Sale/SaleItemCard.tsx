'use client';

import { Smartphone, Banknote, Package, Check, Clock, FileEdit, Trash2, Send, ShieldX } from 'lucide-react';
import { PastSale, UserRole } from "@/types/types";

interface SaleItemCardProps {
    sale: PastSale;
    userRole: UserRole;
    assignedBrand: string | null;
    onEdit: (sale: PastSale) => void;
    onVoid: (sale: PastSale) => void;
    onRequestFix: () => void;
    onApproveFix: (id: string) => void;
}

export default function SaleItemCard({
                                         sale,
                                         userRole,
                                         assignedBrand,
                                         onEdit,
                                         onVoid,
                                         onRequestFix,
                                         onApproveFix,
                                     }: SaleItemCardProps) {
    // 1. Safe Date parsing (handles both Date object and ISO string)
    const isWithin15Minutes = (createdAt: Date | string) => {
        if (!createdAt) return false;
        const dateObj = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
        const diffInMinutes = (Date.now() - dateObj.getTime()) / (1000 * 60);
        return diffInMinutes >= 0 && diffInMinutes <= 15;
    };

    const isUnlocked = isWithin15Minutes(sale.createdAt);

    // 2. Safe time string fallback
    const formattedTime = sale.time || (sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

    const saleBrand = sale.brandId?.toLowerCase() || '';
    const userBrand = assignedBrand?.toLowerCase();

    // Check brand authorization for employees
    const isBrandAssociated = userRole === 'boss' || !userBrand || userBrand === saleBrand;

    // Display "Approved by Boss" if associated
    const isApprovedVisible = sale.bossApprovedFix && isBrandAssociated;

    // Edit and Void permissions
    const canEdit = isBrandAssociated && (userRole === 'boss' || isUnlocked || isApprovedVisible);
    const canVoid = isBrandAssociated && (userRole === 'boss' || isUnlocked || isApprovedVisible);

    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md transition-all hover:border-neutral-700 space-y-3">
            {/* Card Top Row */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-neutral-200 font-bold text-xs shrink-0 border border-neutral-700/40">
                        {sale.customerName?.charAt(0) || 'C'}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white truncate">{sale.customerName || 'Walk-in Customer'}</p>
                            <span className="text-[10px] font-mono text-neutral-500">#{sale.receiptNo}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                            <span className="text-[11px] text-neutral-400">{formattedTime}</span>
                            <span className="text-neutral-700 text-[10px]">•</span>

                            {sale.paymentMethod === 'M-Pesa' || (sale.paymentMethod as string) === 'MPESA' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    <Smartphone className="h-2.5 w-2.5" /> M-Pesa
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                    <Banknote className="h-2.5 w-2.5" /> Cash
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="font-mono text-sm font-bold text-white shrink-0">
                    <span className="text-[10px] font-sans text-neutral-400 mr-1">KES</span>
                    {Number(sale.amount || 0).toLocaleString()}
                </p>
            </div>

            {/* Card Items Row */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-1.5">
                {sale.items && sale.items.length > 0 ? (
                    sale.items.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="flex items-center justify-between rounded-lg bg-neutral-950 px-3 py-1.5 border border-neutral-800/80 text-xs text-neutral-300"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Package className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                                <span className="font-medium text-neutral-200 truncate">{item.name}</span>

                                {/* 🏷️ Render Size Badge */}
                                {item.size && (
                                    <span className="px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-700/60 text-[10px] text-neutral-300 font-mono shrink-0">
                                        {item.size}
                                    </span>
                                )}

                                {/* 🏷️ Render Color Badge */}
                                {item.color && (
                                    <span className="px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-700/60 text-[10px] text-neutral-300 shrink-0">
                                        {item.color}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                                <span className="text-neutral-500">x{item.quantity}</span>
                                <span className="text-neutral-400">
                                    KES {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-between rounded-lg bg-neutral-950 px-3 py-1.5 border border-neutral-800/80 text-xs text-neutral-300">
                        <span className="font-medium text-neutral-200">Item Record</span>
                        <span className="font-mono text-[11px] text-neutral-400">
                            KES {Number(sale.amount || 0).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                    {isUnlocked ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Editable (15m window)
                        </span>
                    ) : isApprovedVisible ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <Check className="h-3 w-3" /> Approved by Boss
                        </span>
                    ) : (
                        <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Locked
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <button
                            onClick={() => onEdit(sale)}
                            className="flex items-center gap-1 rounded-lg bg-neutral-800 border border-neutral-700/60 px-2.5 py-1 text-neutral-200 hover:text-white transition-colors"
                        >
                            <FileEdit className="h-3 w-3" /> Edit
                        </button>
                    )}

                    {canVoid && (
                        <button
                            onClick={() => onVoid(sale)}
                            className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                            <Trash2 className="h-3 w-3" /> Void
                        </button>
                    )}

                    {!canEdit && userRole === 'employee' && isBrandAssociated && (
                        sale.fixRequested ? (
                            <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                Approval Requested
                            </span>
                        ) : (
                            <button
                                onClick={onRequestFix}
                                className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                                <Send className="h-3 w-3" /> Request Fix
                            </button>
                        )
                    )}

                    {!canEdit && userRole === 'employee' && !isBrandAssociated && (
                        <span className="text-stone-500 flex items-center gap-1 text-[10px]">
                            <ShieldX className="h-3 w-3" /> Unassigned Brand
                        </span>
                    )}

                    {userRole === 'boss' && sale.fixRequested && (
                        <button
                            onClick={() => onApproveFix(sale.id)}
                            className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium"
                        >
                            Approve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}