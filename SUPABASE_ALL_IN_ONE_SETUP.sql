-- ==============================================================================
-- 🏰 AMANTRANLINK & SHAHI STUDIO — COMPLETE PRODUCTION ALL-IN-ONE SUPABASE SETUP
-- ==============================================================================
-- File: SUPABASE_ALL_IN_ONE_SETUP.sql
-- Target: Supabase PostgreSQL (Project: owziiqdxbvynrprugvwk)
-- Instructions:
--   1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/owziiqdxbvynrprugvwk
--   2. Click on "SQL Editor" in the left sidebar.
--   3. Click "New Query", paste this ENTIRE file, and click "Run" (▶).
-- Safe & Non-Destructive: Can be executed repeatedly without losing existing data.
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
  city TEXT,
  state TEXT,
  website_or_insta TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all extended profile columns exist idempotently
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'state') THEN
    ALTER TABLE public.profiles ADD COLUMN state TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website_or_insta') THEN
    ALTER TABLE public.profiles ADD COLUMN website_or_insta TEXT;
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
  workflow_status TEXT DEFAULT 'DRAFT', -- 'DRAFT' | 'IN_REVIEW' | 'CLIENT_APPROVED' | 'READY_FOR_DELIVERY' | 'DELIVERED'
  client_phone TEXT,
  client_email TEXT,
  partner_notes TEXT,
  client_feedback TEXT,
  approved_at TIMESTAMPTZ,
  is_suspended BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all extended columns exist on wedding_sites
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'wedding_sites' AND column_name = 'is_suspended') THEN
    ALTER TABLE public.wedding_sites ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ==============================================================================
-- 👥 5. GUESTS TABLE (VIP Roster, Relationship, and Personal Tokens)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
  wedding_slug TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  family_name TEXT,
  relationship TEXT DEFAULT 'Family' NOT NULL,
  number_of_members INTEGER DEFAULT 1 NOT NULL,
  guest_type TEXT DEFAULT 'Family' NOT NULL,
  personal_invitation_token TEXT UNIQUE NOT NULL,
  invitation_status TEXT DEFAULT 'draft' NOT NULL,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💌 6. GUEST RSVPS TABLE (Guest Attendance, Meal Preferences & Wishes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
  wedding_slug TEXT,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  attendees_count INTEGER DEFAULT 1,
  wishes TEXT,
  attending BOOLEAN DEFAULT TRUE,
  meal_preference TEXT DEFAULT 'Traditional Vegetarian',
  dietary_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'guest_id') THEN
    ALTER TABLE public.rsvps ADD COLUMN guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'meal_preference') THEN
    ALTER TABLE public.rsvps ADD COLUMN meal_preference TEXT DEFAULT 'Traditional Vegetarian';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'dietary_requirements') THEN
    ALTER TABLE public.rsvps ADD COLUMN dietary_requirements TEXT;
  END IF;
END $$;

-- ==============================================================================
-- 📸 7. WEDDING MEMORIES TABLE (Live Digital Guestbook & Photo Uploads)
-- ==============================================================================
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

-- ==============================================================================
-- 🎟️ 8. GUEST ENTRY PASSES TABLE (VIP QR Gate Check-in)
-- ==============================================================================
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

-- ==============================================================================
-- 🎨 9. STUDIO WHITE-LABEL BRANDING & CUSTOM DOMAINS TABLE
-- ==============================================================================
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

-- ==============================================================================
-- 📝 10. PROJECT REVIEW LINKS & COMMENTS TABLE (Client Approval Flow)
-- ==============================================================================
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

CREATE TABLE IF NOT EXISTS public.project_review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_link_id UUID REFERENCES public.project_review_links(id) ON DELETE CASCADE,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'client' CHECK (author_role IN ('client', 'studio', 'admin')),
  section_key TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- ==============================================================================
-- 💼 11. STUDIO FINANCE & BILLING ERP (GST, Services, Packages)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.studio_business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL UNIQUE,
  legal_business_name TEXT NOT NULL,
  display_business_name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
  default_gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  business_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pin_code TEXT NOT NULL,
  billing_email TEXT NOT NULL,
  billing_phone TEXT NOT NULL,
  invoice_prefix TEXT NOT NULL DEFAULT 'AL-INV-',
  quotation_prefix TEXT NOT NULL DEFAULT 'AL-QUO-',
  default_payment_terms TEXT DEFAULT '50% Advance, 50% on Final Delivery',
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  upi_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.studio_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'invitation' CHECK (category IN ('invitation', 'video', 'guest_mgmt', 'domain', 'photography', 'addon', 'custom')),
  price_paise BIGINT NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  hsn_sac TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.studio_service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL,
  package_name TEXT NOT NULL,
  description TEXT,
  total_price_paise BIGINT NOT NULL DEFAULT 0,
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 📈 12. PARTNER ECOSYSTEM: COMMISSIONS, SETTLEMENTS & ANALYTICS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.commissions_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  purchase_id TEXT,
  retail_price INTEGER NOT NULL,
  partner_price INTEGER,
  commission_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'credited' CHECK (status IN ('pending', 'credited', 'paid')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.partner_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.partner_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 500),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'rejected', 'reversed')),
  payout_upi TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 📥 13. EXPORT JOBS TABLE (Download Hub & PDF Rendering)
-- ==============================================================================
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

-- ==============================================================================
-- 📦 14. SUPABASE STORAGE BUCKET CONFIGURATION (Photos & Audio)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-media',
  'wedding-media',
  true,
  20971520, -- 20MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];

-- Storage Object RLS Policies
DROP POLICY IF EXISTS "Public can view wedding media" ON storage.objects;
CREATE POLICY "Public can view wedding media" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-media');

DROP POLICY IF EXISTS "Anyone can upload wedding media" ON storage.objects;
CREATE POLICY "Anyone can upload wedding media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-media');

DROP POLICY IF EXISTS "Anyone can update wedding media" ON storage.objects;
CREATE POLICY "Anyone can update wedding media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wedding-media');

DROP POLICY IF EXISTS "Anyone can delete wedding media" ON storage.objects;
CREATE POLICY "Anyone can delete wedding media" ON storage.objects
  FOR DELETE USING (bucket_id = 'wedding-media');

-- ==============================================================================
-- ⚡ 15. AUTOMATIC PROFILE CREATION TRIGGER (On auth.users SignUp)
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
-- 🛡️ 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_entry_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
CREATE POLICY "Public can view basic profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can insert profile" ON public.profiles;
CREATE POLICY "Public can insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Templates Policies
DROP POLICY IF EXISTS "Public can view templates" ON public.templates;
CREATE POLICY "Public can view templates" ON public.templates FOR SELECT USING (true);

-- Purchases Policies
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can insert purchases" ON public.purchases;
CREATE POLICY "Service role can insert purchases" ON public.purchases FOR ALL USING (true);

-- Wedding Sites Policies
DROP POLICY IF EXISTS "View published sites or own drafts or partner sites" ON public.wedding_sites;
CREATE POLICY "View published sites or own drafts or partner sites" ON public.wedding_sites
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own wedding site" ON public.wedding_sites;
CREATE POLICY "Users can create own wedding site" ON public.wedding_sites
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update unlocked wedding sites" ON public.wedding_sites;
CREATE POLICY "Users can update unlocked wedding sites" ON public.wedding_sites
  FOR UPDATE USING (true);

-- RSVPs Policies
DROP POLICY IF EXISTS "Public can submit RSVPs" ON public.rsvps;
CREATE POLICY "Public can submit RSVPs" ON public.rsvps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Couples can view RSVPs of their site" ON public.rsvps;
CREATE POLICY "Couples can view RSVPs of their site" ON public.rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Couples can update RSVPs" ON public.rsvps;
CREATE POLICY "Couples can update RSVPs" ON public.rsvps FOR UPDATE USING (true);

-- Guests Policies
DROP POLICY IF EXISTS "Manage guests" ON public.guests;
CREATE POLICY "Manage guests" ON public.guests FOR ALL USING (true) WITH CHECK (true);

-- Wedding Memories Policies
DROP POLICY IF EXISTS "Public approved memories view" ON public.wedding_memories;
CREATE POLICY "Public approved memories view" ON public.wedding_memories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public guest memory submission" ON public.wedding_memories;
CREATE POLICY "Public guest memory submission" ON public.wedding_memories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Host memory moderation" ON public.wedding_memories;
CREATE POLICY "Host memory moderation" ON public.wedding_memories FOR ALL USING (true) WITH CHECK (true);

-- Guest Entry Passes
DROP POLICY IF EXISTS "Public entry pass resolution by token" ON public.guest_entry_passes;
CREATE POLICY "Public entry pass resolution by token" ON public.guest_entry_passes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff entry pass management" ON public.guest_entry_passes;
CREATE POLICY "Staff entry pass management" ON public.guest_entry_passes FOR ALL USING (true) WITH CHECK (true);

-- Studio Branding & Review Policies
DROP POLICY IF EXISTS "Studio branding access" ON public.studio_branding;
CREATE POLICY "Studio branding access" ON public.studio_branding FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Custom domains access" ON public.custom_domains;
CREATE POLICY "Custom domains access" ON public.custom_domains FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Project review links access" ON public.project_review_links;
CREATE POLICY "Project review links access" ON public.project_review_links FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Project review comments access" ON public.project_review_comments;
CREATE POLICY "Project review comments access" ON public.project_review_comments FOR ALL USING (true) WITH CHECK (true);

-- Studio Finance Policies
DROP POLICY IF EXISTS "Studio business profiles access" ON public.studio_business_profiles;
CREATE POLICY "Studio business profiles access" ON public.studio_business_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Studio services access" ON public.studio_services;
CREATE POLICY "Studio services access" ON public.studio_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Studio service packages access" ON public.studio_service_packages;
CREATE POLICY "Studio service packages access" ON public.studio_service_packages FOR ALL USING (true) WITH CHECK (true);

-- Ledger, Settlements & Analytics
DROP POLICY IF EXISTS "Commissions ledger access" ON public.commissions_ledger;
CREATE POLICY "Commissions ledger access" ON public.commissions_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Partner analytics events access" ON public.partner_analytics_events;
CREATE POLICY "Partner analytics events access" ON public.partner_analytics_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Partner settlements access" ON public.partner_settlements;
CREATE POLICY "Partner settlements access" ON public.partner_settlements FOR ALL USING (true) WITH CHECK (true);

-- Export Jobs
DROP POLICY IF EXISTS "Export jobs access" ON public.export_jobs;
CREATE POLICY "Export jobs access" ON public.export_jobs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 🚀 17. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_wedding_sites_published_url ON public.wedding_sites (published_url);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_user_id ON public.wedding_sites (user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_partner_id ON public.wedding_sites (partner_id);
CREATE INDEX IF NOT EXISTS idx_wedding_sites_workflow_status ON public.wedding_sites (workflow_status);
CREATE INDEX IF NOT EXISTS idx_guests_slug ON public.guests (wedding_slug);
CREATE INDEX IF NOT EXISTS idx_guests_token ON public.guests (personal_invitation_token);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_site_id ON public.rsvps (wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_slug ON public.rsvps (wedding_slug);
CREATE INDEX IF NOT EXISTS idx_wedding_memories_slug ON public.wedding_memories(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_wedding_memories_status ON public.wedding_memories(status);
CREATE INDEX IF NOT EXISTS idx_guest_entry_passes_token ON public.guest_entry_passes(entry_token);
CREATE INDEX IF NOT EXISTS idx_commissions_ledger_partner_id ON public.commissions_ledger (partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_events_partner ON public.partner_analytics_events (partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_settlements_partner ON public.partner_settlements (partner_id);

-- ==============================================================================
-- 🔄 18. NOTIFY POSTGREST SCHEMA CACHE RELOAD
-- ==============================================================================
NOTIFY pgrst, 'reload schema';

-- 🏰 ALL DONE! 🏰
