-- ====================================================================
-- 🏰 SHAHI STUDIO PRODUCTION SUPABASE SCHEMA (IDEMPOTENT & ERROR-FREE)
-- ====================================================================

-- 1. Profiles Table (Referencing auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '+91 9409360336',
  avatar_url TEXT,
  role TEXT DEFAULT 'couple',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Templates Table (7 Royal Themes Catalog)
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  preview_image TEXT,
  price INTEGER NOT NULL DEFAULT 149900, -- in Paise
  category TEXT DEFAULT 'heritage',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial 7 Royal Themes
INSERT INTO public.templates (slug, name, preview_image, price, category)
VALUES
  ('rajmahal', 'The Rajmahal (3D Palace Gateway)', '/previews/theme-rajmahal.webp', 249900, 'heritage'),
  ('royaldawn', 'The Royal Dawn (Udaipur Lakefront & Scratch Card)', '/previews/theme-royaldawn.webp', 249900, 'heritage'),
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

-- 3. Purchases Table (Unlocked Templates per User)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'unlocked' NOT NULL,
  payment_reference TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_template_purchase UNIQUE (user_id, template_id)
);

-- 4. Wedding Sites Table (Drafts & Published Kankotris)
CREATE TABLE IF NOT EXISTS public.wedding_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE NOT NULL,
  published_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Guest RSVPs Table (With Auto-Migration for Existing Tables)
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
  wedding_slug TEXT,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  attendees_count INTEGER DEFAULT 1,
  wishes TEXT,
  attending BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🔄 Safe Schema Migration: Ensure columns exist even if rsvps was previously created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'wedding_site_id'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'wedding_slug'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN wedding_slug TEXT;
  END IF;
END $$;

-- ====================================================================
-- 🛡️ ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Templates RLS (Public Read)
DROP POLICY IF EXISTS "Public can view templates" ON public.templates;
CREATE POLICY "Public can view templates" ON public.templates
  FOR SELECT USING (true);

-- Purchases RLS (Owner Read Only)
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Wedding Sites RLS
DROP POLICY IF EXISTS "View published sites or own drafts" ON public.wedding_sites;
CREATE POLICY "View published sites or own drafts" ON public.wedding_sites
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own wedding site" ON public.wedding_sites;
CREATE POLICY "Users can create own wedding site" ON public.wedding_sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update unlocked wedding sites" ON public.wedding_sites;
CREATE POLICY "Users can update unlocked wedding sites" ON public.wedding_sites
  FOR UPDATE USING (auth.uid() = user_id AND is_locked = false);

-- RSVPs RLS
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
      AND public.wedding_sites.user_id = auth.uid()
    )
  );

-- ====================================================================
-- ⚡ AUTOMATIC USER PROFILE TRIGGER
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', '+91 9409360336'),
    new.raw_user_meta_data->>'avatar_url'
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
