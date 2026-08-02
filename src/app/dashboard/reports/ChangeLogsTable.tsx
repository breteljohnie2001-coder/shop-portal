'use client';

import { History } from 'lucide-react';
import { ChangeLogItem } from '@/types/types';

interface Props {
    logs: ChangeLogItem[];
}

export function ChangeLogsTable({ logs }: Props) {
    return (
        <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                        Changes Logs & Audit Trail
                    </h2>
                </div>
                <span className="text-xs text-neutral-500 font-mono">Real-time updates</span>
            </div>

            <div className="mt-4 overflow-x-auto">
                {logs.length > 0 ? (
                    <table className="w-full text-left text-xs">
                        <thead>
                        <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 pt-1 font-semibold">Time</th>
                            <th className="pb-3 pt-1 font-semibold">User</th>
                            <th className="pb-3 pt-1 font-semibold">Action</th>
                            <th className="pb-3 pt-1 font-semibold text-right">Details</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                        {logs.map((log) => (
                            <tr key={log.id} className="group hover:bg-neutral-950/40">
                                <td className="py-3 font-mono text-neutral-500">{log.time}</td>
                                <td className="py-3 font-medium text-neutral-200">{log.user}</td>
                                <td className="py-3 text-neutral-300">{log.action}</td>
                                <td className="py-3 text-right font-mono text-neutral-400 group-hover:text-emerald-400 transition-colors">
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-xs text-neutral-500 italic py-4 text-center">
                        No recent audit logs recorded.
                    </p>
                )}
            </div>
        </section>
    );
}