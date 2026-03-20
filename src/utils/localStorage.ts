import type { GarageSettings } from '../models/types';
import type { Job } from '../models/types';
import type { Invoice } from '../models/types';

const KEYS = {
    JOBS: 'ag_jobs',
    INVOICES: 'ag_invoices',
    SETTINGS: 'ag_settings',
};

// ─── Generic helpers ──────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function save<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export function loadJobs(): Job[] {
    return load<Job[]>(KEYS.JOBS, []);
}

export function saveJobs(jobs: Job[]): void {
    save(KEYS.JOBS, jobs);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export function loadInvoices(): Invoice[] {
    return load<Invoice[]>(KEYS.INVOICES, []);
}

export function saveInvoices(invoices: Invoice[]): void {
    save(KEYS.INVOICES, invoices);
}

// ─── Settings ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: GarageSettings = {
    name: 'Service Auto',
    address: 'Strada Principais, Nr. 1',
    phone: '07XX-XXX-XXX',
    vatNumber: '',
    tradeRegNumber: '',
    defaultLaborRate: 80,
    currency: 'RON',
    language: 'ro',
    partsRegion: 'eu',
};

export function loadSettings(): GarageSettings {
    const saved = load<GarageSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
    
    // Initialize firstSeenAt if it's the very first time
    if (!saved.firstSeenAt) {
        saved.firstSeenAt = Date.now();
        save(KEYS.SETTINGS, saved);
    }

    // ALWAYS force the latest bundled API keys — old localStorage keys must never win
    return {
        ...saved,
    };
}

export function saveSettings(settings: GarageSettings): void {
    save(KEYS.SETTINGS, settings);
}

// ─── Utils ────────────────────────────────────────────────────────────────────
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
    const year = new Date().getFullYear();
    const count = existingInvoices.filter(
        inv => new Date(inv.date).getFullYear() === year
    ).length + 1;
    return `FAC-${year}-${String(count).padStart(3, '0')}`;
}

export const DEFAULT_SETTINGS_EXPORT = DEFAULT_SETTINGS;
