/**
 * airports.js — Centralised global airport dataset.
 *
 * Format: CityName(IATA)
 * Example: Frankfurt(FRA), Doha(DOH), Entebbe/Kampala(EBB)
 *
 * Every entry uses { label, value } with the SAME string so the submitted
 * value is always identical to what the user sees in the dropdown.
 *
 * Alphabetically sorted.  No duplicates.
 */

export const airports = [
    { label: "Abidjan(ABJ)", value: "Abidjan(ABJ)" },
    { label: "Abu Dhabi(AUH)", value: "Abu Dhabi(AUH)" },
    { label: "Abuja(ABV)", value: "Abuja(ABV)" },
    { label: "Accra(ACC)", value: "Accra(ACC)" },
    { label: "Addis Ababa(ADD)", value: "Addis Ababa(ADD)" },
    { label: "Adelaide(ADL)", value: "Adelaide(ADL)" },
    { label: "Algiers(ALG)", value: "Algiers(ALG)" },
    { label: "Amman(AMM)", value: "Amman(AMM)" },
    { label: "Amsterdam(AMS)", value: "Amsterdam(AMS)" },
    { label: "Anchorage(ANC)", value: "Anchorage(ANC)" },
    { label: "Ankara(ESB)", value: "Ankara(ESB)" },
    { label: "Antalya(AYT)", value: "Antalya(AYT)" },
    { label: "Antananarivo(TNR)", value: "Antananarivo(TNR)" },
    { label: "Asmara(ASM)", value: "Asmara(ASM)" },
    { label: "Athens(ATH)", value: "Athens(ATH)" },
    { label: "Atlanta(ATL)", value: "Atlanta(ATL)" },
    { label: "Auckland(AKL)", value: "Auckland(AKL)" },
    { label: "Austin(AUS)", value: "Austin(AUS)" },
    { label: "Baghdad(BGW)", value: "Baghdad(BGW)" },
    { label: "Bahrain(BAH)", value: "Bahrain(BAH)" },
    { label: "Baku(GYD)", value: "Baku(GYD)" },
    { label: "Bamako(BKO)", value: "Bamako(BKO)" },
    { label: "Bangalore(BLR)", value: "Bangalore(BLR)" },
    { label: "Bangkok(BKK)", value: "Bangkok(BKK)" },
    { label: "Barcelona(BCN)", value: "Barcelona(BCN)" },
    { label: "Basel/Mulhouse(BSL)", value: "Basel/Mulhouse(BSL)" },
    { label: "Beijing(PEK)", value: "Beijing(PEK)" },
    { label: "Beirut(BEY)", value: "Beirut(BEY)" },
    { label: "Belgrade(BEG)", value: "Belgrade(BEG)" },
    { label: "Bergen(BGO)", value: "Bergen(BGO)" },
    { label: "Berlin(BER)", value: "Berlin(BER)" },
    { label: "Bern(BRN)", value: "Bern(BRN)" },
    { label: "Birmingham(BHX)", value: "Birmingham(BHX)" },
    { label: "Bogotá(BOG)", value: "Bogotá(BOG)" },
    { label: "Bologna(BLQ)", value: "Bologna(BLQ)" },
    { label: "Bordeaux(BOD)", value: "Bordeaux(BOD)" },
    { label: "Boston(BOS)", value: "Boston(BOS)" },
    { label: "Brasilia(BSB)", value: "Brasilia(BSB)" },
    { label: "Bratislava(BTS)", value: "Bratislava(BTS)" },
    { label: "Bremen(BRE)", value: "Bremen(BRE)" },
    { label: "Brisbane(BNE)", value: "Brisbane(BNE)" },
    { label: "Brussels(BRU)", value: "Brussels(BRU)" },
    { label: "Bucharest(OTP)", value: "Bucharest(OTP)" },
    { label: "Budapest(BUD)", value: "Budapest(BUD)" },
    { label: "Buenos Aires(EZE)", value: "Buenos Aires(EZE)" },
    { label: "Bujumbura(BJM)", value: "Bujumbura(BJM)" },
    { label: "Cairo(CAI)", value: "Cairo(CAI)" },
    { label: "Calgary(YYC)", value: "Calgary(YYC)" },
    { label: "Cancún(CUN)", value: "Cancún(CUN)" },
    { label: "Cape Town(CPT)", value: "Cape Town(CPT)" },
    { label: "Casablanca(CMN)", value: "Casablanca(CMN)" },
    { label: "Charlotte(CLT)", value: "Charlotte(CLT)" },
    { label: "Chennai(MAA)", value: "Chennai(MAA)" },
    { label: "Chicago(ORD)", value: "Chicago(ORD)" },
    { label: "Colombo(CMB)", value: "Colombo(CMB)" },
    { label: "Copenhagen(CPH)", value: "Copenhagen(CPH)" },
    { label: "Dakar(DSS)", value: "Dakar(DSS)" },
    { label: "Dallas/Fort Worth(DFW)", value: "Dallas/Fort Worth(DFW)" },
    { label: "Dar es Salaam(DAR)", value: "Dar es Salaam(DAR)" },
    { label: "Delhi(DEL)", value: "Delhi(DEL)" },
    { label: "Denver(DEN)", value: "Denver(DEN)" },
    { label: "Detroit(DTW)", value: "Detroit(DTW)" },
    { label: "Dhaka(DAC)", value: "Dhaka(DAC)" },
    { label: "Dire Dawa(DIR)", value: "Dire Dawa(DIR)" },
    { label: "Djibouti(JIB)", value: "Djibouti(JIB)" },
    { label: "Doha(DOH)", value: "Doha(DOH)" },
    { label: "Dortmund(DTM)", value: "Dortmund(DTM)" },
    { label: "Dresden(DRS)", value: "Dresden(DRS)" },
    { label: "Dubai(DXB)", value: "Dubai(DXB)" },
    { label: "Dublin(DUB)", value: "Dublin(DUB)" },
    { label: "Düsseldorf(DUS)", value: "Düsseldorf(DUS)" },
    { label: "Edinburgh(EDI)", value: "Edinburgh(EDI)" },
    { label: "Entebbe/Kampala(EBB)", value: "Entebbe/Kampala(EBB)" },
    { label: "Erbil(EBL)", value: "Erbil(EBL)" },
    { label: "Erfurt(ERF)", value: "Erfurt(ERF)" },
    { label: "Florence(FLR)", value: "Florence(FLR)" },
    { label: "Frankfurt(FRA)", value: "Frankfurt(FRA)" },
    { label: "Frankfurt-Hahn(HHN)", value: "Frankfurt-Hahn(HHN)" },
    { label: "Friedrichshafen(FDH)", value: "Friedrichshafen(FDH)" },
    { label: "Geneva(GVA)", value: "Geneva(GVA)" },
    { label: "Gothenburg(GOT)", value: "Gothenburg(GOT)" },
    { label: "Graz(GRZ)", value: "Graz(GRZ)" },
    { label: "Guangzhou(CAN)", value: "Guangzhou(CAN)" },
    { label: "Hamburg(HAM)", value: "Hamburg(HAM)" },
    { label: "Hanover(HAJ)", value: "Hanover(HAJ)" },
    { label: "Harare(HRE)", value: "Harare(HRE)" },
    { label: "Hargeisa(HGA)", value: "Hargeisa(HGA)" },
    { label: "Havana(HAV)", value: "Havana(HAV)" },
    { label: "Helsinki(HEL)", value: "Helsinki(HEL)" },
    { label: "Ho Chi Minh City(SGN)", value: "Ho Chi Minh City(SGN)" },
    { label: "Hong Kong(HKG)", value: "Hong Kong(HKG)" },
    { label: "Honolulu(HNL)", value: "Honolulu(HNL)" },
    { label: "Houston(IAH)", value: "Houston(IAH)" },
    { label: "Hyderabad(HYD)", value: "Hyderabad(HYD)" },
    { label: "Innsbruck(INN)", value: "Innsbruck(INN)" },
    { label: "Islamabad(ISB)", value: "Islamabad(ISB)" },
    { label: "Istanbul(IST)", value: "Istanbul(IST)" },
    { label: "Izmir(ADB)", value: "Izmir(ADB)" },
    { label: "Jakarta(CGK)", value: "Jakarta(CGK)" },
    { label: "Jeddah(JED)", value: "Jeddah(JED)" },
    { label: "Jimma(JIM)", value: "Jimma(JIM)" },
    { label: "Johannesburg(JNB)", value: "Johannesburg(JNB)" },
    { label: "Karachi(KHI)", value: "Karachi(KHI)" },
    { label: "Karlsruhe/Baden-Baden(FKB)", value: "Karlsruhe/Baden-Baden(FKB)" },
    { label: "Kathmandu(KTM)", value: "Kathmandu(KTM)" },
    { label: "Khartoum(KRT)", value: "Khartoum(KRT)" },
    { label: "Kigali(KGL)", value: "Kigali(KGL)" },
    { label: "Kilimanjaro(JRO)", value: "Kilimanjaro(JRO)" },
    { label: "Kinshasa(FIH)", value: "Kinshasa(FIH)" },
    { label: "Klagenfurt(KLU)", value: "Klagenfurt(KLU)" },
    { label: "Kobe(UKB)", value: "Kobe(UKB)" },
    { label: "Kolkata(CCU)", value: "Kolkata(CCU)" },
    { label: "Kuala Lumpur(KUL)", value: "Kuala Lumpur(KUL)" },
    { label: "Kuwait City(KWI)", value: "Kuwait City(KWI)" },
    { label: "Lagos(LOS)", value: "Lagos(LOS)" },
    { label: "Lahore(LHE)", value: "Lahore(LHE)" },
    { label: "Las Vegas(LAS)", value: "Las Vegas(LAS)" },
    { label: "Leipzig/Halle(LEJ)", value: "Leipzig/Halle(LEJ)" },
    { label: "Lilongwe(LLW)", value: "Lilongwe(LLW)" },
    { label: "Lima(LIM)", value: "Lima(LIM)" },
    { label: "Linz(LNZ)", value: "Linz(LNZ)" },
    { label: "Lisbon(LIS)", value: "Lisbon(LIS)" },
    { label: "Lomé(LFW)", value: "Lomé(LFW)" },
    { label: "London Gatwick(LGW)", value: "London Gatwick(LGW)" },
    { label: "London Heathrow(LHR)", value: "London Heathrow(LHR)" },
    { label: "London Luton(LTN)", value: "London Luton(LTN)" },
    { label: "London Stansted(STN)", value: "London Stansted(STN)" },
    { label: "Los Angeles(LAX)", value: "Los Angeles(LAX)" },
    { label: "Luanda(LAD)", value: "Luanda(LAD)" },
    { label: "Lusaka(LUN)", value: "Lusaka(LUN)" },
    { label: "Luxembourg(LUX)", value: "Luxembourg(LUX)" },
    { label: "Lyon(LYS)", value: "Lyon(LYS)" },
    { label: "Madrid(MAD)", value: "Madrid(MAD)" },
    { label: "Malaga(AGP)", value: "Malaga(AGP)" },
    { label: "Malé(MLE)", value: "Malé(MLE)" },
    { label: "Manchester(MAN)", value: "Manchester(MAN)" },
    { label: "Manila(MNL)", value: "Manila(MNL)" },
    { label: "Maputo(MPM)", value: "Maputo(MPM)" },
    { label: "Marrakech(RAK)", value: "Marrakech(RAK)" },
    { label: "Marseille(MRS)", value: "Marseille(MRS)" },
    { label: "Mauritius(MRU)", value: "Mauritius(MRU)" },
    { label: "Medina(MED)", value: "Medina(MED)" },
    { label: "Mekelle(MQX)", value: "Mekelle(MQX)" },
    { label: "Melbourne(MEL)", value: "Melbourne(MEL)" },
    { label: "Memmingen(FMM)", value: "Memmingen(FMM)" },
    { label: "Mexico City(MEX)", value: "Mexico City(MEX)" },
    { label: "Miami(MIA)", value: "Miami(MIA)" },
    { label: "Milan Linate(LIN)", value: "Milan Linate(LIN)" },
    { label: "Milan Malpensa(MXP)", value: "Milan Malpensa(MXP)" },
    { label: "Minneapolis(MSP)", value: "Minneapolis(MSP)" },
    { label: "Mogadishu(MGQ)", value: "Mogadishu(MGQ)" },
    { label: "Mombasa(MBA)", value: "Mombasa(MBA)" },
    { label: "Montreal(YUL)", value: "Montreal(YUL)" },
    { label: "Moscow Domodedovo(DME)", value: "Moscow Domodedovo(DME)" },
    { label: "Moscow Sheremetyevo(SVO)", value: "Moscow Sheremetyevo(SVO)" },
    { label: "Mumbai(BOM)", value: "Mumbai(BOM)" },
    { label: "Munich(MUC)", value: "Munich(MUC)" },
    { label: "Münster/Osnabrück(FMO)", value: "Münster/Osnabrück(FMO)" },
    { label: "Muscat(MCT)", value: "Muscat(MCT)" },
    { label: "Nairobi(NBO)", value: "Nairobi(NBO)" },
    { label: "Nantes(NTE)", value: "Nantes(NTE)" },
    { label: "Naples(NAP)", value: "Naples(NAP)" },
    { label: "N'Djamena(NDJ)", value: "N'Djamena(NDJ)" },
    { label: "New York JFK(JFK)", value: "New York JFK(JFK)" },
    { label: "New York Newark(EWR)", value: "New York Newark(EWR)" },
    { label: "Nice(NCE)", value: "Nice(NCE)" },
    { label: "Nuremberg(NUE)", value: "Nuremberg(NUE)" },
    { label: "Osaka Kansai(KIX)", value: "Osaka Kansai(KIX)" },
    { label: "Oslo(OSL)", value: "Oslo(OSL)" },
    { label: "Ottawa(YOW)", value: "Ottawa(YOW)" },
    { label: "Ouagadougou(OUA)", value: "Ouagadougou(OUA)" },
    { label: "Paderborn(PAD)", value: "Paderborn(PAD)" },
    { label: "Palma de Mallorca(PMI)", value: "Palma de Mallorca(PMI)" },
    { label: "Panama City(PTY)", value: "Panama City(PTY)" },
    { label: "Paris CDG(CDG)", value: "Paris CDG(CDG)" },
    { label: "Paris Orly(ORY)", value: "Paris Orly(ORY)" },
    { label: "Perth(PER)", value: "Perth(PER)" },
    { label: "Philadelphia(PHL)", value: "Philadelphia(PHL)" },
    { label: "Phoenix(PHX)", value: "Phoenix(PHX)" },
    { label: "Phuket(HKT)", value: "Phuket(HKT)" },
    { label: "Port Harcourt(PHC)", value: "Port Harcourt(PHC)" },
    { label: "Porto(OPO)", value: "Porto(OPO)" },
    { label: "Prague(PRG)", value: "Prague(PRG)" },
    { label: "Reykjavik(KEF)", value: "Reykjavik(KEF)" },
    { label: "Riga(RIX)", value: "Riga(RIX)" },
    { label: "Riyadh(RUH)", value: "Riyadh(RUH)" },
    { label: "Rome Fiumicino(FCO)", value: "Rome Fiumicino(FCO)" },
    { label: "Rostock(RLG)", value: "Rostock(RLG)" },
    { label: "Saarbrücken(SCN)", value: "Saarbrücken(SCN)" },
    { label: "Salzburg(SZG)", value: "Salzburg(SZG)" },
    { label: "San Diego(SAN)", value: "San Diego(SAN)" },
    { label: "San Francisco(SFO)", value: "San Francisco(SFO)" },
    { label: "Santiago(SCL)", value: "Santiago(SCL)" },
    { label: "São Paulo(GRU)", value: "São Paulo(GRU)" },
    { label: "Sarajevo(SJJ)", value: "Sarajevo(SJJ)" },
    { label: "Seattle(SEA)", value: "Seattle(SEA)" },
    { label: "Seoul Incheon(ICN)", value: "Seoul Incheon(ICN)" },
    { label: "Shanghai Pudong(PVG)", value: "Shanghai Pudong(PVG)" },
    { label: "Sharjah(SHJ)", value: "Sharjah(SHJ)" },
    { label: "Shenzhen(SZX)", value: "Shenzhen(SZX)" },
    { label: "Singapore(SIN)", value: "Singapore(SIN)" },
    { label: "Sofia(SOF)", value: "Sofia(SOF)" },
    { label: "Stockholm(ARN)", value: "Stockholm(ARN)" },
    { label: "Stuttgart(STR)", value: "Stuttgart(STR)" },
    { label: "Sydney(SYD)", value: "Sydney(SYD)" },
    { label: "Taipei(TPE)", value: "Taipei(TPE)" },
    { label: "Tallinn(TLL)", value: "Tallinn(TLL)" },
    { label: "Tbilisi(TBS)", value: "Tbilisi(TBS)" },
    { label: "Tehran(IKA)", value: "Tehran(IKA)" },
    { label: "Tel Aviv(TLV)", value: "Tel Aviv(TLV)" },
    { label: "Tenerife(TFS)", value: "Tenerife(TFS)" },
    { label: "Tokyo Haneda(HND)", value: "Tokyo Haneda(HND)" },
    { label: "Tokyo Narita(NRT)", value: "Tokyo Narita(NRT)" },
    { label: "Toronto(YYZ)", value: "Toronto(YYZ)" },
    { label: "Tripoli(TIP)", value: "Tripoli(TIP)" },
    { label: "Tunis(TUN)", value: "Tunis(TUN)" },
    { label: "Vancouver(YVR)", value: "Vancouver(YVR)" },
    { label: "Venice(VCE)", value: "Venice(VCE)" },
    { label: "Vienna(VIE)", value: "Vienna(VIE)" },
    { label: "Vilnius(VNO)", value: "Vilnius(VNO)" },
    { label: "Warsaw(WAW)", value: "Warsaw(WAW)" },
    { label: "Washington Dulles(IAD)", value: "Washington Dulles(IAD)" },
    { label: "Washington Reagan(DCA)", value: "Washington Reagan(DCA)" },
    { label: "Windhoek(WDH)", value: "Windhoek(WDH)" },
    { label: "Zanzibar(ZNZ)", value: "Zanzibar(ZNZ)" },
    { label: "Zurich(ZRH)", value: "Zurich(ZRH)" },
]

// ── Lookup maps (built once) ──────────────────────────────────────────────────

/** Map IATA code → canonical label, e.g. "FRA" → "Frankfurt(FRA)" */
const _iataToLabel = {}
/** Map lowercase city name → canonical label for quick fuzzy matching */
const _cityToLabel = {}

airports.forEach(a => {
    const m = a.value.match(/\(([A-Z]{3})\)$/)
    if (m) {
        _iataToLabel[m[1]] = a.value
    }
    // City = everything before the parenthesised code
    const city = a.value.replace(/\([A-Z]{3}\)$/, '').trim().toLowerCase()
    if (city) {
        _cityToLabel[city] = a.value
    }
})

// ── Utility: normalise any raw airport text to CityName(IATA) ─────────────

/**
 * normalizeAirportValue
 *
 * Accepts any raw airport string and returns the canonical "CityName(IATA)"
 * format if we can match it. Falls back to the cleaned input if no match
 * is found (allows custom entries).
 *
 * Handles:
 *  - Direct match from dataset
 *  - 3-letter IATA code lookup
 *  - "City, Airport Name, Country" comma-separated legacy strings
 *  - "City (CODE)" with spaces
 *  - Strings with extra suffixes like "Airport", "International", etc.
 */
export function normalizeAirportValue(raw) {
    if (!raw) return ''
    const cleaned = String(raw).trim()
    if (!cleaned) return ''

    // 1. Direct dataset match
    if (airports.some(a => a.value === cleaned)) return cleaned

    // 2. Pure IATA code (3 uppercase letters)
    const upper = cleaned.toUpperCase()
    if (/^[A-Z]{3}$/.test(upper) && _iataToLabel[upper]) {
        return _iataToLabel[upper]
    }

    // 3. Extract code from parentheses e.g. "Frankfurt (FRA)" or "Frankfurt(FRA)"
    const paren = cleaned.match(/\(([A-Z]{3})\)\s*$/i)
    if (paren) {
        const code = paren[1].toUpperCase()
        if (_iataToLabel[code]) return _iataToLabel[code]
    }

    // 4. Comma-separated legacy: "FRA, Frankfurt Airport, Frankfurt"
    const commaParts = cleaned.split(',').map(p => p.trim()).filter(Boolean)
    if (commaParts.length >= 1) {
        // Check if first part is an IATA code
        const firstUpper = commaParts[0].toUpperCase()
        if (/^[A-Z]{3}$/.test(firstUpper) && _iataToLabel[firstUpper]) {
            return _iataToLabel[firstUpper]
        }
    }

    // 5. Strip common suffixes and try city match
    const strippedCity = cleaned
        .replace(/\([^)]*\)/g, '')
        .replace(/\b(international|intl|airport|air)\b/gi, '')
        .replace(/,.*$/, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
    if (strippedCity && _cityToLabel[strippedCity]) {
        return _cityToLabel[strippedCity]
    }

    // 6. Fuzzy: check if any city name starts with the cleaned input
    const lowerCleaned = cleaned.toLowerCase()
    const startMatch = Object.keys(_cityToLabel).find(c => c.startsWith(lowerCleaned))
    if (startMatch) return _cityToLabel[startMatch]

    // 7. Last resort: look for a 3-letter code anywhere in the string
    const anyCode = cleaned.match(/\b([A-Z]{3})\b/)
    if (anyCode && _iataToLabel[anyCode[1]]) {
        return _iataToLabel[anyCode[1]]
    }

    // No match — return cleaned as-is (custom entry)
    return cleaned
}

// ── Utility: extract bare IATA code from CityName(IATA) string ────────────

/**
 * extractAirportCode
 *
 * Given a CityName(IATA) string (or raw IATA), returns just the 3-letter code.
 * If no code is found, returns the input trimmed.
 */
export function extractAirportCode(raw) {
    if (!raw) return ''
    const cleaned = String(raw).trim()
    // Extract from parentheses
    const m = cleaned.match(/\(([A-Z]{3})\)\s*$/i)
    if (m) return m[1].toUpperCase()
    // Pure 3-letter code
    if (/^[A-Z]{3}$/i.test(cleaned)) return cleaned.toUpperCase()
    // Fallback — entire string
    return cleaned
}
