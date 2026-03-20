import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, AlertCircle, ChevronDown, ChevronUp, Plus, ArrowRight, Settings } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { parseRomanianProblem } from '../utils/textParser';
import { decodeVIN, BRANDS, BRAND_ENGINES } from '../utils/vin_decoder';
import type { BrandId } from '../models/types';
import { t } from '../i18n/translations';
import { useAnalytics } from '../hooks/useAnalytics';


export type SymptomId =
    | 'mers_in_gol_neregulat' | 'fara_putere' | 'fum' | 'check_engine' | 'zgomot_turbo'
    | 'pornire_dificila' | 'consum_mare' | 'motor_supraincalzit' | 'adblue'
    | 'zgomote_tren_rulare' | 'probleme_climatizare' | 'directie_instabila'
    | 'probleme_franare' | 'probleme_electrice_caroserie' | 'probleme_senzori_roti'
    | 'probleme_usi_caroserie' | 'probleme_interior' | 'probleme_inchidere'
    | 'probleme_lumini' | 'probleme_stergatoare';

const SYMPTOMS: SymptomId[] = [
    'mers_in_gol_neregulat', 'fara_putere', 'fum', 'check_engine',
    'zgomot_turbo', 'pornire_dificila', 'consum_mare', 'motor_supraincalzit',
    'adblue', 'zgomote_tren_rulare', 'probleme_climatizare', 'directie_instabila',
    'probleme_franare', 'probleme_electrice_caroserie',
    'probleme_senzori_roti'
];

const SYMPTOM_LABELS: Record<SymptomId, { ro: string; en: string; de: string }> = {
    mers_in_gol_neregulat: { ro: 'Ralanti Instabil', en: 'Rough Idle', de: 'Rauer Leerlauf' },
    fara_putere: { ro: 'Lipsă Putere', en: 'Power Loss', de: 'Leistungsverlust' },
    fum: { ro: 'Fum / Emisii', en: 'Smoke / Emissions', de: 'Rauch / Abgase' },
    check_engine: { ro: 'Martor Check Engine', en: 'Check Engine Light', de: 'Motorkontrollleuchte' },
    zgomot_turbo: { ro: 'Zgomot Turbo', en: 'Turbo Noise', de: 'Turbogeräusch' },
    pornire_dificila: { ro: 'Pornire Grea', en: 'Hard Starting', de: 'Startschwierigkeiten' },
    consum_mare: { ro: 'Consum Mare', en: 'High Consumption', de: 'Hoher Verbrauch' },
    motor_supraincalzit: { ro: 'Motor Supraîncălzit', en: 'Engine Overheating', de: 'Motorüberhitzung' },
    adblue: { ro: 'Problemă AdBlue', en: 'AdBlue Issue', de: 'AdBlue-Problem' },
    zgomote_tren_rulare: { ro: 'Zgomote Rulare', en: 'Running Noises', de: 'Fahrgeräusche' },
    probleme_climatizare: { ro: 'Climatizare defectă', en: 'AC/Climate issues', de: 'Klimaanlage defekt' },
    directie_instabila: { ro: 'Direcție Instabilă', en: 'Steering Instability', de: 'Instabile Lenkung' },
    probleme_franare: { ro: 'Probleme Frânare', en: 'Braking Issues', de: 'Bremsprobleme' },
    probleme_electrice_caroserie: { ro: 'Instalație Electrică', en: 'Electrical Issues', de: 'Elektrikfehler' },
    probleme_senzori_roti: { ro: 'Senzori Roți', en: 'Wheel Sensors', de: 'Radsensoren' },
    probleme_usi_caroserie: { ro: 'Uși și Caroserie', en: 'Doors & Body', de: 'Türen & Karosserie' },
    probleme_interior: { ro: 'Interior / Bord', en: 'Interior / Dash', de: 'Innenraum / Cockpit' },
    probleme_inchidere: { ro: 'Închidere Centralizată', en: 'Central Locking', de: 'Zentralverriegelung' },
    probleme_lumini: { ro: 'Sistem Lumini', en: 'Lighting System', de: 'Beleuchtungssystem' },
    probleme_stergatoare: { ro: 'Ștergătoare', en: 'Wipers', de: 'Scheibenwischer' },
};

const SYMPTOM_EMOJI: Record<SymptomId, string> = {
    mers_in_gol_neregulat: '🔄', fara_putere: '💪', fum: '💨',
    check_engine: '⚠️', zgomot_turbo: '🌀', pornire_dificila: '🔑',
    consum_mare: '⛽', motor_supraincalzit: '🌡️',
    adblue: '🥣', zgomote_tren_rulare: '🛞', probleme_climatizare: '❄️',
    directie_instabila: '🏎️', probleme_franare: '🛑', probleme_electrice_caroserie: '🔌',
    probleme_senzori_roti: '🎡', probleme_usi_caroserie: '🚪', probleme_interior: '🛋️',
    probleme_inchidere: '🔒', probleme_lumini: '💡', probleme_stergatoare: '🌧️',
};

export default function DiagnosisScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useGarageStore();
    const lang = settings.language;

    // Seed text from home screen if passed
    const prefill = (location.state as { prefillText?: string; parsed?: ReturnType<typeof parseRomanianProblem> } | null);

    // ── Core state
    const [problemText, setProblemText] = useState(prefill?.prefillText ?? '');
    const [parsed, setParsed] = useState<ReturnType<typeof parseRomanianProblem> | null>(prefill?.parsed ?? null);

    // ── Optional details (collapsed by default)
    const [showDetails, setShowDetails] = useState(false);
    const [vin, setVin] = useState('');
    const [mileage, setMileage] = useState('');
    const [dtcCode, setDtcCode] = useState('');
    const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomId[]>([]);
    const [decoded, setDecoded] = useState<ReturnType<typeof decodeVIN> | null>(null);
    const [showManual, setShowManual] = useState(false);
    const [manualBrand, setManualBrand] = useState<BrandId>('BMW');
    const [manualModel, setManualModel] = useState('');
    const [manualEngine, setManualEngine] = useState('');
    const [manualYear, setManualYear] = useState(new Date().getFullYear().toString());
    const [error, setError] = useState('');

    // Parse text in real-time
    useEffect(() => {
        if (problemText.trim().length >= 4) {
            const p = parseRomanianProblem(problemText);
            setParsed(p);
        } else {
            setParsed(null);
        }
    }, [problemText, dtcCode, selectedSymptoms, vin]);

    // Auto-decode VIN
    useEffect(() => {
        if (vin.replace(/\s/g, '').length === 17) {
            const result = decodeVIN(vin);
            setDecoded(result);
        } else {
            setDecoded(null);
        }
    }, [vin]);

    const toggleSymptom = (s: SymptomId) => {
        setSelectedSymptoms(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const { trackEvent } = useAnalytics();

    const handleRun = () => {
        if (!problemText.trim() && !dtcCode && selectedSymptoms.length === 0) {
            setError(lang === 'ro' ? 'Descrie problema sau selectează un simptom' : 'Describe the problem or select a symptom');
            return;
        }
        setError('');

        const vehicle = (decoded && decoded.success && decoded.brand !== 'Unknown' && !showManual)
            ? { vin, brand: decoded.brand, model: decoded.model, engine: decoded.engine, year: decoded.year, mileage: parseInt(mileage) || 0 }
            : { vin: vin || `MANUAL-${Date.now()}`, brand: manualBrand, model: manualModel || manualBrand, engine: manualEngine || BRAND_ENGINES[manualBrand][0]?.label || 'N/A', year: parseInt(manualYear) || new Date().getFullYear(), mileage: parseInt(mileage) || 0 };

        // Merge parsed + manual symptoms/DTC
        const finalDtc = dtcCode || (parsed?.suggestedDtcs[0]);
        const finalSymptoms = selectedSymptoms.length > 0 ? selectedSymptoms : (parsed?.suggestedSymptoms as SymptomId[] ?? []);

        // Track the event
        trackEvent('diagnosis_started', {
            brand: vehicle.brand,
            has_vin: !!vin,
            has_dtc: !!finalDtc,
            symptom_count: finalSymptoms.length
        });

        navigate('/result', {
            state: { vehicle, dtcCode: finalDtc ? finalDtc.toUpperCase().trim() : undefined, symptoms: finalSymptoms, problemText },
        });
    };

    const showDecoded = decoded && decoded.success && decoded.brand !== 'Unknown' && !showManual;

    return (
        <div className="screen-content page-enter">

            <div style={{ marginBottom: 'var(--space-md)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: 4 }}>
                    {lang === 'ro' ? 'Diagnoză Nouă' : 'New Diagnosis'}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-3)', fontWeight: 500 }}>
                    {lang === 'ro' ? 'AI detectează problema din descriere' : 'AI detects problem from description'}
                </p>
            </div>

            {/* ── Problem description header ───────────────────────────── */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Plus size={14} strokeWidth={3} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                        {lang === 'ro' ? 'Descrie simptomele' : 'Describe symptoms'}
                    </span>
                </div>

                <textarea
                    className="form-input"
                    style={{
                        minHeight: 120, resize: 'none', fontSize: '1rem', lineHeight: 1.6,
                        border: '2px solid var(--color-primary)', borderRadius: 20,
                        padding: '16px', background: '#F8FAFF',
                    }}
                    placeholder={({ ro: 'ex: „Mașina vibrează la ralanti și văd fum albastru la pornire...”', en: 'ex: "Car vibrates at idle and I see blue smoke on startup..."', de: 'ex: "Das Auto vibriert im Leerlauf und ich sehe blauen Rauch beim Starten..."' })[lang]}
                    value={problemText}
                    onChange={e => { setProblemText(e.target.value); setError(''); }}
                    autoFocus
                />


            </div>

            {/* ── Main Action ────────────────────────────────────────── */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)', marginBottom: 12, fontWeight: 700, fontSize: '0.875rem', background: '#FEF2F2', padding: '10px 14px', borderRadius: 12 }}>
                    <AlertCircle size={16} />{error}
                </div>
            )}

            <button
                className="btn btn-primary"
                onClick={handleRun}
                style={{
                    width: '100%', height: 56, borderRadius: 18, fontSize: '1rem',
                    fontWeight: 800, marginBottom: 'var(--space-xl)',
                    boxShadow: '0 8px 20px rgba(21, 101, 192, 0.25)',
                }}
            >
                {lang === 'ro' ? 'Rulează Diagnoza AI' : 'Run AI Diagnosis'}
                <ArrowRight size={20} style={{ marginLeft: 8 }} />
            </button>

            {/* ── Advanced Details Section ───────────────────────────── */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
                <button
                    type="button"
                    onClick={() => setShowDetails(v => !v)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: showDetails ? '#F8FAFC' : 'none', border: showDetails ? '1px solid var(--color-border)' : 'none',
                        borderRadius: 14, padding: '12px 14px',
                        color: 'var(--color-text)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer',
                        transition: 'all 200ms',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Settings size={18} color="var(--color-primary)" />
                        {lang === 'ro' ? 'Date Vehicul (VIN, KM, DTC)' : 'Vehicle Data (VIN, KM, DTC)'}
                    </div>
                    {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showDetails && (
                    <div style={{ marginTop: 16, animation: 'fadeInUp 200ms ease both', padding: '4px' }}>
                        {/* VIN */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700 }}>{t('diag_vin_label', lang)}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input vin-input"
                                    placeholder={t('diag_vin_placeholder', lang)}
                                    value={vin}
                                    onChange={e => setVin(e.target.value.toUpperCase())}
                                    maxLength={17}
                                    style={{ paddingRight: 40, letterSpacing: '0.05em' }}
                                />
                                <div style={{ position: 'absolute', right: 12, top: 12, color: 'var(--color-text-3)' }}>
                                    <Car size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Decoded badge */}
                        {showDecoded && decoded && (
                            <div className="card" style={{ marginBottom: 16, background: '#E0F2FE', border: 'none', borderRadius: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', marginBottom: 4 }}>{t('diag_vehicle_detected', lang)}</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0C4A6E' }}>{decoded.brand} {decoded.model}</div>
                                        <div style={{ fontSize: '0.8125rem', color: '#075985', fontWeight: 600 }}>{decoded.engine} · {decoded.year}</div>
                                    </div>
                                    <button
                                        style={{ background: 'white', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#0369A1', cursor: 'pointer' }}
                                        onClick={() => { setShowManual(true); setManualBrand(decoded.brand as BrandId); setManualModel(decoded.model); setManualEngine(decoded.engine); setManualYear(decoded.year.toString()); }}
                                    >
                                        ✏️ {lang === 'ro' ? 'Edit' : 'Edit'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Manual entry */}
                        {(!showDecoded || showManual) && (
                            <div className="card" style={{ marginBottom: 16, border: '1.5px solid var(--color-border)', borderRadius: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">{t('diag_brand_label', lang)}</label>
                                        <select className="form-select" value={manualBrand} onChange={e => setManualBrand(e.target.value as BrandId)}>
                                            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">{t('diag_year_label', lang)}</label>
                                        <input className="form-input" type="number" value={manualYear} onChange={e => setManualYear(e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">{t('diag_model_label', lang)}</label>
                                        <input className="form-input" placeholder="ex: Golf" value={manualModel} onChange={e => setManualModel(e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">{t('diag_engine_label', lang)}</label>
                                        <select className="form-select" value={manualEngine} onChange={e => setManualEngine(e.target.value)}>
                                            <option value="">—</option>
                                            {BRAND_ENGINES[manualBrand].map(e => <option key={e.code} value={e.label}>{e.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mileage & DTC */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t('diag_mileage_label', lang)}</label>
                                <input className="form-input" type="number" placeholder="km" value={mileage} onChange={e => setMileage(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t('diag_dtc_label', lang)}</label>
                                <input className="form-input" placeholder="ex: P0301" value={dtcCode} onChange={e => setDtcCode(e.target.value.toUpperCase())} maxLength={8} style={{ fontFamily: 'monospace', fontWeight: 800 }} />
                            </div>
                        </div>

                        {/* Symptom chips */}
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700 }}>{t('diag_symptoms_label', lang)}</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {SYMPTOMS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSymptom(s)}
                                        style={{
                                            background: selectedSymptoms.includes(s) ? 'var(--color-primary)' : 'white',
                                            color: selectedSymptoms.includes(s) ? 'white' : 'var(--color-text)',
                                            border: '1.5px solid var(--color-border)',
                                            borderRadius: 12, padding: '8px 12px', fontSize: '0.8125rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                            transition: 'all 150ms',
                                        }}
                                    >
                                        <span>{SYMPTOM_EMOJI[s]}</span>
                                        {SYMPTOM_LABELS[s][lang]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
