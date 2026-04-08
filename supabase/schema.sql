-- =============================================================================
-- Ruta Grano — Esquema inicial Supabase + PostGIS
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Orden: ejecutar el script completo de una vez.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensiones
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- Tipos auxiliares
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Cafeterías (geolocalización con geography WGS84)
-- -----------------------------------------------------------------------------
CREATE TABLE public.cafeterias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  -- Punto en EPSG:4326 (lng/lat en WGS84)
  location geography(POINT, 4326) NOT NULL,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cafeterias_location_gix
  ON public.cafeterias USING GIST (location);

CREATE TRIGGER cafeterias_set_updated_at
BEFORE UPDATE ON public.cafeterias
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Check-ins
-- -----------------------------------------------------------------------------
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  cafeteria_id UUID NOT NULL REFERENCES public.cafeterias (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX check_ins_cafeteria_id_created_at_idx
  ON public.check_ins (cafeteria_id, created_at DESC);

CREATE INDEX check_ins_user_id_created_at_idx
  ON public.check_ins (user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- Foros (hilos)
-- -----------------------------------------------------------------------------
CREATE TABLE public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafeteria_id UUID REFERENCES public.cafeterias (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX forum_threads_cafeteria_id_idx ON public.forum_threads (cafeteria_id);
CREATE INDEX forum_threads_created_at_idx ON public.forum_threads (created_at DESC);

CREATE TRIGGER forum_threads_set_updated_at
BEFORE UPDATE ON public.forum_threads
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Respuestas a hilos
-- -----------------------------------------------------------------------------
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX forum_posts_thread_id_created_at_idx
  ON public.forum_posts (thread_id, created_at ASC);

CREATE TRIGGER forum_posts_set_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Votos (upvote +1 / downvote -1), un voto por usuario y post
-- -----------------------------------------------------------------------------
CREATE TABLE public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX forum_votes_post_id_idx ON public.forum_votes (post_id);

-- -----------------------------------------------------------------------------
-- Vista: cafeterías destacadas del mes (últimos 30 días)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.cafeterias_destacadas_mes AS
SELECT
  c.id,
  c.name,
  c.address,
  c.location,
  COUNT(ci.id)::BIGINT AS check_ins_ultimos_30_dias
FROM public.cafeterias c
LEFT JOIN public.check_ins ci
  ON ci.cafeteria_id = c.id
 AND ci.created_at >= (NOW() AT TIME ZONE 'utc') - INTERVAL '30 days'
GROUP BY c.id, c.name, c.address, c.location
ORDER BY check_ins_ultimos_30_dias DESC, c.name ASC;

-- -----------------------------------------------------------------------------
-- RPC: cafeterías dentro de un radio (metros) ordenadas por distancia
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cafeterias_cercanas(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 3000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  distance_m DOUBLE PRECISION,
  check_ins_recientes BIGINT
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
    ) AS check_ins_recientes
  FROM public.cafeterias c
  WHERE ST_DWithin(
    c.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_m;
$$;

-- -----------------------------------------------------------------------------
-- Trigger: crear perfil al registrarse en auth
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data ->> 'username', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafeterias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- cafeterias
CREATE POLICY "cafeterias_select_authenticated"
  ON public.cafeterias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cafeterias_insert_authenticated"
  ON public.cafeterias FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "cafeterias_update_owner"
  ON public.cafeterias FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- check_ins
CREATE POLICY "check_ins_select_authenticated"
  ON public.check_ins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "check_ins_insert_own"
  ON public.check_ins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "check_ins_delete_own"
  ON public.check_ins FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- forum_threads
CREATE POLICY "forum_threads_select_authenticated"
  ON public.forum_threads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_threads_insert_authenticated"
  ON public.forum_threads FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "forum_threads_update_owner"
  ON public.forum_threads FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- forum_posts
CREATE POLICY "forum_posts_select_authenticated"
  ON public.forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_posts_insert_own"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "forum_posts_update_own"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- forum_votes
CREATE POLICY "forum_votes_select_authenticated"
  ON public.forum_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_votes_insert_own"
  ON public.forum_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "forum_votes_update_own"
  ON public.forum_votes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "forum_votes_delete_own"
  ON public.forum_votes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- Grants (API / PostgREST)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.cafeterias_destacadas_mes TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.cafeterias TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.check_ins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.forum_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.forum_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_votes TO authenticated;

GRANT EXECUTE ON FUNCTION public.cafeterias_cercanas(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- =============================================================================
-- Datos de prueba opcionales (Santiago, Chile) — comentar si no los quieres
-- =============================================================================
-- Necesitas un usuario en auth.users para created_by; puedes insertar cafeterías
-- luego desde la app con tu usuario autenticado.
