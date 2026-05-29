export type UserProfile = {
  id: string
  full_name: string
  role: "admin" | "student"
  objective: string | null
  plan_status: string | null
  plan_name: string | null
  plan_value: number | null
  expire_date: string | null
  avatar_url: string | null
  pix_key: string | null
  is_first_login: boolean
  created_at: string
}

export type Exercise = {
  id: string
  workout_id: string | null
  name: string
  muscle_group: string | null
  description: string | null
  sets: string | null
  reps: string | null
  rest: string | null
  note: string | null
  illustration_url: string | null
}

export type Workout = {
  id: string
  user_id: string
  title: string
  icon: string | null
  is_ai_draft: boolean
  status: string | null
  created_at: string
  exercises?: Exercise[]
}

export type Evaluation = {
  id: string
  user_id: string
  date: string
  weight: number | null
  body_fat: number | null
  lean_mass: number | null
  waist: number | null
  photo_url: string | null
  created_at: string
}

export type ExerciseLog = {
  id: string
  user_id: string
  exercise_id: string
  workout_id: string
  workout_session_id: string | null
  weight_used: number | null
  completed_at: string
}

export type Kpis = {
  total: number
  mrr: string
  novosHoje: number
}

export type Plan = {
  id: string
  name: string
  price: number
  cycle: "mensal" | "semestral" | "anual"
  created_at: string
}

export type Anamnesis = {
  id: string
  user_id: string
  weight: number | null
  height: number | null
  injuries: string | null
  days_per_week: number | null
  par_q_data: Record<string, boolean> | null
  created_at: string
}

export type WorkoutSession = {
  id: string
  user_id: string
  workout_id: string
  started_at: string
  completed_at: string
  total_duration: number
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}
