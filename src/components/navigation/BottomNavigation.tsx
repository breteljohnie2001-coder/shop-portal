'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    House,
    ReceiptText,
    Package,
    BarChart3,
} from 'lucide-react';

const navItems = [
    {
        label: 'Home',
        href: '/dashboard',
        icon: House,
    },
    {
        label: 'Sales',
        href: '/dashboard/sales',
        icon: ReceiptText,
    },
    {
        label: 'Stock',
        href: '/dashboard/stock',
        icon: Package,
    },
    {
        label: 'Reports',
        href: '/dashboard/reports',
        icon: BarChart3,
    },
];

export default function BottomNavigation() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-5 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-neutral-800/80 bg-neutral-900/90 shadow-2xl shadow-black/80 backdrop-blur-lg">
            <div className="flex items-center justify-around p-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 px-3 transition-all duration-200 ${
                                active
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
                            }`}
                        >
                            <Icon
                                size={20}
                                strokeWidth={active ? 2.5 : 1.8}
                                className={active ? 'text-emerald-400' : 'text-neutral-400'}
                            />

                            <span className={`text-[11px] font-medium tracking-wide ${active ? 'font-semibold text-emerald-400' : 'text-neutral-400'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}