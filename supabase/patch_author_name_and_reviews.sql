-- =============================================================================
-- Patch: author_name en forum_posts + tabla cafe_reviews
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema inicial y patch_rpc_latlng.
-- =============================================================================

-- 1) Agregar columna author_name a forum_posts (si no existe)
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 2) Crear tabla cafe_reviews
CREATE TABLE IF NOT EXISTS public.cafe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafeterias (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  author_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cafe_reviews_cafe_id_idx
  ON public.cafe_reviews (cafe_id, created_at DESC);

-- 3) RLS
ALTER TABLE public.cafe_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cafe_reviews' AND policyname = 'cafe_reviews_select_authenticated'
  ) THEN
    CREATE POLICY "cafe_reviews_select_authenticated"
      ON public.cafe_reviews FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cafe_reviews' AND policyname = 'cafe_reviews_insert_own'
  ) THEN
    CREATE POLICY "cafe_reviews_insert_own"
      ON public.cafe_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cafe_reviews' AND policyname = 'cafe_reviews_delete_own'
  ) THEN
    CREATE POLICY "cafe_reviews_delete_own"
      ON public.cafe_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- 4) Grants
GRANT SELECT, INSERT, DELETE ON public.cafe_reviews TO authenticated;
