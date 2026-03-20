import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package, FileText, Trash2, Calendar, User, Search,
    DollarSign, Zap, Lightbulb, Hammer, ShoppingCart,
    Plus, X, Fingerprint, Disc, Info, Clock
} from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { useJobStore } from '../store/useJobStore';
import { t } from '../i18n/translations';
import type { Lang } from '../i18n/translations';
import type { Job } from '../models/types';
import { CAR_BRANDS } from '../models/types';
import PartsSection from '../components/PartsSection';
import { useAnalytics } from '../hooks/useAnalytics';

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Small section label ──────────────────────────────────────────────────────
function lp<T>(lang: Lang, ro: T, de: T, en: T): T {
    if (lang === 'ro') return ro;
    if (lang === 'de') return de;
    return en;
}

interface EnrichmentFieldProps {
    icon: ReactNode;
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}

function EnrichmentField({ icon, label, value, onChange, type = "text" }: EnrichmentFieldProps) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ color: 'var(--color-text-3)' }}>{icon}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
            </div>
            <input 
                type={type}
                style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: 14, 
                    border: '1.5px solid #E2E8F0', background: '#FAFBFF',
                    fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', outline: 'none'
                }}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
        </div>
    );
}

export default function JobDetailScreen() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useGarageStore();
    const { getJob, updateJob, deleteJob } = useJobStore();
    const lang = settings.language;

    const job = getJob(id ?? '');
    const [isEnriching, setIsEnriching] = useState(false);
    const [revealedPartsIndex, setRevealedPartsIndex] = useState<number | null>(null);
    const [vinSearch, setVinSearch] = useState('');
    const [customSearchQuery, setCustomSearchQuery] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [showAddPart, setShowAddPart] = useState(false);

    useEffect(() => {
        if (job) setVinSearch(job.vehicle.vin);
    }, [job?.vehicle.vin]);

    if (!job) {
        return (
            <div className="screen-content">
                <div className="empty-state">
                    <div className="empty-state-icon">❓</div>
                    <div className="empty-state-title">{lang === 'ro' ? 'Lucrare negăsită' : 'Job not found'}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')} style={{ marginTop: 16 }}>
                        {t('common_back', lang)}
                    </button>
                </div>
            </div>
        );
    }

    const revenue = (job.laborHours * job.laborRate) + job.partsUsed.reduce((sum, p) => sum + p.price, 0);

    const handleDelete = () => {
        if (window.confirm(lang === 'ro' ? 'Ștergi această lucrare?' : 'Delete this job?')) {
            deleteJob(job.id);
            navigate('/jobs');
        }
    };

    const { trackEvent } = useAnalytics();

    const cycleStatus = () => {
        const statuses: Job['status'][] = ['diagnostic', 'in_lucru', 'finalizat'];
        const next = statuses[(statuses.indexOf(job.status) + 1) % statuses.length];
        updateJob(job.id, { status: next });
        
        trackEvent('job_status_changed', {
            job_id: job.id,
            new_status: next,
            vehicle: `${job.vehicle.brand} ${job.vehicle.model}`
        });
    };

    const statusColors = {
        finalizat: { bg: '#F0FDF4', border: '#DCFCE7', color: '#16A34A' },
        in_lucru: { bg: '#EFF6FF', border: '#DBEAFE', color: '#1D4ED8' },
        diagnostic: { bg: '#FFF7ED', border: '#FFEDD5', color: '#EA580C' },
    } as const;
    const sc = statusColors[job.status];

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 110 }}>


            {/* ── Header ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-text)', margin: 0 }}>
                        {job.vehicle.brand} {job.vehicle.model}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-3)' }}>{job.vehicle.year}</span>
                        {job.vehicle.engine !== 'N/A' && <>
                            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 800 }}>{job.vehicle.engine}</span>
                        </>}
                        {job.vehicle.mileage > 0 && <>
                            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', fontWeight: 600 }}>{job.vehicle.mileage.toLocaleString('ro-RO')} KM</span>
                        </>}
                        {(job.vehicle.plate || job.plateNumber) && <>
                            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                            <span style={{ 
                                fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text)', 
                                padding: '2px 8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6
                            }}>
                                {job.vehicle.plate || job.plateNumber}
                            </span>
                        </>}
                        {job.customerName && <>
                            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                            <span style={{ 
                                fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)', 
                                display: 'flex', alignItems: 'center', gap: 4
                            }}>
                                <User size={12} strokeWidth={3} /> {job.customerName}
                            </span>
                        </>}
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={() => setIsEnriching(true)}
                        style={{
                            padding: '8px 14px', borderRadius: 12, background: 'var(--color-primary-bg)',
                            border: '1.5px solid var(--color-primary-light)', color: 'var(--color-primary)',
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase'
                        }}
                    >
                        <Plus size={16} strokeWidth={3} /> {lp(lang, 'Adaugă Info', 'Zusatzinfo', 'Add Info')}
                    </button>
                    <button
                        onClick={cycleStatus}
                        style={{
                            background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 12, padding: '8px 16px',
                            color: sc.color, fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer',
                            textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                        }}
                    >
                        {t(`jobs_status_${job.status}` as any, lang)}
                    </button>
                </div>
            </div>

            {/* ── Enrichment Modal ────────────────────────────────────── */}
            {isEnriching && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)', padding: 20
                }} onClick={() => setIsEnriching(false)}>
                    <div style={{
                        background: 'white', width: '100%', maxWidth: 450, borderRadius: 24,
                        padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        animation: 'page-enter 300ms ease'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                                    {lp(lang, 'Detalii Vehicul', 'Fahrzeugdetails', 'Vehicle Details')}
                                </h2>
                            </div>
                            <button onClick={() => setIsEnriching(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-3)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
                            {/* License Plate */}
                            <EnrichmentField 
                                icon={<Disc size={16} />} label={lp(lang, 'Nr. Înmatriculare', 'Kennzeichen', 'License Plate')}
                                value={job.vehicle.plate || job.plateNumber || ''}
                                onChange={v => updateJob(job.id, { vehicle: { ...job.vehicle, plate: v }, plateNumber: v })}
                            />
                            {/* KM */}
                            <EnrichmentField 
                                icon={<Clock size={16} />} label={lp(lang, 'Kilometraj (KM)', 'Kilometerstand', 'Mileage')}
                                value={job.vehicle.mileage > 0 ? job.vehicle.mileage.toString() : ''}
                                type="number"
                                onChange={v => updateJob(job.id, { vehicle: { ...job.vehicle, mileage: parseInt(v) || 0 } })}
                            />
                            {/* VIN */}
                            <EnrichmentField 
                                icon={<Fingerprint size={16} />} label={lp(lang, 'VIN (Serie Șasiu)', 'FIN', 'VIN')}
                                value={job.vehicle.vin}
                                onChange={v => updateJob(job.id, { vehicle: { ...job.vehicle, vin: v } })}
                            />
                             {/* Brand */}
                             <EnrichmentField 
                                icon={<Info size={16} />} label={lp(lang, 'Marcă', 'Marke', 'Brand')}
                                value={job.vehicle.brand}
                                onChange={v => updateJob(job.id, { vehicle: { ...job.vehicle, brand: v as any } })}
                            />
                            {/* Model */}
                            <EnrichmentField 
                                icon={<Info size={16} />} label={lp(lang, 'Model', 'Modell', 'Model')}
                                value={job.vehicle.model}
                                onChange={v => updateJob(job.id, { vehicle: { ...job.vehicle, model: v } })}
                            />
                             {/* Year */}
                             <EnrichmentField 
                                icon={<Calendar size={16} />} label={lp(lang, 'An Fabricație', 'Baujahr', 'Year')}
                                value={job.vehicle.year > 0 ? job.vehicle.year.toString() : ''}
                                type="number"
                                onChange={v => updateJob(job.id, { vehicle: { ...job.vehicle, year: parseInt(v) || 0 } })}
                            />
                            {/* User/Customer Name */}
                            <EnrichmentField 
                                icon={<User size={16} />} label={lp(lang, 'Nume Client / Mecanic', 'Kunde / Mechaniker', 'Customer / Mechanic Name')}
                                value={job.customerName || ''}
                                onChange={v => updateJob(job.id, { customerName: v })}
                            />

                            {/* Custom Fields */}
                            <div style={{ marginTop: 8 }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                                    {lp(lang, 'Câmpuri Personalizate', 'Benutzerdefinierte Felder', 'Custom Fields')}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {(job.customFields || []).map((cf, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8 }}>
                                            <input 
                                                style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.8125rem', fontWeight: 800 }}
                                                value={cf.label}
                                                placeholder="Etichetă..."
                                                onChange={e => {
                                                    const newCf = [...(job.customFields || [])];
                                                    newCf[i] = { ...cf, label: e.target.value };
                                                    updateJob(job.id, { customFields: newCf });
                                                }}
                                            />
                                            <input 
                                                style={{ flex: 1.5, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.8125rem', fontWeight: 600 }}
                                                value={cf.value}
                                                placeholder="Valoare..."
                                                onChange={e => {
                                                    const newCf = [...(job.customFields || [])];
                                                    newCf[i] = { ...cf, value: e.target.value };
                                                    updateJob(job.id, { customFields: newCf });
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newCf = (job.customFields || []).filter((_, ci) => ci !== i);
                                                    updateJob(job.id, { customFields: newCf });
                                                }}
                                                style={{ border: 'none', background: '#FEF2F2', padding: 8, borderRadius: 10, color: '#EF4444', cursor: 'pointer' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const newCf = [...(job.customFields || []), { label: '', value: '' }];
                                            updateJob(job.id, { customFields: newCf });
                                        }}
                                        style={{ 
                                            background: '#F1F5F9', border: '1px dashed #CBD5E1', borderRadius: 12, padding: '10px',
                                            fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-2)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                        }}
                                    >
                                        <Plus size={14} strokeWidth={3} /> {lp(lang, 'Adaugă câmp', 'Feld hinzufügen', 'Add field')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsEnriching(false)}
                            style={{ 
                                width: '100%', marginTop: 24, padding: '14px', borderRadius: 16, 
                                background: 'var(--color-primary)', border: 'none', 
                                color: 'white', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(37,99,235,0.2)'
                            }}
                        >
                            {lp(lang, 'Finalizează', 'Fertig', 'Done')}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Meta row: customer + date ──────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
                            <User size={15} />
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Client & Vehicul</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text"
                            value={job.customerName || ''}
                            onChange={e => updateJob(job.id, { customerName: e.target.value })}
                            placeholder={lp(lang, 'Nume Client...', 'Kundenname...', 'Client Name...')}
                            style={{
                                width: '100%', border: 'none', background: 'transparent',
                                fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-text)',
                                outline: 'none', padding: 0, marginBottom: 4
                            }}
                        />
                        {job.customerPhone && (
                            <a href={`tel:${job.customerPhone}`} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'none' }}>
                                {job.customerPhone}
                            </a>
                        )}
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 2 }}>Marcă</div>
                                <input 
                                    list="car-brands"
                                    value={job.vehicle.brand}
                                    onChange={e => {
                                        const newBrand = e.target.value;
                                        const oldBrand = job.vehicle.brand;
                                        const newTags = job.tags.map(t => t === oldBrand ? newBrand : t);
                                        if (!newTags.includes(newBrand) && newBrand) newTags.push(newBrand);
                                        updateJob(job.id, { 
                                            vehicle: { ...job.vehicle, brand: newBrand as any },
                                            tags: Array.from(new Set(newTags))
                                        });
                                    }}
                                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 700 }}
                                />
                                <datalist id="car-brands">
                                    {CAR_BRANDS.map(b => <option key={b} value={b} />)}
                                </datalist>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 2 }}>Model</div>
                                <input 
                                    value={job.vehicle.model}
                                    onChange={e => updateJob(job.id, { vehicle: { ...job.vehicle, model: e.target.value } })}
                                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 700 }}
                                />
                            </div>
                            <div style={{ width: 60 }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 2 }}>An</div>
                                <input 
                                    type="number"
                                    value={job.vehicle.year || ''}
                                    onChange={e => updateJob(job.id, { vehicle: { ...job.vehicle, year: parseInt(e.target.value) || 0 } })}
                                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 700 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
                                    <Calendar size={15} />
                                </div>
                                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Data</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-text)' }}>{formatDate(job.date)}</div>
                        </div>
                        <div style={{ flex: 1, borderLeft: '1px solid #F1F5F9', paddingLeft: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                    <Clock size={15} />
                                </div>
                                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>{lp(lang, 'Manoperă (Ore)', 'Arbeitszeit (Std)', 'Work Hours')}</span>
                            </div>
                            <input 
                                type="number"
                                step="0.5"
                                value={job.laborHours || 0}
                                onChange={e => updateJob(job.id, { laborHours: parseFloat(e.target.value) || 0 })}
                                style={{ 
                                    width: '100%', border: 'none', background: 'transparent', 
                                    fontSize: '1rem', fontWeight: 950, color: 'var(--color-primary)',
                                    outline: 'none', padding: 0
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Problem description (from notes) ─────────────────── */}
            {job.notes && (
                <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 16, padding: '12px 16px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Search size={13} color="var(--color-text-3)" />
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Problemă Raportată</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', lineHeight: 1.6 }}>{job.notes}</div>
                </div>
            )}

            {/* ── DTC + Tags ────────────────────────────────────────── */}
            {(job.dtcCode || job.tags.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {job.dtcCode && (
                        <span style={{ fontSize: '0.8125rem', fontWeight: 950, color: '#DC2626', background: '#FEF2F2', padding: '4px 12px', borderRadius: 8, border: '1px solid #FEE2E2' }}>
                            {job.dtcCode}
                        </span>
                    )}
                    {job.tags.filter(t => t !== job.dtcCode).map(tag => (
                        <span key={tag} style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-3)', background: '#F1F5F9', padding: '4px 10px', borderRadius: 8 }}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Mechanic Comments ────────────────────────────────── */}
            <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
                        <Info size={15} />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {lp(lang, 'Comentarii Mecanic', 'Anmerkungen des Mechanikers', 'Mechanic Comments')}
                    </span>
                </div>
                <textarea 
                    value={job.mechanicNotes || ''}
                    onChange={e => updateJob(job.id, { mechanicNotes: e.target.value })}
                    placeholder={lp(lang, 'Adaugă observații sau detalii suplimentare...', 'Fügen Sie Beobachtungen oder zusätzliche Details hinzu...', 'Add observations or extra details...')}
                    style={{
                        width: '100%', minHeight: 100, border: '1.5px solid #E2E8F0', borderRadius: 16,
                        padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)',
                        background: '#F8FAFC', outline: 'none', resize: 'vertical', display: 'block',
                        transition: 'border-color 0.2s, background-color 0.2s'
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.backgroundColor = '#F8FAFC';
                    }}
                />
            </div>

            {/* ── Additional Info (Color, Fuel) ────────────────────── */}
            {(job.color || job.fuelType) && (
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: 8, marginBottom: 14 
                }}>
                    {job.color && (
                        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 12px' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Culoare</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text)' }}>{job.color}</div>
                        </div>
                    )}
                    {job.fuelType && (
                        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 12px' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Combustibil</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text)' }}>{job.fuelType}</div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                AI DIAGNOSTIC DETAIL — Full data for each cause
            ══════════════════════════════════════════════════════════ */}
            {job.diagnosticResult.causes.map((cause, idx) => {
                const isConfirmed = idx === job.confirmedCauseIndex;
                const accentColor = isConfirmed ? 'var(--color-primary)' : idx === 1 ? '#D97706' : '#64748B';
                return (
                    <div key={idx} style={{
                        background: 'white',
                        border: `2px solid ${isConfirmed ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 24, overflow: 'hidden', marginBottom: 14,
                        boxShadow: isConfirmed ? '0 8px 24px rgba(21,101,192,0.1)' : 'none',
                    }}>
                        {/* Cause header */}
                        <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 12, background: isConfirmed ? 'linear-gradient(135deg, #EFF6FF, #F0F4FF)' : '#FAFAFA' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                background: cause.probability >= 50 ? accentColor : '#F1F5F9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: '0.9rem',
                                color: cause.probability >= 50 ? 'white' : 'var(--color-text-3)',
                            }}>
                                {cause.probability}%
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 900, color: isConfirmed ? 'var(--color-primary)' : 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                                    {isConfirmed ? '✓ SOLUȚIE CONFIRMATĂ' : `Cauza #${idx + 1}`}
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.3 }}>
                                    {lang === 'ro' ? cause.nameRo : cause.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', fontWeight: 700, marginTop: 3 }}>
                                    ⏱ ~{cause.estimatedMinutes} min
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Verification step */}
                            {(lang === 'ro' ? cause.checkStepRo : cause.checkStep) && (
                                <div style={{ background: '#F0F9FF', borderRadius: 12, padding: '10px 14px', borderLeft: '3px solid #0EA5E9' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', marginBottom: 4 }}>Cum verifici</div>
                                    <div style={{ fontSize: '0.8125rem', color: '#0C4A6E', lineHeight: 1.5 }}>
                                        {lang === 'ro' ? cause.checkStepRo : cause.checkStep}
                                    </div>
                                </div>
                            )}

                            {/* Technical explanation */}
                            {(lang === 'ro' ? cause.technicalDetailsRo : cause.technicalDetails) && (
                                <div style={{ background: '#F0F4FF', borderRadius: 12, padding: '10px 14px', borderLeft: '3px solid var(--color-primary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                        <Zap size={12} color="var(--color-primary)" fill="var(--color-primary)" />
                                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Explicație Tehnică</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                                        {lang === 'ro' ? cause.technicalDetailsRo : cause.technicalDetails}
                                    </div>
                                </div>
                            )}

                            {/* Expert tip */}
                            {(lang === 'ro' ? (cause.forumInsightRo || cause.forumInsight) : cause.forumInsight) && (
                                <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '10px 14px', border: '1px solid #FEF3C7' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                        <Lightbulb size={12} color="#D97706" fill="#D97706" />
                                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#D97706', textTransform: 'uppercase' }}>Sfat Expert</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#92400E', fontStyle: 'italic', lineHeight: 1.5 }}>
                                        "{lang === 'ro' ? (cause.forumInsightRo || cause.forumInsight) : cause.forumInsight}"
                                    </div>
                                </div>
                            )}

                            {/* Repair steps */}
                            {((lang === 'ro' ? cause.repairStepsRo : cause.repairSteps) ?? []).length > 0 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                                        <Hammer size={13} color="var(--color-text)" />
                                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Plan de Acțiune (Pași Reparație)</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {((lang === 'ro' ? cause.repairStepsRo : cause.repairSteps) ?? []).map((step, si) => (
                                            <div key={si} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: 22, height: 22, borderRadius: 6, background: 'var(--color-text)', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.65rem', fontWeight: 900, flexShrink: 0, marginTop: 1,
                                                }}>
                                                    {si + 1}
                                                </div>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Parts pricing (Always shown if already exists in job) */}
                            {cause.partsRo && cause.partsRo.length > 0 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                                        <ShoppingCart size={13} color="var(--color-text-2)" />
                                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Piese Recomandate · Prețuri Estimate</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                        {cause.partsRo.map((part, pi) => (
                                            <div key={pi} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                background: '#F8FAFC', border: '1px solid #E2E8F0',
                                                borderRadius: 12, padding: '10px 14px',
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>{part.name}</div>
                                                    {part.note && <div style={{ fontSize: '0.68rem', color: 'var(--color-text-3)', marginTop: 2 }}>{part.note}</div>}
                                                </div>
                                                <div style={{
                                                    flexShrink: 0, marginLeft: 12,
                                                    background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                                                    borderRadius: 9, padding: '4px 12px',
                                                    fontSize: '0.78rem', fontWeight: 900, color: 'white', whiteSpace: 'nowrap',
                                                }}>
                                                    ~{part.priceRon} RON
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Find Part Button & Lazy PartsSection (The new dynamic tool) */}
                            <div style={{ marginTop: 6 }}>
                                {revealedPartsIndex === idx ? (
                                    <PartsSection 
                                        lang={lang}
                                        causeIndex={idx}
                                        partKeywords={cause.partKeywords || []}
                                        vinMotorCode={vinSearch}
                                        onVinChange={setVinSearch}
                                        vehicleContext={{
                                            brand: job.vehicle.brand,
                                            model: job.vehicle.model,
                                            year: job.vehicle.year.toString(),
                                            vin: vinSearch
                                        }}
                                        region={lang === 'ro' ? 'ro' : 'eu'}
                                        aiPartsByCause={null}
                                        partsLoading={false}
                                    />
                                ) : (
                                    <button 
                                        onClick={() => setRevealedPartsIndex(idx)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: 12,
                                            background: '#F1F5F9',
                                            border: '1.5px solid #E2E8F0',
                                            color: '#475569',
                                            fontWeight: 800,
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
                                        onMouseOut={e => e.currentTarget.style.background = '#F1F5F9'}
                                    >
                                        <Search size={14} /> {lp(lang, 'Găsește Piese Online', 'Teile online finden', 'Find Parts Online')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* ── Custom Parts Search ──── */}
            <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 24, overflow: 'hidden', marginBottom: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Search size={18} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {lp(lang, 'Caută orice piesă', 'Beliebiges Teil suchen', 'Search any part')}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        placeholder={lp(lang, 'Ex: Kit ambreiaj, Plăcuțe...', 'Z.B. Kupplungssatz...', 'e.g. Clutch kit...')}
                        value={customSearchQuery}
                        onChange={e => setCustomSearchQuery(e.target.value)}
                        style={{
                            flex: 1, padding: '12px 16px', borderRadius: 14,
                            border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                            fontSize: '0.9rem', fontWeight: 700, outline: 'none'
                        }}
                    />
                </div>
                {customSearchQuery && (
                    <div style={{ marginTop: 12 }}>
                        <PartsSection
                            lang={lang}
                            causeIndex={999}
                            partKeywords={[customSearchQuery]}
                            vinMotorCode={vinSearch}
                            onVinChange={setVinSearch}
                            vehicleContext={{
                                brand: job.vehicle.brand,
                                model: job.vehicle.model,
                                year: job.vehicle.year.toString(),
                                vin: vinSearch
                            }}
                            region={lang === 'ro' ? 'ro' : (settings.partsRegion || 'eu')}
                            aiPartsByCause={null}
                            partsLoading={false}
                        />
                    </div>
                )}
            </div>

            {/* ── Parts actually used ─────────────────────────────── */}
            <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 24, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Package size={18} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {lp(lang, 'Piese Utilizate', 'Verwendete Teile', 'Parts Used')}
                        </span>
                    </div>
                    <button 
                        onClick={() => setShowAddPart(!showAddPart)}
                        style={{ border: 'none', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '6px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        {showAddPart ? <X size={14} /> : <Plus size={14} />} {lp(lang, 'Adaugă Manual', 'Manuell hinzufügen', 'Add Manual')}
                    </button>
                </div>
                
                {showAddPart && (
                    <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <input 
                                placeholder={lp(lang, 'Nume Piesă...', 'Teilname...', 'Part Name...')}
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                style={{ flex: 2, minWidth: 150, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 700 }}
                            />
                            <input 
                                placeholder={lp(lang, 'Preț (RON)...', 'Preis (RON)...', 'Price (RON)...')}
                                type="number"
                                value={newItemPrice}
                                onChange={e => setNewItemPrice(e.target.value)}
                                style={{ flex: 1, minWidth: 80, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 700 }}
                            />
                            <button 
                                onClick={() => {
                                    if (!newItemName || !newItemPrice) return;
                                    const newPart = {
                                        id: `manual-${Date.now()}`,
                                        name: newItemName,
                                        nameRo: newItemName,
                                        price: parseFloat(newItemPrice) || 0,
                                        currency: 'RON' as const,
                                        brand: lp(lang, 'Manual', 'Manuell', 'Manual'),
                                        store: lp(lang, 'Atelier', 'Werkstatt', 'Workshop'),
                                        partNumber: '-',
                                        deliveryDays: 0,
                                        phone: '',
                                        availability: 'stoc' as const,
                                        keywords: []
                                    };
                                    updateJob(job.id, { partsUsed: [...job.partsUsed, newPart] });
                                    setNewItemName('');
                                    setNewItemPrice('');
                                    setShowAddPart(false);
                                    
                                    trackEvent('part_added_manually', {
                                        job_id: job.id,
                                        part_name: newItemName,
                                        price: parseFloat(newItemPrice)
                                    });
                                }}
                                style={{ padding: '10px 20px', borderRadius: 12, background: 'var(--color-primary)', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                            >
                                {lp(lang, 'Adaugă', 'Hinzufügen', 'Add')}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ padding: '4px 0' }}>
                    {job.partsUsed.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {lp(lang, 'Nicio piesă adăugată încă', 'Noch keine Teile hinzugefügt', 'No parts added yet')}
                        </div>
                    ) : (
                        job.partsUsed.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F8FAFC' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)' }}>{lang === 'ro' ? p.nameRo : p.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', marginTop: 2 }}>{p.brand} · {p.store}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 950, color: 'var(--color-text)' }}>{p.price.toLocaleString('ro-RO')} {p.currency}</div>
                                    <button 
                                        onClick={() => updateJob(job.id, { partsUsed: job.partsUsed.filter(px => px.id !== p.id) })}
                                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Financial summary ─────────────────────────────────── */}
            <div style={{ background: 'var(--color-text)', borderRadius: 24, padding: 20, color: 'white', marginBottom: 'var(--space-xl)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cost Total Estimat</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#93C5FD', marginTop: 2 }}>
                            {revenue.toLocaleString('ro-RO')} <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>RON</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                            Manoperă: {job.laborHours}h × {job.laborRate} RON/h = {(job.laborHours * job.laborRate).toLocaleString('ro-RO')} RON
                        </div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93C5FD' }}>
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* ── Fixed bottom actions ──────────────────────────────── */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
                padding: '16px 20px', borderTop: '1px solid var(--color-border)',
                display: 'flex', gap: 12, zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
            }}>
                <button
                    onClick={handleDelete}
                    style={{
                        width: 50, height: 50, borderRadius: 16, background: '#FEF2F2', border: '1px solid #FEE2E2',
                        color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                >
                    <Trash2 size={20} />
                </button>
                <button
                    onClick={() => navigate('/invoice-detail/new', { state: { jobId: job.id } })}
                    style={{
                        flex: 1, height: 50, borderRadius: 16, background: 'var(--color-text)', border: 'none',
                        color: 'white', fontWeight: 900, fontSize: '0.9375rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                    }}
                >
                    <FileText size={18} /> {t('common_generate_invoice', lang)}
                </button>
            </div>
        </div>
    );
}
