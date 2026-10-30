---
id: F2.06
title: "F2.06 - Domínio: agenda semanal, treino do dia, status do dia e fichas avulsas (com testes)"
labels: [fase-2, backend, testes]
depends_on: [F1.01, F2.05]
---
## Contexto
O treino do dia, o status de cada dia (feito, reposto, não realizado, pendente), a visão de "montando sua agenda" e a lista de fichas avulsas são regras puras derivadas da agenda, das fichas e das sessões da semana. Spec: docs/specs/002-agenda-semanal/spec.md, RF-001, RF-002, RF-003, RF-005, RF-006, RF-007, RF-010, RF-011, RF-012, RF-024, RF-026, RF-028, RF-038, RF-044. Assinaturas em plan.md, "Regras de domínio" (`schedule.ts`, `week-view.ts`).

## Objetivo
Módulos `schedule.ts` e `week-view.ts` em `src/core/domain/schedule/`, com testes T09 a T26 e T55 a T57 escritos antes da implementação.

## Escopo
- Testes primeiro: `schedule.test.ts` (T55 a T57: limite de 500, mesma ficha em dois dias, dia repetido ou faltando) e `week-view.test.ts` (T09 a T26: todos os cenários de status, home e avulsas, inclusive virada de semana e audiência aluno/professor).
- Domínio `schedule.ts`: tipos `ScheduleDay`, `WeeklySchedule`, `WorkoutSummary`; `materializeSchedule`, `isPublishedStatus` (`published` e `approved`, RF-007), `hasConfiguredDay`, `validateScheduleInput` (sete dias únicos, `restNote` até 500, `workoutId` só em `workout`).
- Domínio `week-view.ts`: tipos `DayStatus`, `SessionSummary`, `WeekDayView`, `WeekView`, `HomeView`; `deriveDayStatus` (só sessão `completed` conta; `done` quando `toBrasiliaDate(startedAt) === date`, `made_up` quando posterior; `missed`/`pending` só com ficha publicada; descanso, livre e rascunho sem status); `buildWeekView` (audiência `student` converte rascunho em livre; `teacher` mantém com `isDraft`; sessão prevalece sobre o que o dia aponta, com `executed.workoutTitle` do snapshot); `resolveHome`; `listMissedDays`; `listStandaloneWorkouts` (publicadas fora de todos os dias, ordem alfabética de título por `Intl.Collator("pt-BR")`).
- Arquivos prováveis: `src/core/domain/schedule/schedule.ts`, `schedule.test.ts`, `week-view.ts`, `week-view.test.ts`.

## Fora de escopo
- Regras de início, reposição e retomada de sessão (F2.07).
- Acesso a banco, repositórios e actions (F2.09 em diante).
- Distribuição da migração e da IA (F2.08).

## Critérios de aceite
- [ ] T09 a T26 e T55 a T57 do plano implementados e verdes, com evidência de vermelho antes.
- [ ] Cenário 1.1: quarta sem sessão e hoje quinta resulta em quarta `missed`, quinta `pending`, home com a ficha de quinta.
- [ ] Cenário 1.2 e 4.2: Treino A na segunda e na quinta com sessão na segunda resulta em segunda `done` e quinta `pending` com `canStart`.
- [ ] Cenário 4.10: sessão iniciada domingo 23:40 e finalizada segunda 00:15 (Brasília) conta para o domingo; na semana nova a segunda continua `pending`.
- [ ] Cenário 4.12 e 4.13: dia com sessão mantém status e mostra o título do snapshot mesmo com a agenda trocada para outra ficha, descanso, livre ou rascunho.
- [ ] Caso de borda: todos os dias descanso nunca resulta em `not_configured`; agenda só com avulsas resulta em `not_configured` e `listStandaloneWorkouts` não vazio.
- [ ] Nenhum import de framework; "agora" sempre como parâmetro.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] Sem QA manual: módulo puro

## Notas técnicas
- `buildWeekView` é O(7 + fichas + sessões): indexar fichas e sessões em `Map` antes de montar os dias; nada de busca linear dentro do loop dos sete dias.
- `isDraft` só aparece na audiência `teacher`; a audiência `student` não recebe nem o título do rascunho (RF-005).
- A exceção do RF-013 (dia feito cuja ficha executada voltou a rascunho) é resolvida aqui: `executed` vem da sessão e não depende do status atual da ficha.
