'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Clock, Check, FileEdit, Send, Trash2, ShieldX, X } from 'lucide-react';
import { StockItem, UserRole } from "@/types/types";

interface StockItemCardProps {
    item: StockItem;
    userRole: UserRole;
    assignedBrand: string | null;
    onEdit: (item: StockItem) => void;
    onVoid: (item: StockItem) => void;
    onRequestFix: (id: string) => void;
    onApproveFix: (id: string) => void;
}

export default function StockItemCard({
                                          item,
                                          userRole,
                                          assignedBrand,
                                          onEdit,
                                          onVoid,
                                          onRequestFix,
                                          onApproveFix,
                                      }: StockItemCardProps) {
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Accept string | Date safely to handle both raw Supabase ISO strings and Date objects
    const isWithin15Minutes = (createdAt: string | Date) => {
        const createdTime = new Date(createdAt).getTime();
        if (isNaN(createdTime)) return false; // Guard against invalid date values

        const diffInMinutes = (Date.now() - createdTime) / (1000 * 60);
        return diffInMinutes <= 15;
    };

    const isUnlocked = isWithin15Minutes(item.createdAt);

    const itemBrand = item.brandId.toLowerCase();
    const userBrand = assignedBrand?.toLowerCase();

    const isBrandAssociated = userRole === 'boss' || !userBrand || userBrand === itemBrand;

    const canEdit = isBrandAssociated && (userRole === 'boss' || isUnlocked || item.bossApprovedFix);
    const canVoid = isBrandAssociated && (userRole === 'boss' || isUnlocked || item.bossApprovedFix);

    return (
        <>
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Thumbnail Container - Clickable */}
                        <div
                            onClick={() => item.imageUrl && !imgError && setIsImageOpen(true)}
                            className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-800 border border-stone-700/50 ${
                                item.imageUrl && !imgError ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                            }`}
                        >
                            {item.imageUrl && !imgError ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                    sizes="48px"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <Package className="h-5 w-5 text-stone-500" />
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">{item.name}</p>
                            <p className="text-xs text-stone-400 font-mono">KES {item.price.toLocaleString()}</p>
                        </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">Qty: {item.quantity}</span>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                        {isUnlocked ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Editable (15m window)
                            </span>
                        ) : item.bossApprovedFix ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Approved by Boss
                            </span>
                        ) : (
                            <span className="text-stone-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Locked
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                onClick={() => onEdit(item)}
                                className="flex items-center gap-1 rounded-lg bg-stone-800 border border-stone-700/60 px-2.5 py-1 text-stone-200 hover:bg-stone-700"
                            >
                                <FileEdit className="h-3 w-3" /> Edit
                            </button>
                        )}

                        {canVoid && (
                            <button
                                onClick={() => onVoid(item)}
                                className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-rose-400 hover:bg-rose-500/20"
                            >
                                <Trash2 className="h-3 w-3" /> Void
                            </button>
                        )}

                        {!canEdit && userRole === 'employee' && isBrandAssociated && (
                            item.fixRequested ? (
                                <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                    Approval Requested
                                </span>
                            ) : (
                                <button
                                    onClick={() => onRequestFix(item.id)}
                                    className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-400 hover:bg-amber-500/20"
                                >
                                    <Send className="h-3 w-3" /> Request Boss Fix
                                </button>
                            )
                        )}

                        {!canEdit && userRole === 'employee' && !isBrandAssociated && (
                            <span className="text-stone-500 flex items-center gap-1 text-[10px]">
                                <ShieldX className="h-3 w-3" /> Unassigned Brand
                            </span>
                        )}

                        {userRole === 'boss' && item.fixRequested && (
                            <button
                                onClick={() => onApproveFix(item.id)}
                                className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400 hover:bg-emerald-500/20"
                            >
                                Approve Fix
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* FULL-SCREEN IMAGE MODAL LIGHTBOX */}
            {isImageOpen && item.imageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
                    onClick={() => setIsImageOpen(false)}
                >
                    <div
                        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 p-2 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsImageOpen(false)}
                            className="absolute right-3 top-3 z-10 rounded-full bg-stone-950/80 p-2 text-stone-300 hover:bg-stone-900 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="relative h-[65vh] w-[80vw] max-w-xl">
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                unoptimized
                                className="object-contain"
                            />
                        </div>

                        <div className="p-3 text-center border-t border-stone-800/80 mt-1">
                            <p className="text-sm font-bold text-white">{item.name}</p>
                            <p className="text-xs text-stone-400 font-mono">KES {item.price.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}