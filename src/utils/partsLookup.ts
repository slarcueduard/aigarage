export interface ShopLink {
    /** Shop display name */
    shopName: string;
    /** Direct search URL */
    url: string;
    /** Brand color for the button */
    color: string;
    /** Background color for the button */
    bgColor: string;
}

export interface PartSuggestion {
    /** Display name in Romanian */
    name: string;
    /** Display name in English */
    nameEn: string;
    /** Display name in German */
    nameDe: string;
    /** Estimated low price in EUR */
    priceFrom: number;
    /** Estimated high price in EUR */
    priceTo: number;
    /** Category for icon display */
    category: 'engine' | 'brake' | 'suspension' | 'electric' | 'body' | 'cooling' | 'transmission' | 'exhaust' | 'sensor';
    /** Multiple shop links (2-3 options) */
    shopLinks: ShopLink[];
    /** The original keyword that matched */
    keyword: string;
}

// ── Market price ranges (EUR, common aftermarket brands) ────────
// These are curated from Romanian market data (2024-2025 prices)
interface PriceEntry {
    nameRo: string;
    nameEn: string;
    priceFrom: number;
    priceTo: number;
    nameDe: string;
    category: PartSuggestion['category'];
    /** Alternative keyword matches */
    aliases?: string[];
}

const PARTS_PRICES: Record<string, PriceEntry> = {
    // Engine / Turbo
    'turbo': { nameRo: 'Turbocompresor (reconditionat)', nameEn: 'Turbocharger (refurbished)', nameDe: 'Turbolader (überholt)', priceFrom: 250, priceTo: 800, category: 'engine' },
    'furtun turbo': { nameRo: 'Furtun turbo / intercooler', nameEn: 'Turbo / intercooler hose', nameDe: 'Turboladerschlauch', priceFrom: 15, priceTo: 80, category: 'engine' },
    'furtun intercooler': { nameRo: 'Furtun intercooler', nameEn: 'Intercooler hose', nameDe: 'Ladeluftschlauch', priceFrom: 20, priceTo: 90, category: 'engine' },
    'intercooler': { nameRo: 'Intercooler', nameEn: 'Intercooler', nameDe: 'Ladeluftkühler', priceFrom: 80, priceTo: 250, category: 'engine' },
    'wastegate': { nameRo: 'Supapă wastegate', nameEn: 'Wastegate valve', nameDe: 'Wastegate-Ventil', priceFrom: 30, priceTo: 150, category: 'engine' },
    'supapa turbo': { nameRo: 'Supapă turbo / BOV', nameEn: 'Turbo valve / BOV', nameDe: 'Turboventil', priceFrom: 25, priceTo: 120, category: 'engine' },

    // Ignition
    'bujie': { nameRo: 'Set bujii (4 buc)', nameEn: 'Spark plug set (4 pcs)', nameDe: 'Zündkerzen-Set (4 Stk.)', priceFrom: 15, priceTo: 60, category: 'engine', aliases: ['bujii'] },
    'bobina': { nameRo: 'Bobină de inducție', nameEn: 'Ignition coil', nameDe: 'Zündspule', priceFrom: 15, priceTo: 80, category: 'engine', aliases: ['bobina inductie', 'coil pack'] },

    // Fuel / Injection
    'injector': { nameRo: 'Injector', nameEn: 'Fuel injector', nameDe: 'Einspritzdüse', priceFrom: 40, priceTo: 200, category: 'engine' },
    'pompa injectie': { nameRo: 'Pompă injecție', nameEn: 'Injection pump', nameDe: 'Einspritzpumpe', priceFrom: 200, priceTo: 800, category: 'engine' },
    'rampa injectie': { nameRo: 'Rampă injecție / Rail', nameEn: 'Fuel rail', nameDe: 'Kraftstoff-Rail', priceFrom: 80, priceTo: 300, category: 'engine' },
    'regulator presiune': { nameRo: 'Regulator presiune combustibil', nameEn: 'Fuel pressure regulator', nameDe: 'Kraftstoffdruckregler', priceFrom: 20, priceTo: 100, category: 'engine' },
    'pompa combustibil': { nameRo: 'Pompă combustibil', nameEn: 'Fuel pump', nameDe: 'Kraftstoffpumpe', priceFrom: 40, priceTo: 200, category: 'engine' },

    // Sensors
    'sondă lambda': { nameRo: 'Sondă lambda', nameEn: 'Lambda / O2 sensor', nameDe: 'Lambdasonde', priceFrom: 25, priceTo: 120, category: 'sensor', aliases: ['sonda lambda', 'senzor oxigen'] },
    'debitmetru': { nameRo: 'Debitmetru aer (MAF)', nameEn: 'Mass air flow sensor', nameDe: 'Luftmassenmesser', priceFrom: 30, priceTo: 150, category: 'sensor', aliases: ['maf', 'senzor aer'] },
    'senzor arbore': { nameRo: 'Senzor arbore cotit', nameEn: 'Crankshaft position sensor', nameDe: 'Kurbelwellensensor', priceFrom: 15, priceTo: 60, category: 'sensor' },
    'senzor turatie': { nameRo: 'Senzor turație', nameEn: 'RPM sensor', nameDe: 'Drehzahlsensor', priceFrom: 15, priceTo: 50, category: 'sensor' },
    'senzor ABS': { nameRo: 'Senzor ABS / viteză roată', nameEn: 'ABS / wheel speed sensor', nameDe: 'ABS-Sensor', priceFrom: 10, priceTo: 50, category: 'sensor', aliases: ['senzor viteza'] },
    'senzor nox': { nameRo: 'Senzor NOx', nameEn: 'NOx sensor', nameDe: 'NOx-Sensor', priceFrom: 80, priceTo: 350, category: 'sensor' },
    'senzor presiune dpf': { nameRo: 'Senzor presiune diferențială DPF', nameEn: 'DPF differential pressure sensor', nameDe: 'Differenzdrucksensor DPF', priceFrom: 25, priceTo: 100, category: 'sensor' },

    // EGR / DPF / Exhaust
    'egr': { nameRo: 'Supapă EGR', nameEn: 'EGR valve', nameDe: 'Abgasrückführungsventil', priceFrom: 40, priceTo: 200, category: 'exhaust', aliases: ['valva egr'] },
    'filtru particule': { nameRo: 'Filtru de particule (DPF)', nameEn: 'Diesel particulate filter (DPF)', nameDe: 'Dieselpartikelfilter', priceFrom: 200, priceTo: 900, category: 'exhaust', aliases: ['dpf', 'fap'] },
    'catalizator': { nameRo: 'Catalizator', nameEn: 'Catalytic converter', nameDe: 'Katalysator', priceFrom: 100, priceTo: 500, category: 'exhaust' },

    // Timing
    'kit distributie': { nameRo: 'Kit distribuție complet', nameEn: 'Timing chain/belt kit', nameDe: 'Zahnriemensatz / Steuerkettensatz', priceFrom: 80, priceTo: 400, category: 'engine', aliases: ['lant distributie', 'curea distributie'] },

    // Cooling
    'termostat': { nameRo: 'Termostat', nameEn: 'Thermostat', nameDe: 'Thermostat', priceFrom: 10, priceTo: 50, category: 'cooling' },
    'pompa apa': { nameRo: 'Pompă apă', nameEn: 'Water pump', nameDe: 'Wasserpumpe', priceFrom: 20, priceTo: 100, category: 'cooling' },
    'radiator': { nameRo: 'Radiator', nameEn: 'Radiator', nameDe: 'Radiator', priceFrom: 50, priceTo: 250, category: 'cooling' },
    'ventilator racire': { nameRo: 'Ventilator răcire', nameEn: 'Cooling fan', nameDe: 'Kühlerlüfter', priceFrom: 30, priceTo: 200, category: 'cooling' },

    // Suspension
    'amortizor': { nameRo: 'Amortizor (bucată)', nameEn: 'Shock absorber (each)', nameDe: 'Stoßdämpfer', priceFrom: 25, priceTo: 120, category: 'suspension' },
    'arc': { nameRo: 'Arc spirală', nameEn: 'Coil spring', nameDe: 'Fahrwerksfeder', priceFrom: 15, priceTo: 60, category: 'suspension', aliases: ['arc spirala'] },
    'bucsa brat': { nameRo: 'Bucșă braț suspensie', nameEn: 'Control arm bushing', nameDe: 'Querlenkerbuchse', priceFrom: 8, priceTo: 35, category: 'suspension', aliases: ['bucsa', 'silent bloc', 'silentbloc'] },
    'bieleta': { nameRo: 'Bieleta antiruliu', nameEn: 'Sway bar link', nameDe: 'Koppelstange', priceFrom: 8, priceTo: 30, category: 'suspension', aliases: ['bieleta antiruliu'] },
    'bascula': { nameRo: 'Bascuală / braț suspensie', nameEn: 'Control arm', nameDe: 'Querlenker', priceFrom: 30, priceTo: 150, category: 'suspension', aliases: ['brat suspensie'] },
    'pivot': { nameRo: 'Pivot / articulație sferică', nameEn: 'Ball joint', nameDe: 'Traggelenk', priceFrom: 10, priceTo: 50, category: 'suspension' },
    'perna aer': { nameRo: 'Pernă de aer (Airmatic)', nameEn: 'Air spring / Air bag', nameDe: 'Luftfeder', priceFrom: 80, priceTo: 400, category: 'suspension', aliases: ['air spring'] },
    'compresor aer': { nameRo: 'Compresor suspensie aer', nameEn: 'Air suspension compressor', nameDe: 'Luftfederungskompressor', priceFrom: 100, priceTo: 500, category: 'suspension', aliases: ['releu suspensie'] },
    'furtun suspensie aer': { nameRo: 'Furtun suspensie aer / perna', nameEn: 'Air suspension hose / line', nameDe: 'Luftfederschlauch', priceFrom: 15, priceTo: 60, category: 'suspension', aliases: ['air suspension hose'] },
    'amortizor directie': { nameRo: 'Amortizor direcție', nameEn: 'Steering damper', nameDe: 'Lenkungsdämpfer', priceFrom: 20, priceTo: 80, category: 'suspension' },
    'bara panhard': { nameRo: 'Bară panhard', nameEn: 'Track bar', nameDe: 'Panhardstab', priceFrom: 30, priceTo: 100, category: 'suspension' },

    // Steering
    'geometrie': { nameRo: 'Geometrie roți (serviciu)', nameEn: 'Wheel alignment (service)', nameDe: 'Achsvermessung', priceFrom: 20, priceTo: 50, category: 'suspension' },
    'pompa servo': { nameRo: 'Pompă servodirecție', nameEn: 'Power steering pump', nameDe: 'Servopumpe', priceFrom: 40, priceTo: 200, category: 'suspension', aliases: ['lichid servodirectie'] },
    'cap de bara': { nameRo: 'Cap de bară', nameEn: 'Tie rod end', nameDe: 'Spurstangenkopf', priceFrom: 8, priceTo: 40, category: 'suspension', aliases: ['bieleta directie'] },

    // Brakes
    'placute frana': { nameRo: 'Set plăcuțe frână (axă)', nameEn: 'Brake pad set (per axle)', nameDe: 'Bremsbelagsatz', priceFrom: 15, priceTo: 60, category: 'brake', aliases: ['placute'] },
    'disc frana': { nameRo: 'Disc frână (bucată)', nameEn: 'Brake disc (each)', nameDe: 'Bremsscheibe', priceFrom: 15, priceTo: 80, category: 'brake', aliases: ['disc uzat', 'discuri frana'] },
    'etrier': { nameRo: 'Etrier frână', nameEn: 'Brake caliper', nameDe: 'Bremssattel', priceFrom: 40, priceTo: 200, category: 'brake' },
    'lichid frana': { nameRo: 'Lichid frână DOT4 (1L)', nameEn: 'Brake fluid DOT4 (1L)', nameDe: 'Bremsflüssigkeit', priceFrom: 5, priceTo: 15, category: 'brake' },

    // Transmission
    'ambreiaj': { nameRo: 'Kit ambreiaj', nameEn: 'Clutch kit', nameDe: 'Kupplungssatz', priceFrom: 80, priceTo: 350, category: 'transmission', aliases: ['disc ambreiaj', 'placa presiune'] },
    'volanta': { nameRo: 'Volantă masă dublă', nameEn: 'Dual-mass flywheel', nameDe: 'Zweimassenschwungrad', priceFrom: 150, priceTo: 600, category: 'transmission' },
    'mecatronic': { nameRo: 'Unitate mecatronică', nameEn: 'Mechatronic unit', nameDe: 'Mechatronik', priceFrom: 300, priceTo: 1200, category: 'transmission', aliases: ['solenoid cutie'] },
    'ulei cutie automat': { nameRo: 'Ulei cutie automată (6L)', nameEn: 'Automatic transmission fluid (6L)', nameDe: 'Automatikgetriebeöl', priceFrom: 30, priceTo: 80, category: 'transmission' },
    'sincron': { nameRo: 'Sincron / inel sincronizare', nameEn: 'Synchronizer ring', nameDe: 'Synchronring', priceFrom: 20, priceTo: 80, category: 'transmission', aliases: ['pinioane cutie'] },

    // Electrical / Body
    'macara': { nameRo: 'Macara geam electric', nameEn: 'Window regulator', nameDe: 'Fensterheber', priceFrom: 20, priceTo: 80, category: 'electric' },
    'baterie': { nameRo: 'Acumulator / Baterie auto', nameEn: 'Car battery', nameDe: 'Autobatterie', priceFrom: 50, priceTo: 200, category: 'electric', aliases: ['acumulator'] },
    'alternator': { nameRo: 'Alternator', nameEn: 'Alternator', nameDe: 'Lichtmaschine', priceFrom: 60, priceTo: 300, category: 'electric' },
    'electromotor': { nameRo: 'Electromotor / Demaror', nameEn: 'Starter motor', nameDe: 'Anlasser', priceFrom: 40, priceTo: 200, category: 'electric', aliases: ['starter', 'demaror'] },

    // AdBlue / SCR
    'doser adblue': { nameRo: 'Injector AdBlue / Dozer', nameEn: 'AdBlue injector / Doser', nameDe: 'AdBlue-Düse', priceFrom: 40, priceTo: 200, category: 'exhaust', aliases: ['doser'] },
    'pompa adblue': { nameRo: 'Pompă AdBlue', nameEn: 'AdBlue pump', nameDe: 'AdBlue-Pumpe', priceFrom: 80, priceTo: 400, category: 'exhaust' },

    // TPMS
    'senzor tpms': { nameRo: 'Senzor presiune pneu (TPMS)', nameEn: 'TPMS sensor', nameDe: 'Reifendrucksensor', priceFrom: 15, priceTo: 60, category: 'sensor', aliases: ['senzor presiune'] },

    // AC
    'compresor clima': { nameRo: 'Compresor AC / Climatizare', nameEn: 'AC compressor', nameDe: 'Klimakompressor', priceFrom: 100, priceTo: 400, category: 'cooling' },
    'freon': { nameRo: 'Încărcare freon R134a (serviciu)', nameEn: 'R134a recharge (service)', nameDe: 'Klimaservice / Kältemittel', priceFrom: 20, priceTo: 60, category: 'cooling' },

    // Door / Body
    'limitator usa': { nameRo: 'Limitator ușă (door check)', nameEn: 'Door check strap / limiter', nameDe: 'Türfeststeller', priceFrom: 8, priceTo: 40, category: 'body', aliases: ['door check', 'door limiter', 'opritoare usa'] },
    'balamale usa': { nameRo: 'Set balamale ușă', nameEn: 'Door hinge set', nameDe: 'Türscharnier-Set', priceFrom: 15, priceTo: 80, category: 'body', aliases: ['hinge', 'bolturi balamale'] },
    'broasca usa': { nameRo: 'Broască / încuietoare ușă', nameEn: 'Door lock / latch assembly', nameDe: 'Türschloss', priceFrom: 25, priceTo: 120, category: 'body', aliases: ['cleste usa', 'striker', 'incuietoare usa'] },
    'actuator usa': { nameRo: 'Actuator încuietoare ușă', nameEn: 'Door lock actuator', nameDe: 'Türschloss-Stellmotor', priceFrom: 15, priceTo: 60, category: 'electric', aliases: ['motor incuietoare', 'centralizata'] },
    'cablaj usa': { nameRo: 'Cablaj ușă / mufă conector', nameEn: 'Door wiring harness', nameDe: 'Tür-Kabelbaum', priceFrom: 20, priceTo: 80, category: 'electric', aliases: ['conector usa', 'fisa usa'] },

    // Trunk
    'amortizor haion': { nameRo: 'Amortizor haion / portbagaj (pereche)', nameEn: 'Tailgate gas strut (pair)', nameDe: 'Gasfeder Heckklappe', priceFrom: 10, priceTo: 50, category: 'body', aliases: ['telescop portbagaj', 'gas strut'] },
    'broasca portbagaj': { nameRo: 'Broască portbagaj / haion', nameEn: 'Trunk latch / lock', nameDe: 'Heckklappenschloss', priceFrom: 20, priceTo: 80, category: 'body', aliases: ['actuator portbagaj', 'incuietoare'] },

    // Window
    'buton geam': { nameRo: 'Buton / comutator geam electric', nameEn: 'Window switch / control', nameDe: 'Fensterschalter', priceFrom: 8, priceTo: 40, category: 'electric', aliases: ['comutator geam'] },
    'motor geam': { nameRo: 'Motor geam electric', nameEn: 'Window motor', nameDe: 'Fensterhebermotor', priceFrom: 20, priceTo: 80, category: 'electric', aliases: ['motor macara'] },

    // Seat
    'motor scaun': { nameRo: 'Motor reglaj scaun', nameEn: 'Seat adjustment motor', nameDe: 'Sitzverstellmotor', priceFrom: 25, priceTo: 120, category: 'electric', aliases: ['motor reglaj'] },
    'element incalzire': { nameRo: 'Element încălzire scaun', nameEn: 'Seat heating pad', nameDe: 'Sitzheizungselement', priceFrom: 15, priceTo: 60, category: 'electric', aliases: ['incalzire scaun'] },
    'sina scaun': { nameRo: 'Șină / glisieră scaun', nameEn: 'Seat rail / slider', nameDe: 'Sitzschiene', priceFrom: 20, priceTo: 80, category: 'body', aliases: ['mecanism scaun'] },
};

export type PartsRegion = 'ro' | 'eu' | 'uk' | 'us';

interface ShopConfig {
    name: string;
    color: string;
    bgColor: string;
    buildUrl: (query: string) => string;
}

const SHOPS: Record<PartsRegion, ShopConfig[]> = {
    ro: [
        { name: 'eMAG', color: '#FFFFFF', bgColor: '#CC0000', buildUrl: (q) => `https://www.emag.ro/search/${encodeURIComponent(q)}` },
        { name: 'ePiesa', color: '#FFFFFF', bgColor: '#E65100', buildUrl: (q) => `https://www.epiesa.ro/cautare-piesa/?find=${encodeURIComponent(q)}` },
        { name: 'Google', color: '#FFFFFF', bgColor: '#1565C0', buildUrl: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + ' piese auto')}` },
    ],
    eu: [
        { name: 'Autodoc', color: '#FFFFFF', bgColor: '#FF5C00', buildUrl: (q) => `https://www.autodoc.de/search?keyword=${encodeURIComponent(q)}` },
        { name: 'Amazon', color: '#000000', bgColor: '#FF9900', buildUrl: (q) => `https://www.amazon.de/s?k=${encodeURIComponent(q + ' auto parts')}` },
        { name: 'eBay', color: '#FFFFFF', bgColor: '#E53238', buildUrl: (q) => `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(q + ' auto')}` },
        { name: 'Google', color: '#FFFFFF', bgColor: '#1565C0', buildUrl: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + ' auto parts')}` },
    ],
    uk: [
        { name: 'Euro Car Parts', color: '#FFFFFF', bgColor: '#0033A0', buildUrl: (q) => `https://www.eurocarparts.com/search/${encodeURIComponent(q)}` },
        { name: 'Amazon UK', color: '#000000', bgColor: '#FF9900', buildUrl: (q) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q + ' car parts')}` },
        { name: 'Google', color: '#FFFFFF', bgColor: '#1565C0', buildUrl: (q) => `https://www.google.co.uk/search?tbm=shop&q=${encodeURIComponent(q + ' car parts')}` },
    ],
    us: [
        { name: 'RockAuto', color: '#FFFFFF', bgColor: '#0033A0', buildUrl: (q) => `https://www.rockauto.com/en/partsearch/?partnum=${encodeURIComponent(q)}` },
        { name: 'Amazon US', color: '#000000', bgColor: '#FF9900', buildUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q + ' auto parts')}` },
        { name: 'Google', color: '#FFFFFF', bgColor: '#1565C0', buildUrl: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q + ' auto parts')}` },
    ]
};
// Replaced above

/**
 * Generate shop links for a part
 */
export function generateShopLinks(
    _partNameEn: string, 
    partNameRo: string, 
    v: { brand?: string, model?: string, year?: string, vin?: string }, 
    region: PartsRegion = 'eu'
): ShopLink[] {
    const shops = SHOPS[region] || SHOPS['eu'];
    return shops.map(shop => {
        const baseName = region === 'ro' ? partNameRo : region === 'eu' ? _partNameEn || partNameRo : _partNameEn;
        
        // Build precision query: VIN/EngineCode > Brand+Model+Year > Brand
        let context = '';
        if (v.vin) {
            context = v.vin; // Serial number / Engine code is the most precise
        } else {
            context = `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim();
        }

        const query = `${baseName} ${context}`.trim();
        
        return {
            shopName: shop.name,
            url: shop.buildUrl(query),
            color: shop.color,
            bgColor: shop.bgColor,
        };
    });
}

/**
 * Normalise for matching
 */
function norm(s: string): string {
    return s.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Given a list of partKeywords from a diagnostic cause,
 * return matching parts with prices and shop links.
 */
export function getPartSuggestions(
    partKeywords: string[],
    v: { brand?: string, model?: string, year?: string, vin?: string },
    region?: PartsRegion,
): PartSuggestion[] {
    const results: PartSuggestion[] = [];
    const seen = new Set<string>();

    for (const keyword of partKeywords) {
        const kNorm = norm(keyword);
        if (!kNorm) continue;

        for (const [key, entry] of Object.entries(PARTS_PRICES)) {
            const keyNorm = norm(key);
            const nameEnNorm = norm(entry.nameEn);
            const nameDeNorm = norm(entry.nameDe);
            const aliases = (entry.aliases ?? []).map(norm);

            const targets = [keyNorm, nameEnNorm, nameDeNorm, ...aliases];
            
            // Refined matching:
            // 1. Exact match is always good
            // 2. Multi-word inclusion is usually good
            // 3. Single-word match ONLY if it's a whole word and NOT a generic term
            const isMatch = targets.some(t => {
                if (!t) return false;
                if (t === kNorm) return true;
                
                const tWords = t.split(/\s+/);
                const kWords = kNorm.split(/\s+/);

                // Multi-word sub-match (e.g. "air suspension" in "air suspension compressor")
                if (kWords.length >= 2 && t.includes(kNorm)) return true;
                if (tWords.length >= 2 && kNorm.includes(t)) return true;

                // Single word whole-word match
                if (kWords.length === 1) {
                    const isWholeWord = tWords.includes(kNorm);
                    if (isWholeWord) {
                        // Block generic terms from matching specific long names
                        // We don't want "sensor" to match "O2 sensor" unless the user specifically wants sensors
                        const generic = ['senzor', 'sensor', 'pompa', 'pump', 'furtun', 'hose', 'set', 'kit', 'valva', 'valve', 'aer', 'air'];
                        if (generic.includes(kNorm)) {
                             return t === kNorm; // Only match if the target IS also that generic word
                        }
                        return true;
                    }
                }
                return false;
            });

            if (isMatch && !seen.has(keyNorm)) {
                seen.add(keyNorm);
                results.push({
                    name: entry.nameRo,
                    nameEn: entry.nameEn,
                    nameDe: entry.nameDe,
                    priceFrom: entry.priceFrom,
                    priceTo: entry.priceTo,
                    category: entry.category,
                    shopLinks: generateShopLinks(entry.nameEn, entry.nameRo, v, region),
                    keyword: key,
                });
            }
        }
    }

    return results;
}
