'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    X,
    Bell,
    Check,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { approveSaleFix } from '@/lib/salesApproval';
import { approveStockFix } from '@/lib/stockApproval';
import { approveExpenseFix } from '@/lib/expenseApproval';

interface User {
    name: string;
    role: string;
}

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function ProfileDrawer({
                                          isOpen,
                                          onClose,
                                          user,
                                      }: ProfileDrawerProps) {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [approvingAll, setApprovingAll] = useState(false);

    const employeeSeenIdsRef = useRef<Set<string>>(new Set());

    const isBoss = user?.role?.toLowerCase() === 'boss';

    useEffect(() => {
        if (!isOpen || !user) return;

        let channel: any = null;
        let cancelled = false;

        const loadNotifications = async () => {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            if (!authUser || cancelled) return;

            let query = supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (isBoss) {
                query = query.eq('is_read', false);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Notification fetch error:', error);
                return;
            }

            if (cancelled) return;

            const loadedNotifications = data || [];

            setNotifications(loadedNotifications);

            if (!isBoss && loadedNotifications.length > 0) {
                const ids = loadedNotifications.map(
                    (notification) => notification.id
                );

                ids.forEach((id) => {
                    employeeSeenIdsRef.current.add(id);
                });

                const { error: markReadError } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .in('id', ids);

                if (markReadError) {
                    console.error(
                        'Mark employee notifications as read error:',
                        markReadError
                    );
                } else {
                    setNotifications((current) =>
                        current.map((notification) => ({
                            ...notification,
                            is_read: true,
                        }))
                    );
                }
            }

            channel = supabase
                .channel(`notifications-${authUser.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${authUser.id}`,
                    },
                    async (payload) => {
                        if (cancelled) return;

                        const newNotification = {
                            ...payload.new,
                        };

                        if (!isBoss) {
                            newNotification.is_read = true;

                            employeeSeenIdsRef.current.add(
                                newNotification.id
                            );

                            await supabase
                                .from('notifications')
                                .update({ is_read: true })
                                .eq('id', newNotification.id);
                        }

                        setNotifications((current) => [
                            newNotification,
                            ...current,
                        ]);
                    }
                )
                .subscribe();
        };

        loadNotifications();

        return () => {
            cancelled = true;

            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [isOpen, user, isBoss, supabase]);

    const handleCloseDrawer = async () => {
        if (!isBoss && employeeSeenIdsRef.current.size > 0) {
            const idsToDelete = Array.from(
                employeeSeenIdsRef.current
            );

            employeeSeenIdsRef.current.clear();

            const { error } = await supabase
                .from('notifications')
                .delete()
                .in('id', idsToDelete);

            if (error) {
                console.error(
                    'Delete notification error:',
                    error.message
                );
            }
        }

        onClose();
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const pendingApprovals = notifications.filter((notification) => {
        if (notification.is_read) return false;

        return (
            (
                notification.type === 'FIX_REQUEST' &&
                notification.sale_id
            ) ||
            (
                notification.type === 'FIX_REQUEST_INVENTORY' &&
                notification.inventory_id
            ) ||
            (
                notification.type === 'FIX_REQUEST_EXPENSE' &&
                notification.expense_id
            )
        );
    });

    const handleApprove = async (notification: any) => {
        try {
            setApprovingId(notification.id);

            if (
                notification.type === 'FIX_REQUEST' &&
                notification.sale_id
            ) {
                await approveSaleFix(notification.sale_id);
            } else if (
                notification.type === 'FIX_REQUEST_INVENTORY' &&
                notification.inventory_id
            ) {
                await approveStockFix(
                    notification.inventory_id
                );
            } else if (
                notification.type === 'FIX_REQUEST_EXPENSE' &&
                notification.expense_id
            ) {
                await approveExpenseFix(
                    notification.expense_id
                );
            } else {
                return;
            }

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id);

            if (error) {
                throw error;
            }

            setNotifications((current) =>
                current.filter(
                    (item) => item.id !== notification.id
                )
            );
        } catch (error) {
            console.error('Approval failed:', error);
        } finally {
            setApprovingId(null);
        }
    };

    const handleApproveAll = async () => {
        if (pendingApprovals.length === 0) return;

        try {
            setApprovingAll(true);

            for (const notification of pendingApprovals) {
                try {
                    if (
                        notification.type === 'FIX_REQUEST' &&
                        notification.sale_id
                    ) {
                        await approveSaleFix(
                            notification.sale_id
                        );
                    } else if (
                        notification.type ===
                        'FIX_REQUEST_INVENTORY' &&
                        notification.inventory_id
                    ) {
                        await approveStockFix(
                            notification.inventory_id
                        );
                    } else if (
                        notification.type ===
                        'FIX_REQUEST_EXPENSE' &&
                        notification.expense_id
                    ) {
                        await approveExpenseFix(
                            notification.expense_id
                        );
                    } else {
                        continue;
                    }

                    const { error } = await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', notification.id);

                    if (error) {
                        console.error(
                            'Failed to mark notification as read:',
                            error
                        );
                        continue;
                    }

                    setNotifications((current) =>
                        current.filter(
                            (item) =>
                                item.id !== notification.id
                        )
                    );
                } catch (error) {
                    console.error(
                        `Failed to approve notification ${notification.id}:`,
                        error
                    );
                }
            }
        } finally {
            setApprovingAll(false);
        }
    };

    const handleNotificationClick = async (
        notification: any
    ) => {
        if (isBoss || notification.is_read) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notification.id);

        employeeSeenIdsRef.current.add(notification.id);

        setNotifications((current) =>
            current.map((item) =>
                item.id === notification.id
                    ? {
                        ...item,
                        is_read: true,
                    }
                    : item
            )
        );
    };

    const handleLogout = async () => {
        setLoading(true);

        await supabase.auth.signOut();

        router.push('/');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm">
            <aside className="flex h-full w-80 flex-col justify-between bg-white shadow-2xl animate-in slide-in-from-left duration-200">
                <div className="overflow-y-auto p-6">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Profile
                        </h2>

                        <button
                            type="button"
                            onClick={handleCloseDrawer}
                            className="rounded-lg p-2 transition hover:bg-neutral-100"
                            aria-label="Close profile"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mt-10 flex flex-col items-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 text-2xl font-semibold text-white">
                            {user?.name?.charAt(0).toUpperCase() ||
                                'U'}
                        </div>

                        <h3 className="mt-5 text-xl font-semibold text-neutral-900">
                            {user?.name || 'User'}
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            {user?.role || ''}
                        </p>
                    </div>

                    <div className="my-8 border-t border-neutral-200" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900">
                                    {isBoss
                                        ? 'Approval Requests'
                                        : 'Notifications'}
                                </h3>

                                {isBoss &&
                                    pendingApprovals.length > 0 && (
                                        <p className="mt-0.5 text-[10px] text-neutral-500">
                                            {
                                                pendingApprovals.length
                                            }{' '}
                                            pending approval
                                            {pendingApprovals.length !==
                                            1
                                                ? 's'
                                                : ''}
                                        </p>
                                    )}
                            </div>

                            {!isBoss && unreadCount > 0 && (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                    {unreadCount} new
                                </span>
                            )}

                            {isBoss &&
                                pendingApprovals.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleApproveAll}
                                        disabled={approvingAll}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {approvingAll ? (
                                            <>
                                                <Loader2
                                                    size={11}
                                                    className="animate-spin"
                                                />
                                                Approving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2
                                                    size={11}
                                                />
                                                Approve All (
                                                {
                                                    pendingApprovals.length
                                                }
                                                )
                                            </>
                                        )}
                                    </button>
                                )}
                        </div>

                        {notifications.length === 0 ? (
                            <div className="rounded-xl bg-neutral-50 px-4 py-8 text-center">
                                <Bell
                                    className="mx-auto mb-2 text-neutral-300"
                                    size={24}
                                />

                                <p className="text-xs text-neutral-500">
                                    {isBoss
                                        ? 'No pending approval requests'
                                        : 'No notifications'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map(
                                    (notification) => {
                                        const isSaleApproval =
                                            notification.type ===
                                            'FIX_REQUEST' &&
                                            notification.sale_id;

                                        const isStockApproval =
                                            notification.type ===
                                            'FIX_REQUEST_INVENTORY' &&
                                            notification.inventory_id;

                                        const isExpenseApproval =
                                            notification.type ===
                                            'FIX_REQUEST_EXPENSE' &&
                                            notification.expense_id;

                                        const isApproval =
                                            isSaleApproval ||
                                            isStockApproval ||
                                            isExpenseApproval;

                                        return (
                                            <div
                                                key={
                                                    notification.id
                                                }
                                                className={`rounded-xl border p-3 transition ${
                                                    notification.is_read
                                                        ? 'border-neutral-200 bg-white'
                                                        : 'border-emerald-200 bg-emerald-50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`mt-0.5 shrink-0 rounded-full p-2 ${
                                                            notification.is_read
                                                                ? 'bg-neutral-100 text-neutral-400'
                                                                : 'bg-emerald-100 text-emerald-600'
                                                        }`}
                                                    >
                                                        {notification.is_read ? (
                                                            <Check
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        ) : (
                                                            <Bell
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                            className="w-full text-left"
                                                        >
                                                            <p className="text-xs font-semibold text-neutral-900">
                                                                {
                                                                    notification.title
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>

                                                            <p className="mt-2 text-[10px] text-neutral-400">
                                                                {new Date(
                                                                    notification.created_at
                                                                ).toLocaleString()}
                                                            </p>
                                                        </button>

                                                        {isBoss &&
                                                            isApproval && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            notification
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        approvingId ===
                                                                        notification.id ||
                                                                        approvingAll
                                                                    }
                                                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {approvingId ===
                                                                    notification.id ? (
                                                                        <>
                                                                            <Loader2
                                                                                size={
                                                                                    13
                                                                                }
                                                                                className="animate-spin"
                                                                            />
                                                                            Approving...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle2
                                                                                size={
                                                                                    13
                                                                                }
                                                                            />
                                                                            Approve
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}

                                                        {!isBoss &&
                                                            !notification.is_read && (
                                                                <div className="mt-2 flex items-center gap-1.5">
                                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                                                    <span className="text-[10px] font-medium text-emerald-600">
                                                                        New
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>

                    <div className="my-8 border-t border-neutral-200" />

                </div>

                <div className="border-t border-neutral-200 p-6">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? 'Signing Out...'
                            : 'Sign Out'}
                    </button>
                </div>
            </aside>

            <button
                type="button"
                onClick={handleCloseDrawer}
                className="flex-1"
                aria-label="Close profile drawer"
            />
        </div>
    );
}