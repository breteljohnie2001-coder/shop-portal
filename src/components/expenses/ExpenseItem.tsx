'use client';

import { Clock, Check, FileEdit, Trash2, Wrench } from 'lucide-react';
import { Expense, isWithin15Minutes } from '@/types/types';

interface ExpenseItemProps {
    expense: Expense;
    userRole: 'boss' | 'employee';
    onEdit: (expense: Expense) => void;
    onVoid: (expense: Expense) => void;
    onRequestFix: (expense: Expense) => void;
    onApproveFix: (id: string) => void;
}

export default function ExpenseItem({
                                        expense,
                                        userRole,
                                        onEdit,
                                        onVoid,
                                        onRequestFix,
                                        onApproveFix,
                                    }: ExpenseItemProps) {
    const isUnlocked = isWithin15Minutes(expense.created_at);
    const isApprovedVisible = expense.boss_approved_fix;
    const canModify = userRole === 'boss' || isUnlocked || isApprovedVisible;

    return (
        <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/50 transition-colors">
            <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-white truncate">
                    {expense.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span>{expense.brand_id === 'brand_a' ? 'Bee Trendy' : 'Baddie'}</span>
                    <span>•</span>
                    <span>
            {new Date(expense.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })}
          </span>
                    <span>•</span>
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
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-neutral-800/80">
        <span className="font-mono text-sm font-semibold text-rose-400">
          − KES {Number(expense.amount).toLocaleString()}
        </span>

                <div className="flex items-center gap-1.5">
                    {canModify ? (
                        <>
                            <button
                                onClick={() => onEdit(expense)}
                                className="flex items-center gap-1 rounded-lg bg-neutral-800 border border-neutral-700/60 px-2 py-1 text-xs text-neutral-200 hover:text-white transition-colors"
                            >
                                <FileEdit className="h-3 w-3" /> Edit
                            </button>
                            <button
                                onClick={() => onVoid(expense)}
                                className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                            >
                                <Trash2 className="h-3 w-3" /> Void
                            </button>
                        </>
                    ) : userRole === 'employee' ? (
                        expense.fix_requested ? (
                            <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                Approval Requested
              </span>
                        ) : (
                            <button
                                onClick={() => onRequestFix(expense)}
                                className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                                <Wrench className="h-3 w-3" /> Request Fix
                            </button>
                        )
                    ) : null}

                    {userRole === 'boss' && expense.fix_requested && (
                        <button
                            onClick={() => onApproveFix(expense.id)}
                            className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium"
                        >
                            Approve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}