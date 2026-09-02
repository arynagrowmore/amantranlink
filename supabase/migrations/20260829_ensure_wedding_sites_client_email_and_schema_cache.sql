-- =========================================================================
-- 🏰 AMANTRANLINK: POSTGREST SCHEMA CACHE & CLIENT EMAIL RECONCILIATION
-- File: 20260829_ensure_wedding_sites_client_email_and_schema_cache.sql
-- Idempotent, Non-Destructive, Schema Cache Reload
-- =========================================================================

-- 1. Ensure all Client Workflow & Partner Columns exist in public.wedding_sites
DO $$
BEGIN
  -- Client Email (Optional, private to studio partner & creator)
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

  -- Workflow Status ('DRAFT', 'SENT_FOR_REVIEW', 'CHANGES_REQUESTED', 'CLIENT_APPROVED', 'LIVE')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'workflow_status'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN workflow_status TEXT DEFAULT 'DRAFT';
  END IF;

  -- Lifecycle Status ('DRAFT', 'ACTIVE', 'ARCHIVED')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'lifecycle_status'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN lifecycle_status TEXT DEFAULT 'DRAFT';
  END IF;

  -- Client Payment Tracking Status ('NOT_TRACKED', 'PENDING', 'PARTIALLY_PAID', 'PAID')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_payment_status'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_payment_status TEXT DEFAULT 'NOT_TRACKED';
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

  -- Template ID Column (e.g. 'rajmahal', 'royaldawn', 'jharokha')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN template_id TEXT DEFAULT 'rajmahal';
  END IF;
END $$;

-- 2. Seed All Royal Themes into public.templates if missing
INSERT INTO public.templates (slug, name, preview_image, price, category)
VALUES
  ('rajmahal', 'The Rajmahal (3D Palace Gateway)', '/previews/theme-rajmahal.webp', 249900, 'heritage'),
  ('royaldawn', 'The Royal Dawn (Udaipur Lakefront & Scratch Card)', '/previews/theme-royaldawn.webp', 249900, 'heritage'),
  ('royalring', 'The Royal Ring (3D Floating Diamond Engagement)', '/previews/theme-royalring.webp', 199900, 'engagement'),
  ('jharokha', 'The Jharokha (Rajasthani Marble Arch)', '/previews/theme-jharokha.webp', 149900, 'traditional'),
  ('mayura', 'The Mayura (Peacock Teal Plumage)', '/previews/theme-mayura.webp', 149900, 'traditional'),
  ('jodi', 'The Jodi (Festive Gold Thaali)', '/previews/theme-jodi.webp', 149900, 'traditional'),
  ('dak', 'The Shahi Dâk (Vintage Royal Postal Telegram)', '/previews/theme-dak.webp', 149900, 'heritage'),
  ('ivory', 'The Ivory Minimalist (Modern Editorial)', '/previews/theme-ivory.webp', 149900, 'modern')
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  preview_image = EXCLUDED.preview_image,
  price = EXCLUDED.price,
  category = EXCLUDED.category;

-- 3. Performance & Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_sites_partner_id ON public.wedding_sites(partner_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_workflow_status ON public.wedding_sites(workflow_status);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_client_email ON public.wedding_sites(client_email);

-- 4. Notify PostgREST to immediately refresh its schema cache
NOTIFY pgrst, 'reload schema';
