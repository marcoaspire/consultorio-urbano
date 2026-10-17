-- ==============================================================================
-- Migración: allow_public_read_access
-- Descripción:
--   1. Permite acceso de lectura (SELECT) público (anon y authenticated)
--      a las tablas 'projects', 'analyses' y 'analysis_assets'.
--   2. Mantiene intactas las políticas estrictas de mutación (INSERT, UPDATE, DELETE)
--      exclusivamente para usuarios con rol 'admin' (is_admin() = true).
-- ==============================================================================

ALTER POLICY "Allow authenticated select on projects" ON public.projects 
TO anon, authenticated 
USING (deleted_at IS NULL);

ALTER POLICY "Allow authenticated select on projects" ON public.projects 
RENAME TO "Allow public select on projects";

ALTER POLICY "Allow authenticated select on analyses" ON public.analyses 
TO anon, authenticated 
USING (deleted_at IS NULL);

ALTER POLICY "Allow authenticated select on analyses" ON public.analyses 
RENAME TO "Allow public select on analyses";

ALTER POLICY "Allow authenticated select on analysis_assets" ON public.analysis_assets 
TO anon, authenticated 
USING (deleted_at IS NULL);

ALTER POLICY "Allow authenticated select on analysis_assets" ON public.analysis_assets 
RENAME TO "Allow public select on analysis_assets";
