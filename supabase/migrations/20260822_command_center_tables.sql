-- ====================================================================
-- 🏰 SHAHI STUDIO — WEDDING COMMAND CENTER DATABASE EXTENSION
-- ====================================================================

-- 1. Wedding Expenses Table (Royal Wedding Ledger)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for instant querying per wedding site
CREATE INDEX IF NOT EXISTS idx_wedding_expenses_site_id ON public.wedding_expenses(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_wedding_expenses_user_id ON public.wedding_expenses(user_id);

-- RLS for wedding_expenses
ALTER TABLE public.wedding_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wedding expenses"
  ON public.wedding_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wedding expenses"
  ON public.wedding_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wedding expenses"
  ON public.wedding_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wedding expenses"
  ON public.wedding_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Wedding Checklist Items Table (Private Wedding Checklist)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for instant querying per wedding site
CREATE INDEX IF NOT EXISTS idx_wedding_checklist_site_id ON public.wedding_checklist_items(wedding_site_id);
CREATE INDEX IF NOT EXISTS idx_wedding_checklist_user_id ON public.wedding_checklist_items(user_id);

-- RLS for wedding_checklist_items
ALTER TABLE public.wedding_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wedding checklist"
  ON public.wedding_checklist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wedding checklist"
  ON public.wedding_checklist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wedding checklist"
  ON public.wedding_checklist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wedding checklist"
  ON public.wedding_checklist_items FOR DELETE
  USING (auth.uid() = user_id);
