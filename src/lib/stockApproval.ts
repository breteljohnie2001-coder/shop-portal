import { createClient } from '@/lib/supabase/client';

export async function requestStockFix(
    stockId: string,
    requesterName: string
) {    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    const { data: item, error: itemError } = await supabase
        .from('inventory')
        .select('id, name, brand_id, created_by')
        .eq('id', stockId)
        .single();

    if (itemError || !item) {
        throw new Error('Stock item could not be found.');
    }

    const { error: updateError } = await supabase
        .from('inventory')
        .update({
            fix_requested: true,
            boss_approved_fix: false,
        })
        .eq('id', stockId);

    if (updateError) {
        throw updateError;
    }

    await supabase.rpc('log_activity', {
        p_action: 'REQUEST_FIX_INVENTORY',
        p_entity_type: 'inventory',
        p_entity_id: stockId,
        p_brand_id: item.brand_id,
        p_notes: `Fix requested for stock item: ${item.name}`,
    });


    const { data: bosses, error: bossError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'boss');

    if (bossError) {
        console.error('Boss lookup error:', bossError);
        return true;
    }

    if (bosses && bosses.length > 0) {

        const notifications = bosses.map((boss) => ({
            recipient_id: boss.id,
            sender_id: user.id,
            type: 'FIX_REQUEST_INVENTORY',
            title: 'Stock Approval Required',
            message: `${requesterName} requested a fix for "${item.name}".`,
            inventory_id: stockId,
            is_read: false,
        }));

        const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);

        if (notificationError) {
            console.error(
                'Stock notification error:',
                notificationError
            );
        }
    }

    return true;
}

export async function approveStockFix(stockId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    const { data: item, error: itemError } = await supabase
        .from('inventory')
        .select('id, name, brand_id, created_by')
        .eq('id', stockId)
        .single();

    if (itemError || !item) {
        throw new Error('Stock item could not be found.');
    }

    const { error: updateError } = await supabase
        .from('inventory')
        .update({
            fix_requested: false,
            boss_approved_fix: true,
        })
        .eq('id', stockId);

    if (updateError) {
        throw updateError;
    }

    await supabase.rpc('log_activity', {
        p_action: 'APPROVE_FIX_INVENTORY',
        p_entity_type: 'inventory',
        p_entity_id: stockId,
        p_brand_id: item.brand_id,
        p_old_values: null,
        p_new_values: {
            boss_approved_fix: true,
        },
        p_notes: `Boss approved fix for stock item: ${item.name}`,
    });

    if (item.created_by) {
        const { error: notificationError } =
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: item.created_by,
                    sender_id: user.id,
                    type: 'FIX_APPROVED_INVENTORY',
                    title: 'Stock Fix Approved',
                    message: `Your request to fix "${item.name}" has been approved.`,
                    inventory_id: stockId,
                    is_read: false,
                });

        if (notificationError) {
            console.error(
                'Stock approval notification error:',
                notificationError
            );
        }
    }

    return true;
}