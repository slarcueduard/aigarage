import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Settings, Plus, Zap, ChevronRight, ExternalLink, MapPin, Wrench } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { useJobStore } from '../store/useJobStore';
import { useDiagnosticSession } from '../store/useDiagnosticSession';
import { t } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import { parseRomanianProblem } from '../utils/textParser';

import { runAIDiagnosis, aiResultToDiagnosticResult, runAIPartsSearch } from '../utils/aiDiagnostic';
import type { AIPartsResult } from '../utils/aiDiagnostic';
import PartsSection from '../components/PartsSection';
import { getFastDiagnostic } from '../utils/fastDiagnostic';
import { getFastDtcDiagnostic, COMMON_DTCS } from '../utils/fastDtc';
import { useAnalytics } from '../hooks/useAnalytics';
import type { Vehicle, Symptom } from '../models/types';
import { CAR_BRANDS } from '../models/types';



function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
}

function lp<T>(lang: Lang, ro: T, de: T, en: T): T {
    if (lang === 'ro') return ro;
    if (lang === 'de') return de;
    return en;
}

// ── Confidence badge ──────────────────────────────────────────────────────────
function ConfidenceBadge({ value, aiMode, lang }: { value: number; aiMode: 'ai' | 'hidden' | 'loading'; lang: Lang }) {
    const color = value >= 70 ? '#16A34A' : value >= 45 ? '#D97706' : '#DC2626';
    const bg = value >= 70 ? '#F0FDF4' : value >= 45 ? '#FFFBEB' : '#FEF2F2';
    const label = value >= 70
        ? lp(lang, '✔ Diagnostic sigur', '✔ Diagnose sicher', '✔ High confidence')
        : value >= 45
            ? lp(lang, '◑ Potrivire parțială', '◑ Teilweise passend', '◑ Partial match')
            : lp(lang, '? Informații insuficiente', '? Unzureichende Infos', '? Insufficient info');
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${value}%`,
                    background: aiMode === 'ai' ? 'linear-gradient(90deg, #6366F1, #8B5CF6)' : color,
                    borderRadius: 99, transition: 'width 600ms cubic-bezier(.4,0,.2,1)',
                }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 20 }}>{label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 900, color }}>{value}%</span>
                {aiMode === 'ai' && (
                    <span style={{
                        fontSize: '0.6rem', fontWeight: 900, color: '#fff',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        padding: '2px 7px', borderRadius: 6,
                    }}>🤖 AI</span>
                )}
            </div>
        </div>
    );
}

// ── Quick tag chips ───────────────────────────────────────────────────────────
function QuickTags({ lang, onSelect }: { lang: Lang; onSelect: (q: string) => void }) {
    const tags = [
        { label: lp(lang, '🔥 Fum negru', '🔥 Schwarzer Rauch', '🔥 Black smoke'), query: lp(lang, 'motorul scoate fum negru', 'Motor stößt schwarzen Rauch aus', 'engine black smoke') },
        { label: lp(lang, '⚡ Nu pornește', '⚡ Startet nicht', '⚡ Won\'t start'), query: lp(lang, 'masina nu porneste', 'Auto startet nicht', 'car won\'t start') },
        { label: lp(lang, '🛢️ Pierde ulei', '🛢️ Ölverlust', '🛢️ Oil leak'), query: lp(lang, 'pierde ulei pe jos', 'Öl verliert unten', 'oil leak under car') },
        { label: lp(lang, '🌡️ Supraîncălzire', '🌡️ Überhitzung', '🌡️ Overheating'), query: lp(lang, 'motorul se supraincalzeste', 'Motor überhitzt', 'engine overheating') },
        { label: lp(lang, '⚙️ Cutie viteze', '⚙️ Getriebe', '⚙️ Gearbox'), query: lp(lang, 'probleme cutie de viteze', 'Getriebeprobleme', 'gearbox problem') },
        { label: lp(lang, '🔊 Zgomot suspensie', '🔊 Fahrwerksgeräusch', '🔊 Suspension noise'), query: lp(lang, 'zgomot suspensie pe gropi', 'Fahrwerksgeräusch über Bodenwellen', 'suspension noise on bumps') },
        { label: lp(lang, '🛞 Vibrații volan', '🛞 Lenkradvibrationen', '🛞 Steering vibration'), query: lp(lang, 'vibreaza volanul la viteza', 'Lenkrad vibriert bei Geschwindigkeit', 'steering vibration at speed') },
        { label: lp(lang, '❄️ AC nu răcește', '❄️ Klimaanlage schwach', '❄️ AC not cooling'), query: lp(lang, 'aerul conditionat nu raceste', 'Klimaanlage kühlt nicht', 'AC not cooling') },
    ];
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {tags.map((tag, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(tag.query)}
                    style={{
                        padding: '5px 11px', borderRadius: 20,
                        background: 'white', border: '1px solid #E2E8F0',
                        fontSize: '0.72rem', fontWeight: 700,
                        color: 'var(--color-text-2)', cursor: 'pointer',
                        transition: 'all 150ms ease', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4338CA'; e.currentTarget.style.borderColor = '#A5B4FC'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--color-text-2)'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                    {tag.label}
                </button>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomeScreen() {
    const navigate = useNavigate();
    const { settings, updateSettings } = useGarageStore();
    const { jobs, addJob } = useJobStore();
    const lang = settings.language;

    const { 
        text, setText,
        parsed, setParsed,
        typing, setTyping,
        savedJobId, setSavedJobId,
        selectedFastDtc, setSelectedFastDtc,
        selectedBrand, setSelectedBrand,
        selectedModel, setSelectedModel,
        selectedYear, setSelectedYear,
        vinMotorCode, setVinMotorCode,
        fastResult, setFastResult,
        pendingAiResult, setPendingAiResult,
        revealAi, setRevealAi,
        aiMode, setAiMode,
        aiError, setAiError,
        expandedCauseIndex, setExpandedCauseIndex,
        partsLoading, setPartsLoading,
        resetSession
    } = useDiagnosticSession();

    const { trackEvent } = useAnalytics();

    // Per-cause AI parts: loaded asynchronously after main diagnosis
    const [aiPartsByCause, setAiPartsByCause] = useState<AIPartsResult | null>(null);

    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const aiAbort = useRef<AbortController | null>(null);
    const partsAbort = useRef<AbortController | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasAI = !!(import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY);

    // Real-time diagnosis — AI-first with rule-based fallback
    useEffect(() => {
        if (debounce.current) clearTimeout(debounce.current);
        if (aiAbort.current) { aiAbort.current.abort(); aiAbort.current = null; }
        if (partsAbort.current) { partsAbort.current.abort(); partsAbort.current = null; }

        // Clear previous results immediately every time input changes,
        // so the user never sees stale results while new ones are loading.
        setFastResult(null);
        setPendingAiResult(null);
        setRevealAi(false);
        setAiPartsByCause(null);
        setPartsLoading(false);

        if (text.trim().length < 4 && !selectedFastDtc && !selectedBrand && !selectedModel) {
            setAiMode('hidden');
            setAiError(null);
            return;
        }

        // Only set typing if we have enough characters. Setting it on every keystroke
        // without a small delay causes UI re-renders that can interrupt the textarea.
        setTyping(true);
        setAiError(null);

        // Run fast rules immediately for instant feedback
        const fastDiag = getFastDiagnostic(text);
        if (fastDiag) {
            const p = parseRomanianProblem(text);
            const explicitBrand = selectedBrand || p.detectedBrand || (fastDiag.detectedBrand !== 'Unknown' ? fastDiag.detectedBrand : null) || 'Unknown';
            const aiVehicle: Vehicle = {
                vin: `AI-${Date.now()}`,
                brand: explicitBrand as any,
                model: selectedModel || p.detectedModel || explicitBrand || 'Autovehicul',
                engine: 'N/A',
                year: selectedYear ? parseInt(selectedYear) : (p.detectedYear ?? new Date().getFullYear()),
                mileage: 0,
            };
            const res = aiResultToDiagnosticResult(fastDiag, aiVehicle);
            setFastResult(res);
            setRevealAi(true); // Show offline result instantly
        } else if (selectedFastDtc && text.trim().length < 4) {
            const dtcDiag = getFastDtcDiagnostic(selectedFastDtc);
            if (dtcDiag) {
                const aiVehicle: Vehicle = {
                    vin: `AI-${Date.now()}`,
                    brand: (selectedBrand || 'Unknown') as any,
                    model: selectedModel || 'Autovehicul',
                    engine: 'N/A',
                    year: selectedYear ? parseInt(selectedYear) : new Date().getFullYear(),
                    mileage: 0,
                };
                const res = aiResultToDiagnosticResult(dtcDiag, aiVehicle);
                setFastResult(res);
                setRevealAi(true); // Show DTC result instantly
            }
        } else {
            setFastResult(null);
        }

        debounce.current = setTimeout(async () => {
            const p = parseRomanianProblem(text);
            setParsed(p);
            setTyping(false);
            setSavedJobId(null);
            setAiError(null);
            // Cancel any running parts search for the prev query
            if (partsAbort.current) { partsAbort.current.abort(); partsAbort.current = null; }
            setAiPartsByCause(null);

            // AI Activation Logic:
            // 1. If user just selected a DTC (without specific symptoms or vehicle info) -> show instant offline result only.
            // 2. If user provides "specifics" (text symptom >= 5 chars OR car brand/model) -> trigger AI for customized response.
            const hasSpecifics = text.trim().length >= 5 || selectedBrand || selectedModel;

            if (hasAI && hasSpecifics) {
                try {
                    setAiMode('loading');
                    aiAbort.current = new AbortController();
                    
                    let fullProblemText = '';
                    if (selectedBrand) fullProblemText += `${selectedBrand} `;
                    if (selectedModel) fullProblemText += `${selectedModel} `;
                    if (selectedYear) fullProblemText += `${selectedYear} `;
                    if (selectedFastDtc) fullProblemText += `(DTC ${selectedFastDtc}) `;
                    fullProblemText += text;
                    
                    const timeoutId = setTimeout(() => {
                        if (aiAbort.current) {
                            aiAbort.current.abort();
                            setAiError(lp(lang, 'Timeout: Serviciul durează prea mult. Încearcă din nou.', 'Timeout: Server antwortet nicht. Bitte erneut versuchen.', 'Timeout: Server takes too long. Please try again.'));
                            setAiMode('hidden');
                        }
                    }, 45000);

                    const aiResult = await runAIDiagnosis(
                        fullProblemText.trim(),
                        lang,
                        selectedBrand || p.detectedBrand || undefined,
                        selectedModel || p.detectedModel || undefined,
                        selectedYear || (p.detectedYear ? String(p.detectedYear) : undefined),
                        aiAbort.current.signal,
                        '',
                    );
                    clearTimeout(timeoutId);

                    if (aiResult && aiResult.causes && aiResult.causes.length > 0) {
                        const explicitBrand = selectedBrand || p.detectedBrand || (aiResult.detectedBrand !== 'Unknown' ? aiResult.detectedBrand : null) || 'Unknown';
                        const aiVehicle: Vehicle = {
                            vin: `AI-${Date.now()}`,
                            brand: explicitBrand as any,
                            model: selectedModel || p.detectedModel || explicitBrand || 'Autovehicul',
                            engine: 'N/A',
                            year: selectedYear ? parseInt(selectedYear) : (p.detectedYear ?? new Date().getFullYear()),
                            mileage: 0,
                        };
                        setPendingAiResult(aiResultToDiagnosticResult(aiResult, aiVehicle));
                        setAiMode('ai');
                        // Auto-reveal results immediately — no button needed
                        setRevealAi(true);

                        // Track the event
                        trackEvent('quick_diagnosis_success', {
                            brand: explicitBrand,
                            model: aiVehicle.model,
                            has_vin: !!vinMotorCode,
                            provider: import.meta.env.VITE_AI_PROVIDER || 'gemini'
                        });

                        // ── Stage 2: Parts search in background ──────────────────
                        if (hasAI) {
                            setPartsLoading(true);
                            partsAbort.current = new AbortController();
                            const currency: 'RON' | 'EUR' = lang === 'ro' ? 'RON' : 'EUR';
                            runAIPartsSearch(
                                aiResult,
                                lang,
                                currency,
                                partsAbort.current.signal,
                            ).then(partsResult => {
                                if (partsResult) setAiPartsByCause(partsResult);
                            }).finally(() => {
                                setPartsLoading(false);
                            });
                        }
                    } else {
                        if (!aiAbort.current?.signal.aborted) {
                            setAiMode('hidden');
                            setAiError('AI returned empty result.');
                        }
                    }
                } catch (err: unknown) {
                    if (err instanceof Error && err.name === 'AbortError') {
                        // Handled by timeout or component unmount/typing
                    } else if (err instanceof Error && err.message === 'RATE_LIMIT') {
                        setAiError(lp(lang, 
                            'Limita de utilizare (Quota) atinsă la Google Gemini. Te rugăm să aștepți ~30 secunde și să reîncerci.',
                            'Quotenlimit erreicht. Bitte warten Sie ~30 Sekunden und versuchen Sie es erneut.',
                            'Quota limit reached on Google Gemini. Please wait ~30 seconds and try again.'
                        ));
                        setAiMode('hidden');
                    } else {
                        setAiError(err instanceof Error ? err.message : String(err));
                        setAiMode('hidden');
                    }
                }
            } else {
                setAiMode('hidden');
            }
        }, hasAI ? 650 : 300);

        return () => { if (debounce.current) clearTimeout(debounce.current); };
    }, [text, hasAI, selectedFastDtc, selectedBrand, selectedModel, selectedYear]);

    useEffect(() => {
        const top = (revealAi ? pendingAiResult : fastResult)?.causes?.[0]?.name ?? null;
        if (top && top !== prevTopCause.current) { setExpandedCauseIndex(0); prevTopCause.current = top; }
        else if (!revealAi && !fastResult) { prevTopCause.current = null; }
    }, [revealAi, fastResult, pendingAiResult]);

    const prevTopCause = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (aiAbort.current) aiAbort.current.abort();
            if (partsAbort.current) partsAbort.current.abort();
        };
    }, []);

    const handleNewDiagnosis = () => {
        resetSession();
        if (textareaRef.current) textareaRef.current.focus();
    };

    const handleSave = () => {
        const result = revealAi ? pendingAiResult : fastResult;
        if (!result || !parsed) return;
        const vehicle: Vehicle = {
            vin: `TEXT-${Date.now()}`,
            brand: ((selectedBrand || parsed.detectedBrand) ?? 'Unknown') as any,
            model: (selectedModel || parsed.detectedModel || parsed.detectedBrand) ?? 'Autovehicul',
            engine: 'N/A',
            year: (selectedYear ? parseInt(selectedYear) : parsed.detectedYear) ?? new Date().getFullYear(),
            mileage: 0,
        };
        const saved = addJob({
            vehicle,
            dtcCode: parsed.suggestedDtcs[0],
            symptoms: parsed.suggestedSymptoms as Symptom[],
            diagnosticResult: result,
            confirmedCauseIndex: 0,
            partsUsed: [], lineItems: [],
            laborHours: 0, laborRate: settings.defaultLaborRate,
            notes: text,
            tags: [parsed.detectedBrand, parsed.suggestedDtcs[0], ...parsed.suggestedSymptoms].filter(Boolean) as string[],
            date: Date.now(),
            status: 'diagnostic',
        });
        setSavedJobId(saved.id);
    };

    const today = new Date();
    const todayCount = jobs.filter(j => {
        const d = new Date(j.date);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    const navItems = [
        {
            icon: <Plus size={20} strokeWidth={3} />,
            label: lp(lang, 'Diagnoză Nouă', 'Neue Diagnose', 'New Diagnosis'),
            sub: 'Reset',
            color: 'var(--color-primary)', bg: 'var(--color-primary-bg)', border: 'var(--color-primary-light)',
            onClick: handleNewDiagnosis,
            primary: true,
        },
        {
            icon: <FolderOpen size={20} />,
            label: lp(lang, 'Istoric Lucrări', 'Auftragshistorie', 'Jobs History'),
            sub: `${jobs.length}`,
            color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
            onClick: () => navigate('/jobs'),
        },
        {
            icon: <Settings size={20} />,
            label: lp(lang, 'Setări', 'Einstellungen', 'Settings'),
            sub: lp(lang, 'Profil', 'Profil', 'Profile'),
            color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
            onClick: () => navigate('/settings'),
        },
    ];

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 20 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 38, height: 38, background: 'var(--color-primary)',
                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', boxShadow: '0 4px 10px rgba(21,101,192,0.2)',
                    }}>🔧</div>
                    <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 950, color: 'var(--color-text)', lineHeight: 1.1 }}>
                            {settings.name || 'Garage OS'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', fontWeight: 600, marginTop: 1 }}>
                            {todayCount > 0
                                ? <><span style={{ color: 'var(--color-primary)', fontWeight: 900 }}>{todayCount}</span> {t('home_jobs_today', lang)}</>
                                : lp(lang, 'Workshop activ', 'Werkstatt activ', 'Workshop active')}
                        </div>
                    </div>
                </div>
                {(() => {
                    const firstSeenAt = settings.firstSeenAt || Date.now();
                    const diff = Date.now() - firstSeenAt;
                    const daysLeft = Math.max(0, 7 - Math.floor(diff / (24 * 60 * 60 * 1000)));
                    return (
                        <div style={{ 
                            marginLeft: 12, padding: '4px 10px', borderRadius: 8, 
                            background: daysLeft <= 2 ? '#FEF2F2' : '#F0F9FF',
                            border: `1px solid ${daysLeft <= 2 ? '#FEE2E2' : '#E0F2FE'}`,
                            display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: 3, background: daysLeft <= 2 ? '#EF4444' : '#0EA5E9' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: daysLeft <= 2 ? '#B91C1C' : '#0369A1', textTransform: 'uppercase' }}>
                                {daysLeft} {lp(lang, 'Zile Testare', 'Testtage übrig', 'Trial Days')}
                            </span>
                        </div>
                    );
                })()}
                <select
                    value={lang}
                    onChange={(e) => updateSettings({ language: e.target.value as 'ro' | 'en' | 'de' })}
                    style={{
                        background: 'white', border: '1.5px solid var(--color-border)',
                        borderRadius: 10, padding: '5px 28px 5px 10px',
                        fontWeight: 900, fontSize: '0.72rem',
                        color: 'var(--color-text-2)', cursor: 'pointer',
                        outline: 'none', appearance: 'none',
                        minWidth: 85,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center'
                    }}
                >
                    <option value="ro">🇷🇴 RO</option>
                    <option value="en">🇬🇧 ENG</option>
                    <option value="de">🇩🇪 DE</option>
                </select>
            </div>

            {/* Quick Hero */}
            <div style={{
                background: (fastResult || revealAi) ? 'white' : 'linear-gradient(145deg, #F0F4FF, #F8FAFF)',
                border: (fastResult || revealAi) ? '1.5px solid var(--color-primary-light)' : '1.5px solid #E0E7FF',
                borderRadius: 22, padding: '16px', marginBottom: 16,
                boxShadow: (fastResult || revealAi) ? '0 8px 32px rgba(99,102,241,0.10)' : '0 2px 12px rgba(99,102,241,0.04)',
                transition: 'all 300ms ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                    }}>
                        <Zap size={16} color="white" fill="white" />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        {lp(lang, 'Diagnoză Rapidă AI', 'Schnelldiagnose KI', 'Quick AI Diagnosis')}
                    </span>
                    {(typing || (aiMode === 'loading' && !revealAi)) && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#6366F1', fontWeight: 700, animation: 'pulse 1s ease-in-out infinite' }}>
                            {typing ? lp(lang, 'Analizez...', 'Analysiere...', 'Analyzing...') : lp(lang, 'AI în curs...', 'KI läuft...', 'AI thinking...')}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    <select
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none', minWidth: 120 }}
                        value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                    >
                        <option value="">{lp(lang, 'Marcă...', 'Marke...', 'Brand...')}</option>
                        {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <input
                        type="text" placeholder={lp(lang, 'Model', 'Modell', 'Model')}
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none', flex: 1, minWidth: 100 }}
                        value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                    />
                    <input
                        type="number" placeholder={lp(lang, 'An', 'Jahr', 'Year')}
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none', width: 70 }}
                        value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                    />
                    <select
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none', flex: 1, minWidth: 100 }}
                        value={selectedFastDtc} onChange={e => setSelectedFastDtc(e.target.value)}
                    >
                        <option value="">{lp(lang, 'Alege Cod DTC...', 'DTC-Code wählen...', 'Select DTC Code...')}</option>
                        {COMMON_DTCS.map(d => (
                           <option key={d.code} value={d.code}>{d.code} - {lp(lang, d.nameRo, d.nameDe || d.nameEn, d.nameEn)}</option>
                        ))}
                    </select>
                </div>

                <div style={{ position: 'relative' }}>
                    <textarea
                        ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
                        placeholder={lp(lang, 'Descrie problema...', 'Problem beschreiben...', 'Describe problem...')}
                        style={{
                            width: '100%', minHeight: 70, resize: 'none', background: 'white',
                            border: `1.5px solid ${aiMode === 'loading' ? '#A5B4FC' : (fastResult || revealAi) ? '#E0E7FF' : '#E2E8F0'}`,
                            borderRadius: 14, padding: '12px', fontSize: '0.9rem', outline: 'none',
                        }}
                    />
                    {text && <button onClick={() => setText('')} style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>✕</button>}
                </div>
                <QuickTags lang={lang} onSelect={setText} />

                {/* Display AI Error if present */}
                {aiError && (
                    <div style={{ marginTop: 14, padding: '12px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                        <span style={{ fontSize: '0.8rem', color: '#B91C1C', fontWeight: 700, lineHeight: 1.4 }}>{aiError}</span>
                    </div>
                )}

                {/* Loading state bar - High visibility */}
                {(typing || aiMode === 'loading') && (
                    <div style={{ 
                        marginTop: 18, 
                        background: '#F1F5F9', 
                        height: 22, 
                        borderRadius: 12, 
                        overflow: 'hidden', 
                        position: 'relative',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                         <div style={{
                             height: '100%',
                             width: '40%',
                             background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2), transparent)',
                             position: 'absolute',
                             left: 0,
                             animation: 'shimmer-loading 1.5s infinite linear'
                         }} />
                         <span style={{ 
                             position: 'relative', 
                             fontSize: '0.65rem', 
                             fontWeight: 900, 
                             color: '#6366F1', 
                             letterSpacing: '0.02em',
                             textTransform: 'uppercase'
                         }}>
                             {typing ? lp(lang, 'Analizez datele...', 'Daten werden analysiert...', 'Analyzing data...') : lp(lang, 'AI prepară soluția...', 'KI bereitet Lösung vor...', 'AI is preparing solution...')}
                         </span>
                    </div>
                )}

                {/* RESULTS AREA */}
                {(() => {
                    const activeResult = revealAi ? (pendingAiResult || fastResult) : null;
                    
                    return (
                        <>

                            {activeResult && (
                                <div style={{ marginTop: 16 }}>
                                    <ConfidenceBadge value={activeResult.confidence} aiMode={revealAi ? 'ai' : 'hidden'} lang={lang} />
                                    
                                    {/* Vehicle Identity Tag (Confirmation) */}
                                    {(activeResult.vehicle.brand !== 'Unknown' || activeResult.vehicle.model) && (
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: 6, 
                                            padding: '4px 10px', background: '#EEF2FF', border: '1px solid #C7D2FE',
                                            borderRadius: 8, marginTop: 8, marginBottom: 4
                                        }}>
                                            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#6366F1' }} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {lp(lang, 'Vehicul Identificat:', 'Identifiziertes Fahrzeug:', 'Identified Vehicle:')}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E40AF' }}>
                                                {activeResult.vehicle.brand} {activeResult.vehicle.model} {activeResult.vehicle.year > 0 ? activeResult.vehicle.year : ''}
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {activeResult.causes.map((cause, idx) => {
                                            const isExpanded = expandedCauseIndex === idx;
                                            const title = lp(lang, cause.nameRo, cause.nameDe || cause.name, cause.name);
                                            const steps = lp(lang, cause.repairStepsRo, cause.repairStepsDe || cause.repairSteps, cause.repairSteps) || [];
                                            const techDetails = lp(lang, cause.technicalDetailsRo, cause.technicalDetailsDe || cause.technicalDetails, cause.technicalDetails);
                                            const location = lp(lang, cause.componentLocationRo, cause.componentLocationDe || cause.componentLocation, cause.componentLocation);
                                            const tools = lp(lang, cause.requiredToolsRo, cause.requiredToolsDe || cause.requiredTools, cause.requiredTools) || [];
                                            const quickTests = lp(lang, (cause as any).quickTestsRo, (cause as any).quickTestsDe || (cause as any).quickTests, (cause as any).quickTests) || [];
                                            const safety = lp(lang, (cause as any).safetyWarningsRo, (cause as any).safetyWarningsDe || (cause as any).safetyWarnings, (cause as any).safetyWarnings);
                                            const forumInsight = lp(lang, cause.forumInsightRo, cause.forumInsightDe || cause.forumInsight, cause.forumInsight);
                                            const tricks = lp(lang, (cause as any).tricksAndTipsRo, (cause as any).tricksAndTipsDe || (cause as any).tricksAndTips, (cause as any).tricksAndTips);

                                            return (
                                                <div key={idx} style={{
                                                    background: isExpanded ? 'white' : '#F8FAFC',
                                                    border: isExpanded ? '1.5px solid #6366F1' : '1px solid #E2E8F0',
                                                    borderRadius: 14, overflow: 'hidden',
                                                    boxShadow: isExpanded ? '0 10px 25px rgba(99,102,241,0.12)' : 'none',
                                                    transition: 'all 200ms ease',
                                                }}>
                                                    <div onClick={() => setExpandedCauseIndex(isExpanded ? -1 : idx)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{
                                                            width: 36, height: 36, borderRadius: 10,
                                                            background: isExpanded ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : '#F1F5F9',
                                                            color: isExpanded ? 'white' : '#64748B',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 900, fontSize: '0.85rem'
                                                        }}>
                                                            {cause.probability}%
                                                        </div>
                                                        <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 850, color: '#1E293B' }}>{title}</div>
                                                        <ChevronRight size={18} style={{ color: '#94A3B8', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
                                                    </div>

                                                    {isExpanded && (
                                                        <div style={{ padding: '0 16px 16px', fontSize: '0.85rem' }}>
                                                            {/* 1. Problem identification & start point */}
                                                            {techDetails && (
                                                                <div style={{ padding: '12px', background: '#F0F9FF', borderRadius: 10, border: '1px solid #E0F2FE', marginBottom: 12 }}>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                                                                        {lp(lang, 'Identificare Problemă', 'Problemidentifizierung', 'Problem Identification')}
                                                                    </div>
                                                                    <div style={{ color: '#0369A1', lineHeight: 1.5, fontWeight: 600 }}>{techDetails}</div>
                                                                </div>
                                                            )}

                                                            {/* 2. Component Location & Tools */}
                                                            {(location || tools.length > 0) && (
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                                                                    {location && (
                                                                        <div style={{ padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                                                                <MapPin size={12} color="#6366F1" />
                                                                                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>{lp(lang, 'Locație', 'Standort', 'Location')}</span>
                                                                            </div>
                                                                            <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.75rem' }}>{location}</div>
                                                                        </div>
                                                                    )}
                                                                    {tools.length > 0 && (
                                                                        <div style={{ padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                                                                <Wrench size={12} color="#6366F1" />
                                                                                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>{lp(lang, 'Scule', 'Werkzeuge', 'Tools')}</span>
                                                                            </div>
                                                                            <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.75rem' }}>{tools.join(', ')}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* 3. Quick Diagnostic Tests (New!) */}
                                                            {quickTests.length > 0 && (
                                                                <div style={{ marginBottom: 14 }}>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                        <Zap size={10} color="#6366F1" />
                                                                        {lp(lang, 'Teste Rapide (< 5 min)', 'Schnelltests (< 5 Min.)', 'Quick Tests (< 5 min)')}
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                                        {quickTests.map((qt: string, qti: number) => (
                                                                            <div key={qti} style={{ padding: '6px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>
                                                                                {qt}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 4. Execution Plan (Steps) */}
                                                            <div style={{ marginBottom: 14 }}>
                                                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <div style={{ width: 4, height: 4, borderRadius: 2, background: '#6366F1' }} />
                                                                    {lp(lang, 'Plan de Reparație', 'Reparaturplan', 'Execution Plan')}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                    {steps.map((st: string, si: number) => (
                                                                        <div key={si} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                                            <div style={{ width: 18, height: 18, borderRadius: 5, background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                                                                            <div style={{ lineHeight: 1.4, color: '#334155', fontWeight: 600 }}>{st}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* 4. Expert Insight */}
                                                            {forumInsight && (
                                                                <div style={{ padding: '12px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FEF3C7', marginBottom: 10 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                                                        <span style={{ fontSize: '1rem' }}>💡</span>
                                                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#D97706', textTransform: 'uppercase' }}>{lp(lang, 'Sfat de la comunitate (Forums)', 'Forum-Vorschläge', 'Forum Suggestions')}</span>
                                                                    </div>
                                                                    <div style={{ color: '#92400E', fontStyle: 'italic', lineHeight: 1.4, fontWeight: 500 }}>"{forumInsight}"</div>
                                                                </div>
                                                            )}

                                                            {/* 5. Tricks & Tips (New!) */}
                                                            {tricks && (
                                                                <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #DCFCE7', marginBottom: 14 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                                                        <span style={{ fontSize: '1rem' }}>🛠️</span>
                                                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#16A34A', textTransform: 'uppercase' }}>{lp(lang, 'Trucuri și Sfaturi (Tricks)', 'Tricks & Tipps', 'Master Tricks & Tips')}</span>
                                                                    </div>
                                                                    <div style={{ color: '#166534', lineHeight: 1.4, fontWeight: 600 }}>{tricks}</div>
                                                                </div>
                                                            )}

                                                            {/* 6. Safety Warnings */}
                                                            {safety && (
                                                                <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FEE2E2', marginBottom: 14 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                                                        <span style={{ fontSize: '1rem' }}>⚠️</span>
                                                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase' }}>{lp(lang, 'Avertizări de Siguranță', 'Sicherheitshinweise', 'Safety Warnings')}</span>
                                                                    </div>
                                                                    <div style={{ color: '#991B1B', lineHeight: 1.4, fontWeight: 700 }}>{safety}</div>
                                                                </div>
                                                            )}

                                                            {/* 7. Parts & Shop Links */}
                                                            <PartsSection
                                                                lang={lang}
                                                                causeIndex={idx}
                                                                partKeywords={(cause as any).partKeywords || []}
                                                                vinMotorCode={vinMotorCode}
                                                                onVinChange={setVinMotorCode}
                                                                vehicleContext={{
                                                                    brand: selectedBrand || parsed?.detectedBrand || undefined,
                                                                    model: selectedModel || (parsed as any)?.detectedModel || undefined,
                                                                    year: selectedYear || (parsed as any)?.detectedYear?.toString() || undefined,
                                                                    vin: vinMotorCode || undefined,
                                                                }}
                                                                region={lang === 'ro' ? 'ro' : lang === 'de' ? 'eu' : (settings.partsRegion || 'eu')}
                                                                aiPartsByCause={aiPartsByCause}
                                                                partsLoading={partsLoading}
                                                            />

                                                            {/* Save & Detail Buttons */}
                                                            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                                                <button onClick={handleSave} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#1E293B', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '0.84rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                                    {savedJobId ? lp(lang, 'Fișă Salvată ✓', 'Gespeichert ✓', 'Job Saved ✓') : lp(lang, 'Salvează Fișă', 'Speichern', 'Save Job')}
                                                                </button>
                                                                <button onClick={() => navigate('/job-detail/new')} style={{ padding: '10px', width: 44, borderRadius: 10, background: 'white', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                                    <ExternalLink size={18} color="#64748B" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            {/* Nav Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {navItems.map((item, i) => (
                    <button key={i} onClick={item.onClick} style={{ background: 'white', border: `1.5px solid ${item.border}`, borderRadius: 16, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E293B' }}>{item.label}</div>
                    </button>
                ))}
            </div>

            {/* Recent Jobs */}
            {jobs.length > 0 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{t('home_recent_jobs', lang)}</span>
                        <button onClick={() => navigate('/jobs')} style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 700, fontSize: '0.75rem' }}>{lp(lang, 'Toate →', 'Alle →', 'All →')}</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {jobs.slice(0, 3).map(job => (
                            <div key={job.id} onClick={() => navigate(`/job-detail/${job.id}`)} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '12px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{job.vehicle.brand} {job.vehicle.model}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{formatDate(job.date)}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{job.dtcCode || 'General Service'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
