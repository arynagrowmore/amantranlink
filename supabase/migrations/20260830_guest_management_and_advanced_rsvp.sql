-- ====================================================================
-- 👑 SHAHI VIVAH — GUEST MANAGEMENT & ADVANCED RSVP ENGINE
-- Migration: 20260830_guest_management_and_advanced_rsvp.sql
-- Robust relational architecture for Couple, Studio, & Guests
-- ====================================================================

-- 1. Create Guests Table (with both wedding_site_id and wedding_slug for resilience)
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_site_id UUID REFERENCES public.wedding_sites(id) ON DELETE CASCADE,
  wedding_slug TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  family_name TEXT,
  relationship TEXT DEFAULT 'Family' NOT NULL, -- 'Family', 'Friend', 'Relative', 'VIP', 'Business', 'Other'
  number_of_members INTEGER DEFAULT 1 NOT NULL,
  guest_type TEXT DEFAULT 'Family' NOT NULL,
  personal_invitation_token TEXT UNIQUE NOT NULL,
  invitation_status TEXT DEFAULT 'draft' NOT NULL, -- 'draft', 'sent', 'delivered', 'viewed'
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent column additions for guests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'guests' AND column_name = 'wedding_slug'
  ) THEN
    ALTER TABLE public.guests ADD COLUMN wedding_slug TEXT;
  END IF;
END $$;

-- 2. Ensure public.rsvps is extended for Advanced RSVP flow
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

DO $$
BEGIN
  -- Add guest_id link to rsvps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'guest_id'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL;
  END IF;

  -- Add attendance_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'attendance_status'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN attendance_status TEXT DEFAULT 'Attending';
  END IF;

  -- Add meal_preference / dietary
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'meal_preference'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN meal_preference TEXT DEFAULT 'Standard';
  END IF;

  -- Add special_note
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'special_note'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN special_note TEXT;
  END IF;

  -- Add responded_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rsvps' AND column_name = 'responded_at'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
  END IF;
END $$;

-- 3. Indexes for fast real-time search & filters
CREATE INDEX IF NOT EXISTS idx_guests_wedding_site_id ON public.guests(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_slug ON public.guests(wedding_slug);
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON public.guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_token ON public.guests(personal_invitation_token);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON public.rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_site_id ON public.rsvps(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_slug ON public.rsvps(wedding_slug);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Guests Table
DROP POLICY IF EXISTS "Users can view own guests" ON public.guests;
CREATE POLICY "Users can view own guests"
  ON public.guests FOR SELECT
  USING (
    auth.uid() = user_id OR
    (wedding_site_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.wedding_sites ws
      WHERE ws.id = guests.wedding_site_id AND ws.user_id = auth.uid()
    )) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'partner')
    )
  );

DROP POLICY IF EXISTS "Public can view guest by invitation token" ON public.guests;
CREATE POLICY "Public can view guest by invitation token"
  ON public.guests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own guests" ON public.guests;
CREATE POLICY "Users can insert own guests"
  ON public.guests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'partner')
    )
  );

DROP POLICY IF EXISTS "Users can update own guests" ON public.guests;
CREATE POLICY "Users can update own guests"
  ON public.guests FOR UPDATE
  USING (
    auth.uid() = user_id OR
    user_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'partner')
    )
  );

DROP POLICY IF EXISTS "Users can delete own guests" ON public.guests;
CREATE POLICY "Users can delete own guests"
  ON public.guests FOR DELETE
  USING (
    auth.uid() = user_id OR
    user_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'partner')
    )
  );

-- 6. RLS Policies for RSVPs
DROP POLICY IF EXISTS "Public can insert rsvps" ON public.rsvps;
CREATE POLICY "Public can insert rsvps"
  ON public.rsvps FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public and users can view rsvps" ON public.rsvps;
CREATE POLICY "Public and users can view rsvps"
  ON public.rsvps FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update rsvps" ON public.rsvps;
CREATE POLICY "Users can update rsvps"
  ON public.rsvps FOR UPDATE
  USING (true);

-- 7. Notify PostgREST schema reload
NOTIFY pgrst, 'reload schema';
