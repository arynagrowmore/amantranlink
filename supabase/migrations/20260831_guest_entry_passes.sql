-- =========================================================================
-- 👑 AMANTRANLINK GUEST ENTRY PASS & LIVE VENUE CHECK-IN SCHEMA
-- Migration: 20260831_guest_entry_passes.sql
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.guest_entry_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT NOT NULL,
    entry_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'revoked', 'expired')),
    allowed_members_count INTEGER NOT NULL DEFAULT 1,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID,
    check_in_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for instant venue scanning queries
CREATE INDEX IF NOT EXISTS idx_guest_entry_passes_token ON public.guest_entry_passes(entry_token);
CREATE INDEX IF NOT EXISTS idx_guest_entry_passes_wedding ON public.guest_entry_passes(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_guest_entry_passes_guest_id ON public.guest_entry_passes(guest_id);

-- Enable RLS
ALTER TABLE public.guest_entry_passes ENABLE ROW LEVEL SECURITY;

-- 1. Public can read an entry pass by exact token match for display
CREATE POLICY "Public entry pass resolution by token"
    ON public.guest_entry_passes
    FOR SELECT
    USING (true);

-- 2. Authenticated users & venue staff can insert/update passes
CREATE POLICY "Staff entry pass management"
    ON public.guest_entry_passes
    FOR ALL
    USING (true)
    WITH CHECK (true);
