/**
 * Romanian / mixed-language free-text → vehicle brand/model/year extractor
 * Parses brand, model, and year from the user's symptom description so
 * the AI can receive them as explicit context for personalized results.
 */

import type { BrandId } from '../models/types';

export interface ParsedProblem {
    suggestedDtcs: string[];
    suggestedSymptoms: string[];
    detectedBrand: BrandId | null;
    detectedModel: string | null;
    detectedYear: number | null;
    detectedLang: 'ro' | 'en' | 'de';
    confidence: 'high' | 'medium' | 'low';
}

// ── Normalise text for matching ─────────────────────────────────────────────
function norm(s: string): string {
    return s.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-_]/g, ' ');
}

// ── Brand patterns ──────────────────────────────────────────────────────────
const BRAND_PATTERNS: { patterns: string[]; brand: BrandId }[] = [
    { brand: 'BMW', patterns: ['bmw', 'seria ', 'series '] },
    { brand: 'Volkswagen', patterns: ['volkswagen', ' vw ', 'golf', 'passat', 'polo', 'tiguan', 'touareg', 'arteon', 'caddy', 't-roc', 'troc'] },
    { brand: 'Audi', patterns: ['audi'] },
    { brand: 'Mercedes-Benz', patterns: ['mercedes', 'benz', 'sprinter', 'vito', 'clasa e', 'clasa c', 'clasa a', 'clasa s', 'e-class', 'c-class', 'a-class', 's-class', 'gle', 'glc', 'gla', 'glb', 'cla'] },
    { brand: 'Renault', patterns: ['renault', 'megane', 'clio', 'laguna', 'scenic', 'kadjar', 'captur', 'talisman', 'koleos'] },
    { brand: 'Dacia', patterns: ['dacia', 'logan', 'sandero', 'duster', 'dokker', 'lodgy', 'jogger', 'spring'] },
    { brand: 'Ford', patterns: ['ford', 'focus', 'fiesta', 'mondeo', 'kuga', 'ranger', 'puma', 'transit', 'ecosport'] },
    { brand: 'Opel', patterns: ['opel', 'astra', 'insignia', 'corsa', 'mokka', 'grandland', 'zafira', 'vectra'] },
    { brand: 'Jeep', patterns: ['jeep', 'wrangler', 'cherokee', 'compass', 'renegade'] },
];

// ── Model patterns (within a brand context) ──────────────────────────────────
const MODEL_PATTERNS: string[] = [
    // BMW
    'seria 1', 'seria 2', 'seria 3', 'seria 4', 'seria 5', 'seria 6', 'seria 7',
    'series 1', 'series 2', 'series 3', 'series 4', 'series 5', 'series 7',
    'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'm3', 'm5',
    // VW
    'golf', 'passat', 'polo', 'tiguan', 'touareg', 'arteon', 'caddy', 't-roc', 'troc',
    // Audi
    'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'q2', 'q3', 'q5', 'q7', 'tt', 'rs',
    // Mercedes
    'e-class', 'c-class', 'a-class', 's-class', 'clasa e', 'clasa c', 'clasa a', 'clasa s',
    'gle', 'glc', 'gla', 'glb', 'cla', 'sprinter', 'vito',
    // Renault
    'megane', 'clio', 'laguna', 'scenic', 'kadjar', 'captur', 'talisman',
    // Dacia
    'logan', 'sandero', 'duster', 'dokker', 'lodgy', 'jogger',
    // Ford
    'focus', 'fiesta', 'mondeo', 'kuga', 'ranger', 'puma', 'transit', 'ecosport',
    // Opel
    'astra', 'insignia', 'corsa', 'mokka', 'grandland', 'zafira',
    // Jeep
    'wrangler', 'cherokee', 'compass', 'renegade',
];

// ── Year detection ───────────────────────────────────────────────────────────
function detectYear(text: string): number | null {
    const match = text.match(/\b(19[89]\d|200\d|201\d|202[0-6])\b/);
    return match ? parseInt(match[1]) : null;
}

// ── Language detection ───────────────────────────────────────────────────────
function detectLanguage(text: string): 'ro' | 'en' | 'de' {
    const n = norm(text);
    
    // Romanian keywords
    const ro = ['nu ', ' si ', ' masina ', ' motor ', ' bate ', ' problema ', ' scartaie ', ' s-a ', ' sa '];
    let roCount = ro.filter(w => n.includes(w)).length;
    
    // English keywords
    const en = [' not ', ' and ', ' car ', ' engine ', ' knock ', ' issue ', ' squeak ', ' the ', ' is '];
    let enCount = en.filter(w => n.includes(w)).length;
    
    // German keywords
    const de = [' nicht ', ' und ', ' auto ', ' motor ', ' klopft ', ' problem ', ' quietscht ', ' das ', ' ist '];
    let deCount = de.filter(w => n.includes(w)).length;
    
    if (deCount > roCount && deCount > enCount) return 'de';
    if (enCount > roCount && enCount > deCount) return 'en';
    return 'ro'; // Default to RO for this app
}

// ── Main parser ──────────────────────────────────────────────────────────────
export function parseRomanianProblem(text: string): ParsedProblem {
    const n = norm(text);

    // Detect brand
    let detectedBrand: BrandId | null = null;
    for (const { brand, patterns } of BRAND_PATTERNS) {
        if (patterns.some(p => n.includes(p))) {
            detectedBrand = brand;
            break;
        }
    }

    // Detect model
    let detectedModel: string | null = null;
    for (const model of MODEL_PATTERNS) {
        if (n.includes(norm(model))) {
            detectedModel = model;
            break;
        }
    }

    // Detect year
    const detectedYear = detectYear(n);

    const confidence = (detectedBrand && detectedModel && detectedYear)
        ? 'high'
        : detectedBrand
            ? 'medium'
            : 'low';

    const detectedLang = detectLanguage(text);

    return {
        suggestedDtcs: [],
        suggestedSymptoms: [],
        detectedBrand,
        detectedModel,
        detectedYear,
        detectedLang,
        confidence,
    };
}
