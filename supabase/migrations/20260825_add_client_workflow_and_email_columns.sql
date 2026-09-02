-- =========================================================================
-- 🏰 AMANTRANLINK: CLIENT WORKFLOW & CLIENT EMAIL EXTENSION MIGRATION
-- File: 20260825_add_client_workflow_and_email_columns.sql
-- Non-destructive, Idempotent, RLS-Enforced, Backward-Compatible
-- =========================================================================

-- 1. Extend wedding_sites with Partner Client Workflow Columns (including optional client_email)
DO $$
BEGIN
  -- Client Email (Optional, private to partner/creator)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_email TEXT;
  END IF;

  -- Client Phone / WhatsApp Number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_phone'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_phone TEXT;
  END IF;

  -- Workflow Status ('PREVIEW_READY', 'CLIENT_REVIEWED', 'CLIENT_APPROVED', 'LIVE', 'DRAFT')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'workflow_status'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN workflow_status TEXT DEFAULT 'DRAFT';
  END IF;

  -- Partner Private Notes (Studio only)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'partner_notes'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN partner_notes TEXT;
  END IF;

  -- Client Feedback / Revision Notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_feedback'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_feedback TEXT;
  END IF;

  -- Client Approval Timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  -- Partner ID Reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  -- Studio Badge Text
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'studio_badge'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN studio_badge TEXT;
  END IF;
END $$;

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_sites_partner_id ON public.wedding_sites(partner_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_workflow_status ON public.wedding_sites(workflow_status);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_client_email ON public.wedding_sites(client_email);

-- 3. Row Level Security (RLS) Verification
ALTER TABLE public.wedding_sites ENABLE ROW LEVEL SECURITY;

-- Partner & Owner Access Policy
DROP POLICY IF EXISTS "Users and Partners can view own wedding sites" ON public.wedding_sites;
CREATE POLICY "Users and Partners can view own wedding sites" ON public.wedding_sites
  FOR SELECT USING (
    auth.uid() = user_id 
    OR auth.uid() = partner_id 
    OR status = 'published'
  );

DROP POLICY IF EXISTS "Users and Partners can insert wedding sites" ON public.wedding_sites;
CREATE POLICY "Users and Partners can insert wedding sites" ON public.wedding_sites
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() = partner_id
  );

DROP POLICY IF EXISTS "Users and Partners can update own wedding sites" ON public.wedding_sites;
CREATE POLICY "Users and Partners can update own wedding sites" ON public.wedding_sites
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR auth.uid() = partner_id
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
