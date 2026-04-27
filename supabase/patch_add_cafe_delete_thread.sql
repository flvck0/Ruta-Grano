-- =============================================================================
-- Patch: Políticas de Borrado para Hilos y Creación de Cafeterías
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Permitir a los usuarios borrar sus propios hilos
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forum_threads' AND policyname = 'forum_threads_delete_own'
  ) THEN
    CREATE POLICY "forum_threads_delete_own"
      ON public.forum_threads FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

-- 2. Permitir a los usuarios borrar sus propias respuestas (opcional pero útil)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'forum_posts_delete_own'
  ) THEN
    CREATE POLICY "forum_posts_delete_own"
      ON public.forum_posts FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- 3. Permitir a los usuarios autenticados crear nuevas cafeterías
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cafeterias' AND policyname = 'cafeterias_insert_authenticated'
  ) THEN
    CREATE POLICY "cafeterias_insert_authenticated"
      ON public.cafeterias FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- 4. RPC (Procedimiento almacenado) para insertar una cafetería de manera segura usando PostGIS
CREATE OR REPLACE FUNCTION public.create_cafeteria(
  p_name TEXT,
  p_description TEXT,
  p_address TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO public.cafeterias (
    name,
    description,
    address,
    location,
    created_by
  )
  VALUES (
    p_name,
    p_description,
    p_address,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    auth.uid()
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;
