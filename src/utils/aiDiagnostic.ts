/**
 * AI-powered Automotive Diagnostic Engine
 * Uses Google Gemini (free tier) or OpenAI to understand natural language
 * problem descriptions and return structured diagnostic results.
 *
 * System Prompt: Romanian expert automotive diagnostician for professional mechanics.
 */

export interface AIDiagnosticResult {
    problemTitle: string;
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

/// ── System prompt ─────────────────────────────────────────────────────────────
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

    return `System Prompt 3: The Procurement & Upsell Engine
ROLE: You are an expert Automotive Parts Procurement Specialist. You estimate aftermarket parts costs and provide buying advice to professional mechanics.

EXECUTION RULES:

ALL text values in your JSON output MUST be in ${targetLang}. JSON keys MUST remain in English.

Tiered Pricing Directive: You MUST categorize every required part into three specific tiers:

Cheapest: Lowest-priced budget brand (e.g., Ridex, Stark).

Recommended: High-quality sweet spot (e.g., Bosch, Lemförder, TRW, Pierburg).

Original (OEM): The genuine manufacturer part.

Mechanic Advice (CRITICAL): Provide practical, professional advice. You MUST write an extensive explanation explicitly stating WHICH part brand is best and EXACTLY WHY, referencing brand-specific engineering qualities or known failure rates (e.g., "Avoid budget brands for this MAF sensor; the cheap hot-film elements degrade in 3 months. Stick to Bosch or genuine OEM").

OUTPUT FORMAT: Respond ONLY with valid JSON matching this exact structure:
{
  "causes": [
    {
      "causeIndex": 0,
      "partsAdvice": "Professional buying advice...",
      "parts": [
        {
          "name": "Full name of the required part",
          "cheapest": {
            "brand": "Budget brand name",
            "price": 50,
            "shop": "Autodoc"
          },
          "recommended": {
            "brand": "Premium aftermarket brand",
            "price": 85,
            "shop": "Autokarma"
          },
          "original": {
            "brand": "OEM",
            "price": 250,
            "shop": "Dealership"
          }
        }
      ]
    }
  ]
}`;
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
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI response is not valid JSON: no JSON object found');
    }

    let parsed: any;
    try {
        parsed = JSON.parse(jsonMatch[0]);
    } catch {
        throw new Error('AI response is not valid JSON');
    }

    if (!parsed.causes || !Array.isArray(parsed.causes) || parsed.causes.length === 0) {
        throw new Error('AI response has no causes');
    }

    const causes: AICause[] = parsed.causes.map((c: any) => {
        return {
            causeIdentification: c.causeIdentification ?? c.name ?? 'Unknown cause',
            probability: c.probability ?? 33,
            technicalExplanation: c.technicalExplanation ?? c.technicalDetails ?? '',
            executionPlan: c.executionPlan ?? c.repairSteps ?? [],
            partLocation: c.partLocation ?? c.componentLocation ?? '',
            requiredTools: c.requiredTools ?? 'N/A',
            quickTests: c.quickTests ?? [],
            masterTricks: c.masterTricks ?? c.tricksAndTips ?? '',
            partKeywords: c.partKeywords ?? [],
        };
    });

    return {
        problemTitle: parsed.problemTitle ?? 'Automotive Issue',
        confidence: parsed.confidence ?? 85,
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

        // 1. Try OpenAI if available
        if (openAIKey && openAIKey.length > 5) {
            try {
                const result = await callOpenAI(openAIKey, userProblem, lang, parsedBrand, model, year, signal);
                if (result && result.causes.length > 0) return result;
            } catch (err) {
                console.warn(`[AI Diagnosis] OpenAI failed, trying fallback:`, err);
                // If Gemini key is also missing, rethrow the error
                if (!geminiKey) throw err;
            }
        }

        // 2. Try Gemini
        if (geminiKey && geminiKey.length > 5) {
            return await callGemini(geminiKey, userProblem, lang, parsedBrand, model, year, signal);
        }

        console.warn(`[AI Diagnosis] No valid key/provider available.`);
        return null;
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return null;
        console.error(`[AI Diagnosis] failed:`, err);
        
        // Rethrow specialized errors for the UI to display
        const msg = String(err).toLowerCase();
        if (msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('exhausted')) {
            throw new Error('RATE_LIMIT');
        }
        return null;
    }
}

// ── Second stage parts lookup ─────────────────────────────────────────────────
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

    const userMessage = `Vă rugăm să analizați următoarele cauze și componente și să furnizați estimări de prețuri și sfaturi:
${diagnosis.causes.map((c, i) => `Cauza ${i}: ${c.causeIdentification}
Piese necesare estimate: ${c.partKeywords?.join(', ') || 'N/A'}`).join('\n\n')}`;

    // 1. Try OpenAI first
    if (openAIKey && openAIKey.length > 5) {
        try {
            const response = await fetch('/api/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIKey}`,
                },
                signal,
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.2,
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: getPartsSearchPrompt(lang, currency) },
                        { role: 'user', content: userMessage },
                    ],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const rawText = data.choices[0].message.content;
                return JSON.parse(rawText);
            }
        } catch (err) {
            console.warn('[AI Parts] OpenAI failed, falling back to Gemini:', err);
        }
    }

    // 2. Try Gemini
    if (geminiKey && geminiKey.length > 5) {
        for (const modelName of GEMINI_MODELS) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
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
    }

    return null;
}

// ── Quick Test Elaboration ─────────────────────────────────────────────────────
// Called when mechanic taps a Quick Test pill — returns detailed procedure steps.
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
- If the test is hydraulic/pneumatic: Give exact measurement values (Bar/PSI) and the specific tool setup (e.g., "Connect 150-bar pressure gauge to the tandem pump test port").
- If the test is mechanical: Give exact measurement values (mm/inches) using micrometers or dial indicators.

OUTPUT FORMAT: Respond ONLY with valid JSON matching this exact structure:
{
  "testTitle": "Full name of the test",
  "estimatedTime": "3-5 minutes",
  "requiredTools": "Specific tools needed (e.g., Digital Multimeter, Oscilloscope, Smoke Machine)",
  "steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "passResult": "What reading/result indicates the component is GOOD",
  "failResult": "What reading/result indicates the component is FAULTY and what to replace"
}`;
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
    const openAIKey = (import.meta.env.VITE_OPENAI_API_KEY || '').trim().replace(/['\"]/g, '');
    const geminiKey = (import.meta.env.VITE_AI_API_KEY || '').trim().replace(/['\"]/g, '');

    const userMessage = `Generate a detailed diagnostic procedure for this test: "${quickTestDescription}"${vehicleContext ? `\nVehicle context: ${vehicleContext}` : ''}`;

    // 1. Try OpenAI first
    if (openAIKey && openAIKey.length > 5) {
        try {
            const response = await fetch('/api/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.1,
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: getQuickTestPrompt(lang) },
                        { role: 'user', content: userMessage },
                    ],
                }),
            });
            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.choices[0].message.content) as QuickTestProcedure;
            }
        } catch (err) {
            console.warn('[Quick Test] OpenAI failed, falling back to Gemini:', err);
        }
    }

    // 2. Try Gemini
    if (geminiKey && geminiKey.length > 5) {
        for (const modelName of GEMINI_MODELS) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: getQuickTestPrompt(lang) }] },
                            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                            generationConfig: {
                                temperature: 0.1,
                                maxOutputTokens: 1200,
                                responseMimeType: 'application/json',
                            },
                        }),
                    },
                );
                if (!response.ok) {
                    if (response.status === 404 || response.status === 400 || response.status === 429) continue;
                    throw new Error(`Gemini ${response.status}`);
                }
                const data = await response.json();
                const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                const match = rawText.match(/\{[\s\S]*\}/);
                if (match) return JSON.parse(match[0]) as QuickTestProcedure;
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') throw err;
                continue;
            }
        }
    }
    return null;
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
            estimatedHoursMax: 0,
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
