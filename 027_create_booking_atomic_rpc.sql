-- =============================================================================
-- Migration 027: create_booking_atomic RPC Function
-- Purpose: Atomic booking creation across bookings, booking_passengers,
--          booking_flights, and main_table in a single transaction.
-- Applied: PENDING MANUAL REVIEW
-- =============================================================================
-- GUARDRAILS:
--   - DB writes ONLY. No external API calls.
--   - No business logic or pricing validation.
--   - Explicit RAISE EXCEPTION with error codes.
--   - Automatic rollback on any failure (Postgres default).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_user_id            UUID,
    p_gds_pnr            TEXT,
    p_gds_order_id       TEXT,
    p_contact_email      TEXT,
    p_contact_phone      TEXT,
    p_total_price        NUMERIC,
    p_currency           TEXT,
    p_ticket_time_limit  TIMESTAMPTZ,
    p_passengers         JSONB,
    p_flights            JSONB,
    p_main_table_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking_id     UUID;
    v_main_table_id  UUID;
    v_passenger      JSONB;
    v_flight         JSONB;
    v_booking_id_str TEXT;   -- For main_table booking_ref fallback
BEGIN
    -- =========================================================================
    -- STEP 0: Input Validation
    -- =========================================================================

    -- Validate p_passengers is a non-empty JSON array
    IF p_passengers IS NULL
       OR jsonb_typeof(p_passengers) != 'array'
       OR jsonb_array_length(p_passengers) = 0 THEN
        RAISE EXCEPTION 'EMPTY_PASSENGERS: p_passengers must be a non-empty JSON array'
            USING ERRCODE = 'P0003';
    END IF;

    -- Validate p_flights is a non-empty JSON array
    IF p_flights IS NULL
       OR jsonb_typeof(p_flights) != 'array'
       OR jsonb_array_length(p_flights) = 0 THEN
        RAISE EXCEPTION 'EMPTY_FLIGHTS: p_flights must be a non-empty JSON array'
            USING ERRCODE = 'P0004';
    END IF;


    -- =========================================================================
    -- STEP 1: Insert into bookings
    -- Unique constraint violations (gds_pnr, gds_order_id) are caught
    -- by the EXCEPTION block at the end of this function.
    -- =========================================================================

    INSERT INTO public.bookings (
        user_id,
        gds_pnr,
        gds_order_id,
        status,
        total_price,
        currency,
        contact_email,
        contact_phone,
        ticket_time_limit,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_gds_pnr,
        p_gds_order_id,
        'PENDING_PAYMENT'::booking_status_enum,
        p_total_price,
        COALESCE(p_currency, 'EUR'),
        p_contact_email,
        p_contact_phone,
        p_ticket_time_limit,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_booking_id;

    -- Verify insertion succeeded
    IF v_booking_id IS NULL THEN
        RAISE EXCEPTION 'BOOKING_INSERT_FAILED: INSERT into bookings returned NULL id'
            USING ERRCODE = 'P0002';
    END IF;

    -- =========================================================================
    -- STEP 2: Insert passengers
    -- =========================================================================

    FOR v_passenger IN SELECT * FROM jsonb_array_elements(p_passengers)
    LOOP
        INSERT INTO public.booking_passengers (
            booking_id,
            first_name,
            last_name,
            dob,
            gender,
            passport_number,
            passenger_type,
            ticket_number,
            loyalty_program,
            loyalty_number,
            amadeus_traveler_id
        ) VALUES (
            v_booking_id,
            v_passenger ->> 'first_name',
            v_passenger ->> 'last_name',
            (v_passenger ->> 'dob')::DATE,
            v_passenger ->> 'gender',
            v_passenger ->> 'passport_number',
            v_passenger ->> 'passenger_type',
            v_passenger ->> 'ticket_number',
            v_passenger ->> 'loyalty_program',
            v_passenger ->> 'loyalty_number',
            v_passenger ->> 'amadeus_traveler_id'
        );
    END LOOP;

    -- =========================================================================
    -- STEP 3: Insert flights
    -- =========================================================================

    FOR v_flight IN SELECT * FROM jsonb_array_elements(p_flights)
    LOOP
        INSERT INTO public.booking_flights (
            booking_id,
            carrier_code,
            flight_number,
            departure_iata,
            arrival_iata,
            departure_at,
            arrival_at,
            duration,
            segment_order
        ) VALUES (
            v_booking_id,
            v_flight ->> 'carrier_code',
            v_flight ->> 'flight_number',
            v_flight ->> 'departure_iata',
            v_flight ->> 'arrival_iata',
            (v_flight ->> 'departure_at')::TIMESTAMPTZ,
            (v_flight ->> 'arrival_at')::TIMESTAMPTZ,
            v_flight ->> 'duration',
            (v_flight ->> 'segment_order')::INTEGER
        );
    END LOOP;

    -- =========================================================================
    -- STEP 4: Insert into main_table (legacy sync)
    -- =========================================================================
    -- p_main_table_payload contains all fields pre-built by Express.
    -- We extract each field explicitly for type safety.

    v_booking_id_str := v_booking_id::TEXT;

    INSERT INTO public.main_table (
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        gender,
        passport_number,
        departure_airport,
        destination_airport,
        travel_date,
        return_date,
        request_types,
        status,
        booking_ref,
        booking_status,
        hold_expires_at,
        amadeus_offer_id,
        amadeus_order_id,
        amadeus_pnr,
        payment_status,
        payment_currency,
        total_ticket_price,
        airlines_price,
        service_fee,
        total_amount_due,
        passenger_json,
        pricing_json
    ) VALUES (
        COALESCE(p_main_table_payload ->> 'first_name', 'UNKNOWN'),
        p_main_table_payload ->> 'middle_name',
        COALESCE(p_main_table_payload ->> 'last_name', 'UNKNOWN'),
        (p_main_table_payload ->> 'date_of_birth')::DATE,
        p_main_table_payload ->> 'gender',
        p_main_table_payload ->> 'passport_number',
        p_main_table_payload ->> 'departure_airport',
        p_main_table_payload ->> 'destination_airport',
        (p_main_table_payload ->> 'travel_date')::DATE,
        (p_main_table_payload ->> 'return_date')::DATE,
        COALESCE((p_main_table_payload -> 'request_types'), '["flight"]'::JSONB),
        COALESCE(p_main_table_payload ->> 'status', 'draft'),
        COALESCE(p_main_table_payload ->> 'booking_ref', v_booking_id_str),
        COALESCE(p_main_table_payload ->> 'booking_status', 'pending'),
        p_ticket_time_limit,
        p_main_table_payload ->> 'amadeus_offer_id',
        p_gds_order_id,
        p_gds_pnr,
        COALESCE(p_main_table_payload ->> 'payment_status', 'unpaid'),
        COALESCE(p_main_table_payload ->> 'payment_currency', p_currency, 'EUR'),
        (p_main_table_payload ->> 'total_ticket_price')::NUMERIC,
        (p_main_table_payload ->> 'airlines_price')::NUMERIC,
        (p_main_table_payload ->> 'service_fee')::NUMERIC,
        (p_main_table_payload ->> 'total_amount_due')::NUMERIC,
        p_main_table_payload -> 'passenger_json',
        p_main_table_payload -> 'pricing_json'
    )
    RETURNING id INTO v_main_table_id;

    -- =========================================================================
    -- STEP 5: Return structured result
    -- =========================================================================

    RETURN jsonb_build_object(
        'success',         TRUE,
        'booking_id',      v_booking_id,
        'main_table_id',   v_main_table_id
    );

    -- =========================================================================
    -- EXCEPTION HANDLING
    -- Catches unique constraint violations from the INSERT and maps them
    -- to explicit P0001 error codes for clean Express-layer handling.
    -- Any other unhandled exception will automatically roll back the
    -- entire transaction. No partial state will be committed.
    -- =========================================================================

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'DUPLICATE_PNR: gds_pnr "%" or gds_order_id "%" already exists',
            p_gds_pnr, p_gds_order_id
            USING ERRCODE = 'P0001';

END;
$$;

-- Grant execute permission to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.create_booking_atomic(
    UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ, JSONB, JSONB, JSONB
) TO authenticated, service_role;
