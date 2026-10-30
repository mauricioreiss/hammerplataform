---
id: F2.18
title: "F2.18 - Rascunho da IA pede uma ficha por dia marcado e aponta os dias livres para os rascunhos"
labels: [fase-2, backend]
depends_on: [F2.08, F2.09, F2.17, F1.03]
---
## Contexto
O rascunho gerado pela IA passa a usar os dias marcados na anamnese: pede uma ficha por dia e aponta cada dia marcado que esteja livre para o rascunho correspondente, sem sobrescrever e sem escrever descanso; divergências ficam visíveis ao professor. Spec: docs/specs/002-agenda-semanal/spec.md, RF-041 a RF-044; cenários 6.4 a 6.11. Hoje `createAiWorkoutDraft` usa `days_per_week ?? 3`.

## Objetivo
`createAiWorkoutDraft` usa `requestedDraftCount` para pedir N fichas e, após criar os rascunhos, chama `AssignAiDraftsToScheduleUseCase`, que aplica `assignDraftsToAvailableDays` e grava a agenda; a divergência é anexada ao `ai_notes` dos rascunhos criados.

## Escopo
- Aplicação: `AssignAiDraftsToScheduleUseCase` (`IScheduleRepository`): carrega a agenda, calcula as atribuições, grava via `replace` só quando há mudança, devolve `divergence`.
- Backend: em `createAiWorkoutDraft`, ler `training_days` e `days_per_week` da anamnese mais recente; `daysPerWeek: requestedDraftCount(...)` para o prompt; coletar os ids dos rascunhos criados na ordem devolvida pela IA; chamar o use case; se `divergence`, `update workouts set ai_notes = ai_notes || '\n\n' || divergence where id in (...)`.
- Backend: sem dias marcados (`training_days` nulo), o use case não altera nenhum dia (RF-042).
- Arquivos prováveis: `src/core/application/use-cases/assign-ai-drafts-to-schedule.use-case.ts`, `src/app/actions.ts` (`createAiWorkoutDraft`), `src/lib/openai.ts` (sem mudança de contrato; o prompt já recebe `daysPerWeek`).

## Fora de escopo
- Mudar o prompt ou o modelo da OpenAI.
- Publicação automática dos rascunhos (continuam invisíveis ao aluno, RF-044 e RF-005).
- UI de revisão além do que `ai_notes` já mostra.

## Critérios de aceite
- [ ] Aluno com segunda, quarta e sexta marcadas e agenda vazia: três rascunhos criados, segunda, quarta e sexta apontando para eles na ordem, demais dias livres, nenhum texto de descanso (cenário 6.4); a home do aluno continua "montando sua agenda" até a publicação (6.5) e, após publicar, os dias aparecem e o push de publicação é enviado como hoje (6.6).
- [ ] Cinco dias marcados e três fichas devolvidas: três dias preenchidos, dois livres, `ai_notes` com a divergência (cenário 6.7); três marcados e cinco devolvidas: duas sobram como rascunho fora da agenda, com divergência (6.8).
- [ ] Segunda ocupada e quarta livre: só a quarta muda (6.9); todos ocupados: nenhum dia muda e os rascunhos são criados (6.10).
- [ ] Sem dias marcados: pede o número legado (ou 3) e não aponta dia algum (6.11).
- [ ] O caminho `after()` de `registerFromLanding` também passa pelo use case, com falha logada sem quebrar o cadastro (comportamento atual preservado).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: gerar o rascunho pelo botão do professor para os cenários 6.4, 6.9 e 6.10 (requer `OPENAI_API_KEY` válida; sem ela, cobrir pelo teste unitário do domínio e por um stub local)

## Notas técnicas
- Os inserts de rascunho hoje ignoram erro (`continue`); manter, mas só incluir na distribuição os ids efetivamente criados.
- A divergência é texto técnico, sem emoji, em pt-BR com acento, por exemplo: "Foram pedidas 5 fichas (dias marcados) e a IA devolveu 3; segunda, quarta e sexta receberam os rascunhos; terça e quinta ficaram livres."
