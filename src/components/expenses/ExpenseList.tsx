'use client';

import { Loader2 } from 'lucide-react';
import ExpenseItem from './ExpenseItem';
import { Expense } from '@/types/types';

interface ExpenseListProps {
    expenses: Expense[];
    loading: boolean;
    userRole: 'boss' | 'employee';
    onEdit: (expense: Expense) => void;
    onVoid: (expense: Expense) => void;
    onRequestFix: (expense: Expense) => void;
    onApproveFix: (id: string) => void;
}

export default function ExpenseList({
                                        expenses,
                                        loading,
                                        userRole,
                                        onEdit,
                                        onVoid,
                                        onRequestFix,
                                        onApproveFix,
                                    }: ExpenseListProps) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-[#0F0F10] overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-neutral-800">
                <h2 className="text-sm font-semibold text-neutral-300">All Expenses</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : expenses.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                    No active expenses found
                </div>
            ) : (
                <div className="divide-y divide-neutral-800">
                    {expenses.map((expense) => (
                        <ExpenseItem
                            key={expense.id}
                            expense={expense}
                            userRole={userRole}
                            onEdit={onEdit}
                            onVoid={onVoid}
                            onRequestFix={onRequestFix}
                            onApproveFix={onApproveFix}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}