---
id: F2.10
title: "F2.10 - Server actions do professor: ler e salvar a agenda, uso de ficha na agenda"
labels: [fase-2, backend]
depends_on: [F2.09]
---
## Contexto
O professor monta a agenda no perfil do aluno e precisa saber o status de cada dia e se uma ficha está na agenda antes de excluir. Spec: docs/specs/002-agenda-semanal/spec.md, RF-014, RF-024, RF-030 a RF-034, RF-038; cenários 2.1 a 2.8. Contratos em plan.md, "Contratos das server actions".

## Objetivo
Arquivo `src/app/admin/agenda/actions.ts` com `getStudentSchedule`, `saveStudentSchedule` e `getWorkoutScheduleUsage`, adaptadores finos sobre os use cases, com Zod na fronteira e `requireAuth("admin")`; e `getAuthUser`/`requireAuth` movidos para `src/lib/auth.ts`.

## Escopo
- Backend: criar `src/lib/auth.ts` exportando `getAuthUser()` e `requireAuth(role?)` com o código atual de `actions.ts`; `actions.ts` passa a importar de lá (sem mudar comportamento; as cópias em `admin/exercicios/actions.ts` e `admin/ia/actions.ts` ficam como estão).
- Backend: `getStudentSchedule(studentId)` devolve `{ week: WeekView (audiência teacher, com isDraft e status), workouts: WorkoutSummary[] (publicadas e rascunhos) }`.
- Backend: `saveStudentSchedule(studentId, days)` com schema Zod: array de 7 itens `{ weekday 1..7, kind in workout|rest|free, workoutId uuid opcional, restNote string max 500 opcional }`; `validateScheduleInput` do domínio; use case confirma que cada `workoutId` pertence ao aluno; grava; `revalidatePath` de `/admin/alunos/[id]`, `/aluno` e `/aluno/treino`; devolve `{ success, pastDaysAssigned: Weekday[] }` (dias passados da semana corrente que receberam ficha publicada sem sessão, para o aviso do RF-024). Nenhuma notificação (RF-033).
- Backend: `getWorkoutScheduleUsage(workoutId)` devolve `{ weekdays }` para o aviso de exclusão (RF-014).
- Arquivos prováveis: `src/app/admin/agenda/actions.ts`, `src/lib/auth.ts`, `src/app/actions.ts` (só a troca dos helpers por import).

## Fora de escopo
- UI da aba Agenda (F2.12) e aviso na exclusão (F2.13).
- Actions do aluno (F2.11).
- Mudar `deleteWorkout` ou `updateWorkoutStatus` (o banco já trata a cascata).

## Critérios de aceite
- [ ] Chamada de aluno autenticado a `saveStudentSchedule` é recusada; chamada sem sessão é recusada; ids inválidos são recusados antes de tocar o banco (cenário 2.6, RF-034).
- [ ] `restNote` com 501 caracteres é recusado com mensagem que cita o limite de 500; com 500 é aceito (cenário 5.6).
- [ ] `workoutId` de ficha de outro aluno é recusado.
- [ ] A mesma ficha em dois dias é aceita (cenário 2.2); ficha em rascunho é aceita e aparece com `isDraft` em `getStudentSchedule` (cenário 2.3).
- [ ] Após salvar, `getStudentHome` do aluno (F2.11) reflete a mudança sem passo de publicação (RF-032) e nenhuma linha é inserida em `notifications` (RF-033).
- [ ] `pastDaysAssigned` lista a terça quando o professor atribui ficha publicada à terça na quinta (cenário 2.7).
- [ ] `getWorkoutScheduleUsage` devolve os dias que apontam para a ficha, inclusive quando são vários.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: chamadas diretas às actions (DevTools ou script) como professor, como aluno e sem sessão

## Notas técnicas
- `revalidatePath` e `refresh` em server actions confirmados na doc do Next 16 (Context7, 2026-10-17). Como as páginas do aluno são dinâmicas (cookies), `revalidatePath` aqui serve para o Router Cache do cliente; manter o `router.refresh()` que o padrão do projeto já faz após salvar.
- Padrão de retorno `{ success, error? }` como o resto de `actions.ts`.
- Não logar o payload (contém texto livre do professor sobre o aluno).
