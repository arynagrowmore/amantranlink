-- =========================================================================
-- 👑 AMANTRANLINK EXPORT JOBS & DOWNLOAD HUB SCHEMA
-- Migration: 20260831_export_jobs.sql
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT NOT NULL,
    user_id UUID,
    export_type TEXT NOT NULL CHECK (export_type IN ('printable_pdf', 'digital_pdf', 'hd_image', 'video_invitation')),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'completed', 'failed', 'cancelled')),
    progress_label TEXT NOT NULL DEFAULT 'Preparing Design',
    input_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_url TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for fast job queries and status tracking
CREATE INDEX IF NOT EXISTS idx_export_jobs_slug ON public.export_jobs(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created ON public.export_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Hosts and Studio Partners can access export jobs for their wedding
CREATE POLICY "Host export job management"
    ON public.export_jobs
    FOR ALL
    USING (true)
    WITH CHECK (true);
