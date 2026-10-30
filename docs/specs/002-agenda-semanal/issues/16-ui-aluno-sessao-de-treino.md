---
id: F2.16
title: "F2.16 - UI do aluno: sessão de treino com início no servidor, finalização idempotente, retomada e registro local legado"
labels: [fase-2, frontend]
depends_on: [F2.11, F2.15]
---
## Contexto
A página da sessão passa a abrir um dia da agenda (ou uma ficha avulsa), iniciar a sessão no servidor por um botão, continuar a execução local e finalizar por `sessionId`, tratando retomada após a virada da semana e o registro local anterior à entrega. Spec: docs/specs/002-agenda-semanal/spec.md, RF-005, RF-013, RF-021, RF-022, RF-023, RF-029, RF-049; cenários 1.7, 1.11, 4.14, 4.19, 4.20, 4.21, 4.22 e os casos de borda de sessão local. Fluxo em plan.md, "Fluxo de iniciar e finalizar a sessão" e decisões D2, D10, D13.

## Objetivo
`src/app/aluno/treino/[id]/page.tsx` lê `?dia=`, chama `getScheduleDayView` e monta `WorkoutSession` em um dos modos; `WorkoutSession` ganha o botão "Iniciar treino", persiste por `sessionId`, finaliza por `sessionId` e trata `resume_week_ended` e a chave legada.

## Escopo
- Frontend (page): valida `dia` com Zod (`YYYY-MM-DD`), chama `getScheduleDayView(id, dia)`; `not_found` -> `notFound()`; demais modos passam `view` para `WorkoutSession`.
- Frontend (`workout-storage-utils.ts`): `PersistedSession` v2 com `sessionId`, `workoutId`, `scheduledDate`, `completedSets`, `weights`, `elapsed`, `savedAt`, `expandedId`; chave `hammer_session_v2_<sessionId>`; funções `loadSessionById`, `saveSession`, `clearSessionById`, `loadLegacySession(workoutId)` (chave antiga `hammer_session_<workoutId>`) e `clearLegacySession(workoutId)`.
- Frontend (`workout-session.tsx`):
  - modos de leitura (`readonly_future`: ficha visível, botão desabilitado e "Esse dia ainda não chegou"; `readonly_completed`: ficha ou só título com as cargas da sessão e "Concluído", sem iniciar; `readonly_scheduled_elsewhere`: ficha com links para os dias);
  - modos iniciáveis (`startable_today`, `startable_make_up`, `standalone`): botão "Iniciar treino" chama `startWorkoutSession`; só depois o cronômetro e as séries ficam ativos; a mensagem de reposição aparece quando `make_up`;
  - `resume`: carrega o estado local por `sessionId` e continua; `resume_week_ended`: aviso "A semana desse dia já acabou" com "Finalizar sem dia" (`finishWorkoutSession` com `detachDay: true`) e "Descartar" (`discardWorkoutSession`), nunca descartando sozinho;
  - registro legado: ao montar, se `loadLegacySession(workoutId)` existir e não houver `activeSession`, mostrar "Encontramos um treino em andamento" com "Continuar" (`adoptLegacyLocalSession` -> migra o estado local para a chave v2) e "Descartar" (apaga a chave antiga só após a escolha);
  - finalizar: `finishWorkoutSession({ sessionId, logs })`; em sucesso limpa a chave v2; em falha mantém a chave e reabilita o botão (o aluno pode tentar de novo; o servidor não duplica);
  - o `useMemo` que lê `localStorage` no render passa para `useEffect` com estado de "restaurando" (evita hydration mismatch, gotcha 34).
- Arquivos prováveis: `src/app/aluno/treino/[id]/page.tsx`, `src/components/aluno/workout-session.tsx`, `src/lib/workout-storage-utils.ts`, `src/components/aluno/exercise-item.tsx` (só se precisar de `readOnly` com cargas da sessão).

## Fora de escopo
- Cronômetro pelo relógio, vibração, som e comemoração (Fase 3).
- Diálogo padronizado (Fase 3): usar a UI inline atual para avisos e escolhas.
- Expirar sessões automaticamente.

## Critérios de aceite
- [ ] Dia futuro abre em leitura com o início desabilitado e a mensagem de que o dia ainda não chegou (cenário 1.7, RF-029).
- [ ] Dia feito ou reposto abre em leitura com a ficha executada, as cargas e "Concluído", sem iniciar nova sessão; se a ficha voltou a rascunho, mostra só o título e as cargas (cenários 4.14, 4.22, RF-013).
- [ ] Abrir ficha em rascunho pela URL mostra "não encontrada", sem título (cenário 1.11).
- [ ] Professor troca a ficha do dia durante a sessão: a sessão continua, finaliza e o dia fica feito com a ficha iniciada; o aluno só vê a nova ao reabrir o dia (cenário 4.19, RF-021).
- [ ] Sessão iniciada na terça e retomada no sábado continua e conta para a terça (cenário 4.20); iniciada no domingo e retomada na quarta seguinte mostra o aviso com as duas opções e nada é descartado sem escolha (cenário 4.21, CS-008).
- [ ] Registro local da versão anterior (chave por ficha) é detectado, adotado para hoje, para um dia não realizado ou sem dia conforme a agenda, e as cargas marcadas são preservadas (RF-049); "Descartar" só apaga após o toque.
- [ ] Falha de rede ao finalizar mantém as cargas locais e reabilita o botão; tentar de novo com o servidor já tendo gravado leva a uma única sessão no banco (RF-023; RF-025 da Fase 3).
- [ ] Ficha avulsa pode ser iniciada e finalizada mais de uma vez no mesmo dia (cenário 1.10).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: fluxo completo em celular ou emulação, com rede offline no DevTools para o retry, e uma chave legada criada à mão no localStorage

## Notas técnicas
- `key={sessionId ?? workout.id}` na page para remontar ao trocar de sessão.
- O estado local nunca contém dado sensível além de cargas; continua em `localStorage` (não é token).
- Mensagens em pt-BR com acento; o visual segue os cards e botões atuais.
