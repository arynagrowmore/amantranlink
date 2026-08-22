-- ====================================================================
-- ⚡ DATABASE PERFORMANCE OPTIMIZATION: QUERY & FOREIGN KEY INDEXES
-- ====================================================================

-- 1. Fast Public Invitation Lookup by Slug (GET /i/:slug)
CREATE INDEX IF NOT EXISTS idx_wedding_sites_slug ON public.wedding_sites (slug);

-- 2. Scoped RSVP Queries & Cascade Joins by Wedding Site ID
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_site_id ON public.rsvps (wedding_site_id);

-- 3. Owner Wedding Sites Lookup by User ID (Profile & Studio Dashboard)
CREATE INDEX IF NOT EXISTS idx_wedding_sites_user_id ON public.wedding_sites (user_id);

-- 4. User Entitlements & Purchased Themes Lookup by User ID
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases (user_id);
