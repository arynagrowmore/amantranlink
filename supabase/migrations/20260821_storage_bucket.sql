-- ====================================================================
-- 🏰 SHAHI STUDIO SUPABASE STORAGE BUCKET & SECURITY POLICIES
-- Run this in Supabase SQL Editor to enable Photo & Music Uploads!
-- ====================================================================

-- 1. Create Public Storage Bucket for Wedding Media
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

-- 2. Storage Bucket Security Policies (RLS)
-- Allow Public to View/Stream photos and music
DROP POLICY IF EXISTS "Public can view wedding media" ON storage.objects;
CREATE POLICY "Public can view wedding media" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-media');

-- Allow Authenticated Users to Upload media into their own user folder
DROP POLICY IF EXISTS "Authenticated users can upload wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can upload wedding media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wedding-media' AND 
    auth.role() = 'authenticated'
  );

-- Allow Users to Delete/Update their own uploaded media
DROP POLICY IF EXISTS "Users can update own wedding media" ON storage.objects;
CREATE POLICY "Users can update own wedding media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wedding-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own wedding media" ON storage.objects;
CREATE POLICY "Users can delete own wedding media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wedding-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
