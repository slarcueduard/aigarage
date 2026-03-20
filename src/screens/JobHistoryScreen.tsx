import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, FolderOpen, TrendingUp, Filter, Calendar } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { useJobStore } from '../store/useJobStore';
import { t } from '../i18n/translations';


const TAG_FILTERS = ['BMW', 'VW', 'Audi', 'Mercedes', 'Renault', 'Dacia', 'Ford', 'Turbo', 'Combustibil', 'Aprindere', 'Electric'];

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: '2-digit' });
}

export default function JobHistoryScreen() {
    const navigate = useNavigate();
    const { settings } = useGarageStore();
    const { searchJobs, filterByTag, jobs } = useJobStore();
    const lang = settings.language;

    const [query, setQuery] = useState('');
    const [activeTag, setActiveTag] = useState('');

    const displayed = query
        ? searchJobs(query)
        : activeTag
            ? filterByTag(activeTag)
            : jobs;

    const totalRevenue = displayed.reduce((sum, j) =>
        sum + j.lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0), 0
    );

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 100 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                    {t('jobs_title', lang)}
                </h1>
                <button
                    onClick={() => navigate('/diagnosis')}
                    style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 10, padding: '8px 16px', color: 'white', fontWeight: 800, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)' }}
                >
                    + {lang === 'ro' ? 'Adaugă Lucrare' : 'Add Job'}
                </button>
            </div>

            {/* Global Stats Dashboard */}
            {jobs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--space-lg)' }}>
                    <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <FolderOpen size={16} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>{lang === 'ro' ? 'Total Lucrări' : 'Total Jobs'}</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-text)' }}>{jobs.length}</div>
                    </div>
                    <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                <TrendingUp size={16} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Venit Total</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-text)' }}>{totalRevenue.toLocaleString('ro-RO')} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>RON</span></div>
                    </div>
                </div>
            )}

            {/* Quick Search & Filters */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input
                        className="form-input"
                        placeholder={t('jobs_search_placeholder', lang)}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setActiveTag(''); }}
                        style={{ paddingLeft: 44, borderRadius: 16, height: 48, background: '#F8FAFC', border: '1.5px solid var(--color-border)', fontSize: '0.9375rem' }}
                    />
                    <div style={{ position: 'absolute', left: 14, top: 12, color: 'var(--color-text-3)' }}>
                        <Search size={20} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4, flexShrink: 0 }}>
                        <Filter size={16} color="var(--color-text-3)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Filtră</span>
                    </div>
                    <button
                        className={`filter-chip ${!activeTag && !query ? 'active' : ''}`}
                        onClick={() => { setActiveTag(''); setQuery(''); }}
                        style={{
                            background: !activeTag && !query ? 'var(--color-text)' : 'white',
                            color: !activeTag && !query ? 'white' : 'var(--color-text-2)',
                            border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                        }}
                    >
                        {t('jobs_filter_all', lang)}
                    </button>
                    {TAG_FILTERS.map(tag => (
                        <button
                            key={tag}
                            className={`filter-chip ${activeTag === tag ? 'active' : ''}`}
                            onClick={() => { setActiveTag(tag); setQuery(''); }}
                            style={{
                                background: activeTag === tag ? 'var(--color-text)' : 'white',
                                color: activeTag === tag ? 'white' : 'var(--color-text-2)',
                                border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Header/Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {displayed.length} {lang === 'ro' ? 'Lucrări Găsite' : 'Jobs Found'}
                </span>
            </div>

            {/* Job list */}
            {displayed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: 24, border: '1.5px dashed var(--color-border)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📂</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-2)', marginBottom: 8 }}>{t('jobs_no_results', lang)}</div>
                    {jobs.length === 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/diagnosis')}
                            style={{ height: 44, borderRadius: 12, marginTop: 16 }}
                        >
                            {t('common_new_diagnosis', lang)}
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {displayed.map(job => {
                        const revenue = job.lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
                        const confirmedCause = job.diagnosticResult.causes[job.confirmedCauseIndex];
                        const isDiagnostic = job.status === 'diagnostic';

                        return (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/job-detail/${job.id}`)}
                                style={{
                                    background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 16, cursor: 'pointer', transition: 'all 200ms',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.2 }}>
                                            {job.vehicle.brand} {job.vehicle.model}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-3)' }}>
                                                <Calendar size={12} /> {formatDate(job.date)}
                                            </span>
                                            <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isDiagnostic ? '#EA580C' : '#16A34A', background: isDiagnostic ? '#FFF7ED' : '#F0FDF4', padding: '2px 8px', borderRadius: 6 }}>
                                                {t(`jobs_status_${job.status}` as any, lang)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 950, color: 'var(--color-text)' }}>
                                            {revenue.toLocaleString('ro-RO')} <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>RON</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                    {job.dtcCode && <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 6, border: '1px solid #FEE2E2' }}>{job.dtcCode}</span>}
                                    {confirmedCause && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-2)' }}>
                                            {lang === 'ro' ? confirmedCause.nameRo : confirmedCause.name}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {job.tags.slice(0, 2).map(tag => (
                                            <span key={tag} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-3)', background: '#F8FAFC', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                {tag}
                                            </span>
                                        ))}
                                        {job.tags.length > 2 && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-3)' }}>+{job.tags.length - 2}</span>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 800 }}>
                                        {job.customerName && <span style={{ color: 'var(--color-text-3)', fontWeight: 600, marginRight: 4 }}>👤 {job.customerName}</span>}
                                        Detalii <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
