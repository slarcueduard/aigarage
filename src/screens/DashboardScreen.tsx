import { useMemo } from 'react';
import { useState } from 'react';
import { TrendingUp, Car, Users, Zap, FolderOpen, DollarSign, BarChart3, Activity, Calendar, FileText } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { useJobStore } from '../store/useJobStore';
import { t } from '../i18n/translations';


export default function DashboardScreen() {
    const { settings } = useGarageStore();
    const { jobs } = useJobStore();
    const lang = settings.language;
    const [proMode, setProMode] = useState(false);

    const now = new Date();
    const thisMonthJobs = useMemo(() =>
        jobs.filter(j => {
            const d = new Date(j.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }),
        [jobs]
    );

    const thisMonthRevenue = thisMonthJobs.reduce((s, j) =>
        s + j.lineItems.reduce((a, l) => a + l.qty * l.unitPrice, 0), 0
    );

    const avgJobValue = thisMonthJobs.length > 0
        ? (thisMonthRevenue / thisMonthJobs.length).toFixed(0)
        : '0';

    // Top DTCs
    const dtcCount: Record<string, number> = {};
    jobs.forEach(j => { if (j.dtcCode) dtcCount[j.dtcCode] = (dtcCount[j.dtcCode] || 0) + 1; });
    const topDtcs = Object.entries(dtcCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxDtc = topDtcs[0]?.[1] || 1;

    // Top brands
    const brandCount: Record<string, number> = {};
    jobs.forEach(j => { brandCount[j.vehicle.brand] = (brandCount[j.vehicle.brand] || 0) + 1; });
    const topBrands = Object.entries(brandCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxBrand = topBrands[0]?.[1] || 1;

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 100 }}>

            {/* Header */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: 4 }}>
                    {t('dash_title', lang)}
                </h1>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} />
                    {now.toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-GB', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Main KPIs Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, marginBottom: 12 }}>
                <div style={{ background: 'var(--color-text)', color: 'white', borderRadius: 24, padding: 18, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} color="white" />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>Venit Lună</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{thisMonthRevenue.toLocaleString('ro-RO')} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>RON</span></div>
                </div>
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 24, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                            <FolderOpen size={16} />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Volume Lucrări</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-text)' }}>{thisMonthJobs.length}</div>
                </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1.5px solid var(--color-border)', borderRadius: 24, padding: 16, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>Valoare Medie</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--color-text)' }}>{avgJobValue} <span style={{ fontSize: '0.8rem' }}>RON</span></div>
                    </div>
                </div>
                <Activity size={24} color="var(--color-border)" />
            </div>

            {/* Performance Charts */}
            {topDtcs.length > 0 && (
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 24, padding: 20, marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <BarChart3 size={18} color="var(--color-primary)" />
                        Top Coduri Defect (DTC)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {topDtcs.map(([code, count]) => (
                            <div key={code}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 4 }}>{code}</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-2)' }}>{count} {count === 1 ? 'mașină' : 'mașini'}</span>
                                </div>
                                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(count / maxDtc) * 100}%`, background: '#DC2626', borderRadius: 99 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {topBrands.length > 0 && (
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 24, padding: 20, marginBottom: 'var(--space-lg)' }}>
                    <div style={{ fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Car size={18} color="var(--color-primary)" />
                        Mărci Auto Principale
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {topBrands.map(([brand, count]) => (
                            <div key={brand}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text)' }}>{brand}</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-3)' }}>{count}</span>
                                </div>
                                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(count / maxBrand) * 100}%`, background: 'var(--color-text)', borderRadius: 99 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {jobs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: 24, border: '1.5px dashed var(--color-border)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📊</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-2)' }}>Nicio lucrare înregistrată</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: 4 }}>Datele statistice vor apărea după primele diagnoze salvate.</div>
                </div>
            )}

            {/* Pro Mode Unlock */}
            <div style={{
                background: proMode ? 'white' : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                border: '1.5px solid var(--color-primary-light)', borderRadius: 24, padding: 20,
                boxShadow: proMode ? '0 10px 25px rgba(21, 101, 192, 0.1)' : 'none', transition: 'all 300ms cubic-bezier(.4,0,.2,1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: proMode ? 20 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Zap size={22} fill="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--color-text)' }}>MOD PROFESIONAL</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontWeight: 600 }}>Deblocați Instrumente Avansate</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setProMode(p => !p)}
                        style={{
                            width: 52, height: 30, borderRadius: 100, border: 'none', cursor: 'pointer',
                            background: proMode ? '#16A34A' : '#CBD5E1',
                            position: 'relative', transition: 'background 250ms ease',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: 4, left: proMode ? 26 : 4,
                            width: 22, height: 22, background: 'white', borderRadius: 99,
                            transition: 'left 250ms cubic-bezier(.4,0,.2,1)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                    </button>
                </div>

                {proMode && (
                    <div style={{ animation: 'fadeInUp 400ms ease both', borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { icon: <FileText size={18} />, label: 'OBD Scan PDF' },
                                { icon: <Zap size={18} />, label: 'Corelare DTC' },
                                { icon: <Activity size={18} />, label: 'Analiză Live' },
                                { icon: <Users size={18} />, label: 'Date Comunitate' }
                            ].map((item, i) => (
                                <div key={i} style={{ background: '#F8FAFC', padding: 12, borderRadius: 16, border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ color: 'var(--color-primary)' }}>{item.icon}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text)' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-3)', fontWeight: 600 }}>Disponibil curând</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
