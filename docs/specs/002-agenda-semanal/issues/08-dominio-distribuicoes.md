---
id: F2.08
title: "F2.08 - Domínio: distribuição da migração com ordenação natural e distribuição dos rascunhos da IA (com testes)"
labels: [fase-2, backend, testes]
depends_on: [F1.01, F2.06]
---
## Contexto
Na entrega, as fichas publicadas de cada aluno são distribuídas nos dias em ordem alfabética natural; e o rascunho da IA passa a apontar os dias marcados na anamnese que estiverem livres. Spec: docs/specs/002-agenda-semanal/spec.md, RF-041, RF-042, RF-043, RF-045, RF-046, RF-047; cenários 3.1 a 3.4, 3.7 a 3.9 e 6.4, 6.7 a 6.11. Assinaturas em plan.md (`migration-distribution.ts`, `ai-draft-distribution.ts`).

## Objetivo
Dois módulos puros com testes T42 a T54 escritos antes: `distributeWorkoutsForMigration` + `naturalTitleComparator`, e `assignDraftsToAvailableDays` + `requestedDraftCount`.

## Escopo
- Testes primeiro: `migration-distribution.test.ts` (T42 a T48) e `ai-draft-distribution.test.ts` (T49 a T54).
- Domínio `migration-distribution.ts`: `naturalTitleComparator` com `Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" })` e desempate por `createdAt` crescente; `distributeWorkoutsForMigration(workouts)` filtra por `isPublishedStatus`, ordena, preenche os dias 1..7 sem repetir ficha e devolve as demais como avulsas.
- Domínio `ai-draft-distribution.ts`: `assignDraftsToAvailableDays({ availableDays, schedule, draftWorkoutIds })` preenche só dias marcados que estão `free`, na ordem dos dias e das fichas, devolve `leftoverDraftIds` e uma `divergence` em texto quando a quantidade devolvida difere da marcada (RF-043); `requestedDraftCount({ trainingDays, legacyDaysPerWeek })` devolve a cardinalidade dos dias, senão o legado, senão 3 (RF-042).
- Arquivos prováveis: `src/core/domain/schedule/migration-distribution.ts`, `migration-distribution.test.ts`, `ai-draft-distribution.ts`, `ai-draft-distribution.test.ts`.

## Fora de escopo
- O script que roda a migração (F2.19) e a integração com `createAiWorkoutDraft` (F2.18).
- Qualquer escrita de texto de descanso pela IA (proibido pelo RF-041).

## Critérios de aceite
- [ ] T42 a T54 verdes, com evidência de vermelho antes.
- [ ] Cenário 3.7: "Treino 10", "Treino 2", "treino Água" resultam em 2, 10, Água.
- [ ] Cenário 3.8: dois "Treino A" ficam na ordem de criação.
- [ ] Cenário 3.2: nove publicadas resultam em sete dias e duas avulsas; 3.3: rascunhos ficam fora; 3.9: `approved` entra como publicada.
- [ ] Cenário 6.9 e 6.10: dias ocupados nunca são sobrescritos; sem dia livre, nenhum dia muda e não há erro.
- [ ] Cenário 6.7 e 6.8: menos fichas preenchem os primeiros dias; mais fichas deixam sobras; os dois registram divergência.
- [ ] Cenário 6.11: sem dias marcados, `requestedDraftCount` devolve o legado ou 3 e `assignDraftsToAvailableDays` com `availableDays` vazio não aponta nada.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] Sem QA manual: módulo puro

## Notas técnicas
- `Intl.Collator` com `numeric: true` e `sensitivity: "base"` é ECMAScript padrão (ECMA-402); confirmar na doc que `sensitivity: "base"` ignora acento e caixa em pt-BR, que é o exigido pelo RF-045.
- A ordenação é O(n log n) sobre poucas fichas por aluno.
- A alternativa SQL com collation ICU fica registrada na decisão D8 do plano, caso o script TypeScript seja vetado.
