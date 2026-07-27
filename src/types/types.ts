export interface StockItem {
    id: string;
    name: string;
    brandId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    imageUrl?: string;
    fixRequested?: boolean;
    bossApprovedFix?: boolean;
}

export type UserRole = 'employee' | 'boss';
export type BrandId = 'brand_a' | 'brand_b';

export interface PurchasedProduct {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface PastSale {
    id: string;
    receiptNo: string;
    customerName: string;
    brandId: string;
    amount: number;
    date: string; // YYYY-MM-DD
    time: string;
    createdAt: Date;
    paymentMethod: 'M-Pesa' | 'Cash';
    items: PurchasedProduct[];
    fixRequested?: boolean;
    bossApprovedFix?: boolean;
}

