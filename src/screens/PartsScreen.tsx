import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Search, Filter, ShoppingCart, Truck, CheckCircle } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { t } from '../i18n/translations';
import { searchPartsByKeyword, getAllParts } from '../data/partsDatabase';
import type { Part, DiagnosisCause } from '../models/types';


type SortKey = 'price' | 'delivery' | 'brand';

export default function PartsScreen() {
    const location = useLocation();
    const { settings } = useGarageStore();
    const lang = settings.language;

    const { cause } = (location.state ?? {}) as { cause?: DiagnosisCause };

    const parts: Part[] = cause
        ? searchPartsByKeyword(cause.partKeywords)
        : getAllParts().slice(0, 20);

    const [sortKey, setSortKey] = useState<SortKey>('price');
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [searchQ, setSearchQ] = useState('');

    const filtered = parts.filter(p =>
        !searchQ ||
        p.nameRo.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.store.toLowerCase().includes(searchQ.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === 'price') return a.price - b.price;
        if (sortKey === 'delivery') return a.deliveryDays - b.deliveryDays;
        return a.brand.localeCompare(b.brand);
    });

    const toggleAdd = (id: string) => {
        setAddedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const availabilityLabel = (s: Part['availability']) => {
        const map: Record<typeof s, string> = {
            stoc: lang === 'ro' ? '● Stoc' : '● In Stock',
            comanda: lang === 'ro' ? '○ Comandă' : '○ On Order',
            indisponibil: lang === 'ro' ? '✕ Indisponibil' : '✕ Unavailable',
        };
        return map[s];
    };

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 100 }}>

            {/* Header */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: 4 }}>
                    {t('parts_title', lang)}
                </h1>
                {cause ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--color-primary)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-2)' }}>{lang === 'ro' ? cause.nameRo : cause.name}</span>
                    </div>
                ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-3)', fontWeight: 500 }}>
                        {lang === 'ro' ? 'Catalog complet de piese și consumabile' : 'Full catalog of parts and consumables'}
                    </p>
                )}
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 'var(--space-lg)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        className="form-input"
                        placeholder={lang === 'ro' ? 'Caută piesă, marcă...' : 'Search part, brand...'}
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        style={{ paddingLeft: 44, borderRadius: 16, height: 48, background: '#F8FAFC', border: '1.5px solid var(--color-border)' }}
                    />
                    <div style={{ position: 'absolute', left: 14, top: 12, color: 'var(--color-text-3)' }}>
                        <Search size={20} />
                    </div>
                </div>
            </div>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                    <Filter size={16} color="var(--color-text-3)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>{lang === 'ro' ? 'Sortează' : 'Sort'}</span>
                </div>
                {(['price', 'delivery', 'brand'] as SortKey[]).map(k => (
                    <button
                        key={k}
                        onClick={() => setSortKey(k)}
                        style={{
                            whiteSpace: 'nowrap', background: sortKey === k ? 'var(--color-text)' : 'white',
                            color: sortKey === k ? 'white' : 'var(--color-text-2)',
                            border: '1.5px solid var(--color-border)', borderRadius: 12,
                            padding: '8px 14px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 200ms',
                        }}
                    >
                        {k === 'price' ? t('parts_sort_cheapest', lang) :
                            k === 'delivery' ? t('parts_sort_fastest', lang) :
                                t('parts_sort_brand', lang)}
                    </button>
                ))}
            </div>

            {sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: 24, border: '1.5px dashed var(--color-border)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📦</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-2)' }}>{t('parts_no_results', lang)}</div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {sorted.map(part => {
                    const added = addedIds.has(part.id);
                    const availability = part.availability;
                    const availColor = availability === 'stoc' ? '#16A34A' : availability === 'comanda' ? '#D97706' : '#DC2626';

                    return (
                        <div key={part.id} style={{
                            background: 'white', border: `1.5px solid ${added ? 'var(--color-success)' : 'var(--color-border)'}`,
                            borderRadius: 20, padding: 16, transition: 'all 200ms',
                            boxShadow: added ? '0 8px 20px rgba(22, 163, 74, 0.1)' : 'none',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.2 }}>{lang === 'ro' ? part.nameRo : part.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '2px 8px', borderRadius: 6 }}>{part.brand}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontWeight: 600 }}>#{part.partNumber}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 950, color: 'var(--color-text)' }}>{part.price.toLocaleString('ro-RO')} {part.currency}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-3)', marginTop: 2 }}>{part.store}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 12 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 99, background: availColor }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: availColor }}>{availabilityLabel(availability)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 12 }}>
                                    <Truck size={14} color="var(--color-text-3)" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-2)' }}>{part.deliveryDays} {t('parts_days', lang)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <a
                                    href={`tel:${part.phone}`}
                                    style={{
                                        width: 44, height: 44, borderRadius: 12, background: '#F1F5F9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)',
                                        textDecoration: 'none', transition: 'all 200ms',
                                    }}
                                >
                                    <Phone size={18} />
                                </a>
                                <button
                                    onClick={() => toggleAdd(part.id)}
                                    style={{
                                        flex: 1, height: 44, borderRadius: 12,
                                        background: added ? 'var(--color-success)' : 'var(--color-text)',
                                        color: 'white', border: 'none', fontWeight: 800, fontSize: '0.875rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        cursor: 'pointer', transition: 'all 200ms',
                                    }}
                                >
                                    {added ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                                    {added ? t('parts_added', lang) : t('parts_add_to_job', lang)}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
