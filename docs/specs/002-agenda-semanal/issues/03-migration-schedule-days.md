---
id: F2.03
title: "F2.03 - Migration da tabela schedule_days com RLS e função set_schedule_days"
labels: [fase-2, banco]
depends_on: [F2.01]
---
## Contexto
A agenda semanal precisa de uma tabela por aluno e dia da semana, apontando para uma ficha ou um descanso com texto de até 500 caracteres. Spec: docs/specs/002-agenda-semanal/spec.md, RF-001, RF-002, RF-034, RF-036, RF-037, RF-038. Modelo em plan.md, "Modelo de dados".

## Objetivo
Migration versionada que cria `public.schedule_days`, suas constraints e índices, habilita RLS sem policies e cria a função `set_schedule_days(uuid, jsonb)` que substitui os dias de um aluno em uma transação.

## Escopo
- Banco: `supabase migration new create_schedule_days` com:
  - `alter table workouts add constraint workouts_id_user_id_key unique (id, user_id)`;
  - tabela `schedule_days (user_id, weekday smallint 1..7, kind in ('workout','rest'), workout_id uuid, rest_note text <= 500, updated_at)`, PK `(user_id, weekday)`;
  - FK `user_id -> users(id) on delete cascade`;
  - FK composta `(workout_id, user_id) -> workouts(id, user_id) on delete cascade` (dia vira livre ao excluir a ficha; ficha sempre do mesmo aluno);
  - CHECK `schedule_days_kind_shape` (workout exige `workout_id` e `rest_note` nulo; rest exige `workout_id` nulo);
  - índice `schedule_days_workout_id_idx (workout_id)`;
  - `enable row level security` + `revoke all ... from anon, authenticated`;
  - função `set_schedule_days(p_user_id uuid, p_days jsonb) returns void` (delete + insert via `jsonb_to_recordset`) e `revoke execute ... from anon, authenticated`.
- Banco: aplicar no projeto de desenvolvimento (`supabase db push --linked` com o link no dev) e conferir com `\d` ou pelo painel.
- Arquivos prováveis: `supabase/migrations/<timestamp>_create_schedule_days.sql`, `supabase/README.md` (seção da tabela).

## Fora de escopo
- Alterações em `workout_sessions`, `exercise_logs` (F2.04) e `anamnesis` (F2.17).
- Código TypeScript (F2.09 em diante).
- Policies para anon ou authenticated: a tabela é acessada só pelo service role.

## Critérios de aceite
- [ ] Migration aplica limpa no projeto de desenvolvimento a partir do baseline e `supabase db push --linked --dry-run` fica vazio depois.
- [ ] Inserir `kind = 'workout'` sem `workout_id`, `kind = 'rest'` com `workout_id`, `weekday = 8` e `rest_note` com 501 caracteres são recusados pelo banco; `rest_note` com 500 é aceito.
- [ ] Inserir `workout_id` de uma ficha de outro aluno é recusado pela FK composta.
- [ ] Excluir uma ficha apaga as linhas de `schedule_days` que apontavam para ela e nada mais.
- [ ] Uma chamada à API REST do projeto de desenvolvimento com a chave anon em `schedule_days` (leitura e escrita) é recusada.
- [ ] `set_schedule_days` com sete dias (três fichas, dois descansos, dois livres) deixa cinco linhas; chamar de novo com lista vazia deixa zero.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: os INSERTs de aceite no SQL Editor, com o output colado no PR

## Notas técnicas
- Dia livre é ausência de linha (decisão D1 do plano); o domínio materializa os sete dias.
- Constraint `unique (id, user_id)` em `workouts` é redundante com a PK para unicidade, mas é o que permite a FK composta; custo de um índice a mais em tabela pequena.
- Padrão do vault Supabase-RLS-API-Publica: toda migration que cria tabela repete `enable row level security` e `revoke`.
- Timeouts de migração (vault Banco-em-Producao): a CLI aplica cada arquivo em transação; as operações aqui são de metadado, sem reescrita de tabela.
