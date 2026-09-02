-- =========================================================================
-- 🏰 AMANTRANLINK: PHASE 9 TO PHASE 12 PARTNER ECOSYSTEM MIGRATION
-- File: 20260827_phase9_phase12_partner_ecosystem.sql
-- Non-destructive, Idempotent, RLS-Enforced, Backward-Compatible
-- =========================================================================

-- 1. Extend wedding_sites with Studio Client Payment Tracking & Review Token Reference
DO $$
BEGIN
  -- Client Studio Payment Status ('NOT_TRACKED', 'PENDING', 'PARTIAL', 'PAID')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_payment_status'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_payment_status TEXT DEFAULT 'NOT_TRACKED';
  END IF;

  -- Quoted Amount to Client (Studio internal tracking only)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'quoted_amount'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN quoted_amount INTEGER;
  END IF;

  -- Lifecycle Status ('DRAFT', 'SENT_FOR_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PAYMENT_PENDING', 'UNLOCKED', 'LIVE', 'ARCHIVED')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'lifecycle_status'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN lifecycle_status TEXT DEFAULT 'DRAFT';
  END IF;

  -- Active Review Token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'review_token'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN review_token TEXT UNIQUE;
  END IF;
END $$;

-- 2. Client Review Tokens Table (Secure Random Token, Expiration, Revocation)
CREATE TABLE IF NOT EXISTS public.client_review_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_review_tokens_token ON public.client_review_tokens(token);
CREATE INDEX IF NOT EXISTS idx_client_review_tokens_wedding_site ON public.client_review_tokens(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_client_review_tokens_partner_id ON public.client_review_tokens(partner_id);

-- 3. Structured Change Requests Table
CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_change_requests_wedding_site ON public.change_requests(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_partner_id ON public.change_requests(partner_id);

-- 4. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 5. Studio Team Foundation Table (Phase 12)
CREATE TABLE IF NOT EXISTS public.studio_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'STAFF' CHECK (role IN ('STUDIO_OWNER', 'EDITOR', 'STAFF', 'VIEWER')),
  invited_email TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'REVOKED')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(studio_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_studio_members_studio_id ON public.studio_members(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_members_user_id ON public.studio_members(user_id);

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.client_review_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_members ENABLE ROW LEVEL SECURITY;

-- Review Tokens Policies
DROP POLICY IF EXISTS "Partners can manage review tokens" ON public.client_review_tokens;
CREATE POLICY "Partners can manage review tokens" ON public.client_review_tokens
  FOR ALL USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Anyone can validate active review tokens" ON public.client_review_tokens;
CREATE POLICY "Anyone can validate active review tokens" ON public.client_review_tokens
  FOR SELECT USING (is_revoked = false);

-- Change Requests Policies
DROP POLICY IF EXISTS "Partners can view and manage change requests" ON public.change_requests;
CREATE POLICY "Partners can view and manage change requests" ON public.change_requests
  FOR ALL USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Clients can submit change requests" ON public.change_requests;
CREATE POLICY "Clients can submit change requests" ON public.change_requests
  FOR INSERT WITH CHECK (true);

-- Notifications Policies (Strict Tenant Isolation)
DROP POLICY IF EXISTS "Users can view and manage own notifications" ON public.notifications;
CREATE POLICY "Users can view and manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Studio Members Policies
DROP POLICY IF EXISTS "Studio owners can manage members" ON public.studio_members;
CREATE POLICY "Studio owners can manage members" ON public.studio_members
  FOR ALL USING (auth.uid() = studio_id OR auth.uid() = user_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
