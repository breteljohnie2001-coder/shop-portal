'use client';

import { Loader2, Plus } from 'lucide-react';
import { BrandId } from '@/types/types';

interface ExpenseFormProps {
    description: string;
    amount: number | '';
    brandId: BrandId;
    isBrandLocked: boolean;
    isEditing: boolean;
    isSubmitting: boolean;
    onDescriptionChange: (value: string) => void;
    onAmountChange: (value: number | '') => void;
    onBrandChange: (value: BrandId) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancelEdit: () => void;
}

export default function ExpenseForm({
                                        description,
                                        amount,
                                        brandId,
                                        isBrandLocked,
                                        isEditing,
                                        isSubmitting,
                                        onDescriptionChange,
                                        onAmountChange,
                                        onBrandChange,
                                        onSubmit,
                                        onCancelEdit,
                                    }: ExpenseFormProps) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-[#0F0F10] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-emerald-400" />
                    {isEditing ? 'Edit Expense Record' : 'Add New Expense'}
                </h2>
                {isEditing && (
                    <button
                        onClick={onCancelEdit}
                        className="text-xs text-neutral-400 hover:text-white underline"
                    >
                        Cancel Edit
                    </button>
                )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Brand */}
                <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Brand
                    </label>
                    {isBrandLocked ? (
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs">
                            {brandId === 'brand_a' ? 'Bee Trendy' : 'Baddie'}
                            <span className="ml-2 text-neutral-500">(locked)</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800">
                            <button
                                type="button"
                                onClick={() => onBrandChange('brand_a')}
                                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                    brandId === 'brand_a'
                                        ? 'bg-neutral-800 text-white'
                                        : 'text-neutral-400'
                                }`}
                            >
                                Bee Trendy
                            </button>
                            <button
                                type="button"
                                onClick={() => onBrandChange('brand_b')}
                                className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                                    brandId === 'brand_b'
                                        ? 'bg-neutral-800 text-white'
                                        : 'text-neutral-400'
                                }`}
                            >
                                Baddie
                            </button>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Description
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Transport, Packaging, Marketing..."
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Amount (KES)
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        placeholder="0"
                        value={amount}
                        onChange={(e) =>
                            onAmountChange(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-700"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !brandId}
                    className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                    {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Expense'}
                </button>
            </form>
        </div>
    );
}