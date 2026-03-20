import { create } from 'zustand';
import type { GarageSettings } from '../models/types';
import { loadSettings, saveSettings } from '../utils/localStorage';

interface GarageStore {
    settings: GarageSettings;
    updateSettings: (updates: Partial<GarageSettings>) => void;
}

export const useGarageStore = create<GarageStore>((set, get) => ({
    settings: loadSettings(),

    updateSettings: (updates) => {
        const settings = { ...get().settings, ...updates };
        saveSettings(settings);
        set({ settings });
    },
}));
