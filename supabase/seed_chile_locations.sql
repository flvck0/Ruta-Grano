-- =============================================================================
-- Seed: Regiones y Comunas de Chile
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Crear tabla de Regiones
CREATE TABLE IF NOT EXISTS public.regions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- 2. Crear tabla de Comunas
CREATE TABLE IF NOT EXISTS public.comunas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region_id INTEGER REFERENCES public.regions(id) ON DELETE CASCADE,
  UNIQUE(name, region_id)
);

-- 3. Habilitar RLS (Row Level Security) y permitir acceso público de lectura
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'regions_read_all' AND tablename = 'regions') THEN
    CREATE POLICY "regions_read_all" ON public.regions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'comunas_read_all' AND tablename = 'comunas') THEN
    CREATE POLICY "comunas_read_all" ON public.comunas FOR SELECT USING (true);
  END IF;
END $$;

-- 4. Limpiar datos existentes (para evitar duplicados si se corre varias veces)
TRUNCATE TABLE public.regions CASCADE;

-- 5. Insertar Regiones y Comunas
DO $$ 
DECLARE 
  r_id INTEGER;
BEGIN
  -- Arica y Parinacota
  INSERT INTO public.regions (name) VALUES ('Arica y Parinacota') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Arica', r_id), ('Camarones', r_id), ('Putre', r_id), ('General Lagos', r_id);

  -- Tarapacá
  INSERT INTO public.regions (name) VALUES ('Tarapacá') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Iquique', r_id), ('Alto Hospicio', r_id), ('Pozo Almonte', r_id), ('Camiña', r_id), ('Colchane', r_id), ('Huara', r_id), ('Pica', r_id);

  -- Antofagasta
  INSERT INTO public.regions (name) VALUES ('Antofagasta') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Antofagasta', r_id), ('Mejillones', r_id), ('Sierra Gorda', r_id), ('Taltal', r_id), ('Calama', r_id), ('Ollagüe', r_id), ('San Pedro de Atacama', r_id), ('Tocopilla', r_id), ('María Elena', r_id);

  -- Atacama
  INSERT INTO public.regions (name) VALUES ('Atacama') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Copiapó', r_id), ('Caldera', r_id), ('Tierra Amarilla', r_id), ('Chañaral', r_id), ('Diego de Almagro', r_id), ('Vallenar', r_id), ('Alto del Carmen', r_id), ('Freirina', r_id), ('Huasco', r_id);

  -- Coquimbo
  INSERT INTO public.regions (name) VALUES ('Coquimbo') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('La Serena', r_id), ('Coquimbo', r_id), ('Andacollo', r_id), ('La Higuera', r_id), ('Paihuano', r_id), ('Vicuña', r_id), ('Illapel', r_id), ('Canela', r_id), ('Los Vilos', r_id), ('Salamanca', r_id), ('Ovalle', r_id), ('Combarbalá', r_id), ('Monte Patria', r_id), ('Punitaqui', r_id), ('Río Hurtado', r_id);

  -- Valparaíso
  INSERT INTO public.regions (name) VALUES ('Valparaíso') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Valparaíso', r_id), ('Casablanca', r_id), ('Concón', r_id), ('Juan Fernández', r_id), ('Puchuncaví', r_id), ('Quintero', r_id), ('Viña del Mar', r_id), ('Isla de Pascua', r_id), ('Los Andes', r_id), ('Calle Larga', r_id), ('Rinconada', r_id), ('San Esteban', r_id), ('La Ligua', r_id), ('Cabildo', r_id), ('Papudo', r_id), ('Petorca', r_id), ('Zapallar', r_id), ('Quillota', r_id), ('Calera', r_id), ('Hijuelas', r_id), ('La Cruz', r_id), ('Nogales', r_id), ('San Antonio', r_id), ('Algarrobo', r_id), ('Cartagena', r_id), ('El Quisco', r_id), ('El Tabo', r_id), ('Santo Domingo', r_id), ('San Felipe', r_id), ('Catemu', r_id), ('Llaillay', r_id), ('Panquehue', r_id), ('Putaendo', r_id), ('Santa María', r_id), ('Quilpué', r_id), ('Limache', r_id), ('Olmué', r_id), ('Villa Alemana', r_id);

  -- Metropolitana de Santiago
  INSERT INTO public.regions (name) VALUES ('Metropolitana de Santiago') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Cerrillos', r_id), ('Cerro Navia', r_id), ('Conchalí', r_id), ('El Bosque', r_id), ('Estación Central', r_id), ('Huechuraba', r_id), ('Independencia', r_id), ('La Cisterna', r_id), ('La Florida', r_id), ('La Granja', r_id), ('La Pintana', r_id), ('La Reina', r_id), ('Las Condes', r_id), ('Lo Barnechea', r_id), ('Lo Espejo', r_id), ('Lo Prado', r_id), ('Macul', r_id), ('Maipú', r_id), ('Ñuñoa', r_id), ('Pedro Aguirre Cerda', r_id), ('Peñalolén', r_id), ('Providencia', r_id), ('Pudahuel', r_id), ('Quilicura', r_id), ('Quinta Normal', r_id), ('Recoleta', r_id), ('Renca', r_id), ('Santiago', r_id), ('San Joaquín', r_id), ('San Miguel', r_id), ('San Ramón', r_id), ('Vitacura', r_id), ('Puente Alto', r_id), ('Pirque', r_id), ('San José de Maipo', r_id), ('Colina', r_id), ('Lampa', r_id), ('Tiltil', r_id), ('San Bernardo', r_id), ('Buin', r_id), ('Calera de Tango', r_id), ('Paine', r_id), ('Melipilla', r_id), ('Alhué', r_id), ('Curacaví', r_id), ('María Pinto', r_id), ('San Pedro', r_id), ('Talagante', r_id), ('El Monte', r_id), ('Isla de Maipo', r_id), ('Padre Hurtado', r_id), ('Peñaflor', r_id);

  -- O'Higgins
  INSERT INTO public.regions (name) VALUES ('O''Higgins') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Rancagua', r_id), ('Codegua', r_id), ('Coinco', r_id), ('Coltauco', r_id), ('Doñihue', r_id), ('Graneros', r_id), ('Las Cabras', r_id), ('Machalí', r_id), ('Malloa', r_id), ('Mostazal', r_id), ('Olivar', r_id), ('Peumo', r_id), ('Pichidegua', r_id), ('Quinta de Tilcoco', r_id), ('Rengo', r_id), ('Requínoa', r_id), ('San Vicente', r_id), ('Pichilemu', r_id), ('La Estrella', r_id), ('Litueche', r_id), ('Marchihue', r_id), ('Navidad', r_id), ('Paredones', r_id), ('San Fernando', r_id), ('Chépica', r_id), ('Chimbarongo', r_id), ('Lolol', r_id), ('Nancagua', r_id), ('Palmilla', r_id), ('Peralillo', r_id), ('Placilla', r_id), ('Pumanque', r_id), ('Santa Cruz', r_id);

  -- Maule
  INSERT INTO public.regions (name) VALUES ('Maule') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Talca', r_id), ('Constitución', r_id), ('Curepto', r_id), ('Empedrado', r_id), ('Maule', r_id), ('Pelarco', r_id), ('Pencahue', r_id), ('Río Claro', r_id), ('San Clemente', r_id), ('San Rafael', r_id), ('Cauquenes', r_id), ('Chanco', r_id), ('Pelluhue', r_id), ('Curicó', r_id), ('Hualañé', r_id), ('Licantén', r_id), ('Molina', r_id), ('Rauco', r_id), ('Romeral', r_id), ('Sagrada Familia', r_id), ('Teno', r_id), ('Vichuquén', r_id), ('Linares', r_id), ('Colbún', r_id), ('Longaví', r_id), ('Parral', r_id), ('Retiro', r_id), ('San Javier', r_id), ('Villa Alegre', r_id), ('Yerbas Buenas', r_id);

  -- Ñuble
  INSERT INTO public.regions (name) VALUES ('Ñuble') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Chillán', r_id), ('Bulnes', r_id), ('Cobquecura', r_id), ('Coelemu', r_id), ('Coihueco', r_id), ('Chillán Viejo', r_id), ('El Carmen', r_id), ('Ninhue', r_id), ('Ñiquén', r_id), ('Pemuco', r_id), ('Pinto', r_id), ('Portezuelo', r_id), ('Quillón', r_id), ('Quirihue', r_id), ('Ránquil', r_id), ('San Carlos', r_id), ('San Fabián', r_id), ('San Ignacio', r_id), ('San Nicolás', r_id), ('Treguaco', r_id), ('Yungay', r_id);

  -- Biobío
  INSERT INTO public.regions (name) VALUES ('Biobío') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Concepción', r_id), ('Coronel', r_id), ('Chiguayante', r_id), ('Florida', r_id), ('Hualqui', r_id), ('Lota', r_id), ('Penco', r_id), ('San Pedro de la Paz', r_id), ('Santa Juana', r_id), ('Talcahuano', r_id), ('Tomé', r_id), ('Hualpén', r_id), ('Lebu', r_id), ('Arauco', r_id), ('Cañete', r_id), ('Contulmo', r_id), ('Curanilahue', r_id), ('Los Álamos', r_id), ('Tirúa', r_id), ('Los Ángeles', r_id), ('Antuco', r_id), ('Cabrero', r_id), ('Laja', r_id), ('Mulchén', r_id), ('Nacimiento', r_id), ('Negrete', r_id), ('Quilaco', r_id), ('Quilleco', r_id), ('San Rosendo', r_id), ('Santa Bárbara', r_id), ('Tucapel', r_id), ('Yumbel', r_id), ('Alto Biobío', r_id);

  -- Araucanía
  INSERT INTO public.regions (name) VALUES ('Araucanía') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Temuco', r_id), ('Carahue', r_id), ('Cunco', r_id), ('Curarrehue', r_id), ('Freire', r_id), ('Galvarino', r_id), ('Gorbea', r_id), ('Lautaro', r_id), ('Loncoche', r_id), ('Melipeuco', r_id), ('Nueva Imperial', r_id), ('Padre las Casas', r_id), ('Perquenco', r_id), ('Pitrufquén', r_id), ('Pucón', r_id), ('Saavedra', r_id), ('Teodoro Schmidt', r_id), ('Toltén', r_id), ('Vilcún', r_id), ('Villarrica', r_id), ('Cholchol', r_id), ('Angol', r_id), ('Collipulli', r_id), ('Curacautín', r_id), ('Ercilla', r_id), ('Lonquimay', r_id), ('Los Sauces', r_id), ('Lumaco', r_id), ('Purén', r_id), ('Renaico', r_id), ('Traiguén', r_id), ('Victoria', r_id);

  -- Los Ríos
  INSERT INTO public.regions (name) VALUES ('Los Ríos') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Valdivia', r_id), ('Corral', r_id), ('Lanco', r_id), ('Los Lagos', r_id), ('Máfil', r_id), ('Mariquina', r_id), ('Paillaco', r_id), ('Panguipulli', r_id), ('La Unión', r_id), ('Futrono', r_id), ('Lago Ranco', r_id), ('Río Bueno', r_id);

  -- Los Lagos
  INSERT INTO public.regions (name) VALUES ('Los Lagos') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Puerto Montt', r_id), ('Calbuco', r_id), ('Cochamó', r_id), ('Fresia', r_id), ('Frutillar', r_id), ('Los Muermos', r_id), ('Llanquihue', r_id), ('Maullín', r_id), ('Puerto Varas', r_id), ('Castro', r_id), ('Ancud', r_id), ('Chonchi', r_id), ('Curaco de Vélez', r_id), ('Dalcahue', r_id), ('Puqueldón', r_id), ('Queilén', r_id), ('Quellón', r_id), ('Quemchi', r_id), ('Quinchao', r_id), ('Osorno', r_id), ('Puerto Octay', r_id), ('Purranque', r_id), ('Puyehue', r_id), ('Río Negro', r_id), ('San Juan de la Costa', r_id), ('San Pablo', r_id), ('Chaitén', r_id), ('Futaleufú', r_id), ('Hualaihué', r_id), ('Palena', r_id);

  -- Aysén
  INSERT INTO public.regions (name) VALUES ('Aysén') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Coyhaique', r_id), ('Lago Verde', r_id), ('Aysén', r_id), ('Cisnes', r_id), ('Guaitecas', r_id), ('Cochrane', r_id), ('O''Higgins', r_id), ('Tortel', r_id), ('Chile Chico', r_id), ('Río Ibáñez', r_id);

  -- Magallanes
  INSERT INTO public.regions (name) VALUES ('Magallanes') RETURNING id INTO r_id;
  INSERT INTO public.comunas (name, region_id) VALUES ('Punta Arenas', r_id), ('Laguna Blanca', r_id), ('Río Verde', r_id), ('San Gregorio', r_id), ('Cabo de Hornos', r_id), ('Antártica', r_id), ('Porvenir', r_id), ('Primavera', r_id), ('Timaukel', r_id), ('Natales', r_id), ('Torres del Paine', r_id);

END $$;
