-- =============================================================================
-- Patch: Crear Políticas de Seguridad para el Storage de Cafeterías
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Permitir que cualquier persona (incluso sin cuenta) pueda VER las fotos
CREATE POLICY "Public Access to Cafe Images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'cafes' );

-- Permitir que solo los usuarios logueados puedan SUBIR fotos
CREATE POLICY "Authenticated Users can Upload Cafe Images" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'cafes' 
  AND auth.role() = 'authenticated'
);

-- (Opcional) Permitir a los usuarios borrar sus propias fotos si en el futuro lo necesitan
CREATE POLICY "Users can Delete their own Cafe Images" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'cafes' 
  AND auth.uid() = owner
);
