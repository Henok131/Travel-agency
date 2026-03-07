// ============================================================================
// CENTRALIZED GLOBAL AIRLINE DATASET
// Single source of truth for all airline dropdowns across the application.
// Format: { label: "Airline Name (IATA)", value: "Airline Name (IATA)" }
//
// Rules:
//   - Alphabetically sorted
//   - No duplicates
//   - Includes major + regional airlines worldwide (220+)
//   - Format strictly: "Airline Name (IATA)"
//
// Usage:
//   import { airlines } from '@/data/airlines'
//   <AirlineSelect value={...} onChange={...} />
//
// To extract IATA code for backend/API use:
//   const match = value.match(/\((.*?)\)/)
//   const iataCode = match ? match[1] : null
// ============================================================================

export const airlines = [
    { label: "Adria Airways (JP)", value: "Adria Airways (JP)" },
    { label: "Aegean Airlines (A3)", value: "Aegean Airlines (A3)" },
    { label: "Aer Lingus (EI)", value: "Aer Lingus (EI)" },
    { label: "Aero Dili (8A)", value: "Aero Dili (8A)" },
    { label: "Aeroflot (SU)", value: "Aeroflot (SU)" },
    { label: "Aerolineas Argentinas (AR)", value: "Aerolineas Argentinas (AR)" },
    { label: "Aeromexico (AM)", value: "Aeromexico (AM)" },
    { label: "Air Algerie (AH)", value: "Air Algerie (AH)" },
    { label: "Air Arabia (G9)", value: "Air Arabia (G9)" },
    { label: "Air Astana (KC)", value: "Air Astana (KC)" },
    { label: "Air Austral (UU)", value: "Air Austral (UU)" },
    { label: "Air Baltic (BT)", value: "Air Baltic (BT)" },
    { label: "Air Belgium (KF)", value: "Air Belgium (KF)" },
    { label: "Air Berlin (AB)", value: "Air Berlin (AB)" },
    { label: "Air Botswana (BP)", value: "Air Botswana (BP)" },
    { label: "Air Burkina (2J)", value: "Air Burkina (2J)" },
    { label: "Air Caledonie (TY)", value: "Air Caledonie (TY)" },
    { label: "Air Canada (AC)", value: "Air Canada (AC)" },
    { label: "Air Caraibes (TX)", value: "Air Caraibes (TX)" },
    { label: "Air China (CA)", value: "Air China (CA)" },
    { label: "Air Corsica (XK)", value: "Air Corsica (XK)" },
    { label: "Air Cote d'Ivoire (HF)", value: "Air Cote d'Ivoire (HF)" },
    { label: "Air Djibouti (60)", value: "Air Djibouti (60)" },
    { label: "Air Dolomiti (EN)", value: "Air Dolomiti (EN)" },
    { label: "Air Europa (UX)", value: "Air Europa (UX)" },
    { label: "Air France (AF)", value: "Air France (AF)" },
    { label: "Air India (AI)", value: "Air India (AI)" },
    { label: "Air India Express (IX)", value: "Air India Express (IX)" },
    { label: "Air Jamaica (JM)", value: "Air Jamaica (JM)" },
    { label: "Air Macau (NX)", value: "Air Macau (NX)" },
    { label: "Air Madagascar (MD)", value: "Air Madagascar (MD)" },
    { label: "Air Malta (KM)", value: "Air Malta (KM)" },
    { label: "Air Mauritius (MK)", value: "Air Mauritius (MK)" },
    { label: "Air Moldova (9U)", value: "Air Moldova (9U)" },
    { label: "Air Namibia (SW)", value: "Air Namibia (SW)" },
    { label: "Air New Zealand (NZ)", value: "Air New Zealand (NZ)" },
    { label: "Air Niugini (PX)", value: "Air Niugini (PX)" },
    { label: "Air North (4N)", value: "Air North (4N)" },
    { label: "Air Peace (P4)", value: "Air Peace (P4)" },
    { label: "Air Senegal (HC)", value: "Air Senegal (HC)" },
    { label: "Air Serbia (JU)", value: "Air Serbia (JU)" },
    { label: "Air Seychelles (HM)", value: "Air Seychelles (HM)" },
    { label: "Air Tahiti Nui (TN)", value: "Air Tahiti Nui (TN)" },
    { label: "Air Tanzania (TC)", value: "Air Tanzania (TC)" },
    { label: "Air Transat (TS)", value: "Air Transat (TS)" },
    { label: "Air Vanuatu (NF)", value: "Air Vanuatu (NF)" },
    { label: "Air Zimbabwe (UM)", value: "Air Zimbabwe (UM)" },
    { label: "AirAsia (AK)", value: "AirAsia (AK)" },
    { label: "AirAsia X (D7)", value: "AirAsia X (D7)" },
    { label: "Alaska Airlines (AS)", value: "Alaska Airlines (AS)" },
    { label: "Alitalia / ITA Airways (AZ)", value: "Alitalia / ITA Airways (AZ)" },
    { label: "All Nippon Airways (NH)", value: "All Nippon Airways (NH)" },
    { label: "Allegiant Air (G4)", value: "Allegiant Air (G4)" },
    { label: "American Airlines (AA)", value: "American Airlines (AA)" },
    { label: "ANA Wings (EH)", value: "ANA Wings (EH)" },
    { label: "Asiana Airlines (OZ)", value: "Asiana Airlines (OZ)" },
    { label: "Austrian Airlines (OS)", value: "Austrian Airlines (OS)" },
    { label: "Avianca (AV)", value: "Avianca (AV)" },
    { label: "Azerbaijan Airlines (J2)", value: "Azerbaijan Airlines (J2)" },
    { label: "Azul Brazilian Airlines (AD)", value: "Azul Brazilian Airlines (AD)" },
    { label: "Bahamasair (UP)", value: "Bahamasair (UP)" },
    { label: "Bamboo Airways (QH)", value: "Bamboo Airways (QH)" },
    { label: "Bangkok Airways (PG)", value: "Bangkok Airways (PG)" },
    { label: "Batik Air (ID)", value: "Batik Air (ID)" },
    { label: "Biman Bangladesh Airlines (BG)", value: "Biman Bangladesh Airlines (BG)" },
    { label: "Binter Canarias (NT)", value: "Binter Canarias (NT)" },
    { label: "Blue Air (0B)", value: "Blue Air (0B)" },
    { label: "BORAJET (YB)", value: "BORAJET (YB)" },
    { label: "British Airways (BA)", value: "British Airways (BA)" },
    { label: "Brussels Airlines (SN)", value: "Brussels Airlines (SN)" },
    { label: "Bulgaria Air (FB)", value: "Bulgaria Air (FB)" },
    { label: "Cambodia Angkor Air (K6)", value: "Cambodia Angkor Air (K6)" },
    { label: "Cameroon Airlines (UY)", value: "Cameroon Airlines (UY)" },
    { label: "Caribbean Airlines (BW)", value: "Caribbean Airlines (BW)" },
    { label: "Cathay Pacific (CX)", value: "Cathay Pacific (CX)" },
    { label: "Cebu Pacific (5J)", value: "Cebu Pacific (5J)" },
    { label: "China Airlines (CI)", value: "China Airlines (CI)" },
    { label: "China Eastern Airlines (MU)", value: "China Eastern Airlines (MU)" },
    { label: "China Southern Airlines (CZ)", value: "China Southern Airlines (CZ)" },
    { label: "Condor (DE)", value: "Condor (DE)" },
    { label: "Copa Airlines (CM)", value: "Copa Airlines (CM)" },
    { label: "Croatia Airlines (OU)", value: "Croatia Airlines (OU)" },
    { label: "Cubana de Aviacion (CU)", value: "Cubana de Aviacion (CU)" },
    { label: "Czech Airlines (OK)", value: "Czech Airlines (OK)" },
    { label: "Delta Air Lines (DL)", value: "Delta Air Lines (DL)" },
    { label: "easyJet (U2)", value: "easyJet (U2)" },
    { label: "EgyptAir (MS)", value: "EgyptAir (MS)" },
    { label: "El Al (LY)", value: "El Al (LY)" },
    { label: "Emirates (EK)", value: "Emirates (EK)" },
    { label: "Eritrean Airlines (B8)", value: "Eritrean Airlines (B8)" },
    { label: "Ethiopian Airlines (ET)", value: "Ethiopian Airlines (ET)" },
    { label: "Etihad Airways (EY)", value: "Etihad Airways (EY)" },
    { label: "Eurowings (EW)", value: "Eurowings (EW)" },
    { label: "EVA Air (BR)", value: "EVA Air (BR)" },
    { label: "Fiji Airways (FJ)", value: "Fiji Airways (FJ)" },
    { label: "Finnair (AY)", value: "Finnair (AY)" },
    { label: "Flybe (BE)", value: "Flybe (BE)" },
    { label: "flydubai (FZ)", value: "flydubai (FZ)" },
    { label: "FlyEgypt (FT)", value: "FlyEgypt (FT)" },
    { label: "Flynas (XY)", value: "Flynas (XY)" },
    { label: "Frontier Airlines (F9)", value: "Frontier Airlines (F9)" },
    { label: "Garuda Indonesia (GA)", value: "Garuda Indonesia (GA)" },
    { label: "GOL Linhas Aereas (G3)", value: "GOL Linhas Aereas (G3)" },
    { label: "Gulf Air (GF)", value: "Gulf Air (GF)" },
    { label: "Hainan Airlines (HU)", value: "Hainan Airlines (HU)" },
    { label: "Hawaiian Airlines (HA)", value: "Hawaiian Airlines (HA)" },
    { label: "Helvetic Airways (2L)", value: "Helvetic Airways (2L)" },
    { label: "HK Express (UO)", value: "HK Express (UO)" },
    { label: "Hong Kong Airlines (HX)", value: "Hong Kong Airlines (HX)" },
    { label: "Iberia (IB)", value: "Iberia (IB)" },
    { label: "Iberia Express (I2)", value: "Iberia Express (I2)" },
    { label: "Icelandair (FI)", value: "Icelandair (FI)" },
    { label: "IndiGo (6E)", value: "IndiGo (6E)" },
    { label: "InterJet (4O)", value: "InterJet (4O)" },
    { label: "Iran Air (IR)", value: "Iran Air (IR)" },
    { label: "Iraqi Airways (IA)", value: "Iraqi Airways (IA)" },
    { label: "ITA Airways (AZ)", value: "ITA Airways (AZ)" },
    { label: "Japan Airlines (JL)", value: "Japan Airlines (JL)" },
    { label: "Jazeera Airways (J9)", value: "Jazeera Airways (J9)" },
    { label: "Jeju Air (7C)", value: "Jeju Air (7C)" },
    { label: "JetBlue (B6)", value: "JetBlue (B6)" },
    { label: "JetStar (JQ)", value: "JetStar (JQ)" },
    { label: "Jin Air (LJ)", value: "Jin Air (LJ)" },
    { label: "Kenya Airways (KQ)", value: "Kenya Airways (KQ)" },
    { label: "KLM Royal Dutch Airlines (KL)", value: "KLM Royal Dutch Airlines (KL)" },
    { label: "Korean Air (KE)", value: "Korean Air (KE)" },
    { label: "Kuwait Airways (KU)", value: "Kuwait Airways (KU)" },
    { label: "Lao Airlines (QV)", value: "Lao Airlines (QV)" },
    { label: "LATAM Airlines (LA)", value: "LATAM Airlines (LA)" },
    { label: "Lion Air (JT)", value: "Lion Air (JT)" },
    { label: "LOT Polish Airlines (LO)", value: "LOT Polish Airlines (LO)" },
    { label: "Lufthansa (LH)", value: "Lufthansa (LH)" },
    { label: "Luxair (LG)", value: "Luxair (LG)" },
    { label: "Malaysia Airlines (MH)", value: "Malaysia Airlines (MH)" },
    { label: "Maldivian (Q2)", value: "Maldivian (Q2)" },
    { label: "Mango Airlines (JE)", value: "Mango Airlines (JE)" },
    { label: "MIAT Mongolian Airlines (OM)", value: "MIAT Mongolian Airlines (OM)" },
    { label: "Middle East Airlines (ME)", value: "Middle East Airlines (ME)" },
    { label: "Myanmar National Airlines (UB)", value: "Myanmar National Airlines (UB)" },
    { label: "Nepal Airlines (RA)", value: "Nepal Airlines (RA)" },
    { label: "Nile Air (NP)", value: "Nile Air (NP)" },
    { label: "Nordwind Airlines (N4)", value: "Nordwind Airlines (N4)" },
    { label: "Norwegian (DY)", value: "Norwegian (DY)" },
    { label: "Nouvelair (BJ)", value: "Nouvelair (BJ)" },
    { label: "Oman Air (WY)", value: "Oman Air (WY)" },
    { label: "Pakistan International Airlines (PK)", value: "Pakistan International Airlines (PK)" },
    { label: "Peach Aviation (MM)", value: "Peach Aviation (MM)" },
    { label: "Pegasus Airlines (PC)", value: "Pegasus Airlines (PC)" },
    { label: "Philippine Airlines (PR)", value: "Philippine Airlines (PR)" },
    { label: "Porter Airlines (PD)", value: "Porter Airlines (PD)" },
    { label: "Precision Air (PW)", value: "Precision Air (PW)" },
    { label: "Qantas (QF)", value: "Qantas (QF)" },
    { label: "Qatar Airways (QR)", value: "Qatar Airways (QR)" },
    { label: "Regional Air (ZL)", value: "Regional Air (ZL)" },
    { label: "Rex Regional Express (ZL)", value: "Rex Regional Express (ZL)" },
    { label: "Royal Air Maroc (AT)", value: "Royal Air Maroc (AT)" },
    { label: "Royal Brunei Airlines (BI)", value: "Royal Brunei Airlines (BI)" },
    { label: "Royal Jordanian (RJ)", value: "Royal Jordanian (RJ)" },
    { label: "RwandAir (WB)", value: "RwandAir (WB)" },
    { label: "Ryanair (FR)", value: "Ryanair (FR)" },
    { label: "S7 Airlines (S7)", value: "S7 Airlines (S7)" },
    { label: "SAS Scandinavian Airlines (SK)", value: "SAS Scandinavian Airlines (SK)" },
    { label: "SATA Azores Airlines (S4)", value: "SATA Azores Airlines (S4)" },
    { label: "Saudia (SV)", value: "Saudia (SV)" },
    { label: "Scoot (TR)", value: "Scoot (TR)" },
    { label: "Shandong Airlines (SC)", value: "Shandong Airlines (SC)" },
    { label: "Shanghai Airlines (FM)", value: "Shanghai Airlines (FM)" },
    { label: "Shenzhen Airlines (ZH)", value: "Shenzhen Airlines (ZH)" },
    { label: "Sichuan Airlines (3U)", value: "Sichuan Airlines (3U)" },
    { label: "Silkair (MI)", value: "Silkair (MI)" },
    { label: "Singapore Airlines (SQ)", value: "Singapore Airlines (SQ)" },
    { label: "Sky Express (GQ)", value: "Sky Express (GQ)" },
    { label: "SmartWings (QS)", value: "SmartWings (QS)" },
    { label: "Solomon Airlines (IE)", value: "Solomon Airlines (IE)" },
    { label: "South African Airways (SA)", value: "South African Airways (SA)" },
    { label: "Southwest Airlines (WN)", value: "Southwest Airlines (WN)" },
    { label: "SpiceJet (SG)", value: "SpiceJet (SG)" },
    { label: "Spirit Airlines (NK)", value: "Spirit Airlines (NK)" },
    { label: "Spring Airlines (9C)", value: "Spring Airlines (9C)" },
    { label: "SriLankan Airlines (UL)", value: "SriLankan Airlines (UL)" },
    { label: "STARLUX Airlines (JX)", value: "STARLUX Airlines (JX)" },
    { label: "SunExpress (XQ)", value: "SunExpress (XQ)" },
    { label: "Sunwing Airlines (WG)", value: "Sunwing Airlines (WG)" },
    { label: "Swiss International Air Lines (LX)", value: "Swiss International Air Lines (LX)" },
    { label: "TAAG Angola Airlines (DT)", value: "TAAG Angola Airlines (DT)" },
    { label: "TACA International Airlines (TA)", value: "TACA International Airlines (TA)" },
    { label: "TAP Air Portugal (TP)", value: "TAP Air Portugal (TP)" },
    { label: "TAROM (RO)", value: "TAROM (RO)" },
    { label: "Thai Airways (TG)", value: "Thai Airways (TG)" },
    { label: "Thai Lion Air (SL)", value: "Thai Lion Air (SL)" },
    { label: "Thai Smile (WE)", value: "Thai Smile (WE)" },
    { label: "Tigerair Taiwan (IT)", value: "Tigerair Taiwan (IT)" },
    { label: "Transavia (HV)", value: "Transavia (HV)" },
    { label: "TUI fly (X3)", value: "TUI fly (X3)" },
    { label: "Tunisair (TU)", value: "Tunisair (TU)" },
    { label: "Turkish Airlines (TK)", value: "Turkish Airlines (TK)" },
    { label: "Uganda Airlines (UR)", value: "Uganda Airlines (UR)" },
    { label: "Ukraine International Airlines (PS)", value: "Ukraine International Airlines (PS)" },
    { label: "United Airlines (UA)", value: "United Airlines (UA)" },
    { label: "Ural Airlines (U6)", value: "Ural Airlines (U6)" },
    { label: "US-Bangla Airlines (BS)", value: "US-Bangla Airlines (BS)" },
    { label: "UTair (UT)", value: "UTair (UT)" },
    { label: "Uzbekistan Airways (HY)", value: "Uzbekistan Airways (HY)" },
    { label: "Vietnam Airlines (VN)", value: "Vietnam Airlines (VN)" },
    { label: "VietJet Air (VJ)", value: "VietJet Air (VJ)" },
    { label: "Virgin Atlantic (VS)", value: "Virgin Atlantic (VS)" },
    { label: "Virgin Australia (VA)", value: "Virgin Australia (VA)" },
    { label: "Vistara (UK)", value: "Vistara (UK)" },
    { label: "Viva Aerobus (VB)", value: "Viva Aerobus (VB)" },
    { label: "Volaris (Y4)", value: "Volaris (Y4)" },
    { label: "Volotea (V7)", value: "Volotea (V7)" },
    { label: "Vueling (VY)", value: "Vueling (VY)" },
    { label: "WestJet (WS)", value: "WestJet (WS)" },
    { label: "Wideroe (WF)", value: "Wideroe (WF)" },
    { label: "Wizz Air (W6)", value: "Wizz Air (W6)" },
    { label: "XiamenAir (MF)", value: "XiamenAir (MF)" },
    { label: "Yemenia (IY)", value: "Yemenia (IY)" },
    { label: "Zambia Airways (ZN)", value: "Zambia Airways (ZN)" }
]

// ============================================================================
// IATA CODE → DISPLAY LOOKUP MAP  (built once, O(1) lookups)
// ============================================================================
const _iataToLabel = {}
const _nameLowerToLabel = {}

airlines.forEach(a => {
    const match = a.value.match(/\(([A-Z0-9]{2,3})\)$/i)
    if (match) {
        _iataToLabel[match[1].toUpperCase()] = a.value
        _iataToLabel[match[1].toLowerCase()] = a.value
    }
    // Also index by airline name (lowercase, without the code part)
    const nameOnly = a.value.replace(/\s*\([A-Z0-9]{2,3}\)$/i, '').trim().toLowerCase()
    _nameLowerToLabel[nameOnly] = a.value
})

/**
 * Given a raw string (IATA code, full name, or "Name (CODE)"),
 * return the canonical "Airline Name (IATA)" format.
 * Returns the raw string unmodified if no match is found.
 */
export function normalizeAirlineValue(raw) {
    if (!raw) return ''
    const cleaned = String(raw).trim()
    if (!cleaned) return ''

    // 1. Direct match in dataset
    if (airlines.some(a => a.value === cleaned)) return cleaned

    // 2. Match by IATA code (case-insensitive)
    if (_iataToLabel[cleaned.toUpperCase()]) return _iataToLabel[cleaned.toUpperCase()]

    // 3. Extract code from parentheses e.g. "Ethiopian Airlines (ET)"
    const paren = cleaned.match(/\(([A-Z0-9]{2,3})\)$/i)
    if (paren && _iataToLabel[paren[1].toUpperCase()]) {
        return _iataToLabel[paren[1].toUpperCase()]
    }

    // 4. Match by name (lowercased)
    const lower = cleaned.toLowerCase()
    if (_nameLowerToLabel[lower]) return _nameLowerToLabel[lower]

    // 5. Partial name match (starts with)
    const nameMatch = Object.keys(_nameLowerToLabel).find(k => lower.startsWith(k))
    if (nameMatch) return _nameLowerToLabel[nameMatch]

    // 6. Look for any 2-3 char code in the string
    const tokens = cleaned.split(/[\s,;|/]+/)
    for (const t of tokens) {
        const token = t.replace(/[^A-Za-z0-9]/g, '')
        if (/^[A-Za-z0-9]{2,3}$/.test(token) && _iataToLabel[token.toUpperCase()]) {
            return _iataToLabel[token.toUpperCase()]
        }
    }

    // No match — return cleaned input as-is (allows custom entries)
    return cleaned
}

/**
 * Extract IATA code from a canonical airline string.
 * e.g. "Lufthansa (LH)" → "LH"
 */
export function extractIataCode(airlineString) {
    if (!airlineString) return null
    const match = String(airlineString).match(/\(([A-Z0-9]{2,3})\)$/i)
    return match ? match[1].toUpperCase() : null
}
