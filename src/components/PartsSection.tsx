/**
 * PartsSection — Shows parts catalog + AI-sourced parts with shop links.
 *
 * Stage 1 (instant): Local catalog parts matched from `partKeywords`.
 * Stage 2 (async):   AI-generated parts with precise prices, notes, and buying advice.
 *                    Displayed once `aiCauseParts` is populated.
 *
 * To add a new shop: edit `SHOPS` in `utils/partsLookup.ts`.
 * To change AI parts format: edit `runAIPartsSearch` in `utils/aiDiagnostic.ts`.
 */
import { ExternalLink } from 'lucide-react';
import { getPartSuggestions, generateShopLinks } from '../utils/partsLookup';
import type { PartsRegion, PartSuggestion } from '../utils/partsLookup';
import type { AIPartsResult } from '../utils/aiDiagnostic';
import type { Lang } from '../i18n/translations';

// ── Helper ────────────────────────────────────────────────────────────────────
function lp(lang: Lang, ro: string, de: string, en: string) {
    return lang === 'ro' ? ro : lang === 'de' ? de : en;
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface PartsSectionProps {
    lang: Lang;
    causeIndex: number;
    partKeywords: string[];
    vinMotorCode: string;
    onVinChange: (v: string) => void;
    vehicleContext: {
        brand?: string;
        model?: string;
        year?: string;
        vin?: string;
    };
    region: PartsRegion;
    aiPartsByCause: AIPartsResult | null;
    partsLoading: boolean;
}

// ── Shop Link Row ─────────────────────────────────────────────────────────────
function ShopLinkRow({ links }: { links: ReturnType<typeof generateShopLinks> }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {links.map((shop, i) => (
                <a
                    key={i}
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                        flex: 1,
                        minWidth: '70px',
                        textAlign: 'center',
                        padding: '7px 10px',
                        borderRadius: 8,
                        background: shop.bgColor,
                        color: shop.color,
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                    }}
                >
                    {shop.shopName} <ExternalLink size={10} />
                </a>
            ))}
        </div>
    );
}

// ── AI Part Card ──────────────────────────────────────────────────────────────
function AiPartCard({
    part,
    vehicleContext,
    region,
    currency,
}: {
    part: AIPartsResult['causes'][0]['parts'][0];
    vehicleContext: PartsSectionProps['vehicleContext'];
    region: PartsRegion;
    currency: string;
}) {
    const links = generateShopLinks(part.name, part.name, vehicleContext, region);
    return (
        <div style={{
            background: 'white',
            border: '1.5px solid #E0E7FF',
            borderRadius: 14,
            padding: '12px',
            boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem', flex: 1 }}>{part.name}</div>
                <div style={{
                    padding: '4px 10px',
                    background: '#EEF2FF',
                    color: '#4338CA',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    marginLeft: 8,
                }}>
                    ~ {part.price} {currency}
                </div>
            </div>
            {part.note && (
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: 8, fontStyle: 'italic' }}>
                    {part.note}
                </div>
            )}
            <ShopLinkRow links={links} />
        </div>
    );
}

// ── Catalog Part Card (fallback while AI loads) ───────────────────────────────
function CatalogPartCard({
    part,
    lang,
}: {
    part: PartSuggestion;
    lang: Lang;
}) {
    return (
        <div style={{
            background: 'white',
            border: '1.5px solid #F1F5F9',
            borderRadius: 14,
            padding: '12px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem', flex: 1 }}>
                    {lang === 'ro' ? part.name : lang === 'de' ? part.nameDe : part.nameEn}
                </div>
                <div style={{
                    padding: '4px 10px',
                    background: '#F1F5F9',
                    color: '#6366F1',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    marginLeft: 8,
                }}>
                    ~ {part.priceFrom}–{part.priceTo} €
                </div>
            </div>
            <ShopLinkRow links={part.shopLinks} />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PartsSection({
    lang,
    causeIndex,
    partKeywords,
    vinMotorCode,
    onVinChange,
    vehicleContext,
    region,
    aiPartsByCause,
    partsLoading,
}: PartsSectionProps) {
    const currency = lang === 'ro' ? 'RON' : '€';

    // Catalog parts — instant (local, no network)
    const catalogParts = getPartSuggestions(partKeywords, { ...vehicleContext, vin: vinMotorCode || undefined }, region);

    // AI parts — loaded asynchronously after initial diagnosis
    const aiCauseParts = aiPartsByCause?.causes?.find(c => c.causeIndex === causeIndex);

    return (
        <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 14 }}>
            {/* Section Header */}
            <div style={{
                fontSize: '0.65rem',
                fontWeight: 900,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 10,
            }}>
                🛒 {lp(lang, 'Piese și Magazin Online', 'Teile und Online-Shop', 'Parts & Online Shop')}
            </div>

            {/* VIN / Engine Code Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <input
                    type="text"
                    placeholder={lp(lang, 'VIN / Cod Motor (filtrare piese)...', 'VIN / Motorcode...', 'VIN / Engine code...')}
                    value={vinMotorCode}
                    onChange={e => onVinChange(e.target.value.toUpperCase())}
                    style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* ── AI Buying Advice ── */}
                {aiCauseParts?.partsAdvice && (
                    <div style={{
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        borderRadius: 10,
                        border: '1px dashed #94A3B8',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span>🤖</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>
                                {lp(lang, 'Sfat Achiziție', 'Kaufberatung', 'Buying Advice')}
                            </span>
                        </div>
                        <div style={{ color: '#334155', lineHeight: 1.4, fontWeight: 600, fontSize: '0.8rem' }}>
                            {aiCauseParts.partsAdvice}
                        </div>
                    </div>
                )}

                {/* ── AI Parts (Stage 2) — preferred when loaded ── */}
                {aiCauseParts?.parts && aiCauseParts.parts.length > 0
                    ? aiCauseParts.parts.map((ap, i) => (
                        <AiPartCard
                            key={i}
                            part={ap}
                            vehicleContext={vehicleContext}
                            region={region}
                            currency={currency}
                        />
                    ))
                    : (
                        <>
                            {/* ── Catalog Fallback (Stage 1) — shown while AI loads ── */}
                            {catalogParts.map((part, i) => (
                                <CatalogPartCard key={i} part={part} lang={lang} />
                            ))}

                            {/* ── Loading spinner ── */}
                            {partsLoading && (
                                <div style={{
                                    padding: '14px',
                                    background: '#F8FAFC',
                                    border: '1.5px dashed #CBD5E1',
                                    borderRadius: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        border: '2px solid #6366F1',
                                        borderTopColor: 'transparent',
                                        animation: 'spin 0.8s linear infinite',
                                        flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
                                        {lp(lang, 'AI caută prețuri piese...', 'KI sucht Teilepreise...', 'AI searching parts prices...')}
                                    </span>
                                </div>
                            )}
                        </>
                    )
                }
            </div>
        </div>
    );
}
