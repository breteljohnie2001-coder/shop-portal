'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, PackagePlus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { compressImageToWebP } from '@/lib/utils/imageCompressor';
import ImageUploader from '@/components/inventory/ImageUploader';
import StockVariantEditor, {
    StockVariantInput,
} from '@/components/inventory/StockVariantEditor';

const supabase = createClient();

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

export default function AddStockModal({
                                          isOpen,
                                          onClose,
                                          onSaveSuccess,
                                      }: AddStockModalProps) {
    const [itemName, setItemName] = useState('');
    const [manualQuantity, setManualQuantity] = useState(0);
    const [unitPrice, setUnitPrice] = useState<number | ''>('');
    const [brandId, setBrandId] = useState<'brand_a' | 'brand_b' | null>(null);
    const [isBrandLocked, setIsBrandLocked] = useState(false);
    const [variants, setVariants] = useState<StockVariantInput[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role, assigned_brand')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile?.role === 'boss' || !profile?.assigned_brand) {
                    setBrandId('brand_a');
                    setIsBrandLocked(false);
                } else {
                    setBrandId(profile.assigned_brand as 'brand_a' | 'brand_b');
                    setIsBrandLocked(true);
                }
            } catch (error) {
                console.error('Add Stock Init Error:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const totalVariantQuantity = useMemo(
        () =>
            variants.reduce(
                (total, variant) => total + Math.max(0, Number(variant.quantity) || 0),
                0
            ),
        [variants]
    );

    const handleImageSelect = (file: File | null) => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setSelectedFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const resetForm = () => {
        setItemName('');
        setManualQuantity(0);
        setUnitPrice('');
        setVariants([]);
        setSelectedFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandId || !itemName.trim() || unitPrice === '') return;

        // Clean and validate variants
        const cleanedVariants = variants
            .map((variant) => ({
                color: variant.color.trim().toUpperCase(),
                size: variant.size.trim().toUpperCase(),
                quantity: Math.max(0, Number(variant.quantity) || 0),
            }))
            .filter((variant) => variant.color.length > 0 && variant.size.length > 0);

        // Prevent duplicate color/size combinations
        const combinations = new Set<string>();
        for (const variant of cleanedVariants) {
            const key = `${variant.color}::${variant.size}`;
            if (combinations.has(key)) {
                alert(`Duplicate stock combination: ${variant.color} / ${variant.size}`);
                return;
            }
            combinations.add(key);
        }

        const finalQuantity =
            cleanedVariants.length > 0
                ? cleanedVariants.reduce((total, variant) => total + variant.quantity, 0)
                : Math.max(0, manualQuantity);

        setIsSubmitting(true);
        let inventoryId: string | null = null;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Upload image
            let uploadedImageUrl: string | null = null;
            if (selectedFile) {
                const compressedWebPFile = await compressImageToWebP(selectedFile);
                const filePath = `${brandId}/${Date.now()}_${compressedWebPFile.name}`;

                const { error: uploadError } = await supabase.storage
                    .from('inventory-images')
                    .upload(filePath, compressedWebPFile, {
                        contentType: 'image/webp',
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('inventory-images')
                    .getPublicUrl(filePath);

                uploadedImageUrl = urlData.publicUrl;
            }

            // 2. Build legacy arrays
            const colorsArray = [...new Set(cleanedVariants.map((v) => v.color))];
            const sizesArray = [...new Set(cleanedVariants.map((v) => v.size))];

            // 3. Insert parent inventory
            const { data: inventoryRecord, error: inventoryError } = await supabase
                .from('inventory')
                .insert({
                    brand_id: brandId,
                    name: itemName.trim(),
                    quantity: finalQuantity,
                    price: Number(unitPrice),
                    sizes: sizesArray.length > 0 ? sizesArray : [],
                    colors: colorsArray.length > 0 ? colorsArray : [],
                    image: uploadedImageUrl,
                    created_by: user.id,
                })
                .select('id')
                .single();

            if (inventoryError) throw inventoryError;
            if (!inventoryRecord?.id) {
                throw new Error('Inventory record was created but no ID was returned.');
            }

            inventoryId = inventoryRecord.id;
            console.log('Inventory created:', inventoryRecord);

            // 4. Insert child inventory variants
            if (cleanedVariants.length > 0) {
                const variantRows = cleanedVariants.map((variant) => ({
                    inventory_id: inventoryRecord.id,
                    color: variant.color,
                    size: variant.size,
                    quantity: variant.quantity,
                }));

                console.log('Creating inventory variants:', variantRows);

                const { data: insertedVariants, error: variantsError } = await supabase
                    .from('inventory_variants')
                    .insert(variantRows)
                    .select('id, inventory_id, color, size, quantity');

                if (variantsError) {
                    console.error('Inventory Variants Insert Error:', variantsError);
                    throw variantsError;
                }

                console.log('Inventory variants successfully created:', insertedVariants);

                if (!insertedVariants || insertedVariants.length !== variantRows.length) {
                    throw new Error('The inventory item was created, but not all stock variants were created.');
                }
            }

            // 5. Success
            resetForm();
            onSaveSuccess?.();
            onClose();
        } catch (error: unknown) {
            console.error('Add Inventory Error:', error);

            if (inventoryId) {
                await supabase.from('inventory').delete().eq('id', inventoryId);
            }

            const message = error instanceof Error ? error.message : 'Failed to add stock';
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0F0F10] p-6 shadow-2xl text-white space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <PackagePlus className="h-5 w-5 text-emerald-400" />
                        <h2 className="text-lg font-bold">Add Inventory Stock</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Brand */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                Brand
                            </label>
                            {isBrandLocked ? (
                                <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm font-medium">
                                    {brandId === 'brand_a' ? 'Bee Trendy' : 'Baddie on a Budget'}
                                    <span className="ml-2 text-xs text-neutral-500">(locked)</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 rounded-xl border border-neutral-800 bg-neutral-900 p-1">
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
                                        Baddie on a Budget
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Image */}
                        <ImageUploader
                            previewUrl={imagePreview}
                            onImageSelect={handleImageSelect}
                            disabled={isSubmitting}
                        />

                        {/* Item Name */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-400">
                                Item Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Floral Maxi Dress"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-400">
                                Unit Price (KES)
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="0"
                                value={unitPrice}
                                onChange={(e) =>
                                    setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))
                                }
                                className="h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-neutral-700"
                            />
                        </div>

                        {/* Manual quantity only when no variants */}
                        {variants.length === 0 && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-400">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={manualQuantity}
                                    onChange={(e) =>
                                        setManualQuantity(e.target.value === '' ? 0 : Number(e.target.value))
                                    }
                                    className="h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-neutral-700"
                                />
                            </div>
                        )}

                        {/* Variants */}
                        <StockVariantEditor
                            variants={variants}
                            onChange={setVariants}
                            disabled={isSubmitting}
                        />

                        {/* Submit */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-1/2 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isSubmitting || !brandId || !itemName.trim() || unitPrice === ''
                                }
                                className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
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