import type { AIDiagnosticResult } from './aiDiagnostic';
import { parseRomanianProblem } from './textParser';

const FAST_RULES = [
    {
        keywords: ['nu porneste', 'won\'t start', 'nu invarte', 'baterie'],
        cause: {
            name: 'Battery or Starter Motor',
            nameRo: 'Baterie descărcată sau Electromotor defect',
            probability: 85,
            checkStep: 'Check battery voltage and starter connections.',
            checkStepRo: 'Măsoară tensiunea bateriei (min 12.4V) și verifică bornele.',
            partKeywords: ['baterie', 'electromotor'],
            estimatedMinutes: 30,
            technicalDetailsRo: 'Problema este cel mai probabil la sursa de curent sau la electromotor.',
            technicalDetails: 'The issue is most likely with the power source or starter motor.',
            repairStepsRo: [
                'Verifică tensiunea la bornele bateriei.',
                'Curăță bornele dacă prezintă oxidare.',
                'Încearcă pornirea cu cabluri (jump start).',
                'Dacă tensiunea e bună, verifică electromotorul.'
            ],
            repairSteps: [
                'Check battery terminal voltage.',
                'Clean terminals if oxidized.',
                'Try a jump start.',
                'If voltage is good, check starter motor.'
            ]
        }
    },
    {
        keywords: ['fum negru', 'black smoke', 'consum mare'],
        cause: {
            name: 'EGR Valve or Injectors',
            nameRo: 'Supapă EGR blocată sau Injectoare',
            probability: 70,
            checkStep: 'Inspect EGR valve for soot buildup and run injector balance test.',
            checkStepRo: 'Verifică supapa EGR pentru depuneri de calamină și fă un test de compensare injectoare pe tester.',
            partKeywords: ['supapa EGR', 'injector'],
            estimatedMinutes: 90,
            technicalDetailsRo: 'Fumul negru indică ardere incompletă. EGR-ul sau injectoarele sunt principalele cauze la diesel.',
            technicalDetails: 'Black smoke indicates rich running condition. EGR or injectors are common culprits on diesels.',
            repairStepsRo: [
                'Pune analizorul OBD și verifică parametrii injectoarelor.',
                'Demontează și curăță supapa EGR.',
                'Verifică furtunurile de vacuum.',
                'Efectuează o regenerare/adaptare cu diagnoza.'
            ],
            repairSteps: [
                'Read OBD data for injector balance.',
                'Remove and clean EGR valve.',
                'Check vacuum hoses.',
                'Perform computer adaptation/regeneration.'
            ]
        }
    },
    {
        keywords: ['pierde ulei', 'oil leak', 'ulei sub masina'],
        cause: {
            name: 'Oil Leak (Various Seals)',
            nameRo: 'Scurgere Ulei (Garnituri / Simeringuri)',
            probability: 75,
            checkStep: 'Lift the vehicle, clean the engine underneath, and trace the leak.',
            checkStepRo: 'Ridică mașina, spală motorul pe dedesubt pentru a depista sursa exactă a scurgerii.',
            partKeywords: ['garnitura capac culbutori', 'simering arbore', 'grosime baie ulei'],
            estimatedMinutes: 120,
            technicalDetailsRo: 'Scurgerile de ulei apar frecvent de la garnitura capacului culbutori, baia de ulei sau simeringurile arborelui cotit.',
            technicalDetails: 'Oil leaks frequently come from valve cover gaskets, oil pan gaskets, or crankshaft seals.',
            repairStepsRo: [
                'Elevator: inspectează zona băii de ulei.',
                'Verifică zona superioară (capac culbutori, filtru epurator).',
                'Curăță bine zona cu spray degresant.',
                'Păstrează mașina în funcțiune pe elevator pentru a vedea fluxul de ulei.'
            ],
            repairSteps: [
                'Lift car: inspect oil pan area.',
                'Check upper area (valve cover, breather).',
                'Clean thoroughly with brake cleaner.',
                'Run engine on lift to spot the active leak.'
            ]
        }
    },
    {
        keywords: ['supraincalzire', 'temperatura apa', 'overheating', 'fierbe apa', 'pompa de apa'],
        cause: {
            name: 'Thermostat or Water Pump',
            nameRo: 'Termostat blocat sau Pompă de apă',
            probability: 80,
            checkStep: 'Check coolant level, check if radiator hoses are hot on both sides.',
            checkStepRo: 'Verifică nivel antigel și atinge conductele radiatorului pentru a vedea dacă ambele sunt calde.',
            partKeywords: ['termostat', 'pompa apa', 'antigel'],
            estimatedMinutes: 120,
            technicalDetailsRo: 'Un sistem de răcire ineficient este adesea cauzat de un termostat blocat pe închis sau de paletele deteriorate ale pompei de apă.',
            technicalDetails: 'Cooling system failure is often due to a stuck closed thermostat or broken water pump impeller.',
            repairStepsRo: [
                'Așteaptă ca motorul să se răcească!',
                'Verifică nivelul antigelului din vasul de expansiune.',
                'Testează funcționarea ventilatoarelor de răcire.',
                'Golire antigel și înlocuire termostat/pompă de apă dacă se confirmă defectul.'
            ],
            repairSteps: [
                'Wait for engine to cool!',
                'Check coolant level in expansion tank.',
                'Test radiator fan operation.',
                'Drain system and replace thermostat/water pump if faulty.'
            ]
        }
    },
    {
        keywords: ['cutie de viteze', 'cutie viteze', 'smuceste', 'gearbox', 'transmission'],
        cause: {
            name: 'Transmission Fluid / Mechatronics',
            nameRo: 'Ulei cutie uzat sau Bloc Mecatronic',
            probability: 65,
            checkStep: 'Check transmission fluid condition. Scan TCM for fault codes.',
            checkStepRo: 'Verifică nivelul și culoarea uleiului din cutie. Diagnoza computerizată pe modulul cutiei (TCM).',
            partKeywords: ['ulei cutie automat', 'filtru cutie', 'mecatronic'],
            estimatedMinutes: 90,
            technicalDetailsRo: 'La cutiile automate, șocurile/smuciturile sunt des întâlnite din cauza neefectuării schimbului de ulei la timp.',
            technicalDetails: 'In automatic transmissions, rough shifting is often due to degraded fluid or mechatronic issues.',
            repairStepsRo: [
                'Diagnoză OBD pe modulul de cutie (TCM).',
                'Prelevare mostră ulei cutie – se verifică mirosul și particulele metalice.',
                'Dacă uleiul e închis la culoare, se execută schimbul de ulei și filtru.',
                'Reînvățare adaptări mecatronic din tester.'
            ],
            repairSteps: [
                'OBD scan on Transmission module (TCM).',
                'Check fluid sample for burnt smell/metal chips.',
                'If fluid is dark, perform fluid and filter change.',
                'Reset transmission adaptations via scanner.'
            ]
        }
    },
    {
        keywords: ['zgomot suspensie', 'bate la roti', 'suspensie zgomotasa', 'troncane', 'suspension noise'],
        cause: {
            name: 'Suspension Bushings / Anti-roll bar links',
            nameRo: 'Bucșe braț sau Bielete antiruliu',
            probability: 85,
            checkStep: 'Put the car on the lift and check for play in the suspension components.',
            checkStepRo: 'Ridicarea pe elevator și folosirea unui levier pentru a verifica jocul brațelor și bucșelor.',
            partKeywords: ['bieleta antiruliu', 'bucsa brat', 'pivot'],
            estimatedMinutes: 60,
            technicalDetailsRo: 'Jocul în articulațiile suspensiei creează zgomot ascuțit pe porțiunile de drum denivelat.',
            technicalDetails: 'Play in the suspension joints creates sharp clunking noises over bumps.',
            repairStepsRo: [
                'Inspectează vizual burdufurile și elementele de cauciuc.',
                'Trage puternic de roată la 12-6 și 9-3 (verificare rulment, bielete).',
                'Verifică jocul prinderilor cu un levier.',
                'Înlocuirea elementului defect și refacerea geometriei roților (dacă e necesar).'
            ],
            repairSteps: [
                'Visually inspect rubber boots.',
                'Perform 12-o\'clock/6-o\'clock and 9/3 wheel shake tests.',
                'Check joints play with a pry bar.',
                'Replace faulty part and align wheels if necessary.'
            ]
        }
    }
];

function norm(text: string): string {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function getFastDiagnostic(text: string, lang: 'ro' | 'de' | 'en' = 'ro'): AIDiagnosticResult | null {
    if (text.trim().length < 5) return null;
    
    const parsed = parseRomanianProblem(text);
    const n = norm(text);
    
    const matchedRule = FAST_RULES.find(rule => 
        rule.keywords.some(k => n.includes(norm(k)))
    );

    if (!matchedRule) return null;

    const brandName = parsed.detectedBrand && parsed.detectedBrand !== 'Unknown' 
        ? parsed.detectedBrand 
        : '';
        
    const modelName = parsed.detectedModel ? ` ${parsed.detectedModel}` : '';
    const carContext = (brandName || modelName) ? `${brandName}${modelName}` : 'Mașinii';

    // Use the explicitly selected UI language — never override with text-detected language
    const currentLang = lang;
    
    // For English, use the English base fields for the "Ro"-suffixed fields too
    // since the frontend displays the "Ro" fields if the user language matches the input language
    const causeName = currentLang === 'en' ? matchedRule.cause.name : currentLang === 'de' ? (matchedRule.cause as any).nameDe || matchedRule.cause.name : matchedRule.cause.nameRo;
    const techDetails = currentLang === 'en' ? matchedRule.cause.technicalDetails : currentLang === 'de' ? 'Mögliches Problem mit ' + carContext.trim() + '. ' + (matchedRule.cause as any).technicalDetailsDe || matchedRule.cause.technicalDetails : `Posibilă problemă specifică ${carContext.trim()}. ${matchedRule.cause.technicalDetailsRo}`;
    const repSteps = currentLang === 'en' ? matchedRule.cause.repairSteps : currentLang === 'de' ? (matchedRule.cause as any).repairStepsDe || matchedRule.cause.repairSteps : matchedRule.cause.repairStepsRo;
    const chkStep = currentLang === 'en' ? matchedRule.cause.checkStep : currentLang === 'de' ? (matchedRule.cause as any).checkStepDe || matchedRule.cause.checkStep : matchedRule.cause.checkStepRo;
    const probTitle = currentLang === 'en' ? `Fast Diag: ${matchedRule.cause.name}` : currentLang === 'de' ? `Schnelle Diag: ${(matchedRule.cause as any).nameDe || matchedRule.cause.name}` : `Diagnoză Rapidă: ${matchedRule.cause.nameRo}`;


    return {
        problemTitle: probTitle,
        problemTitleRo: probTitle,
        problemTitleDe: probTitle,
        confidence: matchedRule.cause.probability - 15, // Lower than AI confidence as it's a guess
        detectedBrand: parsed.detectedBrand ?? undefined,
        detectedModel: parsed.detectedModel ?? undefined,
        detectedYear: parsed.detectedYear ?? undefined,
        dtcCodes: [],
        symptoms: matchedRule.keywords.filter(k => n.includes(norm(k))),
        causes: [
            {
                causeIdentification: causeName,
                probability: matchedRule.cause.probability,
                technicalExplanation: techDetails,
                executionPlan: Array.isArray(repSteps) ? repSteps : [repSteps],
                partLocation: (matchedRule.cause as any).componentLocation || '',
                requiredTools: ((matchedRule.cause as any).requiredTools || []).join(', ') || 'N/A',
                quickTests: [],
                masterTricks: chkStep,
                partKeywords: (matchedRule.cause as any).partKeywords || []
            }
        ]
    };
}
