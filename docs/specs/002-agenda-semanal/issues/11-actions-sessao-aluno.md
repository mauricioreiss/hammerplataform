---
id: F2.11
title: "F2.11 - Server actions do aluno: home, semana, dia, iniciar, finalizar (idempotente), descartar e adotar sessão legada"
labels: [fase-2, backend]
depends_on: [F2.09, F2.10]
---
## Contexto
O aluno lê a agenda e executa sessões; o servidor fixa o dia e o início, recusa o que não pode ser iniciado e aceita a finalização a qualquer momento depois. Spec: docs/specs/002-agenda-semanal/spec.md, RF-003, RF-005, RF-006, RF-007, RF-008, RF-009, RF-013, RF-015, RF-016, RF-019, RF-020, RF-022, RF-023, RF-029, RF-049; cenários 1.10, 1.11, 4.4 a 4.10, 4.19 a 4.21. Contratos em plan.md, "Contratos das server actions". Também atende ao RF-025 da Fase 3 (tentar de novo não cria uma segunda sessão).

## Objetivo
Arquivo `src/app/aluno/agenda/actions.ts` com `getStudentHome`, `getStudentWeek`, `getScheduleDayView`, `startWorkoutSession`, `finishWorkoutSession`, `discardWorkoutSession` e `adoptLegacyLocalSession`, todos escopados em `user.id`, e remoção das actions do rodízio.

## Escopo
- Backend: as sete actions como adaptadores finos (Zod na entrada, `getAuthUser()`, instanciar repositório e use case, mapear retorno). O `now` passado ao use case é `new Date()` do servidor.
- Backend: `getScheduleDayView(workoutId, scheduledDate?)` devolve `mode` entre `startable_today`, `startable_make_up`, `readonly_future`, `readonly_completed`, `readonly_scheduled_elsewhere`, `standalone`, `resume`, `resume_week_ended`, `not_found`; nunca devolve exercícios de ficha em rascunho; no modo `readonly_completed` com ficha em rascunho devolve só `{ id, title }` com as cargas da sessão (RF-013); `activeSession` traz `{ id, scheduledDate, startedAt }` quando há sessão `in_progress`.
- Backend: `startWorkoutSession({ workoutId, scheduledDate })` nunca aceita `startedAt`; devolve `reason` nas recusas do domínio.
- Backend: `finishWorkoutSession({ sessionId, logs, detachDay? })` chama o use case (função SQL em transação); após sucesso, insere a notificação ao professor como hoje e `revalidatePath('/aluno')` e `/aluno/treino`.
- Backend: `discardWorkoutSession(sessionId)` e `adoptLegacyLocalSession(workoutId)`.
- Backend: `getWorkoutComExercicios` segue a regra de visibilidade da agenda: ficha não publicada só para admin; posse checada pelo `user.id` autenticado, com ou sem linha em `users`; toda recusa devolve o mesmo `null` de "não encontrada".
- Backend: remover `getWorkoutsDoAluno`, `getLastFinishedWorkoutId`, `isWorkoutCompletedThisWeek` e a antiga `finishWorkoutSession` de `actions.ts` depois que F2.14 a F2.16 trocarem os chamadores (ou nesta issue, com as páginas apontando temporariamente para as novas actions; combinar na branch).
- Arquivos prováveis: `src/app/aluno/agenda/actions.ts`, `src/app/actions.ts`, `src/lib/types.ts`.

## Fora de escopo
- UI (F2.14, F2.15, F2.16).
- Regras de paywall (premissa da spec: o comportamento do paywall não muda nesta fase).
- Expiração automática de sessões `in_progress`.

## Critérios de aceite
- [ ] Chamada direta a `startWorkoutSession` com dia futuro, dia de outra semana, dia livre, dia que aponta para rascunho, ficha diferente da do dia, ficha avulsa com dia, ficha em rascunho, ficha de outro aluno ou dia já feito é recusada no servidor com a razão correspondente (RF-009, RF-020, CS-006).
- [ ] `started_at` e `scheduled_date` gravados vêm do servidor; qualquer campo extra enviado pelo cliente é ignorado pelo Zod (RF-019).
- [ ] Finalizar depois da meia-noite ou da virada da semana é aceito e a sessão conta para o dia fixado no início (cenários 4.9 e 4.10, CS-008).
- [ ] Chamar `finishWorkoutSession` duas vezes com o mesmo `sessionId` (simulando o retry após timeout) devolve sucesso nas duas e deixa uma única sessão e um único conjunto de logs; nunca cria uma segunda sessão para a mesma execução. Este critério cobre o RF-025 da Fase 3.
- [ ] `startWorkoutSession` para um dia que já tem sessão `in_progress` devolve o mesmo `sessionId` (retomada), não uma sessão nova (RF-023).
- [ ] Duas sessões no mesmo dia para dias diferentes (cenário 4.4) são aceitas; a segunda para o mesmo dia já feito é recusada.
- [ ] `getWorkoutComExercicios` com id de ficha em rascunho, chamada por aluno, devolve `null` sem revelar o título (cenário 1.11, RF-005); por admin continua funcionando.
- [ ] `adoptLegacyLocalSession` resolve os três casos do RF-049 e nunca descarta nada.
- [ ] `discardWorkoutSession` só afeta sessão `in_progress` do próprio aluno.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: chamadas diretas às actions com payloads válidos e inválidos, conferindo `workout_sessions` e `exercise_logs` no SQL Editor

## Notas técnicas
- `getStudentHome` e `getStudentWeek` compartilham o `GetStudentWeekUseCase`; a home é `resolveHome(week)` + `listMissedDays(week)`.
- Tratar `SESSION_NOT_FOUND` e `SESSION_DISCARDED` vindos da função SQL como `{ success: false }` com mensagem neutra.
- Mensagens ao usuário em pt-BR com acento; razões técnicas ficam no tipo, não no texto.
