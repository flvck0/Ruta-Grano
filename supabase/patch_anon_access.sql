-- Permitir a usuarios anónimos y autenticados leer las cafeterías y check-ins

-- 1. Políticas para cafeterías
ALTER TABLE public.cafeterias ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cafeterias' AND policyname = 'cafeterias_select_public'
  ) THEN
    CREATE POLICY "cafeterias_select_public"
      ON public.cafeterias FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON public.cafeterias TO anon;
GRANT SELECT ON public.cafeterias TO authenticated;

-- 2. Políticas para check_ins
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'check_ins' AND policyname = 'check_ins_select_public'
  ) THEN
    CREATE POLICY "check_ins_select_public"
      ON public.check_ins FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON public.check_ins TO anon;
GRANT SELECT ON public.check_ins TO authenticated;
