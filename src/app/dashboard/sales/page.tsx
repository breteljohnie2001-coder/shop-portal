'use client';

import { useState, useMemo } from 'react';
import { Search, Calendar as CalendarIcon, Filter, Smartphone, Banknote, X, Check, Loader2 } from 'lucide-react';

import VoidModal from "@/components/dashboard/modals/VoidModal";
import EditSaleModal, { EditableSaleItem } from "@/components/dashboard/modals/EditSaleModal";
import { useSalesData } from "@/hooks/useSalesData";
import { PastSale } from "@/types/types";
import SaleItemCard from "@/components/Sale/SaleItemCard";
import ConfirmFixModal from "@/components/dashboard/modals/ConfirmFixModal";

export default function SalesRecordsPage() {
    // Default to today's date in YYYY-MM-DD
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    const [saleToFix, setSaleToFix] = useState<PastSale | null>(null);

    const handleConfirmRequestFix = async () => {
        if (!saleToFix) return;
        await handleRequestFix(saleToFix.id);
        setSaleToFix(null);
    };

    const {
        userRole,
        assignedBrand,
        salesList,
        loading,
        handleSaveEdit,
        handleConfirmVoid,
        handleRequestFix,
        handleApproveFix,
    } = useSalesData(selectedDate);

    const [selectedBrand, setSelectedBrand] = useState<'brand_a' | 'brand_b' | 'ALL'>('brand_a');
    const [selectedPayment, setSelectedPayment] = useState<'ALL' | 'M-Pesa' | 'Cash'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Modal states
    const [saleToEdit, setSaleToEdit] = useState<PastSale | null>(null);
    const [saleToVoid, setSaleToVoid] = useState<PastSale | null>(null);

    const filteredSales = useMemo(() => {
        return salesList.filter((sale: any) => {
            // Standardize raw brand string from brand_id or brandId
            const rawBrand = String(sale.brandId || sale.brand_id || '').toLowerCase().trim();

            const isBrandA =
                rawBrand === 'a' ||
                rawBrand === 'brand_a' ||
                rawBrand.includes('bee') ||
                rawBrand.includes('trendy') ||
                rawBrand === '1';

            const isBrandB =
                rawBrand === 'b' ||
                rawBrand === 'brand_b' ||
                rawBrand.includes('baddie') ||
                rawBrand.includes('budget') ||
                rawBrand === '2';

            // Match brand based on active tab, fallback to true if selectedBrand is 'ALL' or unassigned
            let matchesBrand = true;
            if (selectedBrand === 'brand_a') {
                matchesBrand = isBrandA || (!isBrandA && !isBrandB); // Shows unmapped sales in Tab A rather than hiding
            } else if (selectedBrand === 'brand_b') {
                matchesBrand = isBrandB;
            }

            const matchesPayment = selectedPayment === 'ALL' || sale.paymentMethod === selectedPayment;

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                (sale.customerName && sale.customerName.toLowerCase().includes(query)) ||
                (sale.receiptNo && sale.receiptNo.toLowerCase().includes(query)) ||
                (sale.items && sale.items.some((item: any) => item.name && item.name.toLowerCase().includes(query)));

            return matchesBrand && matchesPayment && matchesSearch;
        });
    }, [salesList, selectedBrand, selectedPayment, searchQuery]);

    const totalRevenue = filteredSales.reduce((acc, item) => acc + item.amount, 0);

    const onSaveEdit = async (updatedSale: EditableSaleItem) => {
        const success = await handleSaveEdit(updatedSale);
        if (success) setSaleToEdit(null);
    };

    const onConfirmVoid = async () => {
        if (!saleToVoid) return;
        const success = await handleConfirmVoid(saleToVoid.id);
        if (success) setSaleToVoid(null);
    };

    return (
        <div className="min-h-screen bg-[#0F0F10] p-4 sm:p-6 space-y-6 text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Sales Record</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">Track sales and transaction breakdowns</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <label
                            htmlFor="sales-date-picker"
                            className="flex items-center gap-2 rounded-xl bg-stone-900 border border-stone-800 px-3 py-2 text-xs font-medium text-stone-200 hover:border-stone-700 cursor-pointer shadow-sm"
                        >
                            <CalendarIcon className="h-4 w-4 text-emerald-400 pointer-events-none" />
                            <span className="font-mono text-[11px] text-stone-300 pointer-events-none">
                                {selectedDate || 'Select Date'}
                            </span>
                        </label>

                        <input
                            id="sales-date-picker"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            onClick={(e) => {
                                try {
                                    e.currentTarget.showPicker();
                                } catch (err) {}
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                    </div>
                </div>
            </div>

            {/* Brand Switcher */}
            <div className="grid grid-cols-2 rounded-xl bg-neutral-900 p-1.5 border border-neutral-800/80 shadow-lg">
                <button
                    onClick={() => setSelectedBrand('brand_a')}
                    className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                        selectedBrand === 'brand_a' ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                    Bee Trendy Collection
                </button>

                <button
                    onClick={() => setSelectedBrand('brand_b')}
                    className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                        selectedBrand === 'brand_b' ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                    Baddie on a Budget
                </button>
            </div>

            {/* Revenue Summary Card */}
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/90 p-4 shadow-xl flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        {selectedBrand === 'brand_a' ? 'Bee Trendy' : 'Baddie'} Sales Volume
                    </span>
                    <p className="text-xs text-neutral-400 mt-0.5">
                        {filteredSales.length} transaction{filteredSales.length === 1 ? '' : 's'} recorded
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Revenue</span>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                        <span className="text-xs font-sans text-neutral-500 mr-1">KES</span>
                        {totalRevenue.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Search + Payment Filter */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search by customer, receipt or item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                            selectedPayment !== 'ALL'
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 z-30 w-44 rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-2xl space-y-1">
                            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase border-b border-neutral-800 mb-1">
                                <span>Payment Mode</span>
                                <button onClick={() => setIsFilterOpen(false)}><X className="h-3 w-3 text-neutral-400" /></button>
                            </div>

                            <button
                                onClick={() => { setSelectedPayment('ALL'); setIsFilterOpen(false); }}
                                className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs font-medium ${
                                    selectedPayment === 'ALL' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                                }`}
                            >
                                <span>All Methods</span>
                                {selectedPayment === 'ALL' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>

                            <button
                                onClick={() => { setSelectedPayment('M-Pesa'); setIsFilterOpen(false); }}
                                className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs font-medium ${
                                    selectedPayment === 'M-Pesa' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-400'
                                }`}
                            >
                                <span className="flex items-center gap-1.5"><Smartphone className="h-3 w-3" /> M-Pesa</span>
                                {selectedPayment === 'M-Pesa' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>

                            <button
                                onClick={() => { setSelectedPayment('Cash'); setIsFilterOpen(false); }}
                                className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs font-medium ${
                                    selectedPayment === 'Cash' ? 'bg-amber-500/10 text-amber-400' : 'text-neutral-400'
                                }`}
                            >
                                <span className="flex items-center gap-1.5"><Banknote className="h-3 w-3" /> Cash</span>
                                {selectedPayment === 'Cash' && <Check className="h-3.5 w-3.5 text-amber-400" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sales List */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-neutral-500 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">Loading sales transactions...</span>
                </div>
            ) : filteredSales.length === 0 ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center text-xs text-neutral-500 space-y-2">
                    <p>No sales recorded for this date and filter selection ({selectedDate}).</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSales.map((sale) => (
                        <SaleItemCard
                            key={sale.id}
                            sale={sale}
                            userRole={userRole}
                            assignedBrand={assignedBrand}
                            onEdit={setSaleToEdit}
                            onVoid={setSaleToVoid}
                            onRequestFix={() => setSaleToFix(sale)}
                            onApproveFix={handleApproveFix}
                        />
                    ))}
                </div>
            )}

            <ConfirmFixModal
                isOpen={!!saleToFix}
                itemName={saleToFix ? `Sale #${saleToFix.receiptNo} (${saleToFix.customerName})` : ''}
                onClose={() => setSaleToFix(null)}
                onConfirm={handleConfirmRequestFix}
            />

            {/* Modals */}
            <EditSaleModal
                isOpen={!!saleToEdit}
                sale={
                    saleToEdit
                        ? {
                            id: saleToEdit.id,
                            receiptNo: saleToEdit.receiptNo,
                            itemName: saleToEdit.items[0]?.name || '',
                            clientName: saleToEdit.customerName,
                            paymentMethod: saleToEdit.paymentMethod === 'Cash' ? 'Cash' : 'MPESA',
                            unitPrice: saleToEdit.items[0]?.price || saleToEdit.amount,
                            quantity: saleToEdit.items[0]?.quantity || 1,
                        }
                        : null
                }
                onClose={() => setSaleToEdit(null)}
                onSave={onSaveEdit}
            />

            <VoidModal
                isOpen={!!saleToVoid}
                itemName={`Sale #${saleToVoid?.receiptNo} (${saleToVoid?.customerName})`}
                onClose={() => setSaleToVoid(null)}
                onConfirm={onConfirmVoid}
            />
        </div>
    );
}