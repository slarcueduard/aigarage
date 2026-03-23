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
    lang,
}: {
    part: AIPartsResult['causes'][0]['parts'][0];
    vehicleContext: PartsSectionProps['vehicleContext'];
    region: PartsRegion;
    currency: string;
    lang: Lang;
}) {
    // We will render three tier blocks: Cheapest, Recommended, Original
    const renderTier = (tierName: string, tierKey: 'cheapest' | 'recommended' | 'original', badgeColor: string, textColor: string) => {
        const tierData = part[tierKey];
        if (!tierData) return null;

        const links = generateShopLinks(tierData.brand + ' ' + part.name, part.name, vehicleContext, region);
        
        return (
            <div style={{
                background: 'white',
                border: '2px solid #111827',
                borderRadius: 0,
                padding: '12px',
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '2px 2px 0px #111827'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            padding: '4px 8px',
                            background: badgeColor,
                            color: textColor,
                            border: '2px solid #111827',
                            borderRadius: 0,
                            fontSize: '0.70rem',
                            fontWeight: 900,
                            textTransform: 'uppercase'
                        }}>{tierName}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#111827' }}>
                            {tierData.brand}
                        </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>
                        ~ {tierData.price} {currency}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>
                        {lp(lang, 'Sursă sugerată:', 'Empfohlene Quelle:', 'Suggested source:')} <strong>{tierData.shop}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <ShopLinkRow links={links} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            background: '#F9FAFB',
            border: '2px solid #111827',
            borderRadius: 0,
            padding: '16px',
            boxShadow: '4px 4px 0px #111827',
            marginBottom: 16
        }}>
            <div style={{ fontWeight: 900, color: '#111827', fontSize: '1.05rem', marginBottom: 6, textTransform: 'uppercase' }}>
                {part.name}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {renderTier(lp(lang, 'Buget', 'Budget', 'Budget'), 'cheapest', '#F3F4F6', '#111827')}
                {renderTier(lp(lang, 'Optim', 'Optimal', 'Optimal'), 'recommended', '#DB0020', 'white')}
                {renderTier('OEM', 'original', '#FFD700', '#111827')}
            </div>
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
            border: '2px solid #111827',
            borderRadius: 0,
            padding: '12px',
            marginBottom: 10
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.9rem', flex: 1, textTransform: 'uppercase' }}>
                    {lang === 'ro' ? part.name : lang === 'de' ? part.nameDe : part.nameEn}
                </div>
                <div style={{
                    padding: '4px 10px',
                    background: '#111827',
                    color: 'white',
                    borderRadius: 0,
                    fontSize: '0.80rem',
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
        <div style={{ borderTop: '2px dashed #111827', paddingTop: 14 }}>
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
                            lang={lang}
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
