---
id: F2.17
title: "F2.17 - Anamnese com dias disponíveis: migration, validação, funil, modal do professor e número derivado"
labels: [fase-2, banco, backend, frontend]
depends_on: [F2.01, F1.01, F1.03, F1.04, F1.06]
---
## Contexto
A anamnese passa a registrar em quais dias da semana o aluno pode treinar; o número de dias é derivado e o legado é preservado. Spec: docs/specs/002-agenda-semanal/spec.md, RF-039, RF-040; cenários 6.1, 6.2, 6.3, 6.11. Modelo em plan.md ("Tabela alterada: anamnesis", decisão D12). A Fase 1 altera os mesmos arquivos (`funnel-form.tsx`, `anamnese-modal.tsx`, `anamneseSchema`, `registerSchema`); rebase sobre ela antes de abrir o PR.

## Objetivo
Fatia vertical: coluna `training_days smallint[]`, Zod nos dois caminhos, checkboxes de segunda a domingo no passo "Estilo de Vida" do funil (obrigatório, mínimo um) e no modal do professor (opcional), e exibição do número derivado onde hoje aparece `days_per_week`.

## Escopo
- Banco: `supabase migration new anamnesis_training_days` com `add column training_days smallint[]` e CHECK (nulo, ou cardinalidade 1..7 e contido em `{1..7}`); `days_per_week` permanece.
- Backend: `anamneseSchema` e `registerSchema` ganham `training_days: z.array(z.number().int().min(1).max(7)).max(7)` com deduplicação e ordenação em `transform`; no `registerSchema` é obrigatório com `min(1)` e mensagem "Marque ao menos um dia da semana"; `days_per_week` continua opcional nos dois; `upsertAnamnesis` e `registerFromLanding` gravam `training_days`; `Anamnesis` em `types.ts` ganha `training_days: number[] | null`.
- Backend: helper puro `derivedDaysPerWeek(anamnesis)` em `src/core/domain/schedule/` (cardinalidade de `training_days`, senão `days_per_week`, senão null) usado pelo perfil, pelo modal e pela tela da IA.
- Frontend (funil): no passo 3, substituir o `<select>` "Quantos dias treina por semana?" por sete checkboxes rotulados (seg a dom); "Avançar" do passo bloqueado sem ao menos um dia, com mensagem no passo (cenário 6.1); `handleComplete` envia `training_days`.
- Frontend (modal): substituir o `<select>` "Dias por Semana" pelos mesmos checkboxes, opcionais; quando a anamnese tem só o legado, mostrar "Legado: 4x por semana" ao lado, sem marcar dias (RF-042).
- Frontend (perfil e IA): `student-profile.tsx`, `admin/ia/page.tsx` e `analysis-view.tsx` exibem o número derivado; `admin/ia/actions.ts` passa o derivado ao prompt da análise.
- Arquivos prováveis: `supabase/migrations/<timestamp>_anamnesis_training_days.sql`, `src/app/actions.ts`, `src/lib/types.ts`, `src/core/domain/schedule/anamnesis.ts` (+ teste), `src/components/landing/funnel-form.tsx`, `src/components/admin/anamnese-modal.tsx`, `src/components/admin/student-profile.tsx`, `src/app/admin/ia/page.tsx`, `src/app/admin/ia/[id]/analysis-view.tsx`, `src/app/admin/ia/actions.ts`.

## Fora de escopo
- Uso dos dias pelo rascunho da IA (F2.18).
- Os outros campos do funil hoje descartados.
- Troca de componentes (Fase 3).

## Critérios de aceite
- [ ] Funil: sem nenhum dia marcado, o passo "Estilo de Vida" não avança e mostra a mensagem; envio direto ao servidor sem dias é recusado e nenhuma conta é criada (cenário 6.1, CS-007).
- [ ] Funil com segunda, quarta e sexta: a anamnese grava `{1,3,5}` e o perfil mostra "3x" (cenário 6.2).
- [ ] Modal salvo sem dias é aceito; anamnese legada mostra o número legado enquanto não houver dias (cenários 6.3, 6.11).
- [ ] Dias duplicados ou fora de 1..7 enviados diretamente são rejeitados ou normalizados pelo Zod; o CHECK do banco recusa valores fora de 1..7.
- [ ] Teste unitário de `derivedDaysPerWeek` com os três casos.
- [ ] Checkboxes com `label` associado e operáveis por teclado.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: cadastro pelo funil, edição pelo modal e tela da IA

## Notas técnicas
- Operador de contenção de arrays `<@` confirmado na doc do Postgres; a unicidade dentro do array fica a cargo do Zod (confirmar na doc se vale um CHECK adicional).
- Coordenação com a Fase 1: o passo 1 do funil muda lá (data de nascimento); aqui só o passo 3. Se as issues da Fase 1 que tocam `funnel-form.tsx` e os schemas já tiverem id, acrescentar em `depends_on`.
