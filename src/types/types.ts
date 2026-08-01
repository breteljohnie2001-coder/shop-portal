// ─── User & Authorization Types ──────────────────────────────────────────────
export type UserRole = 'boss' | 'employee' | string;
export type BrandId = 'brand_a' | 'brand_b';

export interface AppUser {
    id: string;
    email?: string;
    name: string;
    role: UserRole;
    assignedBrand: BrandId | null;
    isBrandLocked: boolean;
}

// ─── Product & Sales Types ───────────────────────────────────────────────────
export interface PurchasedProduct {
    id: string;
    name: string;
    quantity: number;
    price: number;
    size?: string | null;      // 👈 Added size variant attribute
    color?: string | null;     // 👈 Added color variant attribute
    variantId?: string | null; // 👈 Added variant ID reference
}

export type PaymentMethod = 'M-Pesa' | 'Cash' | 'MPESA' | string;

export interface PastSale {
    id: string;
    receiptNo: string;
    customerName: string;
    brandId: string; // Accepts 'brand_a', 'brand_b', or legacy IDs ('1', '2', 'a', 'b')
    amount: number;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm format
    createdAt: string | Date; // Flexible to prevent raw string parsing errors from Supabase
    paymentMethod: PaymentMethod;
    items: PurchasedProduct[];
    status?: 'completed' | 'voided' | 'approved' | string;
    fixRequested?: boolean;
    bossApprovedFix?: boolean;
}

// ─── Stock & Inventory Types ──────────────────────────────────────────────────

export interface StockVariant {
    id: string;
    color: string;
    size: string;
    quantity: number;
}

export interface StockItem {
    id: string;
    name: string;
    brandId: BrandId | string;
    quantity: number;
    price: number;
    createdAt: string | Date;
    imageUrl?: string;
    fixRequested?: boolean;
    bossApprovedFix?: boolean;
    hasSales?: boolean;

    // Detailed stock breakdown by color and size
    variants: StockVariant[];
}

// ─── Expenses Types ──────────────────────────────────────────────────────────
export interface Expense {
    id: string;
    brandId: BrandId;
    description: string;
    amount: number;
    createdAt: string | Date;
    createdBy: string;
}

// ─── Modal Form Types ────────────────────────────────────────────────────────
export interface EditableSaleItem {
    id: string;
    receiptNo: string;
    itemName: string;
    clientName: string;
    paymentMethod: 'Cash' | 'MPESA' | 'M-Pesa';
    unitPrice: number;
    quantity: number;
}

export type InventoryRow = {
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
}



