-- =========================================================================
-- 👑 AMANTRANLINK STUDIO WHITE-LABEL BRANDING & CLIENT REVIEWS SCHEMA
-- Migration: 20260831_studio_branding_and_reviews.sql
-- =========================================================================

-- 1. Studio Partner Branding Configuration
CREATE TABLE IF NOT EXISTS public.studio_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL UNIQUE,
    studio_name TEXT NOT NULL,
    studio_tagline TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#540D1E',
    secondary_color TEXT NOT NULL DEFAULT '#FAF6EE',
    accent_color TEXT NOT NULL DEFAULT '#F4D06F',
    business_email TEXT,
    business_phone TEXT,
    website_url TEXT,
    instagram_url TEXT,
    business_address TEXT,
    white_label_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Custom Domains for Studio White-label Portals
CREATE TABLE IF NOT EXISTS public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    domain_type TEXT NOT NULL DEFAULT 'studio' CHECK (domain_type IN ('studio', 'wedding')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'verified', 'failed', 'disconnected')),
    ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
    cname_target TEXT NOT NULL DEFAULT 'cname.amantranlink.com',
    verification_token TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Secure Project Review Links
CREATE TABLE IF NOT EXISTS public.project_review_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
    wedding_slug TEXT NOT NULL,
    studio_id UUID NOT NULL,
    review_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Section Feedback & Review Comments
CREATE TABLE IF NOT EXISTS public.project_review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_link_id UUID REFERENCES public.project_review_links(id) ON DELETE CASCADE,
    wedding_slug TEXT NOT NULL,
    section_id TEXT NOT NULL,
    section_title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'client' CHECK (author_role IN ('client', 'studio', 'guest')),
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID
);

-- 5. Design Approval Events & Revision History
CREATE TABLE IF NOT EXISTS public.project_approval_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_slug TEXT NOT NULL,
    studio_id UUID,
    approved_by_name TEXT NOT NULL,
    approved_by_email TEXT,
    approval_note TEXT,
    workflow_status TEXT NOT NULL DEFAULT 'approved' CHECK (workflow_status IN ('draft', 'ready_for_review', 'changes_requested', 'revision_in_progress', 'approved', 'published')),
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid queries
CREATE INDEX IF NOT EXISTS idx_studio_branding_id ON public.studio_branding(studio_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_studio ON public.custom_domains(studio_id);
CREATE INDEX IF NOT EXISTS idx_review_links_token ON public.project_review_links(review_token);
CREATE INDEX IF NOT EXISTS idx_review_links_slug ON public.project_review_links(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_review_comments_slug ON public.project_review_comments(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_approval_events_slug ON public.project_approval_events(wedding_slug);

-- Enable RLS
ALTER TABLE public.studio_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_approval_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Studio branding management" ON public.studio_branding FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Custom domain management" ON public.custom_domains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Project review links access" ON public.project_review_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Review comments access" ON public.project_review_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Approval events access" ON public.project_approval_events FOR ALL USING (true) WITH CHECK (true);
