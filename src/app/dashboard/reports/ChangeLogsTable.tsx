'use client';

import { History } from 'lucide-react';
import { ChangeLogItem } from '@/types/types';

interface Props {
    logs: ChangeLogItem[];
}

export function ChangeLogsTable({ logs }: Props) {
    // Only keep the 10 most recent logs
    const recentLogs = logs.slice(0, 10);

    return (
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-emerald-400 shrink-0" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                        Changes Logs & Audit Trail
                    </h2>
                </div>
                <span className="text-xs text-neutral-500 font-mono shrink-0">
          Last 10 entries
        </span>
            </div>

            {/* Table Container */}
            <div className="mt-4 overflow-x-auto">
                {recentLogs.length > 0 ? (
                    <table className="w-full text-left text-xs table-fixed">
                        <thead>
                        <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 pt-1 font-semibold w-[120px]">Time</th>
                            <th className="pb-3 pt-1 font-semibold w-[130px]">User</th>
                            <th className="pb-3 pt-1 font-semibold w-[150px]">Action</th>
                            <th className="pb-3 pt-1 font-semibold text-right">Details</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                        {recentLogs.map((log) => (
                            <tr key={log.id} className="group hover:bg-neutral-950/40">
                                {/* Time */}
                                <td className="py-3 font-mono text-neutral-500 whitespace-nowrap">
                                    {log.time}
                                </td>

                                {/* User */}
                                <td
                                    className="py-3 font-medium text-neutral-200 whitespace-nowrap truncate max-w-[130px]"
                                    title={log.user}
                                >
                                    {log.user}
                                </td>

                                {/* Action */}
                                <td
                                    className="py-3 text-neutral-300 truncate max-w-[150px]"
                                    title={log.action}
                                >
                                    {log.action}
                                </td>

                                {/* Details */}
                                <td
                                    className="py-3 text-right font-mono text-neutral-400 group-hover:text-emerald-400 transition-colors truncate max-w-[280px] ml-auto"
                                    title={log.details}
                                >
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-xs text-neutral-500 italic py-6 text-center">
                        No recent audit logs recorded.
                    </p>
                )}
            </div>
        </section>
    );
}