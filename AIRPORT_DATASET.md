# Airport Dataset Choice

## Decision: OurAirports Dataset

**Status:** ✅ **FINAL DECISION**

## Dataset Source

**Name:** OurAirports  
**Website:** https://ourairports.com/data/  
**File:** `airports.csv`

## Why OurAirports?

✅ **100% Open Source** - No licensing restrictions  
✅ **No API Key Required** - Free to use  
✅ **Regularly Updated** - Active maintenance  
✅ **Clean CSV Format** - Easy to parse and integrate  
✅ **Production-Safe** - Widely used in open-source projects  
✅ **No Legal Issues** - Clear licensing terms  

## Data Fields Included

The `airports.csv` file includes:
- Airport name
- City / municipality
- Country
- IATA code (3 letters) - e.g., "JFK", "LHR"
- ICAO code (4 letters) - e.g., "KJFK", "EGLL"
- Latitude / longitude coordinates
- Airport type (large, medium, small)

## Future Implementation Plan

**Goal:** Use this dataset for frontend autocomplete input fields:
- "Departure Airport (From)"
- "Destination Airport"

**User Experience:**
- Users type manually
- System shows filtered airport suggestions based on:
  - Airport name
  - City name
  - Country name
  - IATA/ICAO codes

## Current Status

⚠️ **NOT YET IMPLEMENTED**

- Dataset choice is documented
- No autocomplete functionality added
- No UI changes made
- No logic implemented

## Next Steps (Future)

1. Download `airports.csv` from https://ourairports.com/data/
2. Parse and process the CSV data
3. Store/load airport data (client-side or backend)
4. Implement autocomplete component
5. Add filtering logic (search by name, city, country, codes)
6. Integrate with "Departure Airport" and "Destination Airport" input fields

---

**Documented:** 2026-01-11  
**Dataset Source:** OurAirports (https://ourairports.com/data/)  
**File:** airports.csv
