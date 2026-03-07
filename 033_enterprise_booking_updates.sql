-- =============================================================================
-- Migration 033: Enterprise Booking Updates (Pricing Sync & Passenger Edit)
-- Purpose:
--   1. Update finalize_hold_atomic to sync ticket price to main_table.
--   2. Create update_passengers_atomic to allow atomic passenger updates.
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Update finalize_hold_atomic
--    Changes: Added Step 5 (Sync pricing to main_table)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.finalize_hold_atomic(
    p_booking_id       UUID,
    p_pnr              TEXT,
    p_order_id         TEXT,
    p_expires_at       TEXT,          -- ISO timestamp string
    p_price_snapshot   JSONB,
    p_total_price      NUMERIC,
    p_currency         TEXT,
    p_raw_response     JSONB          -- Full Amadeus response → audit_logs only
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows_updated    INT;
    v_rows_locked     INT;
    v_rows_deleted    INT;
    v_main_table_id   UUID;
BEGIN
    -- =========================================================================
    -- STEP 1: Update bookings table (coordination fields only)
    -- =========================================================================
    UPDATE public.bookings
    SET
        status              = 'HELD',
        gds_pnr             = p_pnr,
        gds_order_id        = p_order_id,
        hold_expires_at     = p_expires_at::TIMESTAMPTZ,
        price_snapshot_json = p_price_snapshot,
        total_price         = p_total_price,
        currency            = p_currency
    WHERE id = p_booking_id
    RETURNING main_table_id INTO v_main_table_id;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    IF v_rows_updated = 0 THEN
        RAISE EXCEPTION 'HOLD_BOOKING_NOT_FOUND: No booking row updated for id=%', p_booking_id
            USING ERRCODE = 'P0001';
    END IF;

    -- =========================================================================
    -- STEP 2: Lock all passengers (is_locked = true)
    -- =========================================================================
    UPDATE public.booking_passengers
    SET is_locked = TRUE
    WHERE booking_id = p_booking_id;

    GET DIAGNOSTICS v_rows_locked = ROW_COUNT;

    -- =========================================================================
    -- STEP 3: Insert audit log
    -- =========================================================================
    INSERT INTO public.audit_logs (action, order_id, status, raw_response)
    VALUES ('HOLD_CREATED', p_order_id, 'HELD', p_raw_response);

    -- =========================================================================
    -- STEP 4: Delete spent offers
    -- =========================================================================
    DELETE FROM public.booking_offers
    WHERE booking_id = p_booking_id;

    GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;

    -- =========================================================================
    -- STEP 5: Sync Ticket Price to main_table (if linked)
    -- =========================================================================
    IF v_main_table_id IS NOT NULL THEN
        UPDATE public.main_table
        SET 
            total_ticket_price = p_total_price,
            airlines_price     = p_total_price
        WHERE id = v_main_table_id;
    END IF;

    -- =========================================================================
    -- Return summary
    -- =========================================================================
    RETURN jsonb_build_object(
        'success',       TRUE,
        'rows_updated',  v_rows_updated,
        'rows_locked',   v_rows_locked,
        'offers_deleted', v_rows_deleted,
        'price_synced',  (v_main_table_id IS NOT NULL)
    );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Create update_passengers_atomic
--    Purpose: Atomic replace of passengers for DRAFT/HELD bookings.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_passengers_atomic(
  p_booking_id UUID,
  p_passengers JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  p_record JSONB;
BEGIN
  -- 1. Check status is DRAFT or HELD
  IF NOT EXISTS (
    SELECT 1 FROM bookings 
    WHERE id = p_booking_id 
    AND status IN ('DRAFT', 'HELD')
  ) THEN
    RAISE EXCEPTION 'BOOKING_LOCKED: Booking is not in editable status (DRAFT or HELD)'
        USING ERRCODE = 'P0002';
  END IF;

  -- 2. Delete existing passengers
  DELETE FROM booking_passengers WHERE booking_id = p_booking_id;

  -- 3. Insert new passengers
  FOR p_record IN SELECT * FROM jsonb_array_elements(p_passengers)
  LOOP
    INSERT INTO booking_passengers (
      booking_id,
      first_name,
      last_name,
      dob,
      gender,
      passport_number,
      passenger_type,
      is_locked
    ) VALUES (
      p_booking_id,
      p_record->>'first_name',
      p_record->>'last_name',
      (p_record->>'dob')::date,
      p_record->>'gender',
      p_record->>'passport_number',
      COALESCE(p_record->>'passenger_type', 'ADULT'),
      false -- Always unlocked when editing (or should we respect HOLD lock? No, we are editing)
    );
  END LOOP;
END;
$$;
