export const CAR_BRANDS = [
    'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 
    'Land Rover', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 
    'Renault', 'Seat', 'Skoda', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo', 'Jeep', 'Unknown'
] as const;

export type BrandId = typeof CAR_BRANDS[number];

export type Currency = 'RON' | 'EUR';

export interface DiagnosisInput {
    vehicle: Vehicle;
    dtcCode?: string;
    symptoms: string[];
}

export interface Vehicle {
    vin: string;
    plate?: string;
    brand: BrandId;
    model: string;
    engine: string;
    year: number;
    mileage: number;
}

export type Symptom =
    | 'mers_in_gol_neregulat'    // Rough idle
    | 'fara_putere'               // No power
    | 'fum'                       // Smoke
    | 'check_engine'              // Check engine
    | 'zgomot_turbo'              // Turbo noise
    | 'pornire_dificila'          // Hard start
    | 'consum_mare'               // High fuel consumption
    | 'motor_supraincalzit'       // Overheating
    | 'adblue'                    // AdBlue
    | 'zgomote_tren_rulare'      // Suspension
    | 'probleme_climatizare'     // AC
    | 'directie_instabila'       // Steering
    | 'probleme_franare'         // Brakes
    | 'probleme_electrice_caroserie'
    | 'probleme_senzori_roti'    // TPMS
    | 'probleme_usi_caroserie'   // Doors/Trunk
    | 'probleme_inchidere'       // Doors
    | 'probleme_lumini'          // Lights
    | 'probleme_stergatoare'     // Wipers
    | 'probleme_interior';       // Seats/Interior

export interface DiagnosisCause {
    name: string;
    nameRo: string;
    probability: number;           // 0–100
    checkStep: string;
    checkStepRo: string;
    partKeywords: string[];
    estimatedMinutes: number;
    // Expanded detail shown when user taps the card
    technicalDetails?: string;
    technicalDetailsRo?: string;
    repairSteps?: string[];
    repairStepsRo?: string[];
    // Community/Forum advice (e.g. BMW Club, VW Forum)
    forumInsight?: string;
    forumInsightRo?: string;
    tricksAndTips?: string;
    tricksAndTipsRo?: string;
    safetyWarnings?: string;
    safetyWarningsRo?: string;
    quickTests?: string[];
    quickTestsRo?: string[];
    // Parts Selection Advice (AI recommendations on which brand to buy, what to check)
    partsAdviceRo?: string;
    partsAdviceEn?: string;
    partsAdviceDe?: string;
    // AI-generated parts estimates with localized market prices
    partsRo?: { name: string; priceRon: number; note?: string }[];
    partsEn?: { name: string; priceEur: number; note?: string }[];
    partsDe?: { name: string; priceEur: number; note?: string }[];
    // Detailed repair info
    requiredToolsRo?: string[];
    componentLocationRo?: string;
    estimatedHoursMin?: number;
    estimatedHoursMax?: number;
    requiredTools?: string[];
    componentLocation?: string;

    // German variants
    nameDe?: string;
    checkStepDe?: string;
    technicalDetailsDe?: string;
    repairStepsDe?: string[];
    forumInsightDe?: string;
    requiredToolsDe?: string[];
    componentLocationDe?: string;
    tricksAndTipsDe?: string;
    safetyWarningsDe?: string;
    quickTestsDe?: string[];
}

export interface DiagnosticResult {
    causes: DiagnosisCause[];
    confidence: number;            // 0–100
    dtcCode?: string;
    symptoms: string[];
    vehicle: Vehicle;
    timestamp: number;
}

export interface Part {
    id: string;
    partNumber: string;
    brand: string;
    name: string;
    nameRo: string;
    price: number;
    currency: Currency;
    deliveryDays: number;
    store: string;
    phone: string;
    availability: 'stoc' | 'comanda' | 'indisponibil';
    keywords: string[];
}

export interface JobLineItem {
    type: 'part' | 'manopera' | 'custom';
    description: string;
    partId?: string;
    qty: number;
    unitPrice: number;
    currency: Currency;
}

export interface Job {
    id: string;
    vehicle: Vehicle;
    dtcCode?: string;
    symptoms: Symptom[];
    diagnosticResult: DiagnosticResult;
    confirmedCauseIndex: number;
    partsUsed: Part[];
    lineItems: JobLineItem[];
    laborHours: number;
    laborRate: number;
    notes: string;
    tags: string[];
    customerName?: string;
    customerPhone?: string;
    date: number;                  // unix ms
    invoiceId?: string;
    status: 'diagnostic' | 'in_lucru' | 'finalizat';
    // Optional vehicle details (editable by user)
    fuelType?: 'Diesel' | 'Benzină' | 'Hibrid' | 'Electric' | 'GPL';
    transmissionType?: 'Manuală' | 'Automată';
    plateNumber?: string;
    color?: string;
    customFields?: { label: string; value: string }[];
    mechanicNotes?: string;
}

export interface Invoice {
    id: string;
    jobId: string;
    number: string;               // e.g. "FAC-2024-001"
    garageInfo: GarageSettings;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    vehicle: Vehicle;
    lineItems: JobLineItem[];
    vatPercent: number;
    subtotal: number;
    vatAmount: number;
    total: number;
    currency: Currency;
    status: 'ciorna' | 'trimisa' | 'platita';
    date: number;
    notes?: string;
}

export interface GarageSettings {
    name: string;
    address: string;
    phone: string;
    email?: string;
    vatNumber?: string;           // CUI
    tradeRegNumber?: string;      // J number
    defaultLaborRate: number;
    currency: Currency;
    language: 'ro' | 'en' | 'de';
    partsRegion?: 'ro' | 'eu' | 'uk' | 'us';
    logoBase64?: string;
    ownerName?: string;           // Titular / Mecanic principal
    specialization?: string;      // Specializare / Mărci
    aiApiKey?: string;            // Gemini API key for AI diagnosis (primary)
    openaiApiKey?: string;        // OpenAI API key (fallback)
    aiProvider?: 'gemini' | 'openai'; // AI provider (default: gemini)
    firstSeenAt?: number;         // Unix ms timestamp of first visit
}

export interface DTCEntry {
    code: string;
    descriptionRo: string;
    descriptionEn: string;
    brands: BrandId[];
    causes: DiagnosisCause[];
    estimatedMinutes: number;
    confidence: number;
    tags: string[];
    category: 'combustibil' | 'turbo' | 'aprindere' | 'evacuare' | 'electric' | 'motor' | 'senzori' | 'admisie' | 'chasiu' | 'interioar' | 'caroserie';
}
