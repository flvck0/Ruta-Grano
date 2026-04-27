-- Insertando cafeterías reales en Santiago
-- Asegúrate de ejecutar este archivo en el "SQL Editor" de tu panel de Supabase.

INSERT INTO public.cafeterias (name, description, address, location)
VALUES
  (
    'Doméstico Café',
    'Excelente café de especialidad y ambiente relajado. Especialidad en filtrados.',
    'Providencia, Santiago',
    ST_SetSRID(ST_MakePoint(-70.6130, -33.4278), 4326)::geography
  ),
  (
    'Café Triciclo',
    'Tostadores locales con un patio increíble para disfrutar del sol y un buen espresso.',
    'Barrio Italia, Providencia',
    ST_SetSRID(ST_MakePoint(-70.6248, -33.4435), 4326)::geography
  ),
  (
    'Café Altura',
    'Un clásico. Desde La Vega Central ofreciendo un tueste propio espectacular.',
    'La Vega / Bellas Artes',
    ST_SetSRID(ST_MakePoint(-70.6433, -33.4352), 4326)::geography
  ),
  (
    'Singular Coffee',
    'Cafetería de especialidad con un enfoque meticuloso en el origen del grano.',
    'Barrio Lastarria',
    ST_SetSRID(ST_MakePoint(-70.6385, -33.4385), 4326)::geography
  ),
  (
    'Wonderland Café',
    'Cafetería temática estilo Alicia en el País de las Maravillas. Ideal para pastelería y fotos.',
    'Rosal 361, Barrio Lastarria',
    ST_SetSRID(ST_MakePoint(-70.6360, -33.4380), 4326)::geography
  ),
  (
    'Colonia Café',
    'Un espacio acogedor en Ñuñoa con gran repostería y granos seleccionados.',
    'Ñuñoa',
    ST_SetSRID(ST_MakePoint(-70.6015, -33.4542), 4326)::geography
  );
