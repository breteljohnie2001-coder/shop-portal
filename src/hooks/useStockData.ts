'use client';

import { useState, useEffect, useCallback } from 'react';
import { EditableItem } from '@/components/dashboard/modals/EditStockModal';
import { createClient } from '@/lib/supabase/client';
import { StockItem, StockVariant } from '@/types/types';
import { useUser } from '@/context/UserContext';

const supabase = createClient();

/**
 * A variant being edited may not have an ID yet
 * because it could be a newly-added color/size combination.
 */
type EditableStockVariant = Omit<StockVariant, 'id'> & {
    id?: string;
};

type EditableItemWithVariants = EditableItem & {
    variants?: EditableStockVariant[];
};

/**
 * Shape of the inventory row returned by Supabase,
 * including the related inventory_variants records.
 */
type InventoryRow = {
    id: string;
    name: string;
    brand_id: string;
    quantity: number;
    price: number;
    image: string | null;
    created_at: string;
    fix_requested: boolean;
    boss_approved_fix: boolean;
    inventory_variants: StockVariant[];
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
    // Fetch inventory + detailed color/size stock breakdown
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
                data as unknown as InventoryRow[]
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

            // 2b. Update existing variants one by one
            // and insert new variants.
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

    // ─────────────────────────────────────────────────────────────
    // Void stock item
    // ─────────────────────────────────────────────────────────────
    const handleConfirmVoid = async (itemId: string) => {
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

        setInventory((prev) =>
            prev.filter((item) => item.id !== itemId)
        );

        return true;
    };

    // ─────────────────────────────────────────────────────────────
    // Employee requests a fix
    // ─────────────────────────────────────────────────────────────
    const handleRequestFix = async (id: string) => {
        const { error } = await supabase
            .from('inventory')
            .update({
                fix_requested: true,
            })
            .eq('id', id);

        if (error) {
            console.error('Fix Request Error:', error.message);
            alert('Failed to submit fix request');
            return;
        }

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
    };

    // ─────────────────────────────────────────────────────────────
    // Boss approves the requested fix
    // ─────────────────────────────────────────────────────────────
    const handleApproveFix = async (id: string) => {
        const { error } = await supabase
            .from('inventory')
            .update({
                fix_requested: false,
                boss_approved_fix: true,
            })
            .eq('id', id);

        if (error) {
            console.error('Approve Fix Error:', error.message);
            alert('Failed to approve fix request');
            return;
        }

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