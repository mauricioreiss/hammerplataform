---
id: F2.09
title: "F2.09 - Interfaces de repositório, use cases e implementação Supabase da agenda e da sessão"
labels: [fase-2, backend]
depends_on: [F2.03, F2.04, F2.06, F2.07]
---
## Contexto
As regras puras precisam de dados: agenda, fichas, sessões da semana. Seguindo o padrão de notificações (`src/core/application/interfaces` + `src/infrastructure/repositories`), esta issue cria os contratos e a implementação Supabase, mais os use cases que orquestram carregar, decidir e salvar. Spec: docs/specs/002-agenda-semanal/spec.md, RF-011, RF-019, RF-020, RF-023, RF-034. Camadas em plan.md, "Arquitetura e camadas".

## Objetivo
`IScheduleRepository` e `IWorkoutSessionRepository` definidos na aplicação, implementados em `SupabaseScheduleRepository` e `SupabaseWorkoutSessionRepository`, e use cases `GetStudentWeek`, `SaveStudentSchedule`, `StartWorkoutSession`, `FinishWorkoutSession`, `AdoptLegacyLocalSession`, todos com injeção por construtor.

## Escopo
- Aplicação (interfaces):
  - `IScheduleRepository`: `getByStudent(studentId): Promise<WeeklySchedule>`, `replace(studentId, days: ScheduleDay[]): Promise<void>` (via `rpc('set_schedule_days')`), `listWorkoutsByStudent(studentId): Promise<WorkoutSummary[]>`, `listWeekdaysPointingTo(workoutId): Promise<Weekday[]>`, `hasAnyDay(studentId): Promise<boolean>`.
  - `IWorkoutSessionRepository`: `listCompletedInRange(studentId, fromInstant, toInstant)`, `findInProgressForDay(studentId, date)`, `findInProgressStandalone(studentId, workoutId)`, `findById(sessionId, studentId)`, `insertInProgress({ studentId, workoutId, workoutTitle, scheduledDate })` (trata 23505 devolvendo a sessão em andamento do dia), `finish(sessionId, studentId, logs, detachDay)` (via `rpc('finish_workout_session')`), `discard(sessionId, studentId)`.
- Aplicação (use cases): um método `execute` cada; recebem `now: Date` do adaptador; chamam o domínio; `StartWorkoutSession` mapeia `StartDecision` para `{ sessionId, scheduledDate, startedAt }` ou `{ reason }`; `FinishWorkoutSession` devolve `{ scheduledDate, totalDuration }`; `AdoptLegacyLocalSession` usa `resolveLegacySessionDay` e insere.
- Infra: implementações com `createAdminClient()`, selects explícitos (sem `*`), filtro por `user_id` em toda query; `started_at` nunca enviado (default `now()` no banco ou `now()` explícito via RPC).
- Mapeamento `Workout` -> `WorkoutSummary` e linhas -> `SessionSummary` dentro do repositório.
- Arquivos prováveis: `src/core/application/interfaces/schedule.repository.ts`, `workout-session.repository.ts`; `src/core/application/use-cases/get-student-week.use-case.ts`, `save-student-schedule.use-case.ts`, `start-workout-session.use-case.ts`, `finish-workout-session.use-case.ts`, `adopt-legacy-local-session.use-case.ts`; `src/infrastructure/repositories/supabase-schedule.repository.ts`, `supabase-workout-session.repository.ts`; `src/lib/types.ts` (campos novos em `WorkoutSession`).

## Fora de escopo
- Server actions e revalidação (F2.10, F2.11).
- Composition root: instanciação continua na action, como em notificações.
- `AssignAiDraftsToScheduleUseCase` (F2.18).

## Critérios de aceite
- [ ] Nenhum arquivo de `src/core` importa `@/lib/supabase`, `next/*` ou `@/infrastructure`.
- [ ] Toda query dos repositórios filtra por `user_id`; nenhuma aceita `started_at` ou `completed_at` do chamador.
- [ ] `insertInProgress` para um dia que já tem sessão `in_progress` devolve essa sessão (retomada) em vez de erro; para um dia com sessão `completed` o use case recusa antes de inserir (`day_already_done`).
- [ ] `finish` chamado duas vezes devolve o mesmo resultado sem duplicar logs (verificado no dev).
- [ ] `replace` com sete dias grava via `set_schedule_days` e o estado final no dev corresponde ao enviado.
- [ ] `npm run build` verde com TypeScript strict e zero `any`.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: exercitar os repositórios por um script temporário ou pelas actions de F2.11, com o estado do banco conferido no SQL Editor

## Notas técnicas
- `rpc()` do supabase-js confirmado na doc (Context7, 2026-10-17). Erros das funções SQL chegam como `error.message` (`SESSION_NOT_FOUND`, `SESSION_DISCARDED`); mapear para razões do domínio no use case.
- Código 23505 do Postgres no insert: tratar no repositório e consultar `findInProgressForDay`.
- Semana para `listCompletedInRange`: `brasiliaMidnightInstant(weekStart)` até `brasiliaMidnightInstant(addDays(weekEnd, 1))`, filtrando por `started_at` e `status = 'completed'`.
- Não testar os repositórios com mocks do supabase-js: o valor está na integração real no dev (vault Estrategia-de-Testes).
