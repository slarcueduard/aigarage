import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Plus, Trash2, Printer, Save, User, Home, Receipt } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { useJobStore } from '../store/useJobStore';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { t } from '../i18n/translations';
import { generateId, generateInvoiceNumber } from '../utils/localStorage';
import type { Invoice, JobLineItem } from '../models/types';


function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function InvoiceScreen() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { settings } = useGarageStore();
    const { jobs } = useJobStore();
    const { invoices, addInvoice, updateInvoice, getInvoice, getInvoiceByJobId } = useInvoiceStore();
    const lang = settings.language;

    const jobId = (location.state as any)?.jobId;
    const job = jobId ? jobs.find(j => j.id === jobId) : undefined;

    // Build or load invoice
    const existingInvoice = id && id !== 'new'
        ? getInvoice(id)
        : jobId
            ? getInvoiceByJobId(jobId)
            : undefined;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [status, setStatus] = useState<'saved' | null>(null);

    useEffect(() => {
        if (existingInvoice) { setInvoice({ ...existingInvoice }); return; }

        // Create new invoice from job or blank
        const lines: JobLineItem[] = job
            ? [
                ...job.lineItems,
                { type: 'manopera', description: lang === 'ro' ? 'Manoperă service' : 'Labor', qty: job.laborHours || 1, unitPrice: job.laborRate || settings.defaultLaborRate, currency: settings.currency },
            ]
            : [{ type: 'custom', description: '', qty: 1, unitPrice: 0, currency: settings.currency }];

        const newInvoice: Invoice = {
            id: generateId(),
            jobId: job?.id ?? '',
            number: generateInvoiceNumber(invoices),
            garageInfo: settings,
            customerName: job?.customerName ?? '',
            customerPhone: job?.customerPhone,
            vehicle: job?.vehicle ?? { vin: '', brand: 'Unknown', model: '', engine: '', year: new Date().getFullYear(), mileage: 0 },
            lineItems: lines,
            vatPercent: 19,
            subtotal: 0,
            vatAmount: 0,
            total: 0,
            currency: settings.currency,
            status: 'ciorna',
            date: Date.now(),
        };
        // Compute totals
        newInvoice.subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
        newInvoice.vatAmount = newInvoice.subtotal * (newInvoice.vatPercent / 100);
        newInvoice.total = newInvoice.subtotal + newInvoice.vatAmount;
        setInvoice(newInvoice);
    }, []);

    const recompute = (inv: Invoice): Invoice => {
        const sub = inv.lineItems.reduce((s, l) => s + l.qty * l.unitPrice, 0);
        const vat = sub * (inv.vatPercent / 100);
        return { ...inv, subtotal: sub, vatAmount: vat, total: sub + vat };
    };

    const update = (patch: Partial<Invoice>) => {
        setInvoice(prev => prev ? recompute({ ...prev, ...patch }) : prev);
    };

    const updateLine = (idx: number, patch: Partial<JobLineItem>) => {
        if (!invoice) return;
        const items = invoice.lineItems.map((l, i) => i === idx ? { ...l, ...patch } : l);
        update({ lineItems: items });
    };

    const addLine = () => {
        if (!invoice) return;
        update({ lineItems: [...invoice.lineItems, { type: 'custom', description: '', qty: 1, unitPrice: 0, currency: settings.currency }] });
    };

    const removeLine = (idx: number) => {
        if (!invoice) return;
        update({ lineItems: invoice.lineItems.filter((_, i) => i !== idx) });
    };

    const handleSave = () => {
        if (!invoice) return;
        const saved = recompute(invoice);
        if (existingInvoice) {
            updateInvoice(saved.id, saved);
        } else {
            addInvoice(saved);
        }
        setStatus('saved');
    };

    const handlePrint = () => {
        handleSave();
        setTimeout(() => window.print(), 500);
    };

    const handleMarkPaid = () => {
        if (!invoice) return;
        const updated = { ...invoice, status: 'platita' as const };
        setInvoice(updated);
        if (existingInvoice) updateInvoice(updated.id, updated);
        else addInvoice(updated);
    };

    if (!invoice) {
        return <div className="screen-content"><div className="spinner" /></div>;
    }

    return (
        <div className="screen-content page-enter" style={{ paddingBottom: 100 }}>

            {/* Header / Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                        {t('inv_title', lang)}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary)' }}>#{invoice.number}</span>
                        <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', fontWeight: 600 }}>{formatDate(invoice.date)}</span>
                    </div>
                </div>
                <button
                    onClick={handleMarkPaid}
                    style={{
                        background: invoice.status === 'platita' ? '#F0FDF4' : '#F1F5F9',
                        border: '1px solid var(--color-border)', borderRadius: 10, padding: '6px 12px',
                        color: invoice.status === 'platita' ? '#16A34A' : 'var(--color-text-2)',
                        fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 200ms',
                    }}
                >
                    {invoice.status === 'platita' ? '✓ ' + t('inv_status_platita', lang) : t('inv_status_ciorna', lang)}
                </button>
            </div>

            {/* Entity Details (From / To) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--space-lg)' }}>
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Home size={14} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Furnizor</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--color-text)' }}>{settings.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-2)', marginTop: 4, lineHeight: 1.4 }}>{settings.address}</div>
                    {settings.vatNumber && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontWeight: 700, marginTop: 4 }}>CUI: {settings.vatNumber}</div>}
                </div>
                <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <User size={14} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Client</span>
                    </div>
                    <input
                        className="form-input" placeholder="Nume Client"
                        value={invoice.customerName} onChange={e => update({ customerName: e.target.value })}
                        style={{ border: 'none', background: '#F8FAFC', borderRadius: 8, height: 28, fontSize: '0.8125rem', padding: '0 8px', fontWeight: 700 }}
                    />
                    {invoice.customerPhone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-2)', marginTop: 4 }}>{invoice.customerPhone}</div>
                    )}
                    {invoice.vehicle.brand !== 'Unknown' && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800, marginTop: 4 }}>
                            {invoice.vehicle.brand} {invoice.vehicle.model}
                        </div>
                    )}
                </div>
            </div>

            {/* Line Items Table */}
            <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 24, padding: '16px 4px', marginBottom: 'var(--space-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '0 12px 12px', fontWeight: 900, fontSize: '0.875rem', borderBottom: '1px solid #F1F5F9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Receipt size={16} /> {t('inv_line_items', lang)}
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>{t('inv_description', lang)}</th>
                                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase', width: 40 }}>{t('inv_qty', lang)}</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-3)', textTransform: 'uppercase', width: 80 }}>Preț</th>
                                <th style={{ width: 32 }} />
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems.map((line, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '8px 12px' }}>
                                        <input
                                            value={line.description} onChange={e => updateLine(idx, { description: e.target.value })}
                                            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', padding: 0 }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                                        <input
                                            type="number" value={line.qty} onChange={e => updateLine(idx, { qty: parseFloat(e.target.value) || 0 })}
                                            style={{ border: 'none', background: 'transparent', width: '32px', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 800, padding: 0 }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                        <input
                                            type="number" value={line.unitPrice} onChange={e => updateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                                            style={{ border: 'none', background: 'transparent', width: '60px', textAlign: 'right', fontSize: '0.8125rem', fontWeight: 900, color: 'var(--color-text)', padding: 0 }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                                        <button onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '12px 12px 0' }}>
                    <button
                        onClick={addLine}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 10, padding: '8px 14px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-2)', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                    >
                        <Plus size={14} /> {t('inv_add_line', lang)}
                    </button>
                </div>
            </div>

            {/* VAT / Totals Section */}
            <div style={{ background: 'var(--color-text)', borderRadius: 24, padding: 20, color: 'white', marginBottom: 'var(--space-lg)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Total Parțial</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{invoice.subtotal.toLocaleString('ro-RO')} {invoice.currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>TVA</span>
                        <select
                            value={invoice.vatPercent} onChange={e => update({ vatPercent: parseInt(e.target.value) })}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, color: 'white', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 800 }}
                        >
                            <option value={0}>0%</option>
                            <option value={9}>9%</option>
                            <option value={19}>19%</option>
                        </select>
                    </div>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{invoice.vatAmount.toLocaleString('ro-RO')} {invoice.currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total de Plată</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--color-primary-light)' }}>{invoice.total.toLocaleString('ro-RO')} {invoice.currency}</span>
                </div>
            </div>

            {/* Persistent Actions */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
                padding: '20px', borderTop: '1px solid var(--color-border)',
                display: 'flex', gap: 12, zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
            }}>
                <button
                    onClick={handleSave}
                    style={{
                        flex: 1, height: 50, borderRadius: 16, background: '#F1F5F9', border: 'none',
                        color: 'var(--color-text)', fontWeight: 800, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
                    }}
                >
                    <Save size={18} /> {status === 'saved' ? 'Salvat ✓' : t('common_save', lang)}
                </button>
                <button
                    onClick={handlePrint}
                    style={{
                        flex: 1, height: 50, borderRadius: 16, background: 'var(--color-text)', border: 'none',
                        color: 'white', fontWeight: 800, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
                    }}
                >
                    <Printer size={18} /> {t('inv_print', lang)}
                </button>
            </div>
        </div>
    );
}
