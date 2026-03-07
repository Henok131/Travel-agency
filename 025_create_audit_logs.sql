-- Migration 025: Create audit_logs table for enterprise-grade logging
-- Applied: 2026-02-17
-- Safe for production: CREATE TABLE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    action VARCHAR NOT NULL,
    order_id VARCHAR,
    status VARCHAR,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes (applied concurrently via execute_sql, not inside this transaction)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_order_id ON public.audit_logs (order_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
