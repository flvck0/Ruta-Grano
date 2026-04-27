-- =============================================================================
-- Patch: Actualizar RPC create_cafeteria para soportar calificación (rating)
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Agregar la columna rating a la tabla cafe_reviews si no existe
ALTER TABLE public.cafe_reviews ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 2. Actualizar el RPC para recibir la calificación
CREATE OR REPLACE FUNCTION public.create_cafeteria(
  p_name TEXT,
  p_description TEXT,
  p_address TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_rating INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Insertar la nueva cafetería
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
      COALESCE(p_description, 'Cafetería descubierta'), -- 'body' no puede ser null en cafe_reviews
      NULL
    );
  END IF;

  RETURN v_new_id;
END;
$$;
