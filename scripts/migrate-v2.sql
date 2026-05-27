-- Hammer Plataforma - Migration V2
-- Rodar no Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Tabela de avaliacoes fisicas
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  weight numeric,
  body_fat numeric,
  lean_mass numeric,
  waist numeric,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- 2. Log de exercicios completados
CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  weight_used text,
  completed_at timestamptz DEFAULT now()
);

-- 3. Coluna grupo muscular nos exercicios
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group text;

-- 4. Colunas de plano no usuario
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_name text DEFAULT 'Mensal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_value numeric DEFAULT 150;

-- 5. Coluna illustration_url (caso ainda nao exista)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS illustration_url text;

-- 6. Atualizar admin existente com dados de plano
UPDATE users SET plan_name = 'Admin', plan_value = 0 WHERE role = 'admin';
