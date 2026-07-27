'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmFixModalProps {
    isOpen: boolean;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmFixModal({
                                            isOpen,
                                            itemName,
                                            onClose,
                                            onConfirm,
                                        }: ConfirmFixModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Confirm Fix Request</h3>
                            <p className="text-xs text-stone-400">Request boss approval for editing</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Warning Body */}
                <div className="rounded-xl bg-stone-950/60 p-3.5 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                    Are you sure you want to request permission to edit/fix <strong className="text-white">{itemName}</strong>? Your boss will be notified to review and approve this edit window.
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-stone-800 bg-stone-900 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-400 transition-all"
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
}