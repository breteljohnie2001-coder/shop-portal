'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { Receipt } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import ConfirmFixModal from '@/components/dashboard/modals/ConfirmFixModal';
import VoidModal from '@/components/dashboard/modals/VoidModal';
import { useRef } from 'react';
import {
    requestExpenseFix,
    approveExpenseFix,
} from '@/lib/expenseApproval';


import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import { Expense, BrandId } from '@/types/types';

const supabase = createClient();

export default function ExpensesPage() {
    const { user } = useUser();
    const userRole = user?.role === 'boss' ? 'boss' : 'employee';
    const isBrandLocked = user?.isBrandLocked ?? false;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fromDateRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);

    // Modal state
    const [expenseToFix, setExpenseToFix] = useState<Expense | null>(null);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [expenseToVoid, setExpenseToVoid] = useState<Expense | null>(null);
    const assignedBrand = user?.assignedBrand || null;
    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [brandId, setBrandId] = useState<BrandId>(
        (user?.assignedBrand as BrandId) || 'brand_a'
    );

    // ─── Fetch Active Expenses ───────────────────────────────────────────────
    const loadExpenses = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('expenses')
                .select('*')
                .eq('is_voided', false)
                .order('created_at', { ascending: false });

            // Brand filter (employees only)
            if (userRole === 'employee' && assignedBrand) {
                query = query.eq('brand_id', assignedBrand);
            }

            // Date range filter
            if (fromDate) {
                query = query.gte('created_at', `${fromDate}T00:00:00`);
            }
            if (toDate) {
                query = query.lte('created_at', `${toDate}T23:59:59`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setExpenses(data || []);
        } catch (err) {
            console.error('Expenses load error:', err);
        } finally {
            setLoading(false);
        }
    }, [userRole, assignedBrand, fromDate, toDate]);    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    // ─── Add or Save Edit Expense ────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !brandId || !description.trim() || amount === '') return;

        setIsSubmitting(true);
        try {
            if (expenseToEdit) {
                // ─── EDIT ───────────────────────────────────────────────
                const { error } = await supabase
                    .from('expenses')
                    .update({
                        description: description.trim(),
                        amount: Number(amount),
                        brand_id: brandId,
                        fix_requested: false,
                        boss_approved_fix: false,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', expenseToEdit.id);

                if (error) throw error;

                await supabase.rpc('log_activity', {
                    p_action: 'EDIT_EXPENSE',
                    p_entity_type: 'expenses',
                    p_entity_id: expenseToEdit.id,
                    p_brand_id: brandId,
                    p_notes: `Updated expense: ${description.trim()} (KES ${amount})`,
                });

                setExpenseToEdit(null);
            } else {
                // ─── CREATE ─────────────────────────────────────────────
                const { data, error } = await supabase
                    .from('expenses')
                    .insert({
                        brand_id: brandId,
                        description: description.trim(),
                        amount: Number(amount),
                        created_by: user.id,
                    })
                    .select('id')
                    .single();

                if (error) throw error;

                // Log creation
                await supabase.rpc('log_activity', {
                    p_action: 'CREATE_EXPENSE',
                    p_entity_type: 'expenses',
                    p_entity_id: data.id,
                    p_brand_id: brandId,
                    p_notes: `Created expense: ${description.trim()} (KES ${amount})`,
                });
            }

            // Reset form
            setDescription('');
            setAmount('');
            setBrandId((user?.assignedBrand as BrandId) || 'brand_a');
            await loadExpenses();
        } catch (err: any) {
            alert(err.message || 'Failed to save expense');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    // Open Edit Form prefilled
    const handleStartEdit = (exp: Expense) => {
        setExpenseToEdit(exp);
        setDescription(exp.description);
        setAmount(exp.amount);
        setBrandId((exp.brand_id as BrandId) || 'brand_a');
    };

    const handleCancelEdit = () => {
        setExpenseToEdit(null);
        setDescription('');
        setAmount('');
        setBrandId((user?.assignedBrand as BrandId) || 'brand_a');
    };

    // ─── Void Expense ────────────────────────────────────────────────────────
    const handleConfirmVoid = async () => {
        if (!expenseToVoid) return;

        try {
            const { error } = await supabase
                .from('expenses')
                .update({ is_voided: true })
                .eq('id', expenseToVoid.id);

            if (error) throw error;

            await supabase.rpc('log_activity', {
                p_action: 'VOID_EXPENSE',
                p_entity_type: 'expenses',
                p_entity_id: expenseToVoid.id,
                p_brand_id: expenseToVoid.brand_id,
                p_notes: `Voided expense: ${expenseToVoid.description}`,
            });

            setExpenseToVoid(null);
            await loadExpenses();
        } catch (err: any) {
            alert(err.message || 'Failed to void expense');
        }
    };

    // ─── Request Fix ─────────────────────────────────────────────────────────
    const handleConfirmExpenseFix = async (reason?: string) => {
        if (!expenseToFix || !user) return;

        try {
            await requestExpenseFix(
                expenseToFix.id,
                user.name,
                reason
            );

            setExpenseToFix(null);
            await loadExpenses();
        } catch (err: any) {
            alert(err.message || 'Failed to request fix');
            console.error('Request expense fix error:', err);
        }
    };
    // ─── Boss Approval ───────────────────────────────────────────────────────
    const handleApproveFix = async (id: string) => {
        try {
            await approveExpenseFix(id);
            await loadExpenses();
        } catch (err: any) {
            alert(err.message || 'Failed to approve fix');
            console.error('Approve expense fix error:', err);
        }
    };
    return (
        <div className="space-y-6 max-w-3xl mx-auto text-white">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Expenses</h1>
            </div>

            <ExpenseForm
                description={description}
                amount={amount}
                brandId={brandId}
                isBrandLocked={isBrandLocked}
                isEditing={!!expenseToEdit}
                isSubmitting={isSubmitting}
                onDescriptionChange={setDescription}
                onAmountChange={setAmount}
                onBrandChange={setBrandId}
                onSubmit={handleSubmit}
                onCancelEdit={handleCancelEdit}
            />
            {/* Date Filter Bar */}
            <div className="rounded-2xl border border-neutral-800/80 bg-[#0F0F10] p-3 shadow-lg backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

                    {/* Left Side */}
                    <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        {/* Title */}
                        <div className="flex items-center gap-2 px-1 text-neutral-400">
                            <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-neutral-300 whitespace-nowrap">
                              Filter Date
                            </span>
                        </div>

                        <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-2 flex-1 max-w-md">

                            {/* From Date */}
                            <div
                                className="relative flex items-center cursor-pointer"
                                onClick={() => fromDateRef.current?.showPicker()}
                            >
                                <span className="absolute left-3 text-[10px] font-bold text-neutral-500 uppercase pointer-events-none z-10">
                                From
                                </span>
                                <input
                                    ref={fromDateRef}
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-800/80 bg-neutral-900/90 pl-14 pr-3 py-2 text-xs text-neutral-200 transition-all hover:border-neutral-700 focus:border-emerald-500/50 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark] cursor-pointer"
                                />
                            </div>

                            {/* To Date */}
                            <div
                                className="relative flex items-center cursor-pointer"
                                onClick={() => toDateRef.current?.showPicker()}
                            >
                                <span className="absolute left-3 text-[10px] font-bold text-neutral-500 uppercase pointer-events-none z-10">
                                To
                                </span>
                                <input
                                    ref={toDateRef}
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-800/80 bg-neutral-900/90 pl-10 pr-3 py-2 text-xs text-neutral-200 transition-all hover:border-neutral-700 focus:border-emerald-500/50 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark] cursor-pointer"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Clear Button */}
                    {(fromDate || toDate) && (
                        <button
                            onClick={() => {
                                setFromDate('');
                                setToDate('');
                            }}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/80 hover:border-neutral-700 active:scale-[0.98] transition-all"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Clear</span>
                        </button>
                    )}
                </div>
            </div>

            <ExpenseList
                expenses={expenses}
                loading={loading}
                userRole={userRole}
                onEdit={handleStartEdit}
                onVoid={setExpenseToVoid}
                onRequestFix={setExpenseToFix}
                onApproveFix={handleApproveFix}
            />

            <ConfirmFixModal
                isOpen={!!expenseToFix}
                itemName={expenseToFix?.description || ''}
                onClose={() => setExpenseToFix(null)}
                onConfirm={handleConfirmExpenseFix}
            />

            <VoidModal
                isOpen={!!expenseToVoid}
                itemName={`Expense: ${expenseToVoid?.description} (KES ${expenseToVoid?.amount})`}
                onClose={() => setExpenseToVoid(null)}
                onConfirm={handleConfirmVoid}
            />
        </div>
    );
}