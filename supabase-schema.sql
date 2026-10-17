-- =========================================================================
-- ESQUEMA RELACIONAL Y TABLAS PARA PAES LECTOR (SUPABASE POSTGRESQL)
-- Compatible con Vercel, persistencia en la nube y anon public API key
-- =========================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: Cursos (IV° Medio A, IV° Medio B, etc.)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: Perfiles de Usuario (Docente y Estudiantes)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('docente', 'estudiante')),
    rut TEXT,
    password TEXT DEFAULT 'PAES2026',
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: Banco de Textos
CREATE TABLE IF NOT EXISTS texts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    author TEXT DEFAULT '',
    source TEXT DEFAULT '',
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'narrativo', 'literario', 'expositivo', 'argumentativo', 
        'columna_opinion', 'ensayo', 'noticia', 'instructivo', 'infografia'
    )),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('inicial', 'medio', 'avanzado')),
    status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'en_revision', 'aprobado', 'archivado')),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: Preguntas del Banco
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    text_id TEXT NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 1,
    prompt TEXT NOT NULL,
    skill TEXT NOT NULL CHECK (skill IN ('localizar', 'interpretar_relacionar', 'evaluar')),
    options JSONB NOT NULL, -- {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    distractor_explanations JSONB, -- {"A": "...", "B": "...", ...}
    points NUMERIC NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: Actividades Asignadas
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    text_id TEXT NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
    course_ids JSONB NOT NULL, -- ["iv_medio_a", "iv_medio_b"]
    mode TEXT NOT NULL CHECK (mode IN ('formativo', 'evaluacion')),
    status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'cerrada')),
    due_date TIMESTAMPTZ,
    max_attempts INTEGER DEFAULT 1,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: Intentos de Estudiantes
CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score NUMERIC NOT NULL DEFAULT 0,
    total_points NUMERIC NOT NULL DEFAULT 0,
    percentage NUMERIC NOT NULL DEFAULT 0,
    paes_estimated_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: Respuestas Individuales por Pregunta
CREATE TABLE IF NOT EXISTS attempt_answers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned NUMERIC NOT NULL DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- DATOS INICIALES (DOCENTE TITULAR Y CURSOS OFICIALES)
-- =========================================================================

-- Inserción del docente administrador permanente
INSERT INTO users (id, email, name, role, rut, password)
VALUES ('doc_1', 'rodrigolaraflores4@gmail.com', 'Prof. Rodrigo Lara Flores', 'docente', '17.784.722-4', 'PAES2026')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    rut = EXCLUDED.rut,
    password = EXCLUDED.password;

-- Inserción de cursos IV° Medio
INSERT INTO courses (id, name, code, description)
VALUES 
    ('iv_medio_a', 'IV° Medio A', '4M-A', 'Curso Científico-Humanista IV° Medio A'),
    ('iv_medio_b', 'IV° Medio B', '4M-B', 'Curso Científico-Humanista IV° Medio B')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- POLÍTICAS DE ACCESO (PERMITIR LECTURA/ESCRITURA CON LA ANON KEY DE SUPABASE)
-- =========================================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para la Anon Key de la aplicación web
DROP POLICY IF EXISTS "Acceso total courses" ON courses;
CREATE POLICY "Acceso total courses" ON courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total users" ON users;
CREATE POLICY "Acceso total users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total texts" ON texts;
CREATE POLICY "Acceso total texts" ON texts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total questions" ON questions;
CREATE POLICY "Acceso total questions" ON questions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total assignments" ON assignments;
CREATE POLICY "Acceso total assignments" ON assignments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total attempts" ON attempts;
CREATE POLICY "Acceso total attempts" ON attempts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total attempt_answers" ON attempt_answers;
CREATE POLICY "Acceso total attempt_answers" ON attempt_answers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- EXTENSIONES (vocabulario, racha, guardado automático)
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
