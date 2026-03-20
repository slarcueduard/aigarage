import type { AIDiagnosticResult } from './aiDiagnostic';

export const COMMON_DTCS = [
    {
        code: 'P0420',
        nameEn: 'Catalyst System Efficiency Below Threshold (Bank 1)',
        nameRo: 'Eficiența sistemului catalizator sub prag (Banc 1)',
        nameDe: 'Katalysatorsystem Wirkungsgrad unter Schwellenwert (Bank 1)',
        causes: [
            {
                name: 'Defective Catalytic Converter',
                nameRo: 'Catalizator defect sau înfundat',
                nameDe: 'Katalysator defekt oder verstopft',
                probability: 70,
                checkStep: 'Check temps before/after cat, monitor downstream O2 sensor switching.',
                checkStepRo: 'Verifică temperaturile înainte/după catalizator și graficul sondei lambda 2.',
                checkStepDe: 'Temperaturen vor/nach Kat prüfen, Nachkat-Lambdasonde überwachen.',
                technicalDetails: 'The rear oxygen sensor is showing too much activity, mirroring the front sensor. This means the precious metals in the converter are no longer storing oxygen or catalyzing emissions properly.',
                technicalDetailsRo: 'Sonda lambda 2 copiază graficul sondei 1, ceea ce înseamnă că metalele prețioase din fagure nu mai stochează oxigen și nu reduc gazele.',
                technicalDetailsDe: 'Die Nachkat-Sonde spiegelt das Signal der Vorkat-Sonde wider, was bedeutet, dass der Kat keine Abgase mehr reinigt.',
                repairSteps: [
                    'Read fuel trims to ensure engine isn\'t running too rich (which kills cats).',
                    'Check for exhaust leaks near the sensors.',
                    'Replace the catalytic converter if O2 sensors are verified good.',
                    'Clear codes and perform a drive cycle.'
                ],
                repairStepsRo: [
                    'Verifică corecțiile de injecție (fuel trims) pentru amestec bogat.',
                    'Verifică etanșeitatea sistemului de evacuare.',
                    'Dacă sondele sunt bune, înlocuiește catalizatorul.',
                    'Șterge erorile și efectuează un test de drum lung.'
                ],
                repairStepsDe: [
                    'Kraftstoff-Trimm prüfen um fettes Gemisch auszuschließen.',
                    'Abgasanlage auf Undichtigkeiten prüfen.',
                    'Katalysator ersetzen, falls Lambdasonden in Ordnung sind.',
                    'Fehler löschen und Probefahrt machen.'
                ],
                partKeywords: ['catalizator'],
                estimatedMinutes: 120
            },
            {
                name: 'Faulty Downstream O2 Sensor',
                nameRo: 'Sondă Lambda (înainte/după) defectă',
                nameDe: 'Nachkat-Lambdasonde defekt',
                probability: 25,
                checkStep: 'Induce Lean/Rich condition and watch sensor response time.',
                checkStepRo: 'Forțează un amestec sărac/bogat și urmărește timpii de răspuns ai sondei 2.',
                checkStepDe: 'Mager/Fett-Zustand erzwingen und Reaktionszeit der Sonde überwachen.',
                technicalDetails: 'A sluggish or stuck sensor reading can falsely falsely trigger the P0420 code.',
                technicalDetailsRo: 'Un senzor lent sau blocat pe o anumită valoare poate declanșa eronat codul P0420.',
                technicalDetailsDe: 'Ein träger oder klemmender Sensor kann fälschlicherweise den P0420 Code auslösen.',
                repairSteps: [
                    'Disconnect O2 sensor and check resistance of the heater circuit.',
                    'Remove sensor (use penetrating oil).',
                    'Install new O2 sensor with anti-seize compound on threads.',
                    'Clear codes.'
                ],
                repairStepsRo: [
                    'Deconectează sonda și măsoară rezistența circuitului de încălzire.',
                    'Demontează sonda cu o cheie specială (folosește degripant).',
                    'Apoă vaselină de cupru pe filet și montează noua sondă.',
                    'Șterge erorile.'
                ],
                repairStepsDe: [
                    'Lambdasonde abklemmen und Heizkreis-Widerstand messen.',
                    'Sonde ausbauen (Rostlöser verwenden).',
                    'Neue Sonde mit Kupferpaste am Gewinde einbauen.',
                    'Fehler löschen.'
                ],
                partKeywords: ['sonda lambda'],
                estimatedMinutes: 60
            }
        ]
    },
    {
        code: 'P0300',
        nameEn: 'Random/Multiple Cylinder Misfire Detected',
        nameRo: 'Rateu detectat pe mai mulți cilindri / Aleator',
        nameDe: 'Zufällige/Mehrere Zylinder-Fehlzündungen erkannt',
        causes: [
            {
                name: 'Vacuum Leak or Lean Condition',
                nameRo: 'Pierdere de vacuum / Amestec Sărac',
                nameDe: 'Vakuumleck oder mageres Gemisch',
                probability: 45,
                checkStep: 'Smoke test the intake manifold and check long term fuel trims.',
                checkStepRo: 'Fă un test cu fum pe admisie și verifică LTFT (trebuie să fie sub +10%).',
                checkStepDe: 'Ansaugbrücke mit Rauch testen und langfristige Gemischanpassung (LTFT) prüfen.',
                technicalDetails: 'Unmetered air entering the engine leans out the mixture across all cylinders, causing random misfires.',
                technicalDetailsRo: 'Aerul fals intrat în motor sărăcește amestecul pe toți cilindrii, rezultând în rateuri multiple.',
                technicalDetailsDe: 'Falschluft magert das Gemisch auf allen Zylindern ab und verursacht zufällige Fehlzündungen.',
                repairSteps: [
                    'Inspect all PCV hoses and intake boots for cracks.',
                    'Perform smoke test on intake manifold.',
                    'Replace leaking gaskets or hoses.',
                    'Reset fuel adaptations.'
                ],
                repairStepsRo: [
                    'Inspectează furtunurile de la epurator (PCV) și tubulatura de admisie.',
                    'Efectuează test cu fum sub presiune.',
                    'Înlocuiește garniturile de admisie sau furtunurile crăpate.',
                    'Resetează adaptările de amestec pe tester.'
                ],
                repairStepsDe: [
                    'PCV-Schläuche und Ansaugrohre auf Risse prüfen.',
                    'Rauchtest an der Ansaugbrücke durchführen.',
                    'Undichte Dichtungen oder Schläuche ersetzen.',
                    'Gemischadaptionen zurücksetzen.'
                ],
                partKeywords: ['garnitura admisie', 'furtun vacuum'],
                estimatedMinutes: 90
            },
            {
                name: 'Ignition System (Coils/Plugs)',
                nameRo: 'Sistem aprindere (Bujii / Bobine uzate)',
                nameDe: 'Zündsystem (Spulen/Kerzen)',
                probability: 40,
                checkStep: 'Check spark plug gap and wear, inspect coils for carbon tracking.',
                checkStepRo: 'Verifică distanța electrodului la bujii și inspectează bobinele de crăpături.',
                checkStepDe: 'Zündkerzenabstand prüfen, Spulen auf Risse inspizieren.',
                technicalDetails: 'Worn out spark plugs increase resistance, overloading the coils and causing weak sparks.',
                technicalDetailsRo: 'Bujiile uzate au electrodul prea distanțat, ceea ce suprasolicită bobinele și scade intensitatea scânteii.',
                technicalDetailsDe: 'Verschlissene Zündkerzen erhöhen den Widerstand und überlasten die Spulen.',
                repairSteps: [
                    'Remove coils and inspect for oil in spark plug wells.',
                    'Remove and inspect spark plugs.',
                    'Replace all spark plugs (and coils if tracking is evident).',
                    'Clear misfire counters.'
                ],
                repairStepsRo: [
                    'Demontează bobinele și verifică dacă e ulei în locașul bujiilor.',
                    'Desfă bujiile cu cheia articulată.',
                    'Montare set nou de bujii de calitate și eventual bobine noi.',
                    'Șterge erorile.'
                ],
                repairStepsDe: [
                    'Spulen ausbauen und auf Öl in den Zündkerzenschächten prüfen.',
                    'Zündkerzen ausbauen und prüfen.',
                    'Alle Zündkerzen (und ggf. Spulen) ersetzen.',
                    'Fehlerzähler löschen.'
                ],
                partKeywords: ['bujie', 'bobina'],
                estimatedMinutes: 60
            }
        ]
    },
    {
        code: 'P0171',
        nameEn: 'System Too Lean (Bank 1)',
        nameRo: 'Amestec prea sărac (Banc 1)',
        nameDe: 'System zu mager (Bank 1)',
        causes: [
            {
                name: 'Mass Air Flow Sensor (MAF) Dirty/Faulty',
                nameRo: 'Debitmetru (MAF) murdar sau defect',
                nameDe: 'Luftmassenmesser (LMM) verschmutzt/defekt',
                probability: 50,
                checkStep: 'Graph MAF g/s at idle and WOT (wide open throttle).',
                checkStepRo: 'Grafic MAF în g/s la ralanti (aprox = litrajul motorului) și la accelerație (WOT).',
                checkStepDe: 'LMM-Werte (g/s) im Leerlauf und unter Volllast grafisch auswerten.',
                technicalDetails: 'A dirty MAF under-reports incoming air. The ECM adds less fuel, resulting in a physically lean condition.',
                technicalDetailsRo: 'Filamentul MAF acoperit de praf raportează mai puțin aer decât intră. ECU injectează mai puțin combustibil, sărăcind amestecul.',
                technicalDetailsDe: 'Ein verschmutzter LMM meldet weniger Luft als tatsächlich eintritt. Das Motorsteuergerät spritzt zu wenig Krafftstoff ein.',
                repairSteps: [
                    'Remove MAF sensor housing.',
                    'Spray MAF element with dedicated MAF cleaner (never carb cleaner).',
                    'Allow to air dry completely.',
                    'Reinstall and check fuel trims.'
                ],
                repairStepsRo: [
                    'Demontează mufa și senzorul debitmetrului.',
                    'Curăță filamentul EXCLUSIV cu spray special pentru debitmetre.',
                    'Lasă la uscat 10 minute la aer.',
                    'Resetează adaptările și probează mașina.'
                ],
                repairStepsDe: [
                    'LMM-Gehäuse ausbauen.',
                    'LMM-Element mit speziellem Reiniger besprühen.',
                    'Vollständig an der Luft trocknen lassen.',
                    'Wieder einbauen und Kraftstoff-Trimm prüfen.'
                ],
                partKeywords: ['debitmetru'],
                estimatedMinutes: 45
            },
            {
                name: 'Low Fuel Pressure',
                nameRo: 'Presiune scăzută combustibil',
                nameDe: 'Niedriger Kraftstoffdruck',
                probability: 30,
                checkStep: 'Connect manual fuel pressure gauge to the rail testing port.',
                checkStepRo: 'Atașează manometru mecanic pe supapa rampei de benzină.',
                checkStepDe: 'Mechanisches Manometer an das Kraftstoffverteilerrohr anschließen.',
                technicalDetails: 'A weak fuel pump or clogged fuel filter delivers insufficient fuel volume under load, leaning the mixture.',
                technicalDetailsRo: 'Filtrul colmatat sau o pompă obosită nu pot menține presiunea (~3.5/4 bar) la accelerație.',
                technicalDetailsDe: 'Ein schwacher Kraftstoffpumpe oder verstopfter Filter liefert unter Last nicht genug Kraftstoff.',
                repairSteps: [
                    'Check fuel pressure specifications.',
                    'Replace inline fuel filter if equipped.',
                    'If pressure is still low, access and replace fuel pump module in the tank.',
                    'Test drive to confirm fix.'
                ],
                repairStepsRo: [
                    'Verifică presiunea conform manualului.',
                    'Înlocuiește filtrul de benzină (sub mașină).',
                    'Dacă presiunea tot e mică, schimbă ansamblul pompei de benzină din rezervor.',
                    'Probează mașina.'
                ],
                repairStepsDe: [
                    'Kraftstoffdruckvorgaben prüfen.',
                    'Kraftstofffilter ersetzen (falls vorhanden).',
                    'Falls Druck immer noch niedrig, Kraftstoffpumpenmodul im Tank ersetzen.',
                    'Probefahrt durchführen.'
                ],
                partKeywords: ['pompa combustibil', 'filtru benzina'],
                estimatedMinutes: 120
            }
        ]
    },
    {
        code: 'P0101',
        nameEn: 'Mass or Volume Air Flow Circuit Range/Performance',
        nameRo: 'Debitmetru Aer (MAF) în afara intervalului/performanței',
        nameDe: 'Luftmassenmesser Bereichs-/Leistungsproblem',
        causes: [
            {
                name: 'Dirty or Faulty MAF Sensor',
                nameRo: 'Senzor MAF murdar sau defect',
                nameDe: 'LMM verschmutzt oder defekt',
                probability: 60,
                checkStep: 'Check MAF reading in livedata. At idle it should roughly match engine liters (e.g., 2.0L = 2.0 g/s).',
                checkStepRo: 'La ralanti, valoarea pe diagnoză (g/s) trebuie să fie aproximativ cât litrajul motorului (ex. 2.0 motor = 2-3 g/s).',
                checkStepDe: 'LMM-Werte in Livedaten prüfen. Sollte ungefähr dem Hubraum entsprechen.',
                technicalDetails: 'Dirt or oil on the hot wire insulates it, causing under-reporting of airflow.',
                technicalDetailsRo: 'Dacă o peliculă de ulei a ajuns pe filament (ex. de la un filtru sport K&N netratat corect), senzorul minte ECU-ul.',
                technicalDetailsDe: 'Verschmutzung oder Öl auf dem Hitzedraht isoliert ihn, was zu falschen Werten führt.',
                repairSteps: [
                    'Remove MAF sensor.',
                    'Clean thoroughly with MAF specialized cleaner ONLY.',
                    'Inspect air filter and housing for dirt bypass.',
                    'Clear codes and recheck live data.'
                ],
                repairStepsRo: [
                    'Demontează debitmetrul.',
                    'Folosește exclusiv spray de curățare MAF, lasă să se evapore.',
                    'Verifică capacul filtrului de aer să fie perfect etanș.',
                    'Citește noile valori.'
                ],
                repairStepsDe: [
                    'LMM ausbauen.',
                    'Mit speziellem LMM-Reiniger sorgfältig reinigen.',
                    'Luftfilter und Gehäuse auf Undichtigkeiten prüfen.',
                    'Fehler löschen und Live-Daten prüfen.'
                ],
                partKeywords: ['debitmetru', 'filtru aer'],
                estimatedMinutes: 30
            }
        ]
    },
    {
        code: 'P2002',
        nameEn: 'Diesel Particulate Filter Efficiency Below Threshold',
        nameRo: 'Eficiența Filtrului de Particule (DPF) sub prag',
        nameDe: 'Dieselpartikelfilter Wirkungsgrad unter Schwellenwert',
        causes: [
            {
                name: 'Clogged DPF',
                nameRo: 'DPF Colmatat (Cenușă/Soot ridicat)',
                nameDe: 'Verstopfter DPF',
                probability: 80,
                checkStep: 'Check DPF backpressure sensors parameter and soot/ash mass load in Grams.',
                checkStepRo: 'Diagnoză pe modulul motor (MVB): verifică presiunea diferențială (mbar) și masa de funingine calculată (g).',
                checkStepDe: 'Differenzdruck im Leerlauf prüfen und Ruß-/Aschebeladung in Gramm kontrollieren.',
                technicalDetails: 'The differential pressure sensor reads too high of a blockage threshold across the DPF element.',
                technicalDetailsRo: 'Senzorul G450 citește o presiune mare înainte de DPF și zero după, deducând o blocare peste 80% a fagurelui.',
                technicalDetailsDe: 'Der Differenzdrucksensor liest einen zu hohen Wert über das DPF-Element.',
                repairSteps: [
                    'If soot load is high but below safety threshold, attempt forced stationary regeneration via scan tool.',
                    'If overloaded with ash, remove DPF for physical chemical cleaning off-car.',
                    'Reset DPF ash counters if cleaned.'
                ],
                repairStepsRo: [
                    'Atenție la nivelul de ulei! (să nu fie contaminat).',
                    'Pornește regenerare forțată din tester dacă gradul de încărcare o permite.',
                    'Dacă fagurele e plin de cenușă aspră, trebuie demontat și trimis fizic la spălare chimică.',
                    'Resetează valorile de cenușă din modul Engine -> Adaptations -> DPF Replacement.'
                ],
                repairStepsDe: [
                    'Wenn die Rußbeladung unter der Sicherheitsgrenze liegt, stationäre Zwangsregeneration einleiten.',
                    'Wenn mit Asche überladen, DPF zur chemischen Reinigung ausbauen.',
                    'Aschezähler nach der Reinigung zurücksetzen.'
                ],
                partKeywords: ['filtru particule', 'senzor presiune dpf'],
                estimatedMinutes: 240
            }
        ]
    },
    {
        code: 'P0113',
        nameEn: 'Intake Air Temperature Sensor 1 Circuit High',
        nameRo: 'Circuit senzor temperatură aer admisie 1 prea mare',
        nameDe: 'Ansauglufttemperatursensor 1 Schaltkreis zu hoch',
        causes: [
            {
                name: 'IAT Sensor Unplugged or Open Circuit',
                nameRo: 'Senzor IAT deconectat / Cablaj întrerupt',
                nameDe: 'IAT-Sensor nicht angeschlossen oder Stromkreis offen',
                probability: 90,
                checkStep: 'Look at live data for IAT. If it reads -40°C or -40°F, it is completely open loop.',
                checkStepRo: 'Pune testerul. Dacă pe Live Data arată fix -40 grade C, înseamnă fir rupt sau mufă scoasă.',
                checkStepDe: 'Live-Daten für IAT prüfen. Wenn -40°C angezeigt wird, ist der Stromkreis unterbrochen.',
                technicalDetails: 'The thermistor resistance goes to infinity when the circuit breaks. The ECU interprets high resistance = -40°C.',
                technicalDetailsRo: 'Senzorul e NTC (Negative Temperature Coefficient). Fără curent (rezistență infinită), ECU interpretează temperatura ca fiind îngheț extrem.',
                technicalDetailsDe: 'Der Thermistor-Widerstand geht gegen Unendlich, was das ECU als -40°C interpretiert.',
                repairSteps: [
                    'Locate IAT sensor (often integrated into MAF sensor).',
                    'Check connector is fully seated.',
                    'Check for broken wires near the connector body.',
                    'Replace sensor if internal open is found.'
                ],
                repairStepsRo: [
                    'Identifică mufa senzorului de aer (de multe ori este 5-pini pe MAF sau pe galerie).',
                    'Trage de firele din mufa de plastic — adesea se forfecă exact la intrarea în pin.',
                    'Măsoară 5V pe mufa venind de la ECU pe contact.',
                    'Înlocuiește mufa/senzorul,.'
                ],
                repairStepsDe: [
                    'IAT-Sensor lokalisieren (oft im MAF integriert).',
                    'Steckerverbindung prüfen.',
                    'Kabelbruch am Stecker suchen.',
                    'Sensor austauschen, falls defekt.'
                ],
                partKeywords: ['senzor aer', 'mufa'],
                estimatedMinutes: 60
            }
        ]
    },
    {
        code: 'P0340',
        nameEn: 'Camshaft Position Sensor "A" Circuit Bank 1',
        nameRo: 'Circuit senzor ax cu came "A", Banc 1',
        nameDe: 'Nockenwellenpositionssensor "A" Stromkreis Bank 1',
        causes: [
            {
                name: 'Faulty Camshaft Sensor or Wiring',
                nameRo: 'Senzor Ax cu Came picat sau fir',
                nameDe: 'Nockenwellensensor oder Verkabelung defekt',
                probability: 75,
                checkStep: 'Check for +5V or +12V reference, ground, and scope the signal wire while cranking.',
                checkStepRo: 'Pune osciloscopul / multimetrul. Ai nevoie de +5/12V (contact), Masă (-), Semnal pulsat când dai la automat.',
                checkStepDe: 'Versorgungsspannung und Masse prüfen, Signal mit Oszilloskop messen.',
                technicalDetails: 'The Engine Computer is not receiving pulse signals from the Hall-Effect or Reluctor wheel on the camshaft.',
                technicalDetailsRo: 'ECU nu mai primește semnal de la cama de citire. Mașina fie pornește foarte greu (pe injecție secvențială forțată), fie nu pornește.',
                technicalDetailsDe: 'Das Motorsteuergerät empfängt kein Signal vom Sensor der Nockenwelle.',
                repairSteps: [
                    'Verify battery voltage is healthy (weak voltage drops during crank can cause this).',
                    'Inspect the three wires going to the CMP block.',
                    'Remove CMP sensor and install new OEM-quality sensor.',
                    'Clear errors and try starting.'
                ],
                repairStepsRo: [
                    'Dacă totul este curat pe cablaj, desface șurubul de 10mm/torx care ține senzorul pe corpul motorului.',
                    'Atenție la oringul de etanșare, unge cu puțin ulei.',
                    'Cumpără senzor DE ORIGINE (marching inlocuitori ieftini frecvent ratează pulsul).',
                    'Inlocuieste si sterge erorile.'
                ],
                repairStepsDe: [
                    'Batteriespannung prüfen (Startspannung).',
                    'Verkabelung zum Sensor prüfen.',
                    'Neuen OEM-Sensor einbauen.',
                    'Fehler löschen und starten.'
                ],
                partKeywords: ['senzor ax came'],
                estimatedMinutes: 90
            }
        ]
    },
    {
        code: 'P1300', // P03## / P1300 generally
        nameEn: 'Ignition Coil Circuit Fault',
        nameRo: 'Eroare circuit bobină inducție',
        nameDe: 'Zündspule-Stromkreisfehler',
        causes: [
            {
                name: 'Blown Coil Pack or Driver',
                nameRo: 'Bobină de inducție arsă',
                nameDe: 'Zündspule durchgebrannt',
                probability: 80,
                checkStep: 'Swap the suspected coil with a neighboring cylinder and see if the misfire/code follows the coil.',
                checkStepRo: 'Mută bobina de inducție suspectă pe cilindrul vecin (ex: schimbă bobina 2 cu 3) și vezi dacă eroarea se mută la citire Dtc.',
                checkStepDe: 'Verdächtige Zündspule mit Nachbarzylinder tauschen, prüfen ob der Fehler wandert.',
                technicalDetails: 'The primary circuit of the ignition coil has an extremely high resistance, indicating a broken internal winding.',
                technicalDetailsRo: 'Circuitul primar al bobinei s-a întrerupt. Fără ea, bujia aferentă nu primește deloc scânteie.',
                technicalDetailsDe: 'Die Primärwicklung der Zündspule ist gebrochen.',
                repairSteps: [
                    'Wait for engine to cool.',
                    'Unclip harness and extract the coil pack.',
                    'Replace the coil pack and firmly press it over the spark plug.',
                    'Check wiring to the coil connector.'
                ],
                repairStepsRo: [
                    'Se așteaptă răcirea parțială a motorului.',
                    'Se deconectează mufa bobinei, se extrage bobina din locașul ei.',
                    'Este bine ca atunci când cade o bobină, să verificăm și bujia (uzura ei mare distruge bobina).',
                    'Se aplică vaselină dielectrică pe manșonul noii bobine și se introduce.'
                ],
                repairStepsDe: [
                    'Motor abkühlen lassen.',
                    'Stecker abziehen und Spule ausbauen.',
                    'Neue Spule aufstecken.',
                    'Kabel prüfen.'
                ],
                partKeywords: ['bobina inductie'],
                estimatedMinutes: 30
            }
        ]
    }
];

export function getFastDtcDiagnostic(dtcCode: string) {
    const rawCode = dtcCode.toUpperCase().trim();
    const entry = COMMON_DTCS.find(c => c.code === rawCode);
    if (!entry) return null;

    const causes = entry.causes.map(c => {
        return {
            name: c.name,
            nameRo: c.nameRo,
            nameDe: c.nameDe,
            probability: c.probability,
            checkStep: c.checkStep,
            checkStepRo: c.checkStepRo,
            checkStepDe: c.checkStepDe,
            repairSteps: c.repairSteps,
            repairStepsRo: c.repairStepsRo,
            repairStepsDe: c.repairStepsDe,
            technicalDetails: c.technicalDetails,
            technicalDetailsRo: c.technicalDetailsRo,
            technicalDetailsDe: c.technicalDetailsDe,
            forumInsight: '',
            forumInsightRo: '',
            forumInsightDe: '',
            requiredToolsRo: [],
            requiredToolsDe: [],
            requiredTools: [], // Added
            componentLocationRo: '',
            componentLocationDe: '',
            componentLocation: '', // Added
            estimatedHoursMin: (c as any).estimatedMinutes ? (c as any).estimatedMinutes / 60 : 0,
            estimatedHoursMax: (c as any).estimatedMinutes ? ((c as any).estimatedMinutes + 30) / 60 : 0,
            partsRo: (c as any).partsRo || [],
            partsEn: (c as any).partsRo ? (c as any).partsRo.map((p: any) => ({ name: p.name, priceEur: Math.round(p.priceRon / 5), note: p.note })) : [],
            partsDe: (c as any).partsRo ? (c as any).partsRo.map((p: any) => ({ name: p.name, priceEur: Math.round(p.priceRon / 5), note: p.note })) : [],
            partKeywords: (c as any).partKeywords || [],
            estimatedMinutes: (c as any).estimatedMinutes || 0,
        };
    });

    const result: AIDiagnosticResult = {
        problemTitle: `Fault Code: ${entry.code}`,
        problemTitleRo: `Cod de eroare: ${entry.code}`,
        problemTitleDe: `Fehlercode: ${entry.code}`,
        confidence: 95,
        dtcCodes: [entry.code],
        symptoms: [],
        causes: causes
    };

    return result;
}
