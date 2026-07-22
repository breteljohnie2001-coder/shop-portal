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
            <div className="flex items-center justify-around py-2.5 px-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                                active
                                    ? 'text-emerald-400'
                                    : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                        >
                            <Icon
                                size={20}
                                strokeWidth={active ? 2.5 : 1.8}
                                className="transition-transform duration-200 group-hover:scale-105"
                            />

                            <span className={`text-[11px] tracking-wide ${active ? 'font-semibold text-emerald-400' : 'font-medium text-neutral-400'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}