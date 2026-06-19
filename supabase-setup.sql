-- ============================================================
-- Clozest Supabase Setup Guide
-- Run these statements in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Create Storage Buckets ────────────────────────────────
-- Navigate to: Storage → New Bucket

-- wardrobe-items  (public: false)
-- avatars         (public: false)
-- outfit-assets   (public: false)

-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('wardrobe-items', 'wardrobe-items', true),
  ('avatars',        'avatars',        true),
  ('outfit-assets',  'outfit-assets',  true)
ON CONFLICT DO NOTHING;


-- ── 2. RLS Policies for Storage ──────────────────────────────
-- Users can only upload to their own folder (userId/*)

-- wardrobe-items: allow authenticated users to INSERT their own files
CREATE POLICY "Users can upload their own wardrobe items"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wardrobe-items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- wardrobe-items: allow users to SELECT their own files
CREATE POLICY "Users can view their own wardrobe items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'wardrobe-items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- wardrobe-items: allow users to DELETE their own files
CREATE POLICY "Users can delete their own wardrobe items"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wardrobe-items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Repeat for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ── 3. Prisma will create all database tables via: ───────────
-- npx prisma db push
-- (Run AFTER setting DATABASE_URL in .env.local)


-- ── 4. Environment Variables needed ─────────────────────────
-- DATABASE_URL        → Settings → Database → URI (with ?pgbouncer=true)
-- DIRECT_URL          → Settings → Database → URI (without pgbouncer)
-- NEXT_PUBLIC_SUPABASE_URL        → Settings → API → Project URL
-- NEXT_PUBLIC_SUPABASE_ANON_KEY   → Settings → API → anon key
-- SUPABASE_SERVICE_ROLE_KEY       → Settings → API → service_role key
