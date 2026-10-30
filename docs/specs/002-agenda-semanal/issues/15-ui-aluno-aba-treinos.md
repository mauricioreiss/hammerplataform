---
id: F2.15
title: "F2.15 - UI do aluno: aba Treinos com os sete dias e a seção Outras fichas"
labels: [fase-2, frontend]
depends_on: [F2.11]
---
## Contexto
A aba Treinos deixa a lista alfabética com "Próximo" e passa a mostrar a semana de segunda a domingo com hoje em destaque, o status de cada dia e, abaixo, as fichas avulsas. Spec: docs/specs/002-agenda-semanal/spec.md, RF-003, RF-006, RF-015, RF-027, RF-028; cenários 1.3, 1.6, 1.7, 1.9, 4.1, 4.3, 4.7, 4.15, 5.3 e os casos de borda de "Outras fichas" e virada da semana. Visual atual.

## Objetivo
`src/app/aluno/treino/page.tsx` consome `getStudentWeek` e renderiza sete linhas (dia, data, conteúdo, status) com links para o dia, mais a seção "Outras fichas" em ordem alfabética.

## Escopo
- Frontend: a page troca as actions do rodízio por `getStudentWeek()`.
- Frontend: componente `WeekDayRow` (server-compatível) com: nome do dia e data; título da ficha (a executada quando há sessão, senão a apontada), ou indicação de descanso com o texto, ou "Dia livre"; status (feito, reposto, não realizado, pendente) quando houver; destaque visual de hoje (borda vermelha, como o "Próximo" atual); link para `/aluno/treino/[workoutId]?dia=[date]` quando há ficha (inclusive futuro, que abre em leitura) e sem link em descanso e livre.
- Frontend: seção "Outras fichas" com as avulsas publicadas, cards no estilo atual, link para `/aluno/treino/[workoutId]` sem `dia`.
- Frontend: estado vazio: sete dias livres (sem a mensagem antiga "Nenhum treino disponivel") mais "Outras fichas" quando houver.
- Frontend: `src/app/aluno/treino/loading.tsx` com a geometria de sete linhas (hoje mostra o layout da sessão, gotcha 40).
- Arquivos prováveis: `src/app/aluno/treino/page.tsx`, `src/components/aluno/week-day-row.tsx`, `src/app/aluno/treino/loading.tsx`.

## Fora de escopo
- Página da sessão e modo leitura (F2.16).
- Reformulação visual (Fase 3).

## Critérios de aceite
- [ ] Sete linhas na ordem segunda a domingo, cada uma com ficha, descanso ou dia livre, hoje em destaque e "Outras fichas" abaixo em ordem alfabética (cenário 1.3).
- [ ] Quarta sem sessão e hoje quinta: quarta "não realizada", quinta "pendente" (cenário 4.1); quarta reposta no sábado: quarta "reposta", sábado sem status (cenário 4.3).
- [ ] Dia livre ou descanso passado sem sessão não aparece como não realizado (cenário 4.15); descanso mostra o texto do professor em qualquer dia (cenário 5.3).
- [ ] Dia que aponta para rascunho aparece como dia livre, sem título (cenário 1.6).
- [ ] Dia futuro com ficha abre a página em modo de leitura (cenário 1.7; comportamento da página em F2.16).
- [ ] Após 00:00 de segunda em Brasília, a quarta anterior não aparece mais como não realizada e a nova semana começa pendente (cenário 4.7).
- [ ] Ficha que está em qualquer dia nunca aparece em "Outras fichas"; ficha avulsa aparece mesmo depois de executada (cenário 1.10).
- [ ] Nenhuma rolagem horizontal em 320 px.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: agenda do aluno de teste com feito, reposto, não realizado, descanso, livre, rascunho e uma avulsa; screenshot em 320 px

## Notas técnicas
- Status com texto além da cor (verde feito/reposto, amarelo não realizado, zinc pendente), nas classes Tailwind já usadas no projeto.
- A linha de hoje é a primeira coisa visível em telas pequenas? Não: a ordem é sempre segunda a domingo (RF-027); o destaque basta.
