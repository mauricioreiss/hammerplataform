---
id: F2.19
title: "F2.19 - Script de migração de dados das fichas para a agenda e ensaio no projeto de desenvolvimento"
labels: [fase-2, banco, backend]
depends_on: [F2.02, F2.03, F2.08, F2.09]
---
## Contexto
Na entrega, cada aluno recebe a agenda montada a partir das fichas publicadas, em ordem natural, sem tocar em agendas existentes nem em sessões. Spec: docs/specs/002-agenda-semanal/spec.md, RF-018, RF-045 a RF-048; cenários 3.1 a 3.10; CS-003, CS-004. Decisão D8 e seção "Migração de dados e runbook" do plan.md.

## Objetivo
`tools/migrate-schedules.ts`, versionado, idempotente, com `--dry-run` e `--env dev|prod`, que reusa `distributeWorkoutsForMigration` e grava via `set_schedule_days`; ensaiado no projeto de desenvolvimento com os alunos de teste e o resultado registrado.

## Escopo
- Backend: script que lê `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` do ambiente do shell (recusa rodar sem os dois; nunca lê arquivo); lista `users` com `role = 'student'`; para cada um, pula se já houver linha em `schedule_days` (RF-048); carrega `workouts` (`id, user_id, title, status, created_at`), aplica o domínio e, fora do `--dry-run`, chama `rpc('set_schedule_days')`; imprime por aluno `id`, fichas publicadas, dias preenchidos e avulsas, mais totais; sem nomes de alunos na saída.
- Backend: `package.json` com script `migrate:schedules` e devDependency `tsx` (requer ok do Mauri; alternativa SQL com collation ICU documentada em D8).
- Banco: ensaio no dev com os três alunos do seed (3 fichas; 9 fichas + 2 rascunhos; nenhuma ficha) mais um aluno com agenda já montada: rodar `--dry-run`, rodar de verdade, rodar de novo; conferir `schedule_days`, contagens de `workout_sessions` e `exercise_logs` antes e depois.
- Documentação: `supabase/README.md` com a seção "Migração de dados da Fase 2" (como rodar, saída esperada, idempotência).
- Arquivos prováveis: `tools/migrate-schedules.ts`, `package.json`, `supabase/README.md`.

## Fora de escopo
- Execução em produção (F2.20).
- Mexer em sessões, cargas ou fichas (o script só escreve em `schedule_days`).

## Critérios de aceite
- [ ] Cenários 3.1 a 3.4 e 3.7 a 3.10 reproduzidos no dev com o seed: A/B/C em seg/ter/qua; nove fichas em sete dias com duas avulsas; rascunhos fora; aluno sem ficha sem dias; ordenação natural e desempate por criação; `approved` como publicada; aluno com agenda prévia intocado.
- [ ] Rodar o script duas vezes produz o mesmo estado (idempotência).
- [ ] `count(*)` de `workout_sessions` e `exercise_logs` idênticos antes e depois (cenário 3.5, CS-004).
- [ ] `--dry-run` não escreve nada (conferido por contagem em `schedule_days`).
- [ ] O script falha com mensagem clara sem as variáveis de ambiente e não imprime chaves nem nomes.
- [ ] Após a migração, o professor consegue trocar qualquer dia pela aba Agenda (cenário 3.6).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: saída do script nas três execuções e as consultas de contagem coladas no PR (sem ids de projeto)

## Notas técnicas
- Complexidade O(alunos + fichas) com duas consultas por aluno; adequado ao volume atual. Se passar de algumas centenas de alunos, trocar por duas consultas totais agrupadas em memória.
- O script usa o supabase-js com a chave service role; não passa por RLS; a posse não se aplica (processo administrativo).
- `tsx` lê TypeScript com `paths` do `tsconfig` (`@/core/...`); confirmar na doc do `tsx` o suporte a `paths` ou usar imports relativos no script.
