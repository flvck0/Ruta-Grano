-- =============================================================================
-- Patch: Actualizar tabla cafeterias para soportar imágenes y RPC
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Añadir la columna image_url a la tabla cafeterias
ALTER TABLE public.cafeterias ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Actualizar el procedimiento de creación para soportar la imagen
CREATE OR REPLACE FUNCTION public.create_cafeteria(
  p_name TEXT,
  p_description TEXT,
  p_address TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_rating INTEGER DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Insertar la nueva cafetería con la imagen
  INSERT INTO public.cafeterias (
    name,
    description,
    address,
    location,
    image_url,
    created_by
  )
  VALUES (
    p_name,
    p_description,
    p_address,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_image_url,
    auth.uid()
  )
  RETURNING id INTO v_new_id;

  -- Si el usuario proporcionó una calificación, insertamos la reseña inicial
  IF p_rating IS NOT NULL AND p_rating >= 1 AND p_rating <= 5 THEN
    INSERT INTO public.cafe_reviews (
      cafe_id,
      user_id,
      rating,
      body,
      author_name
    )
    VALUES (
      v_new_id,
      auth.uid(),
      p_rating,
      COALESCE(p_description, 'Cafetería descubierta'),
      NULL
    );
  END IF;

  RETURN v_new_id;
END;
$$;

-- 3. Actualizar cafeterias_cercanas para devolver image_url
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
  lng DOUBLE PRECISION,
  image_url TEXT
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
      SELECT COUNT(*)
      FROM public.check_ins chk
      WHERE chk.cafeteria_id = c.id
        AND chk.created_at >= (NOW() - INTERVAL '7 days')
    ) AS check_ins_recientes,
    ST_Y(c.location::geometry) AS lat,
    ST_X(c.location::geometry) AS lng,
    c.image_url
  FROM
    public.cafeterias c
  WHERE
    ST_DWithin(
      c.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY
    distance_m ASC;
$$;
