---
id: F2.14
title: "F2.14 - UI do aluno: home com o treino do dia, descanso, dia livre, agenda em montagem e atalho de reposição"
labels: [fase-2, frontend]
depends_on: [F2.11]
---
## Contexto
A home do aluno deixa o rodízio e passa a mostrar o que a agenda atribui ao dia de hoje em Brasília, com atalho para repor dias não realizados. Spec: docs/specs/002-agenda-semanal/spec.md, RF-003, RF-025, RF-026, RF-037; cenários 1.1, 1.2, 1.4, 1.5, 1.6, 1.8, 1.9, 1.10, 4.16, 4.17, 5.2, 6.5 e o caso de borda "todos os dias como descanso". Visual atual.

## Objetivo
`src/app/aluno/page.tsx` consome `getStudentHome` e renderiza uma de quatro variantes (ficha do dia com status, descanso com texto, dia livre, "Seu professor está montando sua agenda"), mais o atalho de reposição quando houver dias não realizados.

## Escopo
- Frontend: a page troca `getWorkoutsDoAluno` + `getLastFinishedWorkoutId` pelo `getStudentHome()` e remove o cálculo de rodízio.
- Frontend: `WorkoutDayCard` passa a receber `day: WeekDayView` e a linkar para `/aluno/treino/[workoutId]?dia=[date]`; mostra "Pendente" ou "Feito" (com "Ver treino" em vez de "Iniciar Treino" quando feito).
- Frontend: componentes server-compatíveis novos e pequenos: `RestDayCard` (indicação de descanso + texto do professor, sem texto padrão), `FreeDayCard` ("Dia livre"), `ScheduleEmptyCard` ("Seu professor está montando sua agenda"), `MakeUpShortcut` (lista os dias não realizados com link para o dia).
- Frontend: `loading.tsx` da home ajustado para a geometria do card (sem mudar o estilo).
- Arquivos prováveis: `src/app/aluno/page.tsx`, `src/components/aluno/workout-day-card.tsx`, `src/components/aluno/rest-day-card.tsx`, `src/components/aluno/free-day-card.tsx`, `src/components/aluno/schedule-empty-card.tsx`, `src/components/aluno/make-up-shortcut.tsx`, `src/app/aluno/loading.tsx` (se existir).

## Fora de escopo
- Aba Treinos (F2.15) e página da sessão (F2.16).
- Reformulação visual, novos componentes padronizados (Fase 3).
- Paywall e primeiro login (inalterados).

## Critérios de aceite
- [ ] Com Treino C na quarta e Treino D na quinta, sem sessão na quarta, a home na quinta mostra Treino D e nunca Treino C (cenário 1.1, CS-002).
- [ ] Treino A na segunda e na quinta, feito na segunda: a home na quinta mostra Treino A pendente e abrível (cenário 1.2).
- [ ] Agenda sem ficha publicada nem descanso mostra "Seu professor está montando sua agenda" (cenários 1.4, 6.5); com fichas avulsas publicadas, a mesma mensagem.
- [ ] Hoje livre mostra "Dia livre"; hoje descanso mostra a indicação e o texto do professor, ou só a indicação sem texto (cenários 1.5, 5.2, 5.4).
- [ ] Dia que aponta para rascunho aparece como dia livre e passa a mostrar a ficha após a publicação, ao recarregar (cenário 1.6).
- [ ] Com a quarta não realizada e hoje livre, descanso ou já feito, o atalho de reposição aparece e leva ao dia (cenários 4.16, 4.17).
- [ ] Após finalizar uma ficha avulsa na segunda, a home continua mostrando Treino A pendente (cenário 1.10).
- [ ] Às 21:30 de domingo em Brasília a home mostra a ficha de domingo (cenário 1.8; verificado no dev com sessão inserida por SQL e, se possível, em um domingo real).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: montar a agenda do aluno de teste pela aba Agenda e percorrer os cenários na home (Chrome DevTools ou Playwright, com screenshot)

## Notas técnicas
- Toda data exibida vem de `LocalDate` formatada como string; nunca `new Date("YYYY-MM-DD")`.
- A home é server component; manter `Promise.all` com `getCurrentUser()` como hoje.
- O texto "Bom dia," atual permanece; não é escopo.
