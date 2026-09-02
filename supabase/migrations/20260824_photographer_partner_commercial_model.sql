-- =========================================================================
-- 🏰 AMANTRANLINK: PHOTOGRAPHER PARTNER COMMERCIAL MODEL MIGRATION
-- File: 20260824_photographer_partner_commercial_model.sql
-- Non-destructive, Idempotent, RLS-Enforced
-- =========================================================================

-- 1. Extend profiles with Partner Role & Studio Metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'end_customer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'studio_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN studio_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'partner_slug'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN partner_slug TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'payout_upi'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN payout_upi TEXT;
  END IF;
END $$;

-- 2. Partner Attributions Table (Session & Client Attribution)
CREATE TABLE IF NOT EXISTS public.partner_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_token TEXT,
  partner_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by partner and session
CREATE INDEX IF NOT EXISTS idx_partner_attributions_slug ON public.partner_attributions(partner_slug);
CREATE INDEX IF NOT EXISTS idx_partner_attributions_partner_id ON public.partner_attributions(partner_id);

-- 3. Commissions Ledger Table (Idempotent Commission Tracking)
CREATE TABLE IF NOT EXISTS public.commissions_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL UNIQUE, -- 🔒 Replay protection / idempotency
  payment_id TEXT,
  retail_price INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'credited' CHECK (status IN ('pending', 'credited', 'paid')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commissions_ledger_partner_id ON public.commissions_ledger(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_ledger_order_id ON public.commissions_ledger(order_id);

-- 4. Extend wedding_sites with Partner Attribution & Studio Badge
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'studio_badge'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN studio_badge TEXT;
  END IF;
END $$;

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.partner_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions_ledger ENABLE ROW LEVEL SECURITY;

-- Partner Attributions Policies
DROP POLICY IF EXISTS "Partners can view own attributions" ON public.partner_attributions;
CREATE POLICY "Partners can view own attributions" ON public.partner_attributions
  FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Anyone can create attributions" ON public.partner_attributions;
CREATE POLICY "Anyone can create attributions" ON public.partner_attributions
  FOR INSERT WITH CHECK (true);

-- Commissions Ledger Policies
DROP POLICY IF EXISTS "Partners can view own commissions" ON public.commissions_ledger;
CREATE POLICY "Partners can view own commissions" ON public.commissions_ledger
  FOR SELECT USING (auth.uid() = partner_id);

-- Server / Service role can insert/update commissions
DROP POLICY IF EXISTS "Service role can manage commissions" ON public.commissions_ledger;
CREATE POLICY "Service role can manage commissions" ON public.commissions_ledger
  FOR ALL USING (true);
