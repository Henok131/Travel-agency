-- Migration 026: Add missing indexes and unique constraints for enterprise hardening
-- Applied: 2026-02-17
-- All indexes applied CONCURRENTLY via execute_sql (outside transaction)
-- Unique constraints applied via apply_migration

-- Performance Indexes (applied concurrently)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_gds_pnr ON public.bookings (gds_pnr);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_gds_order_id ON public.bookings (gds_order_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON public.bookings (status);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_passengers_booking_id ON public.booking_passengers (booking_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_flights_booking_id ON public.booking_flights (booking_id);

-- Unique Constraints (data integrity)
ALTER TABLE public.bookings ADD CONSTRAINT uq_bookings_gds_pnr UNIQUE (gds_pnr);
ALTER TABLE public.bookings ADD CONSTRAINT uq_bookings_gds_order_id UNIQUE (gds_order_id);
