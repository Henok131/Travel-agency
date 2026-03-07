-- =============================================================================
-- TEST SUITE: create_booking_atomic RPC Function
-- Run each test block SEPARATELY in Supabase SQL Editor.
-- =============================================================================


-- =============================================================================
-- TEST 1: HAPPY PATH
-- Expected: Returns JSON with { success: true, booking_id, main_table_id }
-- =============================================================================

SELECT public.create_booking_atomic(
    NULL::UUID,                          -- p_user_id (NULL for test)
    'SQL-TEST-PNR-001',                  -- p_gds_pnr
    'SQL-TEST-ORDER-001',                -- p_gds_order_id
    'test@example.com',                  -- p_contact_email
    '+491234567890',                     -- p_contact_phone
    450.00,                              -- p_total_price
    'EUR',                               -- p_currency
    '2026-02-18T12:00:00Z'::TIMESTAMPTZ, -- p_ticket_time_limit
    -- p_passengers (JSONB array)
    '[
        {
            "first_name": "John",
            "last_name": "Doe",
            "dob": "1990-05-15",
            "gender": "MALE",
            "passport_number": "AB1234567",
            "passenger_type": "ADT",
            "ticket_number": null,
            "loyalty_program": null,
            "loyalty_number": null,
            "amadeus_traveler_id": "1"
        }
    ]'::JSONB,
    -- p_flights (JSONB array)
    '[
        {
            "carrier_code": "LH",
            "flight_number": "1234",
            "departure_iata": "FRA",
            "arrival_iata": "JFK",
            "departure_at": "2026-03-15T10:00:00Z",
            "arrival_at": "2026-03-15T18:00:00Z",
            "duration": "PT8H",
            "segment_order": 0
        }
    ]'::JSONB,
    -- p_main_table_payload (JSONB object)
    '{
        "first_name": "John",
        "middle_name": null,
        "last_name": "Doe",
        "date_of_birth": "1990-05-15",
        "gender": "MALE",
        "passport_number": "AB1234567",
        "departure_airport": "FRA",
        "destination_airport": "JFK",
        "travel_date": "2026-03-15",
        "return_date": null,
        "request_types": ["flight"],
        "booking_status": "pending",
        "amadeus_offer_id": "test-offer-123",
        "payment_status": "unpaid",
        "payment_currency": "EUR",
        "total_ticket_price": 450.00,
        "airlines_price": 400.00,
        "service_fee": 50.00,
        "total_amount_due": 450.00,
        "passenger_json": {"firstName": "John", "lastName": "Doe"},
        "pricing_json": {"total": 450.00, "currency": "EUR"}
    }'::JSONB
);


-- =============================================================================
-- TEST 2: ROLLBACK TEST (Invalid passenger DOB)
-- Expected: ERROR — invalid date format causes exception, entire TX rolls back.
-- Run this block FIRST, then run the verification query below it.
-- =============================================================================

SELECT public.create_booking_atomic(
    NULL::UUID,
    'SQL-TEST-PNR-ROLLBACK',
    'SQL-TEST-ORDER-ROLLBACK',
    'rollback@example.com',
    '+490000000000',
    200.00,
    'EUR',
    '2026-02-18T12:00:00Z'::TIMESTAMPTZ,
    -- p_passengers with INVALID dob
    '[
        {
            "first_name": "Bad",
            "last_name": "Data",
            "dob": "NOT-A-DATE",
            "gender": "MALE",
            "passport_number": "XX0000000",
            "passenger_type": "ADT",
            "ticket_number": null,
            "loyalty_program": null,
            "loyalty_number": null,
            "amadeus_traveler_id": "1"
        }
    ]'::JSONB,
    '[
        {
            "carrier_code": "LH",
            "flight_number": "9999",
            "departure_iata": "FRA",
            "arrival_iata": "MUC",
            "departure_at": "2026-03-15T10:00:00Z",
            "arrival_at": "2026-03-15T11:00:00Z",
            "duration": "PT1H",
            "segment_order": 0
        }
    ]'::JSONB,
    '{
        "first_name": "Bad",
        "last_name": "Data",
        "departure_airport": "FRA",
        "destination_airport": "MUC",
        "travel_date": "2026-03-15",
        "request_types": ["flight"],
        "booking_status": "pending",
        "payment_status": "unpaid",
        "payment_currency": "EUR",
        "total_ticket_price": 200.00,
        "total_amount_due": 200.00
    }'::JSONB
);

-- VERIFICATION: Run this AFTER the rollback test above errors out.
-- Expected: 0 rows — the booking must NOT exist.
SELECT COUNT(*) AS orphan_count
FROM public.bookings
WHERE gds_pnr = 'SQL-TEST-PNR-ROLLBACK';


-- =============================================================================
-- TEST 3: DUPLICATE TEST
-- Expected: Second call raises P0001 DUPLICATE_PNR error.
-- Prerequisite: TEST 1 must have been run successfully first.
-- =============================================================================

-- This should FAIL with: DUPLICATE_PNR: gds_pnr "SQL-TEST-PNR-001" ...
SELECT public.create_booking_atomic(
    NULL::UUID,
    'SQL-TEST-PNR-001',                  -- Same PNR as Test 1
    'SQL-TEST-ORDER-DUPE',               -- Different order ID
    'dupe@example.com',
    '+490000000001',
    450.00,
    'EUR',
    '2026-02-18T12:00:00Z'::TIMESTAMPTZ,
    '[
        {
            "first_name": "Jane",
            "last_name": "Dupe",
            "dob": "1985-01-01",
            "gender": "FEMALE",
            "passport_number": "CD9999999",
            "passenger_type": "ADT",
            "ticket_number": null,
            "loyalty_program": null,
            "loyalty_number": null,
            "amadeus_traveler_id": "1"
        }
    ]'::JSONB,
    '[
        {
            "carrier_code": "LH",
            "flight_number": "5678",
            "departure_iata": "FRA",
            "arrival_iata": "JFK",
            "departure_at": "2026-03-16T10:00:00Z",
            "arrival_at": "2026-03-16T18:00:00Z",
            "duration": "PT8H",
            "segment_order": 0
        }
    ]'::JSONB,
    '{
        "first_name": "Jane",
        "last_name": "Dupe",
        "departure_airport": "FRA",
        "destination_airport": "JFK",
        "travel_date": "2026-03-16",
        "request_types": ["flight"],
        "booking_status": "pending",
        "payment_status": "unpaid",
        "payment_currency": "EUR",
        "total_ticket_price": 450.00,
        "total_amount_due": 450.00
    }'::JSONB
);

-- VERIFICATION: Run this after the duplicate test.
-- Expected: Exactly 1 row (the original from Test 1, NOT the duplicate).
SELECT COUNT(*) AS total_rows
FROM public.bookings
WHERE gds_pnr = 'SQL-TEST-PNR-001';


-- =============================================================================
-- CLEANUP: Run this after ALL tests are complete.
-- Removes all test data from the 4 tables.
-- =============================================================================

DELETE FROM public.booking_passengers
WHERE booking_id IN (SELECT id FROM public.bookings WHERE gds_pnr LIKE 'SQL-TEST-%');

DELETE FROM public.booking_flights
WHERE booking_id IN (SELECT id FROM public.bookings WHERE gds_pnr LIKE 'SQL-TEST-%');

DELETE FROM public.main_table
WHERE amadeus_pnr LIKE 'SQL-TEST-%';

DELETE FROM public.bookings
WHERE gds_pnr LIKE 'SQL-TEST-%';
