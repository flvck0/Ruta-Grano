-- Ejecutar en Supabase SQL Editor DESPUÉS del schema inicial.
-- Añade lat/lng a la RPC para poder dibujar pines en el mapa.

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
