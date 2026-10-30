---
id: F2.04
title: "F2.04 - Migration de workout_sessions e exercise_logs: dia ligado, status, snapshots, FKs e função finish_workout_session"
labels: [fase-2, banco]
depends_on: [F2.01]
---
## Contexto
A sessão de treino passa a ser criada no início, ligada a um dia da agenda e com o título da ficha preservado, e excluir uma ficha não pode mais apagar sessões nem cargas. Spec: docs/specs/002-agenda-semanal/spec.md, RF-008, RF-014, RF-016, RF-018, RF-021, RF-023. Modelo em plan.md, "Modelo de dados" e decisões D2, D3, D4, D6.

## Objetivo
Migration versionada que adiciona `scheduled_date`, `status` e `workout_title` em `workout_sessions`, `exercise_name` em `exercise_logs`, troca as FKs para `on delete set null`, cria o índice único parcial de uma sessão por dia e a função `finish_workout_session`, mantendo todas as sessões e cargas existentes.

## Escopo
- Banco: `supabase migration new sessions_linked_to_schedule_day` com, nesta ordem:
  - `workout_sessions`: `add column scheduled_date date`, `add column status text not null default 'completed' check (...)`, `add column workout_title text`; `drop not null` em `completed_at`, `total_duration` e `workout_id` conforme o baseline; CHECK `(status = 'completed') = (completed_at is not null)`; backfill `workout_title` a partir de `workouts`; FK `workout_id` recriada com `on delete set null` (nome da constraint vem do baseline); índice único parcial `workout_sessions_one_per_day_idx (user_id, scheduled_date) where scheduled_date is not null and status <> 'discarded'`; índice `workout_sessions_user_started_idx (user_id, started_at desc)`.
  - `exercise_logs`: `add column exercise_name text`; backfill a partir de `exercises`; `drop not null` e FKs `exercise_id` e `workout_id` recriadas com `on delete set null`.
  - função `finish_workout_session(p_session_id uuid, p_user_id uuid, p_logs jsonb, p_detach_day boolean default false)` conforme o SQL ilustrativo do plano: `select ... for update`, no-op quando já `completed`, erro quando `discarded` ou não encontrada, insere logs só de exercícios da ficha da sessão, marca `completed`, calcula `total_duration` pelo relógio do banco, zera `scheduled_date` quando `p_detach_day`; `revoke execute` de `anon` e `authenticated`.
- Banco: aplicar no projeto de desenvolvimento e verificar os critérios abaixo no SQL Editor.
- Arquivos prováveis: `supabase/migrations/<timestamp>_sessions_linked_to_schedule_day.sql`, `supabase/README.md`.

## Fora de escopo
- `schedule_days` (F2.03) e `anamnesis` (F2.17).
- Alterar policies de RLS existentes em `workout_sessions` ou `exercise_logs` (o `RealtimeProfileListener` depende delas).
- Código TypeScript que chama a função (F2.09, F2.11).

## Critérios de aceite
- [ ] `count(*)` de `workout_sessions` e `exercise_logs` é idêntico antes e depois da migration no dev; nenhuma linha fica com `workout_title` ou `exercise_name` nulos quando a ficha/exercício existe.
- [ ] Excluir uma ficha com sessões e cargas no dev mantém as linhas de `workout_sessions` e `exercise_logs`, com `workout_id`/`exercise_id` nulos e os snapshots preenchidos.
- [ ] Segundo INSERT `in_progress` para o mesmo `(user_id, scheduled_date)` falha com 23505; INSERT com `scheduled_date` nulo repetido é aceito; após `status = 'discarded'` o dia aceita nova sessão.
- [ ] `finish_workout_session` duas vezes seguidas na mesma sessão devolve o mesmo resultado e não duplica `exercise_logs`.
- [ ] `finish_workout_session` com `p_user_id` de outro aluno falha; com `exercise_id` de outra ficha o log é ignorado.
- [ ] Chamada à função pela API REST com a chave anon é recusada.
- [ ] O código atual (antes de F2.11) continua inserindo sessões sem erro: `status` cai no default `completed`.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: os cenários de aceite no SQL Editor, output no PR

## Notas técnicas
- Confirmar no baseline (F2.01): nomes das FKs, NOT NULLs atuais e se `exercise_logs` hoje cascateia na exclusão de exercícios (explicaria cargas perdidas na edição de fichas, gotcha 15 do mapa).
- `on delete set null` e índice único parcial confirmados na doc do Postgres 17 (Context7, 2026-10-17).
- `total_duration` passa a ser calculada pelo banco (`now() - started_at`); a duração mostrada no app continua local até a Fase 3.
- Compatibilidade com o código antigo é requisito do runbook: nada aqui remove ou renomeia coluna.
