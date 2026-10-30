---
id: F2.07
title: "F2.07 - Domínio: regras de início, reposição, retomada e sessão legada (com testes)"
labels: [fase-2, backend, testes]
depends_on: [F1.01, F2.05, F2.06]
---
## Contexto
O servidor decide se uma sessão pode começar para um dia, fixa o dia no início, aceita a finalização depois da virada e trata sessões retomadas ou guardadas antes da entrega. Spec: docs/specs/002-agenda-semanal/spec.md, RF-008, RF-009, RF-015, RF-017, RF-020, RF-022, RF-023, RF-049; cenários 4.3 a 4.10, 4.20, 4.21 e o caso de borda "sessão em andamento salva localmente antes da entrega". Assinaturas em plan.md (`session-rules.ts`).

## Objetivo
Módulo `src/core/domain/schedule/session-rules.ts` com `evaluateSessionStart`, `classifyResumedSession` e `resolveLegacySessionDay`, e testes T27 a T41 escritos antes.

## Escopo
- Testes primeiro: `session-rules.test.ts` com T27 a T41 (futuro, fora da semana, reposição às 21:30 de domingo em Brasília, dia livre e rascunho, ficha diferente da do dia, avulsa com dia, não publicada, de outro aluno, dia já feito, avulsa repetida, retomada na mesma semana, retomada na semana seguinte, retomada sem dia, legado para hoje, legado para dia não realizado, legado sem dia).
- Domínio: `evaluateSessionStart` devolve `{ allowed: true, scheduledDate, mode: today | make_up | standalone }` ou `{ allowed: false, reason }` com as razões do plano; ordem das checagens: posse da ficha, publicação, dia nulo (avulsa: só permitido se a ficha não está em nenhum dia), dia fora da semana corrente, dia futuro, dia livre ou rascunho, ficha diferente da do dia, dia já feito ou reposto. Uma sessão `in_progress` já existente para o dia não é recusa: o use case a retoma (F2.11).
- Domínio: `classifyResumedSession` (`continue` quando `weekBoundsOf(scheduledDate)` contém hoje; `week_ended` caso contrário; `standalone` sem dia).
- Domínio: `resolveLegacySessionDay` (hoje se a ficha é a de hoje e hoje está pendente; senão o primeiro dia passado não realizado da semana com a mesma ficha; senão sem dia).
- Arquivos prováveis: `src/core/domain/schedule/session-rules.ts`, `session-rules.test.ts`.

## Fora de escopo
- Persistência, índice único e tratamento de 23505 (F2.04, F2.09, F2.11).
- UI de retomada e de adoção (F2.16).

## Critérios de aceite
- [ ] T27 a T41 verdes, com evidência de vermelho antes.
- [ ] Cenário 4.6: iniciar a sexta na quinta é recusado com `future_day`.
- [ ] Cenário 4.8: às 00:30 UTC de segunda (21:30 de domingo em Brasília) a reposição da quarta é permitida com `make_up`; às 03:30 UTC é recusada com `outside_week`.
- [ ] Cenário 4.14 e RF-023: dia feito ou reposto recusa com `day_already_done`.
- [ ] Cenário 1.10: ficha avulsa pode iniciar sem dia quantas vezes quiser; com dia é `standalone_with_day`.
- [ ] Cenário 4.21: sessão de domingo retomada na quarta seguinte classifica como `week_ended`; 4.20 classifica como `continue`.
- [ ] RF-049: os três ramos do legado cobertos (hoje, reposição, sem dia).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] Sem QA manual: módulo puro

## Notas técnicas
- A finalização não tem regra de domínio: qualquer sessão `in_progress` do próprio aluno pode ser finalizada a qualquer momento (RF-009); a única variação é `detachDay` (RF-022), decidida pelo aluno.
- O "agora" é o instante do servidor passado pelo use case; o cliente só envia `scheduledDate`.
