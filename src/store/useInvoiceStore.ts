import { create } from 'zustand';
import type { Invoice } from '../models/types';
import { loadInvoices, saveInvoices } from '../utils/localStorage';

interface InvoiceStore {
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    deleteInvoice: (id: string) => void;
    getInvoice: (id: string) => Invoice | undefined;
    getInvoiceByJobId: (jobId: string) => Invoice | undefined;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
    invoices: loadInvoices(),

    addInvoice: (invoice) => {
        const invoices = [invoice, ...get().invoices];
        saveInvoices(invoices);
        set({ invoices });
    },

    updateInvoice: (id, updates) => {
        const invoices = get().invoices.map(inv => (inv.id === id ? { ...inv, ...updates } : inv));
        saveInvoices(invoices);
        set({ invoices });
    },

    deleteInvoice: (id) => {
        const invoices = get().invoices.filter(inv => inv.id !== id);
        saveInvoices(invoices);
        set({ invoices });
    },

    getInvoice: (id) => get().invoices.find(inv => inv.id === id),

    getInvoiceByJobId: (jobId) => get().invoices.find(inv => inv.jobId === jobId),
}));
