import { create } from 'zustand';
import type { Job } from '../models/types';
import { loadJobs, saveJobs, generateId } from '../utils/localStorage';

interface JobStore {
    jobs: Job[];
    addJob: (job: Omit<Job, 'id'>) => Job;
    updateJob: (id: string, updates: Partial<Job>) => void;
    deleteJob: (id: string) => void;
    getJob: (id: string) => Job | undefined;
    searchJobs: (query: string) => Job[];
    filterByTag: (tag: string) => Job[];
}

export const useJobStore = create<JobStore>((set, get) => ({
    jobs: loadJobs(),

    addJob: (jobData) => {
        const job: Job = { ...jobData, id: generateId() };
        const jobs = [job, ...get().jobs];
        saveJobs(jobs);
        set({ jobs });
        return job;
    },

    updateJob: (id, updates) => {
        const jobs = get().jobs.map(j => (j.id === id ? { ...j, ...updates } : j));
        saveJobs(jobs);
        set({ jobs });
    },

    deleteJob: (id) => {
        const jobs = get().jobs.filter(j => j.id !== id);
        saveJobs(jobs);
        set({ jobs });
    },

    getJob: (id) => get().jobs.find(j => j.id === id),

    searchJobs: (query) => {
        if (!query.trim()) return get().jobs;
        const q = query.toLowerCase();
        return get().jobs.filter(j =>
            j.vehicle.vin.toLowerCase().includes(q) ||
            j.vehicle.brand.toLowerCase().includes(q) ||
            j.vehicle.model.toLowerCase().includes(q) ||
            (j.vehicle.plate ?? '').toLowerCase().includes(q) ||
            (j.dtcCode ?? '').toLowerCase().includes(q) ||
            (j.customerName ?? '').toLowerCase().includes(q) ||
            (j.customerPhone ?? '').toLowerCase().includes(q) ||
            j.notes.toLowerCase().includes(q) ||
            (j.mechanicNotes ?? '').toLowerCase().includes(q) ||
            j.tags.some(t => t.toLowerCase().includes(q)) ||
            j.diagnosticResult.causes.some(c =>
                c.nameRo.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q) ||
                c.partKeywords.some(p => p.toLowerCase().includes(q))
            ) ||
            j.partsUsed.some(p =>
                p.nameRo.toLowerCase().includes(q) ||
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.store.toLowerCase().includes(q) ||
                p.partNumber.toLowerCase().includes(q)
            ) ||
            j.symptoms.some(s => s.toLowerCase().includes(q))
        );
    },

    filterByTag: (tag) => {
        if (!tag) return get().jobs;
        return get().jobs.filter(j => j.tags.includes(tag));
    },
}));
