---
id: F2.13
title: "F2.13 - Professor: aviso ao excluir ficha na agenda e histórico do perfil na semana de Brasília"
labels: [fase-2, frontend, backend]
depends_on: [F2.10, F2.09, F1.05]
---
## Contexto
Excluir uma ficha que está na agenda precisa avisar o professor antes, e "Frequência da Semana" e "Últimos Treinos" precisam usar a semana de Brasília sem deduplicar por ficha. Spec: docs/specs/002-agenda-semanal/spec.md, RF-014, RF-035; cenários 2.8, 4.23, 4.25, 4.26. Hoje `getWeekStart()` usa o relógio do servidor e `getRecentSessions` deduplica por `workout_id` (CODEBASE_MAP, gotcha 23).

## Objetivo
`WorkoutCard` consulta `getWorkoutScheduleUsage` antes de confirmar a exclusão e inclui os dias no texto; `getStudentQuickStatus` e `getRecentSessions` usam `brasiliaMidnightInstant(weekStart)`, `status = 'completed'`, o snapshot `workout_title` e listam todas as sessões da semana; `getSessionDetail` e `getExerciseWeightHistory` usam `exercise_name` como fallback.

## Escopo
- Frontend: em `workout-builder.tsx`, `handleDelete` chama `getWorkoutScheduleUsage(workout.id)`; se houver dias, o `confirm()` atual passa a dizer "Esta ficha está na agenda (quarta, sexta). Ao excluir, esses dias ficam livres e as sessões já feitas são mantidas. Excluir?"; sem dias, texto atual. O `confirm()` nativo permanece (a troca por diálogo é da Fase 3).
- Backend: `getStudentQuickStatus` e `getRecentSessions` substituem `getWeekStart()` por `weekBoundsOf(toBrasiliaDate(now))` + `brasiliaMidnightInstant`, filtram `status = 'completed'` e `started_at` no intervalo; `getRecentSessions` deixa de deduplicar e usa `workout_title` da sessão (fallback para o título atual da ficha quando o snapshot for nulo em dado antigo); remover `getWeekStart()` quando não houver mais chamadores.
- Backend: `getSessionDetail` e `getExerciseWeightHistory` devolvem `exercise_name` quando `exercise_id` é nulo.
- Arquivos prováveis: `src/components/admin/workout-builder.tsx`, `src/app/actions.ts`.

## Fora de escopo
- Redesenho das seções do perfil (RF-035 pede só o mínimo).
- Diálogo de confirmação padronizado (Fase 3).
- Mudar `deleteWorkout`.

## Critérios de aceite
- [ ] Excluir uma ficha que está na quarta mostra o aviso com o dia antes de confirmar; após confirmar, a quarta aparece livre na aba Agenda e no app do aluno (cenário 2.8).
- [ ] Após excluir uma ficha com sessões, "Últimos Treinos" continua listando as sessões com o título da ficha excluída e a segunda continua feita na aba Agenda (cenário 4.23, CS-004).
- [ ] Sessão finalizada às 22:00 de domingo em Brasília aparece em "Frequência da Semana" e "Últimos Treinos" às 23:00 do mesmo domingo (cenário 4.26); às 00:30 de segunda em Brasília já não aparece.
- [ ] Duas sessões de Treino A na mesma semana aparecem as duas em "Últimos Treinos" e contam 2 em "Frequência da Semana" (cenário 4.25).
- [ ] Sessões `in_progress` não entram na contagem nem na lista.
- [ ] Detalhe de sessão de exercício excluído mostra o nome do snapshot, não "Exercício".

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: inserir sessões por SQL com `started_at` em instantes UTC que caem em domingo 22:00 e segunda 00:30 em Brasília, e conferir o perfil

## Notas técnicas
- `getWeekStart()` tem o comentário sobre "frequency counter every Monday"; ao remover, não deixar referência órfã.
- Confirmar no baseline se `workout_sessions` tem índice por `user_id`; o índice `(user_id, started_at desc)` de F2.04 cobre estas consultas.
