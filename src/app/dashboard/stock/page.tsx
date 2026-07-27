'use client';

import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';

import EditStockModal, { EditableItem } from "@/components/dashboard/modals/EditStockModal";
import VoidModal from "@/components/dashboard/modals/VoidModal";
import {useStockData} from "@/hooks/useStockData";
import {StockItem} from "@/types/types";
import StockItemCard from "@/components/inventory/StockItemCard";
import ConfirmFixModal from "@/components/dashboard/modals/ConfirmFixModal";

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

    // Tab state: 'brand_a' | 'brand_b'
    const [selectedBrand, setSelectedBrand] = useState<'brand_a' | 'brand_b'>('brand_a');
    const [searchQuery, setSearchQuery] = useState('');
    const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
    const [itemToVoid, setItemToVoid] = useState<StockItem | null>(null);
    const [itemToFix, setItemToFix] = useState<StockItem | null>(null);

    const handleConfirmStockFix = async () => {
        if (!itemToFix) return;
        await handleRequestFix(itemToFix.id);
        setItemToFix(null);
    };
    // Filter inventory strict by selected brand
    const filteredStock = useMemo(() => {
        return inventory.filter((item) => {
            const rawBrand = item.brandId ? String(item.brandId).toLowerCase().trim() : '';

            // Check if brand matches tab A vs tab B
            const isBrandA = rawBrand === 'a' || rawBrand === 'brand_a' || rawBrand.includes('trendy') || rawBrand === '1';
            const isBrandB = rawBrand === 'b' || rawBrand === 'brand_b' || rawBrand.includes('baddie') || rawBrand === '2';

            const matchesSelectedBrand = selectedBrand === 'brand_a' ? isBrandA : isBrandB;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSelectedBrand && matchesSearch;
        });
    }, [inventory, selectedBrand, searchQuery]);

    const onSaveEdit = async (updatedItem: EditableItem) => {
        const success = await handleSaveEdit(updatedItem);
        if (success) setItemToEdit(null);
    };

    const onConfirmVoid = async () => {
        if (!itemToVoid) return;
        const success = await handleConfirmVoid(itemToVoid.id);
        if (success) setItemToVoid(null);
    };

    return (
        <div className="space-y-6 text-stone-100">
            {/* Header */}
            <div className="pb-3 border-b border-stone-800">
                <h1 className="text-2xl font-bold text-white">Stock</h1>
                <p className="text-xs text-stone-400">Inventory Management & Approval Workflow</p>
            </div>

            {/* Brand Switcher */}
            <div className="grid grid-cols-2 rounded-2xl bg-stone-900 p-1.5 border border-stone-800">
                <button
                    onClick={() => setSelectedBrand('brand_a')}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                        selectedBrand === 'brand_a' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
                    }`}
                >
                    Bee Trendy
                </button>
                <button
                    onClick={() => setSelectedBrand('brand_b')}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                        selectedBrand === 'brand_b' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
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
                    <span className="text-xs">Loading stock items...</span>
                </div>
            ) : filteredStock.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">
                    No items found for {selectedBrand === 'brand_a' ? 'Bee Trendy' : 'Baddie on a Budget'}.
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
                        />
                    ))}
                </div>
            )}

            <ConfirmFixModal
                isOpen={!!itemToFix}
                itemName={itemToFix ? itemToFix.name : ''}
                onClose={() => setItemToFix(null)}
                onConfirm={handleConfirmStockFix}
            />

            {/* Modals */}
            <EditStockModal
                isOpen={!!itemToEdit}
                item={itemToEdit}
                onClose={() => setItemToEdit(null)}
                onSave={onSaveEdit}
            />

            <VoidModal
                isOpen={!!itemToVoid}
                itemName={itemToVoid?.name || ''}
                onClose={() => setItemToVoid(null)}
                onConfirm={onConfirmVoid}
            />
        </div>
    );
}