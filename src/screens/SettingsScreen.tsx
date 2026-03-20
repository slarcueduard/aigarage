import { useState } from 'react';
import { Save, AlertTriangle, Building, Settings, Trash2, Phone, Mail, Hash, MapPin, CreditCard, Wrench, User, CheckCircle } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import type { Currency } from '../models/types';
import type { Lang } from '../i18n/translations';


// Helper: pick the right string for current lang
function lp(lang: Lang, ro: string, de: string, en: string): string {
    if (lang === 'ro') return ro;
    if (lang === 'de') return de;
    return en;
}

export default function SettingsScreen() {
    const { settings, updateSettings } = useGarageStore();
    const lang = settings.language;
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ ...settings });

    const handleSave = () => {
        updateSettings(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleClearData = () => {
        if (window.confirm(lp(lang,
            'Atenție! Această acțiune va șterge ireversibil toate datele: istoric lucrări, facturi și setări. Continuați?',
            'Achtung! Diese Aktion löscht unwiderruflich alle Daten: Aufträge, Rechnungen und Einstellungen. Fortfahren?',
            'Warning! This action will permanently delete all data: job history, invoices and settings. Continue?'
        ))) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: 10,
        border: '1.5px solid #E2E8F0', background: '#F8FAFC',
        fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)',
        fontFamily: 'inherit', outline: 'none',
        transition: 'border-color 200ms ease',
    };

    const labelStyle = {
        display: 'block', fontSize: '0.7rem', fontWeight: 900,
        color: 'var(--color-text-3)', textTransform: 'uppercase' as const,
        letterSpacing: '0.04em', marginBottom: 6,
    };

    const sectionHeaderStyle = (bgColor: string, iconColor: string) => ({
        wrapper: {
            display: 'flex' as const, alignItems: 'center' as const, gap: 8, marginBottom: 20,
        },
        icon: {
            width: 32, height: 32, borderRadius: 10, background: bgColor,
            display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, color: iconColor,
        },
        label: {
            fontSize: '0.875rem', fontWeight: 950, color: 'var(--color-text)',
            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
        },
    });

    const cardStyle = {
        background: 'white', border: '1.5px solid var(--color-border)',
        borderRadius: 24, padding: 20, marginBottom: 16,
    };

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 110 }}>


            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: 4 }}>
                    {lp(lang, 'Setări', 'Einstellungen', 'Settings')}
                </h1>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', fontWeight: 600 }}>
                    {lp(lang, 'Configurare Service & Profil Profesional', 'Werkstatt-Konfiguration & Profil', 'Garage Setup & Professional Profile')}
                </div>
            </div>

            {/* ── Section 1: Garage / Business Info ── */}
            <div style={cardStyle}>
                {(() => {
                    const s = sectionHeaderStyle('var(--color-primary-bg)', 'var(--color-primary)'); return (
                        <div style={s.wrapper}>
                            <div style={s.icon}><Building size={18} /></div>
                            <span style={s.label}>{lp(lang, 'Informații Service', 'Werkstatt-Info', 'Garage Info')}</span>
                        </div>
                    );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Nume Service / Atelier', 'Werkstattname', 'Garage Name')}</label>
                        <div style={{ position: 'relative' }}>
                            <Building size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-text-3)' }} />
                            <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={lp(lang, 'Ex: Auto Service Pro SRL', 'z.B.: Auto Service GmbH', 'Ex: Pro Auto Garage LLC')} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Adresă Completă', 'Vollständige Adresse', 'Full Address')}</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-text-3)' }} />
                            <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder={lp(lang, 'Ex: Str. Mecanicilor 42, București', 'z.B.: Werkstattstr. 42, München', 'Ex: 42 Mechanic St, Bucharest')} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>{lp(lang, 'Telefon', 'Telefon', 'Phone')}</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-text-3)' }} />
                                <input style={{ ...inputStyle, paddingLeft: 34 }} type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="07xx xxx xxx" />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>{lp(lang, 'Email', 'E-Mail', 'Email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-text-3)' }} />
                                <input style={{ ...inputStyle, paddingLeft: 34 }} type="email" value={form.email ?? ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="contact@service.ro" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Fiscal / Legal Info ── */}
            <div style={cardStyle}>
                {(() => {
                    const s = sectionHeaderStyle('#FEF3C7', '#D97706'); return (
                        <div style={s.wrapper}>
                            <div style={s.icon}><CreditCard size={18} /></div>
                            <span style={s.label}>{lp(lang, 'Date Fiscale (Factură)', 'Steuer- / Rechnungsinfo', 'Fiscal / Invoice Info')}</span>
                        </div>
                    );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>CUI / {lp(lang, 'Cod Fiscal', 'USt-IdNr.', 'VAT Number')}</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-text-3)' }} />
                                <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.vatNumber ?? ''} onChange={e => setForm(p => ({ ...p, vatNumber: e.target.value }))} placeholder="RO12345678" />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>{lp(lang, 'Nr. Reg. Comerțului', 'Handelsreg.-Nr.', 'Trade Reg. No.')}</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-text-3)' }} />
                                <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.tradeRegNumber ?? ''} onChange={e => setForm(p => ({ ...p, tradeRegNumber: e.target.value }))} placeholder="J40/1234/2024" />
                            </div>
                        </div>
                    </div>
                    <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '10px 12px', border: '1px solid #FEF3C7' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400E', lineHeight: 1.5 }}>
                            💡 {lp(lang,
                                'Aceste date vor apărea automat pe facturile generate. Completează-le corect pentru a emite facturi conforme.',
                                'Diese Daten werden automatisch auf generierten Rechnungen angezeigt. Bitte korrekt ausfüllen.',
                                'These details will appear on generated invoices. Fill them in correctly for compliant invoicing.'
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 3: Work Preferences ── */}
            <div style={cardStyle}>
                {(() => {
                    const s = sectionHeaderStyle('#F0FDF4', '#16A34A'); return (
                        <div style={s.wrapper}>
                            <div style={s.icon}><Wrench size={18} /></div>
                            <span style={s.label}>{lp(lang, 'Preferințe Lucru', 'Arbeitseinstellungen', 'Work Preferences')}</span>
                        </div>
                    );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Cost Manoperă (RON/oră)', 'Stundensatz (RON/Std.)', 'Labor Rate (RON/hour)')}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                style={{ ...inputStyle, flex: 1, textAlign: 'center', fontSize: '1.125rem', fontWeight: 900 }}
                                type="number"
                                value={form.defaultLaborRate}
                                onChange={e => setForm(p => ({ ...p, defaultLaborRate: parseFloat(e.target.value) || 0 }))}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-3)' }}>RON/h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 5: Preferences ── */}
            <div style={cardStyle}>
                {(() => {
                    const s = sectionHeaderStyle('#F3F4F6', '#4B5563'); return (
                        <div style={s.wrapper}>
                            <div style={s.icon}><Settings size={18} /></div>
                            <span style={s.label}>{lp(lang, 'Preferințe Aplicație', 'App-Einstellungen', 'App Preferences')}</span>
                        </div>
                    );
                })()}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Valută', 'Währung', 'Currency')}</label>
                        <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={form.currency}
                            onChange={e => setForm(p => ({ ...p, currency: e.target.value as Currency }))}
                        >
                            <option value="RON">🇷🇴 RON / Leu</option>
                            <option value="EUR">🇪🇺 EUR / Euro</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Limbă', 'Sprache', 'Language')}</label>
                        <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={form.language}
                            onChange={e => setForm(p => ({ ...p, language: e.target.value as Lang }))}
                        >
                            <option value="ro">🇷🇴 Română</option>
                            <option value="en">🇬🇧 English</option>
                            <option value="de">🇩🇪 Deutsch</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Regiune Piese', 'Teile-Region', 'Parts Region')}</label>
                        <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            value={form.partsRegion ?? 'eu'}
                            onChange={e => setForm(p => ({ ...p, partsRegion: e.target.value as any }))}
                        >
                            <option value="eu">🇪🇺 Europa</option>
                            <option value="ro">🇷🇴 România</option>
                            <option value="uk">🇬🇧 UK</option>
                            <option value="us">🇺🇸 USA</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Section 6: Owner / Technician Info ── */}
            <div style={cardStyle}>
                {(() => {
                    const s = sectionHeaderStyle('#F5F3FF', '#7C3AED'); return (
                        <div style={s.wrapper}>
                            <div style={s.icon}><User size={18} /></div>
                            <span style={s.label}>{lp(lang, 'Persoană de Contact', 'Kontaktperson', 'Contact Person')}</span>
                        </div>
                    );
                })()
                }

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Nume Titular / Mecanic Principal', 'Inhaber / Hauptmechaniker', 'Owner / Head Mechanic')}</label>
                        <input style={inputStyle} value={form.ownerName ?? ''} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} placeholder={lp(lang, 'Ex: Ion Popescu', 'z.B.: Hans Müller', 'Ex: John Smith')} />
                    </div>
                    <div>
                        <label style={labelStyle}>{lp(lang, 'Specializare / Marcă preferată', 'Spezialisierung / Bevorzugte Marke', 'Specialization / Preferred brand')}</label>
                        <input style={inputStyle} value={form.specialization ?? ''} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder={lp(lang, 'Ex: BMW, Mercedes, Diagnoza electronică', 'z.B.: BMW, Mercedes, Elektronik-Diagnose', 'Ex: BMW, Mercedes, Electronic diagnostics')} />
                    </div>
                </div>
            </div >

            {/* ── Section 5: Danger Zone ── */}
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FEE2E2', borderRadius: 24, padding: 20, marginBottom: 24 }}>
                {(() => {
                    const s = sectionHeaderStyle('#FEE2E2', '#DC2626'); return (
                        <div style={s.wrapper}>
                            <div style={s.icon}><AlertTriangle size={18} /></div>
                            <span style={{ ...s.label, color: '#DC2626' }}>{lp(lang, 'Zonă Periculoasă', 'Gefahrenzone', 'Danger Zone')}</span>
                        </div>
                    );
                })()}

                <p style={{ fontSize: '0.8125rem', color: '#991B1B', lineHeight: 1.5, marginBottom: 16 }}>
                    {lp(lang,
                        'Această acțiune va șterge ireversibil toate datele: istoric lucrări, facturi, piese și setări. Nu se poate recupera.',
                        'Diese Aktion löscht unwiderruflich alle Daten: Aufträge, Rechnungen, Teile und Einstellungen. Nicht rückgängig zu machen.',
                        'This will permanently delete all data: job history, invoices, parts and settings. This cannot be undone.'
                    )}
                </p>
                <button
                    onClick={handleClearData}
                    style={{
                        background: 'white', border: '1.5px solid #FCA5A5', borderRadius: 12,
                        padding: '10px 16px', color: '#DC2626', fontSize: '0.8125rem',
                        fontWeight: 900, cursor: 'pointer', width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                >
                    <Trash2 size={14} />
                    {lp(lang, 'Șterge Toate Datele', 'Alle Daten löschen', 'Delete All Data')}
                </button>
            </div >

            {/* ── Fixed Save Bar ── */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
                padding: '16px 20px', borderTop: '1px solid var(--color-border)',
                display: 'flex', gap: 12, zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
            }}>
                <button
                    onClick={handleSave}
                    style={{
                        flex: 1, height: 50, borderRadius: 16,
                        background: saved ? '#16A34A' : 'var(--color-text)',
                        border: 'none', color: 'white', fontWeight: 900,
                        fontSize: '0.9375rem', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8, cursor: 'pointer',
                        transition: 'background 300ms ease',
                    }}
                >
                    {saved ? (
                        <><CheckCircle size={18} /> {lp(lang, 'Configurație Salvată ✓', 'Einstellungen gespeichert ✓', 'Settings Saved ✓')}</>
                    ) : (
                        <><Save size={18} /> {lp(lang, 'Salvează Setările', 'Einstellungen speichern', 'Save Settings')}</>
                    )}
                </button>
            </div >
        </div >
    );
}
