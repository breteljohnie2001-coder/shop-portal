// lib/brands.ts
export type BrandKey = 'bee_trendy' | 'baddie';

export function resolveBrand(brandId: string | null | undefined): BrandKey {
    const id = String(brandId ?? '').toLowerCase().trim();

    if (
        id === 'brand_a' ||
        id === 'a' ||
        id === 'bee_trendy' ||
        id === 'beetrendy' ||
        id.includes('bee')
    ) {
        return 'bee_trendy';
    }

    return 'baddie';
}

export function brandLabel(brand: BrandKey): string {
    return brand === 'bee_trendy' ? 'Bee Trendy' : 'Baddie Budget';
}

export function brandBadgeClass(brand: BrandKey): string {
    return brand === 'bee_trendy'
        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
        : 'bg-purple-400/10 text-purple-400 border border-purple-400/20';
}