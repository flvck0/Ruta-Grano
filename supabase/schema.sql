-- ==========================================
-- SCHEMA COMPLETO PARA RUTA GRANO
-- Ejecutar en Supabase SQL Editor
-- ==========================================

-- Habilitar extensión espacial para ubicaciones
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. TABLA: perfiles de usuario (conectado con auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: cafeterías
CREATE TABLE IF NOT EXISTS public.cafeterias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- 3. TABLA: check-ins (visitas de los usuarios a las cafeterías)
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  cafeteria_id UUID REFERENCES public.cafeterias ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: hilos del foro (comunidad)
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: respuestas del foro (comunidad)
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.forum_threads ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: reseñas de cafeterías (CafeReviews)
CREATE TABLE IF NOT EXISTS public.cafe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafeterias ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. VISTA: cafeterías destacadas (para pestaña Destacados)
DROP VIEW IF EXISTS public.cafeterias_destacadas_mes;
CREATE OR REPLACE VIEW public.cafeterias_destacadas_mes AS
SELECT 
  c.id,
  c.name,
  c.address,
  (
    SELECT count(*)
    FROM public.check_ins ci
    WHERE ci.cafeteria_id = c.id
      AND ci.created_at >= (now() - interval '30 days')
  ) AS check_ins_ultimos_30_dias
FROM public.cafeterias c;

-- ==========================================
-- FUNCIONES RPC (Stored Procedures)
-- ==========================================
DROP FUNCTION IF EXISTS public.cafeterias_cercanas;
CREATE OR REPLACE FUNCTION public.cafeterias_cercanas(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 10000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  distance_m DOUBLE PRECISION,
  check_ins_recientes BIGINT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT
    c.id,
    c.name,
    c.address,
    ST_Distance(
      c.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    )::DOUBLE PRECISION AS distance_m,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.check_ins ci
      WHERE ci.cafeteria_id = c.id
        AND ci.created_at >= NOW() - INTERVAL '7 days'
    ) AS check_ins_recientes,
    ST_Y(c.location::geometry)::DOUBLE PRECISION AS lat,
    ST_X(c.location::geometry)::DOUBLE PRECISION AS lng
  FROM public.cafeterias c
  WHERE ST_DWithin(
    c.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_m;
$$;

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================
ALTER TABLE public.cafeterias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_reviews ENABLE ROW LEVEL SECURITY;

-- Lectura pública para todos
CREATE POLICY "Lectura publica cafeterias" ON public.cafeterias FOR SELECT USING (true);
CREATE POLICY "Lectura publica check_ins" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Lectura publica forum_threads" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Lectura publica forum_posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Lectura publica cafe_reviews" ON public.cafe_reviews FOR SELECT USING (true);

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
