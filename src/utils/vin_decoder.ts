import type { BrandId, Vehicle } from '../models/types';

// WMI (World Manufacturer Identifier) — first 3 chars of VIN
// Extended list covering Romanian market vehicles
const WMI_DATABASE: Record<string, { brand: BrandId; modelPrefix: string }> = {
    // BMW
    'WBA': { brand: 'BMW', modelPrefix: 'Seria' },
    'WBS': { brand: 'BMW', modelPrefix: 'M' },
    'WBY': { brand: 'BMW', modelPrefix: 'i' },
    'WBX': { brand: 'BMW', modelPrefix: 'X' },

    // Volkswagen
    'WVW': { brand: 'Volkswagen', modelPrefix: 'Golf/Passat' },
    'WV1': { brand: 'Volkswagen', modelPrefix: 'Transporter' },
    'WV2': { brand: 'Volkswagen', modelPrefix: 'LT/Crafter' },
    'WV3': { brand: 'Volkswagen', modelPrefix: 'Polo' },

    // Audi
    'WAU': { brand: 'Audi', modelPrefix: 'A' },
    'WA1': { brand: 'Audi', modelPrefix: 'Q' },
    'TRU': { brand: 'Audi', modelPrefix: 'A' }, // Hungary plant

    // Mercedes
    'WDB': { brand: 'Mercedes-Benz', modelPrefix: 'Clasa' },
    'WDC': { brand: 'Mercedes-Benz', modelPrefix: 'GLC/GLE' },
    'WDD': { brand: 'Mercedes-Benz', modelPrefix: 'Clasa' },
    'WDF': { brand: 'Mercedes-Benz', modelPrefix: 'Sprinter' },
    'WME': { brand: 'Mercedes-Benz', modelPrefix: 'Smart' },

    // Renault
    'VF1': { brand: 'Renault', modelPrefix: 'Megane/Clio' },
    'VF3': { brand: 'Renault', modelPrefix: 'Express' },
    'VF6': { brand: 'Renault', modelPrefix: 'Trafic' },
    'VF7': { brand: 'Renault', modelPrefix: 'Laguna' },

    // Dacia
    'UU1': { brand: 'Dacia', modelPrefix: 'Logan/Sandero' },
    'UU2': { brand: 'Dacia', modelPrefix: 'Duster' },
    'UU3': { brand: 'Dacia', modelPrefix: 'Dokker' },
    'UU6': { brand: 'Dacia', modelPrefix: 'Lodgy' },
    'UU7': { brand: 'Dacia', modelPrefix: 'Spring' },

    // Ford
    'WF0': { brand: 'Ford', modelPrefix: 'Focus/Fiesta' },
    '1FA': { brand: 'Ford', modelPrefix: 'F-Series' },
    '1FT': { brand: 'Ford', modelPrefix: 'F-Series' },

    // Opel
    'W0L': { brand: 'Opel', modelPrefix: 'Astra/Corsa' },

    // JEEP
    '1J4': { brand: 'Unknown', modelPrefix: 'JEEP Grand Cherokee' },
    '1J8': { brand: 'Unknown', modelPrefix: 'JEEP Cherokee' },
    '2C4': { brand: 'Unknown', modelPrefix: 'JEEP Compass' },
};

// More reliable year lookup (char at position 9 in VIN, 0-indexed)
function decodeModelYear(vin: string): number {
    if (vin.length < 10) return new Date().getFullYear();
    const yearChar = vin[9].toUpperCase();
    // 2010–2030
    const yearMap2010: Record<string, number> = {
        'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
        'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
        'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026,
        '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
        '6': 2006, '7': 2007, '8': 2008, '9': 2009,
    };
    return yearMap2010[yearChar] ?? new Date().getFullYear();
}

// Common engine types by brand + year range (simplified for MVP)
type EngineSpec = { code: string; label: string };
const BRAND_ENGINES: Record<string, EngineSpec[]> = {
    BMW: [
        { code: 'N47', label: '2.0d N47' },
        { code: 'B47', label: '2.0d B47' },
        { code: 'N57', label: '3.0d N57' },
        { code: 'N20', label: '2.0i N20' },
        { code: 'B48', label: '2.0i B48' },
        { code: 'M54', label: '2.5 M54' },
    ],
    Volkswagen: [
        { code: 'TDI', label: '2.0 TDI' },
        { code: 'TSI', label: '1.4 TSI' },
        { code: 'TDI25', label: '2.5 TDI' },
        { code: 'FSI', label: '2.0 FSI' },
        { code: 'GTI', label: '2.0 GTI' },
    ],
    Audi: [
        { code: 'TDI20', label: '2.0 TDI' },
        { code: 'TDI30', label: '3.0 TDI' },
        { code: 'TFSI20', label: '2.0 TFSI' },
        { code: 'TFSI14', label: '1.4 TFSI' },
    ],
    'Mercedes-Benz': [
        { code: 'CDI', label: '2.2 CDI' },
        { code: 'CDI30', label: '3.0 CDI' },
        { code: 'CGI', label: '1.8 CGI' },
        { code: 'BlueEff', label: '2.0 BlueTEC' },
    ],
    Renault: [
        { code: 'dCi15', label: '1.5 dCi' },
        { code: 'dCi19', label: '1.9 dCi' },
        { code: 'TCe', label: '1.3 TCe' },
        { code: 'Energy', label: '1.2 Energy TCe' },
    ],
    Dacia: [
        { code: 'dCi15D', label: '1.5 dCi' },
        { code: 'SCe', label: '1.0 SCe' },
        { code: 'TCeD', label: '1.3 TCe' },
        { code: 'LPG', label: '1.6 GPL' },
    ],
    Ford: [
        { code: 'TDCi', label: '1.6/2.0 TDCi' },
        { code: 'EcoB', label: '1.0 EcoBoost' },
        { code: 'EcoB15', label: '1.5 EcoBoost' },
        { code: 'Duratorq', label: '2.2 Duratorq' },
    ],
    Opel: [
        { code: 'CDTI', label: '1.6 CDTI' },
        { code: 'Turbo', label: '1.4 Turbo' },
        { code: 'ECOTEC', label: '1.2 ECOTEC' },
    ],
    Unknown: [{ code: 'N/A', label: 'N/A' }],
};

function guessEngine(brand: BrandId): EngineSpec {
    const engines = BRAND_ENGINES[brand as string] || BRAND_ENGINES.Unknown;
    return engines[0];
}

function detectBrandFromModel(model: string): BrandId {
    const m = model.toLowerCase();
    if (m.includes('bmw')) return 'BMW';
    if (m.includes('volkswagen') || m.includes(' vw') || m.startsWith('vw')) return 'Volkswagen';
    if (m.includes('audi')) return 'Audi';
    if (m.includes('mercedes') || m.includes('benz')) return 'Mercedes-Benz';
    if (m.includes('renault')) return 'Renault';
    if (m.includes('dacia') || m.includes('logan') || m.includes('sandero') || m.includes('duster')) return 'Dacia';
    if (m.includes('ford')) return 'Ford';
    if (m.includes('opel') || m.includes('vauxhall')) return 'Opel';
    return 'Unknown';
}

export interface DecodeResult {
    success: boolean;
    brand: BrandId;
    model: string;
    engine: string;
    year: number;
    error?: string;
}

export function decodeVIN(vin: string): DecodeResult {
    const clean = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (clean.length !== 17) {
        return {
            success: false,
            brand: 'Unknown',
            model: 'Necunoscut',
            engine: 'N/A',
            year: new Date().getFullYear(),
            error: 'VIN trebuie să aibă 17 caractere',
        };
    }

    const wmi = clean.substring(0, 3);
    const matched = WMI_DATABASE[wmi];
    const year = decodeModelYear(clean);

    if (!matched) {
        return {
            success: true,
            brand: 'Unknown',
            model: 'Vehicul necunoscut',
            engine: 'N/A',
            year,
        };
    }

    const engine = guessEngine(matched.brand);
    const model = `${matched.modelPrefix}`;

    return {
        success: true,
        brand: matched.brand,
        model,
        engine: engine.label,
        year,
    };
}

// Build a Vehicle object from VIN + mileage
export function buildVehicleFromVIN(vin: string, mileage: number): Vehicle {
    const decoded = decodeVIN(vin);
    return {
        vin,
        brand: decoded.brand,
        model: decoded.model,
        engine: decoded.engine,
        year: decoded.year,
        mileage,
    };
}

// For manual entry (no VIN) — construct from user input
export function buildVehicleManual(params: {
    brand: BrandId;
    model: string;
    engine: string;
    year: number;
    mileage: number;
    plate?: string;
}): Vehicle {
    return {
        vin: `MANUAL-${Date.now()}`,
        plate: params.plate,
        brand: params.brand,
        model: params.model,
        engine: params.engine,
        year: params.year,
        mileage: params.mileage,
    };
}

export const BRANDS: BrandId[] = ['Audi', 'BMW', 'Dacia', 'Ford', 'Mercedes-Benz', 'Opel', 'Renault', 'Volkswagen', 'Unknown'];
export { BRAND_ENGINES, detectBrandFromModel };
export type { EngineSpec };
