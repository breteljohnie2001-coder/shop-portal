'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Receipt, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

const supabase = createClient();

interface Expense {
    id: string;
    brand_id: 'brand_a' | 'brand_b';
    description: string;
    amount: number;
    created_at: string;
    created_by: string;
}

export default function ExpensesPage() {
    const { user } = useUser();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state initialized directly from context
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [brandId, setBrandId] = useState<'brand_a' | 'brand_b' | null>(
        user?.assignedBrand || 'brand_a'
    );

    const isBrandLocked = user?.isBrandLocked ?? false;

    // ─── Fetch All Expenses (No brand restrictions) ───────────────────────────
    const loadExpenses = useCallback(async () => {
        setLoading(true);

        try {
            // Fetch ALL expenses regardless of user or brand
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setExpenses(data || []);
        } catch (err) {
            console.error('Expenses load error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    // ─── Add expense ──────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !brandId || !description.trim() || !amount) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('expenses').insert({
                brand_id: brandId,
                description: description.trim(),
                amount: Number(amount),
                created_by: user.id,
            });

            if (error) throw error;

            setDescription('');
            setAmount('');
            await loadExpenses();
        } catch (err: any) {
            alert(err.message || 'Failed to add expense');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this expense?')) return;

        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) {
            alert(error.message);
            return;
        }
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Expenses</h1>
            </div>

            {/* Add Expense Form */}
            <div className="rounded-2xl border border-neutral-800 bg-[#0F0F10] p-5 space-y-4">
                <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-emerald-400" />
                    Add New Expense
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Brand Selection for standard users */}
                    <div>
                        <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                            Brand
                        </label>
                        {isBrandLocked ? (
                            <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm">
                                {brandId === 'brand_a' ? 'Bee Trendy' : 'Baddie'}
                                <span className="ml-2 text-xs text-neutral-500">(locked)</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setBrandId('brand_a')}
                                    className={`rounded-lg py-1.5 text-xs font-bold ${
                                        brandId === 'brand_a'
                                            ? 'bg-neutral-800 text-white'
                                            : 'text-neutral-400'
                                    }`}
                                >
                                    Bee Trendy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBrandId('brand_b')}
                                    className={`rounded-lg py-1.5 text-xs font-bold ${
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
                            onChange={(e) => setDescription(e.target.value)}
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
                                setAmount(e.target.value === '' ? '' : Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !brandId}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {isSubmitting ? 'Saving…' : 'Add Expense'}
                    </button>
                </form>
            </div>

            {/* Expenses List */}
            <div className="rounded-2xl border border-neutral-800 bg-[#0F0F10] overflow-hidden">
                <div className="px-5 py-3 border-b border-neutral-800">
                    <h2 className="text-sm font-semibold text-neutral-300">All Expenses</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="py-12 text-center text-sm text-neutral-500">No expenses found</div>
                ) : (
                    <div className="divide-y divide-neutral-800">
                        {expenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-neutral-900/50"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {expense.description}
                                    </p>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">
                                        {expense.brand_id === 'brand_a' ? 'Bee Trendy' : 'Baddie'} ·{' '}
                                        {new Date(expense.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-semibold text-red-400">
                                        − KES {Number(expense.amount).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        className="text-neutral-600 hover:text-red-400 p-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}