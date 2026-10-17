-- ==============================================================================
-- Migración: add_roles_and_strict_rls
-- Descripción:
--   1. Agrega la columna 'role' ('admin' | 'viewer') en public.users con default 'viewer'.
--   2. Asigna rol 'admin' a usuarios iniciales autorizados.
--   3. Crea función helper is_admin() con SECURITY DEFINER para evitar recursión RLS.
--   4. Trigger de protección en public.users para evitar que usuarios no-admin modifiquen su rol.
--   5. Actualiza handle_new_user() para asignar por defecto 'viewer'.
--   6. Configura Row Level Security (RLS) estricto en projects, analyses y analysis_assets:
--      - SELECT: Cualquier usuario autenticado (auth.role() = 'authenticated').
--      - INSERT / UPDATE / DELETE: Únicamente administradores (is_admin() = true).
-- ==============================================================================

-- 1. Agregar columna role a public.users si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role text NOT NULL DEFAULT 'viewer' 
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'viewer'));
  END IF;
END $$;

-- 2. Asignar rol admin a usuarios administrativos iniciales
UPDATE public.users 
SET role = 'admin' 
WHERE email IN ('marco@gmail.com', 'pacheco.marco@hotmail.com', 'demo@consultorio.com');

-- 3. Crear función auxiliar is_admin con SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
      AND deleted_at IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4. Trigger de protección para que solo administradores puedan modificar la columna role
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Solo los administradores pueden cambiar roles de usuario.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_role ON public.users;
CREATE TRIGGER trg_protect_user_role
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_role();

-- 5. Actualizar trigger de nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, firstname, lastname, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstname', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    NEW.email,
    'viewer',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    firstname = EXCLUDED.firstname,
    lastname = EXCLUDED.lastname,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- 6. Configurar RLS estricto en public.projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Allow public select on projects" ON public.projects 
TO authenticated 
USING (deleted_at IS NULL);

ALTER POLICY "Allow public insert on projects" ON public.projects 
TO authenticated 
WITH CHECK (public.is_admin());

ALTER POLICY "Allow public update on projects" ON public.projects 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

ALTER POLICY "Allow public delete on projects" ON public.projects 
TO authenticated 
USING (public.is_admin());

ALTER POLICY "Allow public select on projects" ON public.projects RENAME TO "Allow authenticated select on projects";
ALTER POLICY "Allow public insert on projects" ON public.projects RENAME TO "Allow admin insert on projects";
ALTER POLICY "Allow public update on projects" ON public.projects RENAME TO "Allow admin update on projects";
ALTER POLICY "Allow public delete on projects" ON public.projects RENAME TO "Allow admin delete on projects";

-- 7. Configurar RLS estricto en public.analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Allow public select on analyses" ON public.analyses 
TO authenticated 
USING (deleted_at IS NULL);

ALTER POLICY "Allow public insert on analyses" ON public.analyses 
TO authenticated 
WITH CHECK (public.is_admin());

ALTER POLICY "Allow public update on analyses" ON public.analyses 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

ALTER POLICY "Allow public delete on analyses" ON public.analyses 
TO authenticated 
USING (public.is_admin());

ALTER POLICY "Allow public select on analyses" ON public.analyses RENAME TO "Allow authenticated select on analyses";
ALTER POLICY "Allow public insert on analyses" ON public.analyses RENAME TO "Allow admin insert on analyses";
ALTER POLICY "Allow public update on analyses" ON public.analyses RENAME TO "Allow admin update on analyses";
ALTER POLICY "Allow public delete on analyses" ON public.analyses RENAME TO "Allow admin delete on analyses";

-- 8. Configurar RLS estricto en public.analysis_assets
ALTER TABLE public.analysis_assets ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Allow public select on analysis_assets" ON public.analysis_assets 
TO authenticated 
USING (deleted_at IS NULL);

ALTER POLICY "Allow public insert on analysis_assets" ON public.analysis_assets 
TO authenticated 
WITH CHECK (public.is_admin());

ALTER POLICY "Allow public update on analysis_assets" ON public.analysis_assets 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

ALTER POLICY "Allow public delete on analysis_assets" ON public.analysis_assets 
TO authenticated 
USING (public.is_admin());

ALTER POLICY "Allow public select on analysis_assets" ON public.analysis_assets RENAME TO "Allow authenticated select on analysis_assets";
ALTER POLICY "Allow public insert on analysis_assets" ON public.analysis_assets RENAME TO "Allow admin insert on analysis_assets";
ALTER POLICY "Allow public update on analysis_assets" ON public.analysis_assets RENAME TO "Allow admin update on analysis_assets";
ALTER POLICY "Allow public delete on analysis_assets" ON public.analysis_assets RENAME TO "Allow admin delete on analysis_assets";

-- 9. Actualizar políticas de RLS en public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Allow public select on active users" ON public.users 
TO authenticated;

ALTER POLICY "Allow public insert on users" ON public.users 
TO authenticated 
WITH CHECK (id = auth.uid() OR public.is_admin());

ALTER POLICY "Allow public update on users" ON public.users 
TO authenticated 
USING (id = auth.uid() OR public.is_admin()) 
WITH CHECK (id = auth.uid() OR public.is_admin());

ALTER POLICY "Allow public select on active users" ON public.users RENAME TO "Allow authenticated select on active users";
ALTER POLICY "Allow public insert on users" ON public.users RENAME TO "Allow authenticated insert on users";
ALTER POLICY "Allow public update on users" ON public.users RENAME TO "Allow self or admin update on users";
