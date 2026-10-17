-- =========================================================================
-- MIGRACIÓN PAES LECTOR: guardado automático + vocabulario + racha
-- Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run.
-- Es seguro volver a ejecutarla (usa IF NOT EXISTS).
-- =========================================================================

-- 1. Campos nuevos en usuarios (racha y puntos de vocabulario)
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS highest_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_date TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_history JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vocab_points INTEGER NOT NULL DEFAULT 0;

-- 2. Asignaciones: disponibilidad para todos los estudiantes
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE assignments ALTER COLUMN course_ids SET DEFAULT '[]'::jsonb;

-- 3. Marca de "ya inicializado" (evita que un reinicio del servidor pise la nube con datos de ejemplo)
CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banco de vocabulario (cada ejercicio completo se guarda en "data")
CREATE TABLE IF NOT EXISTS vocab_exercises (
    id TEXT PRIMARY KEY,
    target_word TEXT NOT NULL,
    category TEXT,
    difficulty TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Progreso de vocabulario por estudiante (una fila por estudiante y ejercicio)
CREATE TABLE IF NOT EXISTS vocab_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vocab_progress_user_idx ON vocab_progress(user_id);

-- 6. Seguridad (mismas políticas de acceso que el resto de las tablas)
ALTER TABLE app_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total app_meta" ON app_meta;
CREATE POLICY "Acceso total app_meta" ON app_meta FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso total vocab_exercises" ON vocab_exercises;
CREATE POLICY "Acceso total vocab_exercises" ON vocab_exercises FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Acceso total vocab_progress" ON vocab_progress;
CREATE POLICY "Acceso total vocab_progress" ON vocab_progress FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- OPCIONAL (RECOMENDADO): endurecer la seguridad
-- Hoy las políticas permiten que cualquiera con la anon key lea la tabla users
-- (incluye contraseñas). Si usas SUPABASE_SERVICE_ROLE_KEY en Vercel (solo servidor,
-- NUNCA con prefijo VITE_), puedes cerrar el acceso público ejecutando esto:
--
-- DO $$ DECLARE t TEXT; BEGIN
--   FOR t IN SELECT unnest(ARRAY['courses','users','texts','questions','assignments',
--     'attempts','attempt_answers','app_meta','vocab_exercises','vocab_progress']) LOOP
--     EXECUTE format('DROP POLICY IF EXISTS "Acceso total %s" ON %I', t, t);
--   END LOOP;
-- END $$;
-- =========================================================================
