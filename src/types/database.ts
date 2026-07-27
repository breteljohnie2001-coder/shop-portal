export type BrandId = 'brand_a' | 'brand_b';

export type UserRole = 'boss' | 'employee_a' | 'employee_b';

export interface UserProfile {
    email: string;
    role: UserRole;
    assignedBrand?: BrandId; // undefined for boss
}

export const BRAND_INFO = {
    brand_a: {
        name: "Bee Trendy Collection",
        logo: "/bee-trendya.png",
    },

    brand_b: {
        name: "Baddie On A Budget Closet",
        logo: "/baddyOnABudgetb.png",
    },
} as const;

export interface InventoryItem {
    id: string;
    brandId: BrandId;
    name: string;
    imageUrl?: string;
    sizes: string[];
    colors: string[];
    price: number;
    quantity: number;
    createdAt: string;
    createdBy: string;
}

export interface SaleRecord {
    id: string;
    brandId: BrandId;
    itemId: string;
    itemName: string;
    quantitySold: number;
    totalAmount: number;
    createdBy: string;
    createdAt: string;
    isVoided: boolean;
}

export interface ExpenseRecord {
    id: string;
    brandId: BrandId;
    description: string;
    amount: number;
    createdBy: string;
    createdAt: string;
}