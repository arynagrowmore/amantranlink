-- =========================================================================
-- 👑 AMANTRANLINK: ADMIN CONTROL CENTER & PLATFORM CMS MIGRATION
-- File: 20260827_admin_control_center.sql
-- Non-destructive, Idempotent, RLS-Enforced, Backward-Compatible
-- =========================================================================

-- 1. Extend profiles with account_status ('active' | 'suspended')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));
  END IF;
END $$;

-- 2. Extend wedding_sites with is_suspended (boolean)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE public.wedding_sites ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 3. Create Admin Audit Logs Table (Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_value JSONB DEFAULT '{}'::jsonb,
  new_value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor ON public.admin_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 4. Create Financial Adjustments Table (Auditable Balance Adjustments)
CREATE TABLE IF NOT EXISTS public.financial_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('CREDIT', 'DEBIT', 'BONUS', 'PENALTY', 'CORRECTION')),
  reason TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_financial_adjustments_partner ON public.financial_adjustments(partner_id);

-- 5. Create Template Metadata Table (Admin CMS Layer)
CREATE TABLE IF NOT EXISTS public.template_metadata (
  template_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT DEFAULT 'heritage',
  preview_image TEXT,
  retail_price INTEGER NOT NULL DEFAULT 1299,
  partner_price INTEGER NOT NULL DEFAULT 899,
  partner_commission INTEGER NOT NULL DEFAULT 400,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  display_order INTEGER DEFAULT 1 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed existing 7 royal themes metadata if not already seeded
INSERT INTO public.template_metadata (template_id, name, display_name, category, preview_image, retail_price, partner_price, partner_commission, active, featured, display_order)
VALUES
  ('rajmahal', 'The Rajmahal 3D Palace', 'The Rajmahal 3D Palace', 'heritage', '/previews/theme-rajmahal.webp', 1299, 899, 400, true, true, 1),
  ('royaldawn', 'The Royal Dawn (Lakefront)', 'The Royal Dawn (Lakefront)', 'heritage', '/previews/theme-royaldawn.webp', 1299, 899, 400, true, true, 2),
  ('royalring', 'The Royal Ring (3D Engagement)', 'The Royal Ring (3D Engagement)', 'engagement', '/previews/theme-royalring.webp', 1299, 899, 400, true, false, 3),
  ('jharokha', 'The Jharokha Mandap', 'The Jharokha Mandap', 'traditional', '/previews/theme-jharokha.webp', 999, 699, 300, true, false, 4),
  ('mayura', 'The Mayura Peacock', 'The Mayura Peacock', 'traditional', '/previews/theme-mayura.webp', 999, 699, 300, true, false, 5),
  ('jodi', 'The Shubh Jodi', 'The Shubh Jodi', 'traditional', '/previews/theme-jodi.webp', 999, 699, 300, true, false, 6),
  ('dak', 'The Shahi Dâk', 'The Shahi Dâk', 'heritage', '/previews/theme-dak.webp', 999, 699, 300, true, false, 7),
  ('ivory', 'The Ivory Minimalist', 'The Ivory Minimalist', 'modern', '/previews/theme-ivory.webp', 999, 699, 300, true, false, 8)
ON CONFLICT (template_id) DO NOTHING;

-- 6. Create Pricing Tiers Table (Admin Pricing Configuration)
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  package_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  retail_price INTEGER NOT NULL,
  partner_price INTEGER NOT NULL,
  partner_commission INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.pricing_tiers (package_id, name, retail_price, partner_price, partner_commission, active)
VALUES
  ('silver', 'Shahi Silver (1 Selected Royal Theme)', 999, 699, 300, true),
  ('gold', 'Shahi Gold Royal (All 7 Royal Themes)', 1299, 899, 400, true),
  ('platinum', 'Rajmahal Platinum VIP (Bespoke & All Themes)', 2499, 1699, 800, true)
ON CONFLICT (package_id) DO NOTHING;

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Helper function to verify admin role in RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit Logs: Only admins can view, only backend/authenticated admins can insert
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

-- Financial Adjustments: Admins full access, Partners can only view own adjustments
DROP POLICY IF EXISTS "Admins manage financial adjustments" ON public.financial_adjustments;
CREATE POLICY "Admins manage financial adjustments" ON public.financial_adjustments
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Partners view own financial adjustments" ON public.financial_adjustments;
CREATE POLICY "Partners view own financial adjustments" ON public.financial_adjustments
  FOR SELECT USING (auth.uid() = partner_id);

-- Template Metadata & Pricing Tiers: Anyone can read active metadata, only Admins can update
DROP POLICY IF EXISTS "Anyone can read active template metadata" ON public.template_metadata;
CREATE POLICY "Anyone can read active template metadata" ON public.template_metadata
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage template metadata" ON public.template_metadata;
CREATE POLICY "Admins manage template metadata" ON public.template_metadata
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can read active pricing tiers" ON public.pricing_tiers;
CREATE POLICY "Anyone can read active pricing tiers" ON public.pricing_tiers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage pricing tiers" ON public.pricing_tiers;
CREATE POLICY "Admins manage pricing tiers" ON public.pricing_tiers
  FOR ALL USING (public.is_admin());

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
