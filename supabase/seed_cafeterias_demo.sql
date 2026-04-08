-- Datos demo para Santiago (ejecutar después del schema + patch RPC).
-- created_by puede ser NULL.

INSERT INTO public.cafeterias (name, description, address, location)
VALUES
  (
    'Café Plaza de Armas',
    'Cortado y ambiente céntrico.',
    'Santiago centro',
    ST_SetSRID(ST_MakePoint(-70.6505, -33.4378), 4326)::geography
  ),
  (
    'Lastarria Espresso',
    'Tueste especialidad y pastelería.',
    'Barrio Lastarria',
    ST_SetSRID(ST_MakePoint(-70.636, -33.438), 4326)::geography
  ),
  (
    'Los Leones Brew',
    'Mucho movimiento y buenos cinnamon rolls.',
    'Providencia',
    ST_SetSRID(ST_MakePoint(-70.607, -33.418), 4326)::geography
  ),
  (
    'Bellas Artes Flat White',
    'Ventana al parque, ideal para leer.',
    'Bellas Artes',
    ST_SetSRID(ST_MakePoint(-70.643, -33.435), 4326)::geography
  );

-- Si re-ejecutas y duplica filas, vacía antes: TRUNCATE public.cafeterias CASCADE; (¡cuidado en prod!)
