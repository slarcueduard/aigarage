import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, Car, Clock, CheckCircle, Printer, Share2, Zap, Lightbulb, Hammer, AlertTriangle } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { useJobStore } from '../store/useJobStore';
import { t } from '../i18n/translations';
import { runDiagnosis } from '../utils/diagnosticEngine';
import type { DiagnosticResult, DiagnosisCause, Vehicle, Job, Part, Symptom } from '../models/types';


function ConfidenceBar({ value }: { value: number }) {
    const color = value >= 75 ? '#16A34A' : value >= 50 ? '#D97706' : '#DC2626';
    const label = value >= 75 ? 'Diagnoză Certă' : value >= 50 ? 'Diagnoză Probabilă' : 'Sunt necesare teste suplimentare';
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color }}>{label}</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 900, color }}>{value}%</span>
            </div>
            <div style={{ height: 8, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${value}% `, background: color,
                    borderRadius: 99, transition: 'width 600ms cubic-bezier(.4,0,.2,1)',
                }} />
            </div>
        </div>
    );
}

export default function DiagnosticResultScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useGarageStore();
    const { addJob } = useJobStore();
    const lang = settings.language;

    const { vehicle, dtcCode, symptoms } = (location.state ?? {}) as {
        vehicle: Vehicle;
        dtcCode?: string;
        symptoms: Symptom[];
    };

    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [, setCauseStates] = useState<Array<'idle' | 'ok' | 'defect'>>([]);

    const [confirmedIdx, setConfirmedIdx] = useState<number | null>(null);
    const [selectedParts] = useState<Part[]>([]);
    const [saved, setSaved] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [showCustomer, setShowCustomer] = useState(false);
    const resultRef = useRef<Job | null>(null);

    useEffect(() => {
        if (!vehicle) { navigate('/diagnosis'); return; }
        const r = runDiagnosis({ vehicle, dtcCode, symptoms: symptoms ?? [] });
        setResult(r);
        setCauseStates(new Array(r.causes.length).fill('idle'));
    }, []);

    if (!result || !vehicle) {
        return <div className="screen-content"><div className="spinner" /></div>;
    }

    const handleCauseState = (idx: number, state: 'ok' | 'defect') => {
        setCauseStates(prev => prev.map((s, i) => i === idx ? state : s));
    };

    const buildTags = (cause: DiagnosisCause): string[] => {
        const tags: string[] = [vehicle.brand];
        if (dtcCode) tags.push(dtcCode);
        tags.push(...cause.partKeywords.slice(0, 2));
        return tags;
    };

    const handleConfirm = (idx: number) => {
        setConfirmedIdx(idx);
        setShowCustomer(true);
    };

    const handleSaveJob = () => {
        if (confirmedIdx === null) return;
        const cause = result.causes[confirmedIdx];
        const job: Omit<Job, 'id'> = {
            vehicle,
            dtcCode,
            symptoms: symptoms as Symptom[] ?? [],
            diagnosticResult: result,
            confirmedCauseIndex: confirmedIdx,
            partsUsed: selectedParts,
            lineItems: selectedParts.map(p => ({
                type: 'part',
                description: p.nameRo,
                partId: p.id,
                qty: 1,
                unitPrice: p.price,
                currency: p.currency,
            })),
            laborHours: 0,
            laborRate: settings.defaultLaborRate,
            notes,
            tags: buildTags(cause),
            customerName: customerName || undefined,
            customerPhone: customerPhone || undefined,
            date: Date.now(),
            status: 'diagnostic',
        };
        const saved = addJob(job);
        resultRef.current = saved;
        setSaved(true);
    };

    const confidence = result.confidence;
    const confirmedCause = confirmedIdx !== null ? result.causes[confirmedIdx] : null;

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 100 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                    {t('result_title', lang)}
                </h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-icon" style={{ background: '#F1F5F9', border: 'none', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }} onClick={() => window.print()}>
                        <Printer size={18} />
                    </button>
                    <button className="btn-icon" style={{ background: '#F1F5F9', border: 'none', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Vehicle Card (Compact & Pro) */}
            <div style={{
                background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20,
                padding: '16px', marginBottom: 'var(--space-lg)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={26} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.2 }}>{vehicle.brand} {vehicle.model}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', fontWeight: 600, marginTop: 2 }}>{vehicle.engine} · {vehicle.year} · {vehicle.mileage.toLocaleString('ro-RO')} km</div>
                        {dtcCode && <span className="tag tag-dtc" style={{ marginTop: 8, display: 'inline-block' }}>{dtcCode}</span>}
                    </div>
                </div>
            </div>

            {/* Global Confidence */}
            <ConfidenceBar value={confidence} />

            {/* Causes Deep Dive */}
            <div className="section-header" style={{ marginTop: 'var(--space-lg)' }}>
                <span className="section-title">{t('result_causes', lang)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.causes.map((cause, idx) => {
                    const isConfirmed = confirmedIdx === idx;
                    const prob = cause.probability;
                    const accentColor = idx === 0 ? 'var(--color-primary)' : idx === 1 ? '#D97706' : '#64748B';


                    return (
                        <div key={idx} style={{
                            background: 'white', border: `1.5px solid ${isConfirmed ? 'var(--color-success)' : 'var(--color-border)'} `,
                            borderRadius: 24, overflow: 'hidden', boxShadow: isConfirmed ? '0 10px 25px rgba(22, 163, 74, 0.15)' : 'none',
                        }}>
                            {/* Card Header: Rank + Name + Prob */}
                            <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, background: prob >= 50 ? accentColor : '#F1F5F9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: prob >= 50 ? 'white' : 'var(--color-text-3)',
                                }}>
                                    {prob}%
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.3 }}>
                                        {lang === 'ro' ? cause.nameRo : cause.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={13} /> ~{cause.estimatedMinutes}m
                                        </span>
                                        <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                                        <button
                                            onClick={() => navigate('/parts', { state: { cause, vehicle, jobCauses: result.causes } })}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 800, padding: 0, cursor: 'pointer' }}
                                        >
                                            {t('result_view_parts', lang)} →
                                        </button>
                                    </div>
                                </div>
                                {isConfirmed && <CheckCircle size={24} color="var(--color-success)" strokeWidth={3} />}
                            </div>

                            {/* Verification Step (Info box) */}
                            <div style={{ margin: '0 18px 18px', padding: '12px 14px', background: '#F8FAFC', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ color: 'var(--color-primary)', marginTop: 2 }}><Info size={16} /></div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', lineHeight: 1.5 }}>
                                        <strong style={{ color: 'var(--color-text)' }}>{t('result_check_first', lang)}:</strong> {lang === 'ro' ? cause.checkStepRo : cause.checkStep}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Deep Dive */}
                            {(lang === 'ro' ? cause.technicalDetailsRo : cause.technicalDetails) && (
                                <div style={{ margin: '0 18px 18px', padding: '14px', background: '#F0F4FF', borderRadius: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <Zap size={14} color="var(--color-primary)" fill="var(--color-primary)" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Context Tehnic</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                                        {lang === 'ro' ? cause.technicalDetailsRo : cause.technicalDetails}
                                    </div>
                                </div>
                            )}

                            {/* Community Insights */}
                            {(lang === 'ro' ? (cause.forumInsightRo || cause.forumInsight) : cause.forumInsight) && (
                                <div style={{ margin: '0 18px 18px', padding: '14px', background: '#FFFBEB', borderRadius: 16, border: '1px solid #FEF3C7' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <Lightbulb size={14} color="#D97706" fill="#D97706" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sfat Comunitate (Forum/YT)</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#92400E', lineHeight: 1.6, fontStyle: 'italic' }}>
                                        "{lang === 'ro' ? (cause.forumInsightRo || cause.forumInsight) : cause.forumInsight}"
                                    </div>
                                </div>
                            )}

                            {/* Repair Steps */}
                            {((lang === 'ro' ? cause.repairStepsRo : cause.repairSteps) ?? []).length > 0 && (
                                <div style={{ margin: '0 18px 18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <Hammer size={14} color="var(--color-text)" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pași de Reparație</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {(lang === 'ro' ? cause.repairStepsRo! : cause.repairSteps!).map((step, si) => (
                                            <div key={si} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>
                                                    {si + 1}
                                                </div>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.55 }}>{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Parts Pricing — brand/model-specific */}
                            {cause.partsRo && cause.partsRo.length > 0 && (
                                <div style={{ margin: '0 18px 18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span style={{ fontSize: '16px' }}>🛒</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            Piese Necesare · Prețuri Estimate (RON)
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {cause.partsRo.map((part, pi) => (
                                            <div key={pi} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                background: '#F8FAFC', border: '1px solid #E2E8F0',
                                                borderRadius: 12, padding: '10px 14px',
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>{part.name}</div>
                                                    {part.note && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', marginTop: 3 }}>{part.note}</div>}
                                                </div>
                                                <div style={{
                                                    flexShrink: 0, marginLeft: 12,
                                                    background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                                                    borderRadius: 10, padding: '5px 12px',
                                                    fontSize: '0.8125rem', fontWeight: 800, color: 'white',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    ~{part.priceRon} RON
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bottom Actions for this cause */}
                            {confirmedIdx === null ? (
                                <div style={{ padding: '4px 18px 18px', display: 'flex', gap: 10 }}>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        style={{ flex: 1, height: 40, borderRadius: 12 }}
                                        onClick={() => handleCauseState(idx, 'ok')}
                                    >
                                        <CheckCircle size={16} /> OK
                                    </button>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        style={{ flex: 1, height: 40, borderRadius: 12, background: 'var(--color-text)', color: 'white', border: 'none' }}
                                        onClick={() => handleConfirm(idx)}
                                    >
                                        <AlertTriangle size={16} /> Confirmă Defect
                                    </button>
                                </div>
                            ) : isConfirmed ? (
                                <div style={{ padding: '0 18px 18px' }}>
                                    <div style={{ background: '#F0FDF4', color: '#16A34A', borderRadius: 12, padding: '10px', fontSize: '0.8125rem', fontWeight: 800, textAlign: 'center', border: '1px solid #DCFCE7' }}>
                                        ✓ Cauză Selectată pentru fișă
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {/* Customer Form (Floating Card when confirmed) */}
            {showCustomer && confirmedCause && !saved && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
                    padding: '24px 20px', borderTop: '1px solid var(--color-border)',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', zIndex: 100,
                    animation: 'slideUp 300ms cubic-bezier(.4,0,.2,1)',
                }}>
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1rem' }}>Deschide Fișă Service</h3>
                            <button style={{ background: 'none', border: 'none', color: 'var(--color-text-3)', fontWeight: 800 }} onClick={() => setShowCustomer(false)}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t('common_customer_name', lang)}</label>
                                <input className="form-input" placeholder="Nume client" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t('common_customer_phone', lang)}</label>
                                <input className="form-input" placeholder="07xx xxx xxx" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">{t('common_notes', lang)}</label>
                            <input className="form-input" placeholder="Observații suplimentare..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 800 }} onClick={handleSaveJob}>
                            Salvează Lucrarea în Istoric
                        </button>
                    </div>
                </div>
            )}

            {/* Success Overlay */}
            {saved && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 24, zIndex: 200, animation: 'fadeIn 300ms',
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 400 }}>
                        <div style={{ width: 80, height: 80, borderRadius: 99, background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle size={44} strokeWidth={2.5} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 12 }}>Lucrare Salvată!</h2>
                        <p style={{ color: 'var(--color-text-3)', fontWeight: 500, marginBottom: 32 }}>
                            Diagnosticarea și detaliile vehiculului au fost salvate în baza de date locală.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button className="btn btn-primary" style={{ height: 52, borderRadius: 16, fontWeight: 800 }} onClick={() => navigate('/invoice-detail/new', { state: { jobId: resultRef.current!.id } })}>
                                Generează Factură / Deviz
                            </button>
                            <button className="btn btn-outline" style={{ height: 52, borderRadius: 16, fontWeight: 700 }} onClick={() => navigate('/jobs')}>
                                Mergi la Istoric Lucrări
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
