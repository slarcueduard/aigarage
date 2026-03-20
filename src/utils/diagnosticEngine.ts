import type { DiagnosisInput, DiagnosticResult } from '../models/types';

/**
 * Main diagnostic engine entry point.
 * Currently returns a blank result as the AI logic has been wiped
 * to provide a clean slate for future implementation.
 */
export function runDiagnosis(input: DiagnosisInput): DiagnosticResult {
    return {
        vehicle: input.vehicle,
        dtcCode: input.dtcCode,
        symptoms: input.symptoms,
        confidence: 0,
        causes: [],
        timestamp: Date.now(),
    };
}
