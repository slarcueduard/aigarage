import { create } from 'zustand';
import type { DiagnosticResult } from '../models/types';
import { parseRomanianProblem } from '../utils/textParser';

interface DiagnosticSessionState {
    text: string;
    parsed: ReturnType<typeof parseRomanianProblem> | null;
    typing: boolean;
    savedJobId: string | null;
    selectedFastDtc: string;
    selectedBrand: string;
    selectedModel: string;
    selectedYear: string;
    vinMotorCode: string;
    fastResult: DiagnosticResult | null;
    pendingAiResult: DiagnosticResult | null;
    revealAi: boolean;
    aiMode: 'ai' | 'hidden' | 'loading';
    aiError: string | null;
    expandedCauseIndex: number;
    partsLoading: boolean;

    setText: (t: string) => void;
    setParsed: (p: ReturnType<typeof parseRomanianProblem> | null) => void;
    setTyping: (t: boolean) => void;
    setSavedJobId: (id: string | null) => void;
    setSelectedFastDtc: (d: string) => void;
    setSelectedBrand: (b: string) => void;
    setSelectedModel: (m: string) => void;
    setSelectedYear: (y: string) => void;
    setVinMotorCode: (v: string) => void;
    setFastResult: (r: DiagnosticResult | null) => void;
    setPendingAiResult: (r: DiagnosticResult | null) => void;
    setRevealAi: (r: boolean) => void;
    setAiMode: (m: 'ai' | 'hidden' | 'loading') => void;
    setAiError: (e: string | null) => void;
    setExpandedCauseIndex: (i: number) => void;
    setPartsLoading: (loading: boolean) => void;

    resetSession: () => void;
}

const initialState = {
    text: '',
    parsed: null,
    typing: false,
    savedJobId: null,
    selectedFastDtc: '',
    selectedBrand: '',
    selectedModel: '',
    selectedYear: '',
    vinMotorCode: '',
    fastResult: null,
    pendingAiResult: null,
    revealAi: false,
    aiMode: 'hidden' as const,
    aiError: null,
    expandedCauseIndex: 0,
    partsLoading: false,
};

export const useDiagnosticSession = create<DiagnosticSessionState>((set) => ({
    ...initialState,

    setText: (text) => set({ text }),
    setParsed: (parsed) => set({ parsed }),
    setTyping: (typing) => set({ typing }),
    setSavedJobId: (savedJobId) => set({ savedJobId }),
    setSelectedFastDtc: (selectedFastDtc) => set({ selectedFastDtc }),
    setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
    setSelectedModel: (selectedModel) => set({ selectedModel }),
    setSelectedYear: (selectedYear) => set({ selectedYear }),
    setVinMotorCode: (vinMotorCode) => set({ vinMotorCode }),
    setFastResult: (fastResult) => set({ fastResult }),
    setPendingAiResult: (pendingAiResult) => set({ pendingAiResult }),
    setRevealAi: (revealAi) => set({ revealAi }),
    setAiMode: (aiMode) => set({ aiMode }),
    setAiError: (aiError) => set({ aiError }),
    setExpandedCauseIndex: (expandedCauseIndex) => set({ expandedCauseIndex }),
    setPartsLoading: (partsLoading) => set({ partsLoading }),

    resetSession: () => set(initialState),
}));

