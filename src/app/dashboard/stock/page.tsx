'use client';

import { useState, useMemo } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import EditStockModal, {
    EditableItem,
} from '@/components/dashboard/modals/EditStockModal';
import VoidModal from '@/components/dashboard/modals/VoidModal';
import { useStockData } from '@/hooks/useStockData';
import { StockItem } from '@/types/types';
import StockItemCard from '@/components/inventory/StockItemCard';
import ConfirmFixModal from '@/components/dashboard/modals/ConfirmFixModal';

export default function StockPage() {
    const {
        userRole,
        assignedBrand,
        inventory,
        loading,
        handleSaveEdit,
        handleConfirmVoid,
        handleRequestFix,
        handleApproveFix,
    } = useStockData();

    const [selectedBrand, setSelectedBrand] = useState<
        'brand_a' | 'brand_b'
    >('brand_a');

    const [searchQuery, setSearchQuery] = useState('');

    const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
    const [itemToVoid, setItemToVoid] = useState<StockItem | null>(null);
    const [itemToFix, setItemToFix] = useState<StockItem | null>(null);
    const [itemToView, setItemToView] = useState<StockItem | null>(null);

    const handleConfirmStockFix = async () => {
        if (!itemToFix) return;

        await handleRequestFix(itemToFix.id);
        setItemToFix(null);
    };

    const filteredStock = useMemo(() => {
        return inventory.filter((item) => {
            const rawBrand = item.brandId
                ? String(item.brandId).toLowerCase().trim()
                : '';

            const isBrandA =
                rawBrand === 'a' ||
                rawBrand === 'brand_a' ||
                rawBrand.includes('trendy') ||
                rawBrand === '1';

            const isBrandB =
                rawBrand === 'b' ||
                rawBrand === 'brand_b' ||
                rawBrand.includes('baddie') ||
                rawBrand === '2';

            const matchesSelectedBrand =
                selectedBrand === 'brand_a' ? isBrandA : isBrandB;

            const matchesSearch = item.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return matchesSelectedBrand && matchesSearch;
        });
    }, [inventory, selectedBrand, searchQuery]);

    const onSaveEdit = async (
        updatedItem: EditableItem,
        reason: string
    ) => {
        const success = await handleSaveEdit(updatedItem);

        if (success) {
            setItemToEdit(null);

            // Keep the detail modal in sync if it is currently open
            setItemToView((current) => {
                if (!current || current.id !== updatedItem.id) {
                    return current;
                }

                return {
                    ...current,
                    name: updatedItem.name,
                    price: updatedItem.price,
                    quantity: updatedItem.quantity,
                    variants: updatedItem.variants
                        ? updatedItem.variants.map((variant) => ({
                            id: variant.id ?? crypto.randomUUID(),
                            color: variant.color,
                            size: variant.size,
                            quantity: variant.quantity,
                        }))
                        : current.variants,
                };
            });
        }
    };
    const onConfirmVoid = async () => {
        if (!itemToVoid) return;

        const success = await handleConfirmVoid(itemToVoid.id);

        if (success) {
            setItemToVoid(null);

            if (itemToView?.id === itemToVoid.id) {
                setItemToView(null);
            }
        }
    };

    return (
        <div className="space-y-6 text-stone-100">
            {/* Header */}
            <div className="pb-3 border-b border-stone-800">
                <h1 className="text-2xl font-bold text-white">Stock</h1>
                <p className="text-xs text-stone-400">
                    Inventory Management & Approval Workflow
                </p>
            </div>

            {/* Brand Switcher */}
            <div className="grid grid-cols-2 rounded-2xl bg-stone-900 p-1.5 border border-stone-800">
                <button
                    onClick={() => setSelectedBrand('brand_a')}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                        selectedBrand === 'brand_a'
                            ? 'bg-stone-800 text-white shadow-sm'
                            : 'text-stone-400 hover:text-stone-200'
                    }`}
                >
                    Bee Trendy
                </button>

                <button
                    onClick={() => setSelectedBrand('brand_b')}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                        selectedBrand === 'brand_b'
                            ? 'bg-stone-800 text-white shadow-sm'
                            : 'text-stone-400 hover:text-stone-200'
                    }`}
                >
                    Baddie on a Budget
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                <input
                    type="text"
                    placeholder="Search stock..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2.5 pl-10 pr-4 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-stone-700"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-stone-500 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">
                        Loading stock items...
                    </span>
                </div>
            ) : filteredStock.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">
                    No items found for{' '}
                    {selectedBrand === 'brand_a'
                        ? 'Bee Trendy'
                        : 'Baddie on a Budget'}
                    .
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredStock.map((item) => (
                        <StockItemCard
                            key={item.id}
                            item={item}
                            userRole={userRole}
                            assignedBrand={assignedBrand}
                            onEdit={setItemToEdit}
                            onVoid={setItemToVoid}
                            onRequestFix={() => setItemToFix(item)}
                            onApproveFix={handleApproveFix}
                            onViewDetails={() => setItemToView(item)}
                        />
                    ))}
                </div>
            )}

            {/* Stock Detail Modal */}
            {itemToView && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setItemToView(null)}
                >
                    <div
                        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-stone-800">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {itemToView.name}
                                </h2>

                                <p className="text-xs text-stone-400 font-mono mt-1">
                                    KES {itemToView.price.toLocaleString()}
                                </p>
                            </div>

                            <button
                                onClick={() => setItemToView(null)}
                                className="rounded-full bg-stone-800 p-2 text-stone-400 hover:text-white hover:bg-stone-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Stock Breakdown */}
                        <div className="p-5 space-y-6">
                            {itemToView.variants.length === 0 ? (
                                <div className="text-center py-8 text-xs text-stone-500">
                                    No detailed stock breakdown available.
                                </div>
                            ) : (
                                (() => {
                                    const grouped = itemToView.variants.reduce<
                                        Record<
                                            string,
                                            typeof itemToView.variants
                                        >
                                    >((groups, variant) => {
                                        if (!groups[variant.color]) {
                                            groups[variant.color] = [];
                                        }

                                        groups[variant.color].push(variant);

                                        return groups;
                                    }, {});

                                    return Object.entries(grouped).map(
                                        ([color, variants]) => (
                                            <div key={color} className="space-y-2">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                                                    {color}
                                                </h3>

                                                <div className="overflow-hidden rounded-xl border border-stone-800">
                                                    {variants.map((variant) => (
                                                        <div
                                                            key={variant.id}
                                                            className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 border-stone-800"
                                                        >
                                                            <span className="text-sm text-stone-300">
                                                                {variant.size}
                                                            </span>

                                                            <span className="font-mono text-sm font-bold text-white">
                                                                {variant.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    );
                                })()
                            )}

                            {/* Total */}
                            <div className="flex items-center justify-between rounded-xl bg-stone-800/60 border border-stone-700/60 px-4 py-3">
                                <span className="text-sm font-semibold text-stone-300">
                                    Total Stock
                                </span>

                                <span className="font-mono text-sm font-bold text-white">
                                    {itemToView.variants.reduce(
                                        (total, variant) =>
                                            total + variant.quantity,
                                        0
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Fix */}
            <ConfirmFixModal
                isOpen={!!itemToFix}
                itemName={itemToFix ? itemToFix.name : ''}
                onClose={() => setItemToFix(null)}
                onConfirm={handleConfirmStockFix}
            />

            {/* Edit */}
            <EditStockModal
                isOpen={!!itemToEdit}
                item={itemToEdit}
                onClose={() => setItemToEdit(null)}
                onSave={onSaveEdit}
            />

            {/* Void */}
            <VoidModal
                isOpen={!!itemToVoid}
                itemName={itemToVoid?.name || ''}
                onClose={() => setItemToVoid(null)}
                onConfirm={onConfirmVoid}
            />
        </div>
    );
}