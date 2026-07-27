'use client';

import { AlertCircle } from 'lucide-react';

interface VoidModalProps {
    isOpen: boolean;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function VoidModal({ isOpen, itemName, onClose, onConfirm }: VoidModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-rose-500/30 bg-stone-900 p-6 shadow-2xl space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="h-6 w-6" />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-white">Confirm Void</h3>
                    <p className="text-xs text-stone-400 mt-1">
                        Are you sure you want to void <strong className="text-white">{itemName}</strong>? This action will restore counts and be logged in Audit History.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold border border-stone-800 bg-stone-950 text-stone-300 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-all"
                    >
                        Confirm Void
                    </button>
                </div>
            </div>
        </div>
    );
}