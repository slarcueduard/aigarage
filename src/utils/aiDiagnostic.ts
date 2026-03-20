/**
 * AI-powered Automotive Diagnostic Engine
 * Uses Google Gemini (free tier) or OpenAI to understand natural language
 * problem descriptions and return structured diagnostic results.
 *
 * System Prompt: Romanian expert automotive diagnostician for professional mechanics.
 */

export interface AIDiagnosticResult {
    /** Main problem identified */
    problemTitle: string;
    problemTitleRo: string;
    problemTitleDe: string;

    /** Overall confidence 0-100 */
    confidence: number;

    /** Possible causes, ordered by probability */
    causes: AICause[];

    /** Detected symptoms / keywords */
    symptoms: string[];

    /** Suggested DTC codes, if applicable */
    dtcCodes: string[];

    /** Detected vehicle info from text */
    detectedBrand?: string;
    detectedModel?: string;
    detectedYear?: number;
}

export interface AICausePart {
    name: string;
    priceRon: number;
    note?: string;
}

export interface AICause {
    name: string;
    nameRo: string;
    nameDe?: string;
    probability: number;
    checkStep: string;
    checkStepRo: string;
    checkStepDe?: string;
    partKeywords: string[];
    estimatedMinutes: number;
    technicalDetails?: string;
    technicalDetailsRo?: string;
    technicalDetailsDe?: string;
    repairSteps?: string[];
    repairStepsRo?: string[];
    repairStepsDe?: string[];
    forumInsight?: string;
    forumInsightRo?: string;
    forumInsightDe: string; // Made required
    tricksAndTips?: string;
    tricksAndTipsRo?: string;
    tricksAndTipsDe?: string;
    safetyWarnings?: string;
    safetyWarningsRo?: string;
    safetyWarningsDe?: string;
    quickTests?: string[];
    quickTestsRo?: string[];
    quickTestsDe?: string[];
    partsAdvice?: string;
    partsAdviceRo?: string;
    partsAdviceDe?: string;
    /** Brand/model-specific parts with Romanian market prices */
    partsRo: { name: string; priceRon: number; note?: string }[]; // Made required, inline type
    partsEn: { name: string; priceEur: number; note?: string }[]; // Added
    partsDe: { name: string; priceEur: number; note?: string }[]; // Added
    /** New detailed repair metadata */
    requiredToolsRo: string[]; // Made required
    requiredToolsDe: string[]; // Made required
    componentLocationRo: string; // Made required
    componentLocationDe: string; // Made required
    estimatedHoursMin: number; // Added back
    estimatedHoursMax: number; // Made required
    requiredTools: string[]; // Added
    componentLocation: string; // Added
}

// ── System prompt ─────────────────────────────────────────────────────────────
function getSystemPrompt(lang: 'ro' | 'de' | 'en') {
    const languageInstruction = lang === 'ro' 
        ? 'Răspunde EXCLUSIV în limba ROMÂNĂ. Absolut toate explicațiile și detaliile trebuie să fie în Română.' 
        : lang === 'de' 
            ? 'Răspunde EXCLUSIV în limba GERMANĂ (Deutsch). Absolut toate explicațiile und details trebuie să fie în Germană.' 
            : 'Răspunde EXCLUSIV în limba ENGLEZĂ (English). Absolut toate explicațiile și detaliile trebuie să fie în Engleză.';

    return `You are an expert automotive diagnostic engineer. Help mechanics diagnose vehicle problems fast.

OBLIGATORIU: ${languageInstruction}
OBLIGATORIU: Toate cheile textuale din JSON TREBUIE să fie ÎN LIMBA SOLICITATĂ: ${lang.toUpperCase()}.
OBLIGATORIU: Generează ÎNTOTDEAUNA 2-3 cauze posibile.
IMPORTANT: NU genera sfaturi de piese. Returnează DOAR keywords în 'partKeywords' (IN ENGLISH).

Pentru fiecare cauză:
1. IDENTIFICARE + probabilitate
2. EXPLICAȚIE tehnică scurtă (cauza defecțiunii)
3. REPARAȚIE step-by-step (4 pași, începe cu vehiculul menționat)
4. LOCAȚIE piesă + SCULE necesare
5. TESTE RAPIDE (3 verificări < 5 min)
6. TRUCURI practice + SIGURANȚĂ

Răspunde EXCLUSIV JSON valid:
{
  "problemTitle": "...",
  "confidence": 0-100,
  "detectedBrand": "...", "detectedModel": "...", "detectedYear": 0,
  "dtcCodes": [], "symptoms": [],
  "causes": [
    {
      "name": "...",
      "probability": 60,
      "partKeywords": ["suspension compressor", "air spring"],
      "checkStep": "...",
      "technicalDetails": "...",
      "repairSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
      "componentLocation": "...",
      "requiredTools": ["Basic: ...", "Diag: ..."],
      "quickTests": ["Test 1", "Test 2", "Test 3"],
      "tricksAndTips": "...",
      "safetyWarnings": "..."
    }
  ]
}
`;
}

function getPartsSearchPrompt(lang: 'ro' | 'de' | 'en', currency: 'RON' | 'EUR') {
    const languageInstruction = lang === 'ro' 
        ? 'Răspunde EXCLUSIV în limba ROMÂNĂ. Absolut toate detaliile pieselor trebuie să fie în Română.' 
        : lang === 'de' 
            ? 'Răspunde EXCLUSIV în limba GERMANĂ (Deutsch). Absolut toate detaliile pieselor trebuie să fie în Germană.' 
            : 'Răspunde EXCLUSIV în limba ENGLEZĂ (English). Absolut toate detaliile pieselor trebuie să fie în Engleză.';

    return `You are an expert automotive parts specialist. You receive a diagnostic report containing a list of vehicle problems (causes) and parts keywords.
Your job is to provide parts buying advice and estimate the cost for the required parts specifically for the specified market.

OBLIGATORIU: ${languageInstruction}
OBLIGATORIU: Currency is ${currency}. Calculate prices intuitively for the aftermarket (not dealership).

Răspunde EXCLUSIV JSON valid:
{
  "causes": [
    {
      "causeIndex": 0,
      "partsAdvice": "Sfat din partea ta ca mecanic pentru cumpărarea acestor piese (ex: Evitați brandul X, luați Y. Verificați seria de șasiu).",
      "parts": [
        {
          "name": "Numele complet al piesei (ex: Compresor suspensie aer)",
          "price": 1200,
          "note": "Optional: eMAG/Autokarma/eBay estimate sau detaliu (OEM vs Aftermarket)"
        }
      ]
    }
  ]
}
`;
}





// Best free-tier Gemini models in priority order (best quality first)
const GEMINI_MODELS = [
    'gemini-2.0-flash-lite',   // Fastest, free, 2.0 generation
    'gemini-1.5-flash',        // Reliable free tier
    'gemini-1.5-flash-8b',     // Smaller, higher quota
    'gemini-1.0-pro',          // Oldest, always available
];

// ── Gemini API call ────────────────────────────────────────────────────────────
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
                        systemInstruction: {
                            parts: [{ text: getSystemPrompt(lang) }],
                        },
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: userMessage }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 900,
                            responseMimeType: 'application/json',
                        },
                    }),
                },
            );

            if (response.status === 404 || response.status === 400 || response.status === 429) {
                // Model not available, bad request or Rate Limited — try next
                console.warn(`[AI Diagnosis] Model ${modelName} ${response.status === 429 ? 'Rate Limited' : 'Unavailable'} (${response.status}), trying next...`);
                continue;
            }

            if (!response.ok) {
                const err = await response.text();
                // If it's a 5xx or something else, throw for the upper layer to catch
                throw new Error(`Gemini API error ${response.status}: ${err}`);
            }

            const data = await response.json();
            const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            console.log(`[AI Diagnosis] Using model: ${modelName}`);
            return parseAIResponse(rawText);
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') throw err;
            lastError = err instanceof Error ? err : new Error(String(err));
            // If this was a quota error (429) skip to next model
            if (lastError.message.includes('429')) {
                console.warn(`[AI Diagnosis] Model ${modelName} quota exceeded, trying next...`);
                continue;
            }
            // Other errors — rethrow
            throw lastError;
        }
    }

    throw lastError;
}

// ── OpenAI API call (via Vite proxy to bypass CORS) ─────────────────────────
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
    // Use Vite proxy — /api/openai rewrites to https://api.openai.com
    // stream:true — chunks arrive immediately, reducing TTFB significantly
    const response = await fetch('/api/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            stream: true,          // streaming — tokens arrive as generated
            temperature: 0.1,      // more deterministic = faster
            max_tokens: 3000,      // sufficient for large JSON structures with details
            messages: [
                { role: 'system', content: getSystemPrompt(lang) },
                { role: 'user', content: userMessage },
            ],
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${err}`);
    }

    // Accumulate streamed SSE chunks into a single string.
    // CRITICAL: we buffer the raw bytes across read() calls and split by \n\n
    // (the SSE event terminator) so we never parse a partial SSE JSON payload.
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let sseBuffer = ''; // Raw SSE bytes buffer — may span multiple read() calls

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (signal?.aborted) { reader.cancel(); break; }
        sseBuffer += decoder.decode(value, { stream: true });

        // Split on double-newline — that's the SSE event boundary
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() ?? ''; // Last element may be an incomplete event

        for (const event of events) {
            for (const line of event.split('\n')) {
                if (!line.startsWith('data:')) continue;
                const payload = line.slice(5).trim();
                if (payload === '[DONE]') break;
                try {
                    const evt = JSON.parse(payload);
                    const delta: string = evt?.choices?.[0]?.delta?.content ?? '';
                    accumulated += delta;
                } catch { /* ignore non-JSON SSE comment lines */ }
            }
        }
    }

    return parseAIResponse(accumulated);
}

// ── JSON parser ────────────────────────────────────────────────────────────────
function parseAIResponse(rawText: string): AIDiagnosticResult {
    // Robustly extract the JSON object even if the model adds text before/after
    // e.g. "Here is the diagnosis: {...}" or "```json\n{...}\n```"
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI response is not valid JSON: no JSON object found');
    }

    let parsed: Partial<AIDiagnosticResult> & { causes?: unknown[] };
    try {
        parsed = JSON.parse(jsonMatch[0]);
    } catch {
        throw new Error('AI response is not valid JSON');
    }

    if (!parsed.causes || !Array.isArray(parsed.causes) || parsed.causes.length === 0) {
        throw new Error('AI response has no causes');
    }

    // Normalise and fill optional fields with safe defaults
    const causes: AICause[] = parsed.causes.map((c: unknown) => {
        const cause = c as Partial<AICause>;
        return {
            name: cause.name ?? 'Unknown cause',
            nameRo: cause.nameRo ?? cause.name ?? 'Cauză necunoscută',
            nameDe: cause.nameDe ?? cause.name,
            probability: cause.probability ?? 33,
            checkStep: cause.checkStep ?? '',
            checkStepRo: '',
            checkStepDe: '',
            partKeywords: cause.partKeywords ?? [],
            estimatedMinutes: 60,
            technicalDetails: cause.technicalDetails ?? '',
            technicalDetailsRo: cause.technicalDetails,
            technicalDetailsDe: cause.technicalDetails,
            repairSteps: cause.repairSteps ?? [],
            repairStepsRo: cause.repairSteps,
            repairStepsDe: cause.repairSteps,
            forumInsight: cause.forumInsight ?? '',
            forumInsightRo: cause.forumInsight,
            forumInsightDe: cause.forumInsight ?? '',
            requiredTools: cause.requiredTools ?? [],
            requiredToolsRo: cause.requiredTools ?? [],
            requiredToolsDe: cause.requiredTools ?? [],
            componentLocation: cause.componentLocation ?? '',
            componentLocationRo: cause.componentLocation ?? '',
            componentLocationDe: cause.componentLocation ?? '',
            estimatedHoursMin: 0,
            estimatedHoursMax: 0,
            tricksAndTips: cause.tricksAndTips ?? '',
            tricksAndTipsRo: cause.tricksAndTips ?? '',
            tricksAndTipsDe: cause.tricksAndTips ?? '',
            safetyWarnings: cause.safetyWarnings ?? '',
            safetyWarningsRo: cause.safetyWarnings ?? '',
            safetyWarningsDe: cause.safetyWarnings ?? '',
            quickTests: cause.quickTests ?? [],
            quickTestsRo: cause.quickTests ?? [],
            quickTestsDe: cause.quickTests ?? [],
            partsAdvice: cause.partsAdvice ?? '',
            partsAdviceRo: '',
            partsAdviceDe: '',
            partsRo: [],
            partsEn: [],
            partsDe: [],
        };
    });

    return {
        problemTitle: parsed.problemTitle ?? parsed.problemTitleRo ?? parsed.problemTitleDe ?? 'Automotive Issue',
        problemTitleRo: parsed.problemTitleRo ?? parsed.problemTitle ?? 'Problemă auto',
        problemTitleDe: parsed.problemTitleDe ?? parsed.problemTitle ?? 'Automobil-Problem',
        confidence: parsed.confidence ?? 60,
        causes,
        symptoms: parsed.symptoms ?? [],
        dtcCodes: parsed.dtcCodes ?? [],
        detectedBrand: parsed.detectedBrand || undefined,
        detectedModel: parsed.detectedModel?.toString() || undefined,
        detectedYear: typeof parsed.detectedYear === 'number' ? parsed.detectedYear : (parsed.detectedYear ? parseInt(parsed.detectedYear) : undefined),
    };
}

// ── Main entry point ───────────────────────────────────────────────────────────
export async function runAIDiagnosis(
    apiKey: string,
    provider: 'gemini' | 'openai',
    userProblem: string,
    lang: 'ro' | 'de' | 'en',
    parsedBrand?: string,
    model?: string,
    year?: string,
    signal?: AbortSignal,
    _fallbackOpenAIKey?: string,
): Promise<AIDiagnosticResult | null> {
    try {
        const activeProvider = provider || (import.meta.env.VITE_AI_PROVIDER as any) || 'gemini';
        const activeKey = apiKey || (activeProvider === 'openai' ? import.meta.env.VITE_OPENAI_API_KEY : import.meta.env.VITE_AI_API_KEY);

        if (!activeKey || activeKey.length < 5) {
            console.warn(`[AI Diagnosis] No API key provided for ${activeProvider}.`);
            return null;
        }

        let result: AIDiagnosticResult;
        if (activeProvider === 'gemini') {
            result = await callGemini(activeKey, userProblem, lang, parsedBrand, model, year, signal);
        } else {
            result = await callOpenAI(activeKey, userProblem, lang, parsedBrand, model, year, signal);
        }
        if (result && result.causes.length > 0) return result;
        console.warn(`[AI Diagnosis] ${provider} returned empty result.`);
        return null;
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return null;
        console.error(`[AI Diagnosis] ${provider} failed:`, err);
        
        // Rethrow specialized errors for the UI to display
        const msg = String(err).toLowerCase();
        if (msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('exhausted')) {
            throw new Error('RATE_LIMIT');
        }
        return null;
    }
}

// ── Second stage parts lookup ─────────────────────────────────────────────────
export interface AIPartsResult {
    causes: {
        causeIndex: number;
        partsAdvice: string;
        parts: { name: string; price: number; note?: string }[];
    }[];
}

export async function runAIPartsSearch(
    apiKey: string,
    _provider: 'gemini' | 'openai',
    diagnosis: AIDiagnosticResult,
    lang: 'ro' | 'de' | 'en',
    currency: 'RON' | 'EUR',
    signal?: AbortSignal,
): Promise<AIPartsResult | null> {
    try {
        const activeKey = apiKey || import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
        if (!activeKey || activeKey.length < 5) return null;
        const userMessage = `Vă rugăm să analizați următoarele cauze și componente și să furnizați estimări de prețuri și sfaturi:
${diagnosis.causes.map((c, i) => `Cauza ${i}: ${c.name}
Piese necesare estimate: ${c.partKeywords?.join(', ') || 'N/A'}`).join('\n\n')}`;

        for (const modelName of GEMINI_MODELS) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal,
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: getPartsSearchPrompt(lang, currency) }] },
                            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                            generationConfig: {
                                temperature: 0.2,
                                maxOutputTokens: 2000,
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
                const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) return JSON.parse(jsonMatch[0]) as AIPartsResult;
                return null;
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') throw err;
                continue;
            }
        }
    } catch (err: unknown) {
        console.error(`[AI Parts] failed:`, err);
    }

    // If we're here, all models in the list failed (usually all 429 or 404)
    throw new Error('QUOTA_EXHAUSTED');
}

// ── Converter: AIDiagnosticResult → DiagnosticResult ─────────────────────────
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
            name: c.name,
            nameRo: c.nameRo,
            probability: c.probability,
            checkStep: c.checkStep,
            checkStepRo: c.checkStepRo,
            partKeywords: c.partKeywords,
            estimatedMinutes: c.estimatedMinutes,
            technicalDetails: c.technicalDetails,
            technicalDetailsRo: c.technicalDetailsRo,
            repairSteps: c.repairSteps,
            repairStepsRo: c.repairStepsRo,
            partsRo: c.partsRo,
            requiredToolsRo: c.requiredToolsRo,
            componentLocationRo: c.componentLocationRo,
            estimatedHoursMin: c.estimatedHoursMin,
            estimatedHoursMax: c.estimatedHoursMax,
            nameDe: c.nameDe,
            checkStepDe: c.checkStepDe,
            technicalDetailsDe: c.technicalDetailsDe,
            repairStepsDe: c.repairStepsDe,
            forumInsight: c.forumInsight ?? '',
            forumInsightRo: c.forumInsightRo,
            forumInsightDe: c.forumInsightDe,
            requiredToolsDe: c.requiredToolsDe,
            componentLocationDe: c.componentLocationDe,
            requiredTools: c.requiredTools, // Added
            componentLocation: c.componentLocation, // Added
            partsEn: c.partsEn, // Added
            partsDe: c.partsDe, // Added
            tricksAndTips: c.tricksAndTips,
            tricksAndTipsRo: c.tricksAndTipsRo,
            tricksAndTipsDe: c.tricksAndTipsDe,
            safetyWarnings: c.safetyWarnings,
            safetyWarningsRo: c.safetyWarningsRo,
            safetyWarningsDe: c.safetyWarningsDe,
            quickTests: c.quickTests,
            quickTestsRo: c.quickTestsRo,
            quickTestsDe: c.quickTestsDe,
        })),
    };
}
