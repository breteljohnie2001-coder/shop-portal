'use client';

import { useState, useEffect } from 'react';
import { X, PackagePlus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { compressImageToWebP } from '@/lib/utils/imageCompressor';
import ImageUploader from "@/components/inventory/ImageUploader";

const supabase = createClient();

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

export default function AddStockModal({ isOpen, onClose, onSaveSuccess }: AddStockModalProps) {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState<number | ''>('');
    const [sizes, setSizes] = useState('');
    const [colors, setColors] = useState('');
    const [brandId, setBrandId] = useState<'brand_a' | 'brand_b' | null>(null);
    const [isBrandLocked, setIsBrandLocked] = useState(false);

    // Image State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        async function init() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, assigned_brand')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'boss' || !profile?.assigned_brand) {
                    setBrandId('brand_a');
                    setIsBrandLocked(false);
                } else {
                    setBrandId(profile.assigned_brand as 'brand_a' | 'brand_b');
                    setIsBrandLocked(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [isOpen]);

    const handleImageSelect = (file: File | null) => {
        setSelectedFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandId || !itemName.trim() || !unitPrice) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let uploadedImageUrl: string | null = null;

            // 1. Handle image upload if selected
            if (selectedFile) {
                // Compress image locally before sending to Supabase
                const compressedWebPFile = await compressImageToWebP(selectedFile);

                const filePath = `${brandId}/${Date.now()}_${compressedWebPFile.name}`;

                const { error: uploadError } = await supabase.storage
                    .from('inventory-images')
                    .upload(filePath, compressedWebPFile, {
                        contentType: 'image/webp',
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                // Fetch Public URL
                const { data: urlData } = supabase.storage
                    .from('inventory-images')
                    .getPublicUrl(filePath);

                uploadedImageUrl = urlData.publicUrl;
            }

            // 2. Format inputs
            const sizesArray = sizes.split(',').map((s) => s.trim()).filter(Boolean);
            const colorsArray = colors.split(',').map((c) => c.trim()).filter(Boolean);

            // 3. Insert record into Supabase
            const { error } = await supabase.from('inventory').insert({
                brand_id: brandId,
                name: itemName.trim(),
                quantity: quantity,
                price: Number(unitPrice),
                sizes: sizesArray.length > 0 ? sizesArray : null,
                colors: colorsArray.length > 0 ? colorsArray : null,
                image: uploadedImageUrl, // Save image URL in column 'image'
                created_by: user.id,
            });

            if (error) throw error;

            // Reset Form State
            setItemName('');
            setQuantity(1);
            setUnitPrice('');
            setSizes('');
            setColors('');
            setSelectedFile(null);
            setImagePreview(null);

            onSaveSuccess?.();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to add stock');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0F0F10] p-6 shadow-2xl text-white space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <PackagePlus className="h-5 w-5 text-emerald-400" />
                        <h2 className="text-lg font-bold">Add Inventory Stock</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Brand Switcher */}
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                Brand
                            </label>
                            {isBrandLocked ? (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm font-medium">
                                    {brandId === 'brand_a' ? 'Bee Trendy' : 'Baddie'}
                                    <span className="ml-2 text-xs text-neutral-500">(locked)</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setBrandId('brand_a')}
                                        className={`rounded-lg py-1.5 text-xs font-bold ${
                                            brandId === 'brand_a' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                                        }`}
                                    >
                                        Bee Trendy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBrandId('brand_b')}
                                        className={`rounded-lg py-1.5 text-xs font-bold ${
                                            brandId === 'brand_b' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                                        }`}
                                    >
                                        Baddie
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Image Uploader */}
                        <ImageUploader
                            previewUrl={imagePreview}
                            onImageSelect={handleImageSelect}
                            disabled={isSubmitting}
                        />

                        {/* Item Name */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">Item Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Floral Maxi Dress"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                            />
                        </div>

                        {/* Quantity + Price */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">Quantity</label>
                                <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden h-10">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
                                    >
                                        −
                                    </button>
                                    <span className="flex-1 text-center text-xs font-mono">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">Unit Price (KES)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="0"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-700 h-10"
                                />
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">
                                Sizes <span className="text-neutral-600">(optional, comma separated)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. S, M, L, XL"
                                value={sizes}
                                onChange={(e) => setSizes(e.target.value.toUpperCase())}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                            />
                        </div>

                        {/* Colours */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1">
                                Colours <span className="text-neutral-600">(optional, comma separated)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. BLACK, WHITE, RED"
                                value={colors}
                                onChange={(e) => setColors(e.target.value.toUpperCase())}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-1/2 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !brandId}
                                className="w-1/2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {isSubmitting ? 'Adding…' : 'Add Stock'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}