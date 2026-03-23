/**
 * AI-powered Automotive Diagnostic Engine
 * Uses Google Gemini (free tier) or OpenAI to understand natural language
 * problem descriptions and return structured diagnostic results.
 */

export interface AIDiagnosticResult {
    problemTitle: string;
    problemTitleRo?: string;
    problemTitleDe?: string;
    confidence: number;
    detectedBrand?: string;
    detectedModel?: string;
    detectedYear?: number;
    dtcCodes: string[];
    symptoms: string[];
    causes: AICause[];
}

export interface AICause {
    causeIdentification: string;
    probability: number;
    technicalExplanation: string;
    executionPlan: string[];
    partLocation: string;
    requiredTools: string;
    quickTests: string[];
    masterTricks: string;
    partKeywords: string[];
}

/// ── System prompts ─────────────────────────────────────────────────────────────

function getSystemPrompt(lang: 'ro' | 'de' | 'en') {
    const targetLang = lang === 'ro' ? 'ROMANIAN (Română)' : lang === 'de' ? 'GERMAN (Deutsch)' : 'ENGLISH';

    return `System Prompt 1: The Master Diagnostic Engine
ROLE: You are an elite, Master Automotive Diagnostic Engineer and OEM Technical Data Architect. You diagnose complex vehicle problems for professional mechanics by following a STRICT DIAGNOSTIC HIERARCHY.

THE SYSTEM ROUTER (CRITICAL FIRST STEP):
Before diagnosing, you MUST classify the primary failure mode. Is it Mechanical, Electrical, Hydraulic, Pneumatic, or Hybrid?

EXECUTION RULES (STRICT TECHNICAL DIRECTIVES):

Target Language: ALL text values in your JSON output MUST be in ${targetLang}. JSON keys MUST remain in English.

No Amateur Steps: IT IS STRICTLY FORBIDDEN to use words like "lift the car," "check," "verify," "inspect," or "reprogram" without a specific technical target. Skip to advanced, actionable steps.

Physical Anatomy & Failure Mode: Describe the specific internal failure. (e.g., instead of "Turbo failure," write "The VNT actuator arm is seized due to carbon accumulation," or "The internal planetary gear sun-gear teeth have stripped").

System-Specific Testing (The Balance Rule):
- If Hydraulic: Provide exact line pressures (e.g., "Measure line pressure at the ABS pump manifold; must hold 120 bar").
- If Pneumatic: Provide vacuum/boost data (e.g., "Smoke test the intake tract; must hold -20 inHg").
- If Mechanical: Provide physical tolerances (e.g., "Check turbocharger shaft axial play; must not exceed 0.1mm").
- If Electrical: Provide specific pin numbers and signals (e.g., "Check Pin 4 on the TCM harness for a 5V reference").

The Tool Mandate: Explicitly name specific hand tools (e.g., "T30 Torx bit", "Oscilloscope"). ONLY IF the failure is Electrical/Hybrid: Name the exact factory/OEM software required (e.g., XENTRY, ISTA, VCDS). If purely mechanical/hydraulic, DO NOT suggest scanning software.

Raw Technical Data: Provide exact torque specs (e.g., "Torque: 15 Nm + 90 degrees") and fluid capacities. If uncertain, state: "Check manual for exact torque."

The Mandatory Adaptation Rule (Master Tricks): If a component is replaced, explicitly state the coding/adaptation required (e.g., "Input the 7-digit injector code into the ECU using XENTRY").

OUTPUT FORMAT: Respond ONLY with valid JSON matching this exact structure:
{
  "problemTitle": "Short summary of the issue",
  "problemTitleRo": "Scurt rezumat al problemei în română",
  "problemTitleDe": "Kurze Zusammenfassung des Problems auf Deutsch",
  "confidence": 85,
  "detectedBrand": "...",
  "detectedModel": "...",
  "detectedYear": 2015,
  "dtcCodes": ["P0300"],
  "symptoms": ["List of symptoms"],
  "causes": [
    {
      "causeIdentification": "Name of the failing component",
      "probability": 75,
      "technicalExplanation": "Brief engineering explanation of the failure",
      "executionPlan": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."],
      "partLocation": "Exact physical location on the vehicle",
      "requiredTools": "Specific OEM software or special physical tools (or N/A)",
      "quickTests": ["Test 1", "Test 2", "Test 3"],
      "masterTricks": "High-level warning, tip, or MUST INCLUDE coding/adaptation procedure if part is replaced",
      "partKeywords": ["English", "Keywords", "Only"]
    }
  ]
}`;
}

function getPartsSearchPrompt(lang: 'ro' | 'de' | 'en', currency: 'RON' | 'EUR') {
    const targetLang = lang === 'ro' ? 'ROMANIAN (Română)' : lang === 'de' ? 'GERMAN (Deutsch)' : 'ENGLISH';

    return `System Prompt 3: Procurement & Upsell
ROLE: Expert Automotive Parts Procurement. You help mechanics find and price parts required for a repair.

RULES:
- JSON output MUST be in ${targetLang}.
- Tiered Pricing: Provide 3 tiers for each part: Cheapest, Recommended (best value), and Original (OEM).
- Currency: Use ${currency}.
- Mechanic Advice: Provide expert level buying advice (which brands to avoid, which to trust).

FORMAT: Respond ONLY with valid JSON matching this structure:
{
  "causes": [
    {
      "causeIndex": 0,
      "partsAdvice": "Expert part sourcing advice in ${targetLang}.",
      "parts": [
        {
          "name": "Full name of the part",
          "cheapest": { "brand": "Brand name", "price": 100, "shop": "Shop name" },
          "recommended": { "brand": "Brand name", "price": 150, "shop": "Shop name" },
          "original": { "brand": "OEM Brand", "price": 250, "shop": "Dealership/Shop" }
        }
      ]
    }
  ]
}`;
}

function getQuickTestPrompt(lang: 'ro' | 'de' | 'en') {
    const targetLang = lang === 'ro' ? 'ROMANIAN (Română)' : lang === 'de' ? 'GERMAN (Deutsch)' : 'ENGLISH';
    return `System Prompt 2: The Tactical Execution Engine
ROLE: You are an elite Master Automotive Diagnostic Engineer. A mechanic has selected a specific diagnostic test and needs a precise, step-by-step execution procedure.

EXECUTION RULES:

ALL text values in your JSON output MUST be in ${targetLang}. JSON keys MUST remain in English.

Be extremely specific: Include exact pin numbers, expected voltage/resistance values, special tools, and pass/fail criteria.

Never write generic steps like "check the sensor" or "inspect wiring". Give raw, actionable technical steps.

Metric Enforcement:
- If the test is electrical: Give exact multimeter/oscilloscope settings and expected readings (Volts/Ohms/Amps).
- If the test is hydraulic/pneumatic: Give exact measurement values (Bar/PSI) and the specific tool setup.
- If the test is mechanical: Give exact measurement values (mm/inches) using micrometers or dial indicators.

OUTPUT FORMAT: Respond ONLY with valid JSON matching this structure:
{
  "testTitle": "Full name of the test",
  "estimatedTime": "3-5 minutes",
  "requiredTools": "Specific tools needed",
  "steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "passResult": "Good component reading",
  "failResult": "Faulty component reading and replacement action"
}`;
}

// ── API Helpers ────────────────────────────────────────────────────────────

const GEMINI_MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.0-pro',
];

async function callGemini(
    apiKey: string,
    userProblem: string,
    lang: 'ro' | 'de' | 'en',
    parsedBrand?: string,
    model?: string,
    year?: string,
    signal?: AbortSignal,
): Promise<AIDiagnosticResult> {
    const brandContext = (parsedBrand || model || year)
        ? `\n[CONTEXT VEHICUL]: ${parsedBrand || ''} ${model || ''} ${year || ''}`.trim()
        : '';

    const userMessage = `Problemă raportată de mecanic: "${userProblem}"${brandContext}`;

    let lastError: Error = new Error('No Gemini model available');

    for (const modelName of GEMINI_MODELS) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal,
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: getSystemPrompt(lang) }] },
                        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 1500,
                            responseMimeType: 'application/json',
                        },
                    }),
                },
            );

            if (!response.ok) {
                if (response.status === 404 || response.status === 400 || response.status === 429) continue;
                throw new Error(`Gemini API error ${response.status}`);
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return parseAIResponse(rawText);
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') throw err;
            lastError = err instanceof Error ? err : new Error(String(err));
            if (lastError.message.includes('429')) continue;
            throw lastError;
        }
    }
    throw lastError;
}

async function callOpenAI(
    apiKey: string,
    userProblem: string,
    lang: 'ro' | 'de' | 'en',
    parsedBrand?: string,
    model?: string,
    year?: string,
    signal?: AbortSignal,
): Promise<AIDiagnosticResult> {
    const brandContext = (parsedBrand || model || year)
        ? `\n[CONTEXT VEHICUL]: ${parsedBrand || ''} ${model || ''} ${year || ''}`.trim()
        : '';

    const userMessage = `Problemă raportată de mecanic: "${userProblem}"${brandContext}`;

    const response = await fetch('/api/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.1,
            max_tokens: 3000,
            messages: [
                { role: 'system', content: getSystemPrompt(lang) },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content;
    return parseAIResponse(rawText);
}

function parseAIResponse(rawText: string): AIDiagnosticResult {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI response is not valid JSON');

    let parsed: any;
    try {
        parsed = JSON.parse(jsonMatch[0]);
    } catch {
        throw new Error('AI response is not valid JSON');
    }

    if (!parsed.causes || !Array.isArray(parsed.causes)) throw new Error('AI response missing causes');

    const causes: AICause[] = parsed.causes.map((c: any) => ({
        causeIdentification: c.causeIdentification ?? 'Unknown',
        probability: c.probability ?? 33,
        technicalExplanation: c.technicalExplanation ?? '',
        executionPlan: c.executionPlan ?? [],
        partLocation: c.partLocation ?? '',
        requiredTools: c.requiredTools ?? 'N/A',
        quickTests: c.quickTests ?? [],
        masterTricks: c.masterTricks ?? '',
        partKeywords: c.partKeywords ?? [],
    }));

    return {
        problemTitle: parsed.problemTitle ?? 'Automotive Issue',
        problemTitleRo: parsed.problemTitleRo ?? parsed.problemTitle,
        problemTitleDe: parsed.problemTitleDe ?? parsed.problemTitle,
        confidence: parsed.confidence ?? 80,
        detectedBrand: parsed.detectedBrand,
        detectedModel: parsed.detectedModel?.toString(),
        detectedYear: parsed.detectedYear,
        dtcCodes: parsed.dtcCodes ?? [],
        symptoms: parsed.symptoms ?? [],
        causes,
    };
}

// ── Public Exports ──────────────────────────────────────────────────────────

export async function runAIDiagnosis(
    userProblem: string,
    lang: 'ro' | 'de' | 'en',
    parsedBrand?: string,
    model?: string,
    year?: string,
    signal?: AbortSignal,
    _fallbackOpenAIKey?: string,
): Promise<AIDiagnosticResult | null> {
    try {
        const openAIKey = (import.meta.env.VITE_OPENAI_API_KEY || _fallbackOpenAIKey || '').trim().replace(/['"]/g, '');
        const geminiKey = (import.meta.env.VITE_AI_API_KEY || '').trim().replace(/['"]/g, '');

        if (openAIKey && openAIKey.length > 5) {
            try {
                return await callOpenAI(openAIKey, userProblem, lang, parsedBrand, model, year, signal);
            } catch (err) {
                console.warn('[AI Diagnosis] OpenAI failed:', err);
                if (!geminiKey) throw err;
            }
        }

        if (geminiKey && geminiKey.length > 5) {
            return await callGemini(geminiKey, userProblem, lang, parsedBrand, model, year, signal);
        }

        return null;
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return null;
        console.error('[AI Diagnosis] Failed:', err);
        throw err;
    }
}

export interface AIPartTier {
    brand: string;
    price: number;
    shop: string;
}

export interface AIPartOffer {
    name: string;
    cheapest: AIPartTier;
    recommended: AIPartTier;
    original: AIPartTier;
}

export interface AIPartsResult {
    causes: {
        causeIndex: number;
        partsAdvice: string;
        parts: AIPartOffer[];
    }[];
}

export async function runAIPartsSearch(
    diagnosis: AIDiagnosticResult,
    lang: 'ro' | 'de' | 'en',
    currency: 'RON' | 'EUR',
    signal?: AbortSignal,
): Promise<AIPartsResult | null> {
    const openAIKey = (import.meta.env.VITE_OPENAI_API_KEY || '').trim().replace(/['"]/g, '');
    const geminiKey = (import.meta.env.VITE_AI_API_KEY || '').trim().replace(/['"]/g, '');

    const userMessage = `Based on the diagnostic result, suggest parts and prices in ${currency}.\n${JSON.stringify(diagnosis)}`;

    const activeKey = openAIKey || geminiKey;
    if (!activeKey) return null;

    try {
        const response = await fetch(openAIKey ? '/api/openai/v1/chat/completions' : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(openAIKey ? { 'Authorization': `Bearer ${openAIKey}` } : {}) },
            signal,
            body: JSON.stringify(openAIKey ? {
                model: 'gpt-4o-mini',
                temperature: 0.2,
                messages: [{ role: 'system', content: getPartsSearchPrompt(lang, currency) }, { role: 'user', content: userMessage }],
                response_format: { type: 'json_object' }
            } : {
                contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                systemInstruction: { parts: [{ text: getPartsSearchPrompt(lang, currency) }] },
                generationConfig: { responseMimeType: 'application/json' }
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const rawText = openAIKey ? data.choices[0].message.content : data.candidates[0].content.parts[0].text;
        return JSON.parse(rawText);
    } catch (err) {
        console.error('[AI Parts] Failed:', err);
        return null;
    }
}

export interface QuickTestProcedure {
    testTitle: string;
    estimatedTime: string;
    requiredTools: string;
    steps: string[];
    passResult: string;
    failResult: string;
}

export async function runQuickTestElaboration(
    quickTestDescription: string,
    lang: 'ro' | 'de' | 'en',
    vehicleContext?: string,
): Promise<QuickTestProcedure | null> {
    const openAIKey = (import.meta.env.VITE_OPENAI_API_KEY || '').trim().replace(/['"]/g, '');
    const geminiKey = (import.meta.env.VITE_AI_API_KEY || '').trim().replace(/['"]/g, '');

    const activeKey = openAIKey || geminiKey;
    if (!activeKey) return null;

    const userMessage = `Diagnostic test: ${quickTestDescription}\nVehicle context: ${vehicleContext || 'Generic'}`;

    try {
        const response = await fetch(openAIKey ? '/api/openai/v1/chat/completions' : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(openAIKey ? { 'Authorization': `Bearer ${openAIKey}` } : {}) },
            body: JSON.stringify(openAIKey ? {
                model: 'gpt-4o-mini',
                temperature: 0.1,
                messages: [{ role: 'system', content: getQuickTestPrompt(lang) }, { role: 'user', content: userMessage }],
                response_format: { type: 'json_object' }
            } : {
                contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                systemInstruction: { parts: [{ text: getQuickTestPrompt(lang) }] },
                generationConfig: { responseMimeType: 'application/json' }
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const rawText = openAIKey ? data.choices[0].message.content : data.candidates[0].content.parts[0].text;
        return JSON.parse(rawText);
    } catch (err) {
        console.error('[Quick Test] Failed:', err);
        return null;
    }
}

export function aiResultToDiagnosticResult(
    ai: AIDiagnosticResult,
    vehicle: import('../models/types').Vehicle,
): import('../models/types').DiagnosticResult {
    return {
        confidence: ai.confidence,
        dtcCode: ai.dtcCodes?.[0],
        symptoms: ai.symptoms,
        vehicle,
        timestamp: Date.now(),
        causes: ai.causes.map(c => ({
            name: c.causeIdentification,
            nameRo: c.causeIdentification,
            nameDe: c.causeIdentification,
            probability: c.probability,
            checkStep: '',
            checkStepRo: '',
            checkStepDe: '',
            partKeywords: c.partKeywords,
            estimatedMinutes: 60,
            technicalDetails: c.technicalExplanation,
            technicalDetailsRo: c.technicalExplanation,
            technicalDetailsDe: c.technicalExplanation,
            repairSteps: c.executionPlan,
            repairStepsRo: c.executionPlan,
            repairStepsDe: c.executionPlan,
            requiredTools: [c.requiredTools],
            requiredToolsRo: [c.requiredTools],
            requiredToolsDe: [c.requiredTools],
            componentLocation: c.partLocation,
            componentLocationRo: c.partLocation,
            componentLocationDe: c.partLocation,
            estimatedHoursMin: 0,
            estimatedHoursMax: 1,
            tricksAndTips: c.masterTricks,
            tricksAndTipsRo: c.masterTricks,
            tricksAndTipsDe: c.masterTricks,
            safetyWarnings: '',
            safetyWarningsRo: '',
            safetyWarningsDe: '',
            quickTests: c.quickTests,
            quickTestsRo: c.quickTests,
            quickTestsDe: c.quickTests,
            partsRo: [],
            partsEn: [],
            partsDe: [],
            forumInsight: '',
            forumInsightRo: '',
            forumInsightDe: ''
        })),
    };
}
