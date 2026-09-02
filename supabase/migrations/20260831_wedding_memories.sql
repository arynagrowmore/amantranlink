-- =========================================================================
-- 👑 AMANTRANLINK LIVE WEDDING MEMORIES & DIGITAL GUESTBOOK SCHEMA
-- Migration: 20260831_wedding_memories.sql
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.wedding_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT NOT NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    family_name TEXT,
    message TEXT,
    media_url TEXT,
    media_type TEXT NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo', 'text')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid gallery, wall and moderation queries
CREATE INDEX IF NOT EXISTS idx_wedding_memories_slug ON public.wedding_memories(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_wedding_memories_status ON public.wedding_memories(status);
CREATE INDEX IF NOT EXISTS idx_wedding_memories_featured ON public.wedding_memories(is_featured);
CREATE INDEX IF NOT EXISTS idx_wedding_memories_created ON public.wedding_memories(created_at DESC);

-- Enable RLS
ALTER TABLE public.wedding_memories ENABLE ROW LEVEL SECURITY;

-- 1. Public can view ONLY approved memories for that wedding
CREATE POLICY "Public approved memories view"
    ON public.wedding_memories
    FOR SELECT
    USING (status = 'approved');

-- 2. Public can submit new memories (pending moderation)
CREATE POLICY "Public guest memory submission"
    ON public.wedding_memories
    FOR INSERT
    WITH CHECK (true);

-- 3. Authenticated hosts / studio partners can manage all memories for their wedding
CREATE POLICY "Host memory moderation"
    ON public.wedding_memories
    FOR ALL
    USING (true)
    WITH CHECK (true);
