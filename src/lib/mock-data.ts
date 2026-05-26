export type Student = {
  id: number
  name: string
  status: "Aguardando Treino" | "Ativo"
  plan: string
  objective: string
}

export type Avaliacao = {
  id: number
  data: string
  peso: string
  bf: string
  massaMagra: string
  cintura: string
  fotoFrente: string
}

export const kpis = {
  mrr: "R$ 45.200",
  active: 1243,
  new: 5,
}

export const studentsQueue: Student[] = [
  {
    id: 1,
    name: "Lucas Andrade",
    status: "Aguardando Treino",
    plan: "Premium",
    objective: "Hipertrofia",
  },
]

export const studentsActive: Student[] = [
  {
    id: 2,
    name: "Mariana Costa",
    status: "Ativo",
    plan: "Trimestral",
    objective: "Emagrecimento",
  },
  {
    id: 3,
    name: "Carlos Souza",
    status: "Ativo",
    plan: "Mensal",
    objective: "Força",
  },
]

const avaliacoesMariana: Avaliacao[] = [
  {
    id: 2,
    data: "10/05/2026",
    peso: "68.5",
    bf: "22.4",
    massaMagra: "41.2",
    cintura: "74",
    fotoFrente:
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 1,
    data: "10/02/2026",
    peso: "74.2",
    bf: "28.5",
    massaMagra: "39.5",
    cintura: "82",
    fotoFrente:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop",
  },
]

export function getAllStudents(): Student[] {
  return [...studentsActive, ...studentsQueue]
}

export function getStudentById(id: number): Student | undefined {
  return getAllStudents().find((s) => s.id === id)
}

export function getAvaliacoesByStudentId(studentId: number): Avaliacao[] {
  if (studentId === 2) return avaliacoesMariana
  return []
}

// --- Aluno (Student App) ---

export type UserProfile = {
  name: string
  initials: string
  plan: string
  status: "ativo" | "vencendo" | "atrasado"
  expireDate: string
  daysLeft: number
  pixKey: string
  value: string
}

export type Exercise = {
  id: number
  name: string
  sets: string
  reps: string
  rest: string
  note: string
  videoUrl: string
}

export type WorkoutDay = {
  title: string
  subtitle: string
  duration: string
  exercises: Exercise[]
}

export type AvaliacaoComparativo = {
  dataAntiga: string
  dataNova: string
  pesoAntigo: string
  pesoNovo: string
  diffPeso: string
  bfAntigo: string
  bfNovo: string
  diffBf: string
  massaAntiga: string
  massaNova: string
  diffMassa: string
  fotoAntes: string
  fotoDepois: string
}

export const currentUser: UserProfile = {
  name: "Lucas Andrade",
  initials: "LA",
  plan: "Plano Premium",
  status: "vencendo",
  expireDate: "30/05/2026",
  daysLeft: 4,
  pixKey: "19993939064",
  value: "150,00",
}

export const todayWorkout: WorkoutDay = {
  title: "SÁBADO",
  subtitle: "Pernas + Glúteos Extremo",
  duration: "75 min",
  exercises: [
    {
      id: 1,
      name: "Agachamento Livre",
      sets: "6",
      reps: "5",
      rest: "90s",
      note: "Quebre o paralelo. Core travado.",
      videoUrl:
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Front Squat",
      sets: "5",
      reps: "6",
      rest: "60s",
      note: "Cotovelos altos o tempo todo.",
      videoUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Levantamento Terra",
      sets: "5",
      reps: "5",
      rest: "120s",
      note: "Carga máxima. Costas retas.",
      videoUrl:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop",
    },
  ],
}

export const studentAvaliacao: AvaliacaoComparativo = {
  dataAntiga: "Fev/26",
  dataNova: "Mai/26",
  pesoAntigo: "82.5",
  pesoNovo: "78.1",
  diffPeso: "4.4",
  bfAntigo: "24.5",
  bfNovo: "18.2",
  diffBf: "6.3",
  massaAntiga: "38.1",
  massaNova: "40.5",
  diffMassa: "2.4",
  fotoAntes:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop",
  fotoDepois:
    "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop",
}
