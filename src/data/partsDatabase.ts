import type { Part } from '../models/types';

// Mock Romanian parts catalog
// Keyed by keyword sets — each keyword matches a repair cause's partKeywords
const PARTS: Part[] = [];

// Search parts by keyword match
export function searchPartsByKeyword(keywords: string[]): Part[] {
    const lower = keywords.map(k => k.toLowerCase());
    return PARTS.filter(part =>
        part.keywords.some(pk => lower.some(kw => pk.toLowerCase().includes(kw) || kw.includes(pk.toLowerCase())))
    );
}

// Search parts by brand filter
export function searchPartsByBrand(brand: string): Part[] {
    return PARTS.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
}

// Full-text search across parts
export function searchPartsText(query: string): Part[] {
    const q = query.toLowerCase();
    return PARTS.filter(p =>
        p.nameRo.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.store.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.keywords.some(k => k.toLowerCase().includes(q))
    );
}

// Get all parts
export function getAllParts(): Part[] {
    return PARTS;
}

export const STORE_NAMES = ['AutoEco', 'eMAG Auto', 'Autokarma', 'Dealer BMW', 'Dealer VW'];
