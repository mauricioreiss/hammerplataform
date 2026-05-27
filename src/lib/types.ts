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
  weight_used: string | null
  completed_at: string
}

export type Kpis = {
  total: number
  mrr: string
  novosHoje: number
}
