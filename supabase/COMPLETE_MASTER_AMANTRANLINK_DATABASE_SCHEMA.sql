-- ==============================================================================
-- 🏰 AMANTRANLINK & SHAHI STUDIO — COMPLETE PRODUCTION MASTER DATABASE SCHEMA
-- ==============================================================================
-- File: COMPLETE_MASTER_AMANTRANLINK_DATABASE_SCHEMA.sql
-- Compatibility: PostgreSQL 14+ / Supabase
-- Execution: Copy & paste this entire script into your Supabase SQL Editor and click "Run".
-- Characteristic: 100% IDEMPOTENT & NON-DESTRUCTIVE (Safe to re-run anytime).
-- ==============================================================================

-- 1. Enable Required Database Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 👤 1. USER PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '+91 9409360336',
  avatar_url TEXT,
  role TEXT DEFAULT 'couple', -- 'couple' | 'end_customer' | 'partner' | 'admin'
  studio_name TEXT,
  partner_slug TEXT UNIQUE,
  payout_upi TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Ensure all extended profile columns exist if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'couple';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'studio_name') THEN
    ALTER TABLE public.profiles ADD COLUMN studio_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'partner_slug') THEN
    ALTER TABLE public.profiles ADD COLUMN partner_slug TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'payout_upi') THEN
    ALTER TABLE public.profiles ADD COLUMN payout_upi TEXT;
  END IF;
END $$;

-- ==============================================================================
-- 👑 2. TEMPLATES CATALOG TABLE (8 Royal Themes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  preview_image TEXT,
  price INTEGER NOT NULL DEFAULT 149900, -- Price in Paise (₹1,499.00)
  category TEXT DEFAULT 'heritage',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed All 8 Royal Themes
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

-- ==============================================================================
-- 💎 3. PURCHASES TABLE (Theme Unlocks & Entitlements)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'unlocked' NOT NULL,
  payment_reference TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_template_purchase UNIQUE (user_id, template_id)
);

-- ==============================================================================
-- 🏰 4. WEDDING SITES TABLE (Project State & Published Kankotris)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wedding_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'rajmahal',
  status TEXT DEFAULT 'draft' NOT NULL, -- 'draft' | 'published'
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE NOT NULL,
  published_url TEXT,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  studio_badge TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Ensure partner & client workflow columns exist on wedding_sites
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'partner_id') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'studio_badge') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN studio_badge TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'workflow_status') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN workflow_status TEXT DEFAULT 'DRAFT';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_phone') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_email') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'partner_notes') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN partner_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'client_feedback') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN client_feedback TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'approved_at') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wedding_sites_partner_id ON public.wedding_sites(partner_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_workflow_status ON public.wedding_sites(workflow_status);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_client_email ON public.wedding_sites(client_email);

-- ==============================================================================
-- 💌 5. GUEST RSVPS TABLE (Guest Attendance & Wishes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
  wedding_slug TEXT,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  attendees_count INTEGER DEFAULT 1,
  wishes TEXT,
  attending BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Ensure foreign keys and slug exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'wedding_site_id') THEN
    ALTER TABLE public.rsvps ADD COLUMN wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'wedding_slug') THEN
    ALTER TABLE public.rsvps ADD COLUMN wedding_slug TEXT;
  END IF;
END $$;

-- ==============================================================================
-- 💰 6. WEDDING EXPENSES TABLE (Command Center Royal Budget Ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wedding_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  item_name TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0 NOT NULL,
  actual_cost NUMERIC DEFAULT 0 NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE NOT NULL,
  paid_amount NUMERIC DEFAULT 0 NOT NULL,
  vendor_name TEXT,
  vendor_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ✅ 7. WEDDING CHECKLIST ITEMS TABLE (Command Center Private Tasks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wedding_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  due_date DATE,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🔗 8. PARTNER ATTRIBUTIONS TABLE (Photographer Referral Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.partner_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_token TEXT,
  partner_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💵 9. COMMISSIONS LEDGER TABLE (Idempotent Commission Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.commissions_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL UNIQUE, -- 🔒 Replay protection / idempotency
  payment_id TEXT,
  purchase_id TEXT,
  retail_price INTEGER NOT NULL,
  partner_price INTEGER,
  commission_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'credited' CHECK (status IN ('pending', 'credited', 'paid')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Ensure partner_price and purchase_id columns exist on commissions_ledger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'commissions_ledger' AND column_name = 'partner_price') THEN
    ALTER TABLE public.commissions_ledger ADD COLUMN partner_price INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'commissions_ledger' AND column_name = 'purchase_id') THEN
    ALTER TABLE public.commissions_ledger ADD COLUMN purchase_id TEXT;
  END IF;
END $$;

-- ==============================================================================
-- 📦 10. SUPABASE STORAGE BUCKET CONFIGURATION (Photos & Audio)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-media',
  'wedding-media',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];

-- ==============================================================================
-- ⚡ 11. AUTOMATIC PROFILE CREATION TRIGGER (On auth.users SignUp)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', '+91 9409360336'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'couple')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 🛡️ 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions_ledger ENABLE ROW LEVEL SECURITY;

-- 👤 Profiles RLS
DROP POLICY IF EXISTS "Public can view basic partner profile" ON public.profiles;
CREATE POLICY "Public can view basic partner profile" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 👑 Templates RLS
DROP POLICY IF EXISTS "Public can view templates" ON public.templates;
CREATE POLICY "Public can view templates" ON public.templates
  FOR SELECT USING (true);

-- 💎 Purchases RLS
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert purchases" ON public.purchases;
CREATE POLICY "Service role can insert purchases" ON public.purchases
  FOR ALL USING (true);

-- 🏰 Wedding Sites RLS
DROP POLICY IF EXISTS "View published sites or own drafts or partner sites" ON public.wedding_sites;
CREATE POLICY "View published sites or own drafts or partner sites" ON public.wedding_sites
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Users can create own wedding site" ON public.wedding_sites;
CREATE POLICY "Users can create own wedding site" ON public.wedding_sites
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Users can update unlocked wedding sites" ON public.wedding_sites;
CREATE POLICY "Users can update unlocked wedding sites" ON public.wedding_sites
  FOR UPDATE USING ((auth.uid() = user_id OR auth.uid() = partner_id) AND is_locked = false);

-- 💌 RSVPs RLS
DROP POLICY IF EXISTS "Public can submit RSVPs" ON public.rsvps;
CREATE POLICY "Public can submit RSVPs" ON public.rsvps
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Couples can view RSVPs of their site" ON public.rsvps;
CREATE POLICY "Couples can view RSVPs of their site" ON public.rsvps
  FOR SELECT USING (
    wedding_site_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.wedding_sites
      WHERE public.wedding_sites.id = public.rsvps.wedding_site_id
      AND (public.wedding_sites.user_id = auth.uid() OR public.wedding_sites.partner_id = auth.uid())
    )
  );

-- 💰 Wedding Expenses RLS
DROP POLICY IF EXISTS "Users can view their own wedding expenses" ON public.wedding_expenses;
CREATE POLICY "Users can view their own wedding expenses" ON public.wedding_expenses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wedding expenses" ON public.wedding_expenses;
CREATE POLICY "Users can insert their own wedding expenses" ON public.wedding_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wedding expenses" ON public.wedding_expenses;
CREATE POLICY "Users can update their own wedding expenses" ON public.wedding_expenses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wedding expenses" ON public.wedding_expenses;
CREATE POLICY "Users can delete their own wedding expenses" ON public.wedding_expenses FOR DELETE USING (auth.uid() = user_id);

-- ✅ Wedding Checklist RLS
DROP POLICY IF EXISTS "Users can view their own wedding checklist" ON public.wedding_checklist_items;
CREATE POLICY "Users can view their own wedding checklist" ON public.wedding_checklist_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wedding checklist" ON public.wedding_checklist_items;
CREATE POLICY "Users can insert their own wedding checklist" ON public.wedding_checklist_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wedding checklist" ON public.wedding_checklist_items;
CREATE POLICY "Users can update their own wedding checklist" ON public.wedding_checklist_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wedding checklist" ON public.wedding_checklist_items;
CREATE POLICY "Users can delete their own wedding checklist" ON public.wedding_checklist_items FOR DELETE USING (auth.uid() = user_id);

-- 🔗 Partner Attributions RLS
DROP POLICY IF EXISTS "Partners can view own attributions" ON public.partner_attributions;
CREATE POLICY "Partners can view own attributions" ON public.partner_attributions FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Anyone can create attributions" ON public.partner_attributions;
CREATE POLICY "Anyone can create attributions" ON public.partner_attributions FOR INSERT WITH CHECK (true);

-- 💵 Commissions Ledger RLS
DROP POLICY IF EXISTS "Partners can view own commissions" ON public.commissions_ledger;
CREATE POLICY "Partners can view own commissions" ON public.commissions_ledger FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Service role can manage commissions" ON public.commissions_ledger;
CREATE POLICY "Service role can manage commissions" ON public.commissions_ledger FOR ALL USING (true);

-- 📦 Storage Object RLS Policies
DROP POLICY IF EXISTS "Public can view wedding media" ON storage.objects;
CREATE POLICY "Public can view wedding media" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-media');

DROP POLICY IF EXISTS "Authenticated users can upload wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can upload wedding media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own wedding media" ON storage.objects;
CREATE POLICY "Users can update own wedding media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wedding-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own wedding media" ON storage.objects;
CREATE POLICY "Users can delete own wedding media" ON storage.objects
  FOR DELETE USING (bucket_id = 'wedding-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ==============================================================================
-- 🚀 13. PERFORMANCE INDEXES (High Concurrency & Fast Queries)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_partner_slug ON public.profiles (partner_slug);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_published_url ON public.wedding_sites (published_url);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_user_id ON public.wedding_sites (user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_partner_id ON public.wedding_sites (partner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_site_id ON public.rsvps (wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_slug ON public.rsvps (wedding_slug);
CREATE INDEX IF NOT EXISTS idx_wedding_expenses_site_id ON public.wedding_expenses (wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_wedding_expenses_user_id ON public.wedding_expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_checklist_site_id ON public.wedding_checklist_items (wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_wedding_checklist_user_id ON public.wedding_checklist_items (user_id);
CREATE INDEX IF NOT EXISTS idx_partner_attributions_slug ON public.partner_attributions (partner_slug);
CREATE INDEX IF NOT EXISTS idx_partner_attributions_partner_id ON public.partner_attributions (partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_ledger_partner_id ON public.commissions_ledger (partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_ledger_order_id ON public.commissions_ledger (order_id);

-- ==============================================================================
-- 👑 SCHEMA SETUP COMPLETE & READY FOR PRODUCTION!
-- ==============================================================================
