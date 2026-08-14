'use client';

import { useState, useEffect, useCallback } from 'react';
import { EditableItem } from '@/components/dashboard/modals/EditStockModal';
import { createClient } from '@/lib/supabase/client';
import { StockItem, StockVariant, InventoryRow } from '@/types/types';
import { useUser } from '@/context/UserContext';
import {
    requestStockFix,
    approveStockFix,
} from '@/lib/stockApproval';

const supabase = createClient();


type EditableStockVariant = Omit<StockVariant, 'id'> & {
    id?: string;
};

type EditableItemWithVariants = EditableItem & {
    variants?: EditableStockVariant[];
};

export function useStockData() {
    const { user } = useUser();

    const [inventory, setInventory] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);

    const userRole =
        user?.role === 'boss' || user?.role === 'owner'
            ? 'boss'
            : 'employee';

    const assignedBrand = user?.assignedBrand || null;
    const isBrandLocked = user?.isBrandLocked ?? false;

    // ─────────────────────────────────────────────────────────────
    // Fetch inventory + detailed variants + linked sale_items check
    // ─────────────────────────────────────────────────────────────
    const fetchInventory = useCallback(async () => {
        if (!user) return;

        setLoading(true);

        const { data, error } = await supabase
            .from('inventory')
            .select(`
                *,
                inventory_variants (
                    id,
                    color,
                    size,
                    quantity,
                    created_at,
                    updated_at
                ),
                sale_items (
                    id
                )
            `)
            .eq('is_voided', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Inventory Error:', error.message);
            setLoading(false);
            return;
        }

        if (data) {
            const formattedItems: StockItem[] = (
                data as unknown as (InventoryRow & { sale_items?: { id: string }[] })[]
            ).map((item) => ({
                id: item.id,
                name: item.name,
                brandId: String(item.brand_id).toLowerCase(),
                quantity: item.quantity,
                price: Number(item.price),
                imageUrl: item.image || undefined,
                createdAt: new Date(item.created_at),
                fixRequested: item.fix_requested,
                bossApprovedFix: item.boss_approved_fix,

                // 🔒 Lock Flag: True if 1 or more non-voided sales match this item
                hasSales: Array.isArray(item.sale_items) && item.sale_items.length > 0,

                variants: (item.inventory_variants ?? []).map(
                    (variant: StockVariant) => ({
                        id: variant.id,
                        color: variant.color,
                        size: variant.size,
                        quantity: variant.quantity,
                    })
                ),
            }));

            setInventory(formattedItems);
        }

        setLoading(false);
    }, [user, isBrandLocked, assignedBrand]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // ─────────────────────────────────────────────────────────────
    // Save stock item + its color/size variants
    // ─────────────────────────────────────────────────────────────
    const handleSaveEdit = async (
        updatedItem: EditableItemWithVariants
    ) => {
        // 1. Update the main inventory record
        const { error: inventoryError } = await supabase
            .from('inventory')
            .update({
                name: updatedItem.name,
                price: updatedItem.price,
                quantity: updatedItem.quantity,
                boss_approved_fix: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', updatedItem.id);

        if (inventoryError) {
            console.error(
                'Inventory Update Error:',
                inventoryError.message
            );
            alert('Failed to update stock item');
            return false;
        }
// Example: Fix inside handleSaveEdit
        const originalItem = inventory.find((i) => i.id === updatedItem.id);

        await supabase.rpc('log_activity', {
            p_action: 'EDIT_INVENTORY', // Match your database UPPERCASE naming convention
            p_entity_type: 'inventory',
            p_entity_id: updatedItem.id,
            p_brand_id: originalItem?.brandId || assignedBrand || null,
            p_notes: `Updated stock item: ${updatedItem.name}`,
        });

        // 2. Synchronize variants if the edit form supplied them
        if (updatedItem.variants) {
            // Get current variants from database
            const {
                data: existingVariants,
                error: existingError,
            } = await supabase
                .from('inventory_variants')
                .select('id')
                .eq('inventory_id', updatedItem.id);

            if (existingError) {
                console.error(
                    'Existing Variants Error:',
                    existingError.message
                );
                alert(
                    'Stock was updated, but the existing stock breakdown could not be loaded.'
                );
                return false;
            }

            const existingIds = new Set(
                (existingVariants ?? []).map((variant) => variant.id)
            );

            const submittedIds = new Set(
                updatedItem.variants
                    .filter((variant) => variant.id)
                    .map((variant) => variant.id as string)
            );

            // 2a. Delete variants that were removed
            const idsToDelete = [...existingIds].filter(
                (id) => !submittedIds.has(id)
            );

            if (idsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('inventory_variants')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) {
                    console.error(
                        'Variant Delete Error:',
                        deleteError.message
                    );
                    alert(
                        'Stock was updated, but some removed variants could not be deleted.'
                    );
                    return false;
                }
            }

            // 2b. Update existing variants one by one and insert new variants
            for (const variant of updatedItem.variants) {
                if (variant.id) {
                    const { error: updateVariantError } = await supabase
                        .from('inventory_variants')
                        .update({
                            color: variant.color,
                            size: variant.size,
                            quantity: variant.quantity,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', variant.id)
                        .eq('inventory_id', updatedItem.id);

                    if (updateVariantError) {
                        console.error(
                            'Variant Update Error:',
                            updateVariantError.message
                        );
                        alert(
                            'Stock was updated, but a stock variant could not be updated.'
                        );
                        return false;
                    }
                } else {
                    const { error: insertVariantError } = await supabase
                        .from('inventory_variants')
                        .insert({
                            inventory_id: updatedItem.id,
                            color: variant.color,
                            size: variant.size,
                            quantity: variant.quantity,
                        });

                    if (insertVariantError) {
                        console.error(
                            'Variant Insert Error:',
                            insertVariantError.message
                        );
                        alert(
                            'Stock was updated, but a new stock variant could not be added.'
                        );
                        return false;
                    }
                }
            }
        }

        // 3. Update local state immediately
        setInventory((prev) =>
            prev.map((item) =>
                item.id === updatedItem.id
                    ? {
                        ...item,
                        name: updatedItem.name,
                        price: updatedItem.price,
                        quantity: updatedItem.quantity,
                        bossApprovedFix: false,
                        variants:
                            updatedItem.variants?.map((variant) => ({
                                id: variant.id ?? crypto.randomUUID(),
                                color: variant.color,
                                size: variant.size,
                                quantity: variant.quantity,
                            })) ?? item.variants,
                    }
                    : item
            )
        );

        return true;
    };


    const handleConfirmVoid = async (itemId: string) => {
        // 1. Locate the item in state to get its image path/URL
        const itemToVoid = inventory.find((item) => item.id === itemId);

        if (itemToVoid?.imageUrl) {
            // Extract the relative path if stored as a full Supabase URL
            let filePath = itemToVoid.imageUrl;

            if (filePath.includes('/storage/v1/object/public/inventory-images/')) {
                filePath = filePath.split('/storage/v1/object/public/inventory-images/')[1];
            } else if (filePath.includes('/storage/v1/object/authenticated/inventory-images/')) {
                filePath = filePath.split('/storage/v1/object/authenticated/inventory-images/')[1];
            }

            // Delete the file from the inventory-images bucket
            const { error: storageError } = await supabase.storage
                .from('inventory-images')
                .remove([filePath]);

            if (storageError) {
                console.error('Storage Delete Error:', storageError.message);
            }
        }
        await supabase.rpc('log_activity', {
            p_action: 'inventory_voided',
            p_entity_type: 'inventory',
            p_entity_id: itemId,
            p_brand_id: itemToVoid?.brandId ?? null,
            p_old_values: null,
            p_new_values: { is_voided: true },
            p_notes: 'Stock item voided',
        });

        // 2. Void the stock item in the database
        const { error } = await supabase
            .from('inventory')
            .update({
                is_voided: true,
            })
            .eq('id', itemId);

        if (error) {
            console.error('Void Error:', error.message);
            alert(`Failed to void stock item: ${error.message}`);
            return false;
        }

        // 3. Update local state immediately
        setInventory((prev) =>
            prev.filter((item) => item.id !== itemId)
        );

        return true;
    };

    // ─────────────────────────────────────────────────────────────
    // Employee requests a fix
    // ─────────────────────────────────────────────────────────────
    const handleRequestFix = async (id: string) => {
        try {
            await requestStockFix(id, user?.name || 'Employee');
            setInventory((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            fixRequested: true,
                        }
                        : item
                )
            );

            return true;
        } catch (error) {
            console.error('Fix Request Error:', error);
            alert('Failed to submit fix request');
            return false;
        }
    };
    // ─────────────────────────────────────────────────────────────
    // Boss approves the requested fix
    // ─────────────────────────────────────────────────────────────
    const handleApproveFix = async (id: string) => {
        try {
            await approveStockFix(id);

            setInventory((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            fixRequested: false,
                            bossApprovedFix: true,
                        }
                        : item
                )
            );

            return true;
        } catch (error) {
            console.error('Approve Fix Error:', error);
            alert('Failed to approve fix request');
            return false;
        }
    };
    return {
        userRole,
        assignedBrand,
        inventory,
        loading,
        handleSaveEdit,
        handleConfirmVoid,
        handleRequestFix,
        handleApproveFix,
    };
}