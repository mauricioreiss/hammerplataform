---
id: F2.01
title: "F2.01 - Versionar o schema atual como baseline em supabase/migrations"
labels: [fase-2, infra, banco]
depends_on: []
---
## Contexto
O schema do Supabase não está versionado (docs/CODEBASE_MAP.md, "Modelo de dados"). Antes de qualquer migration desta fase, o banco de produção vira um baseline em `supabase/migrations/`, gerado pelo Mauri, que tem o acesso. Spec: docs/specs/002-agenda-semanal/spec.md. Base para todos os RFs de modelo (RF-001 a RF-024) e para o runbook (plan.md, "Migração de dados e runbook de entrega").

## Objetivo
Ter `supabase/` no repositório com o baseline do schema atual aplicado e registrado no histórico de migrations do projeto de produção, para que `supabase db push` passe a ser o único caminho de mudança de schema.

## Escopo
- Infra (Mauri, local): `supabase init` na raiz; `supabase link --project-ref <ref do projeto de produção>` (o ref não entra no repositório); `supabase db pull baseline_schema` para gerar `supabase/migrations/<timestamp>_baseline_schema.sql` a partir do schema `public`.
- Infra: aceitar a atualização do histórico remoto que o `db pull` propõe (ou `supabase migration repair <versão> --status applied --linked`), e conferir com `supabase migration list --linked` que local e remoto coincidem.
- Banco: ler o baseline e anotar em `supabase/README.md`: FKs e ações de delete de `workout_sessions.workout_id`, `exercise_logs.exercise_id`, `exercise_logs.workout_id`; colunas NOT NULL de `workout_sessions`; estado de RLS e policies de `workouts`, `workout_sessions`, `anamnesis`, `exercise_logs`; índices existentes. Isso alimenta F2.03 e F2.04.
- Infra: `.gitignore` com `supabase/.temp/` (se o `init` não adicionar) e `backup/`.
- Arquivos prováveis: `supabase/config.toml`, `supabase/migrations/<timestamp>_baseline_schema.sql`, `supabase/README.md`, `.gitignore`.

## Fora de escopo
- Qualquer mudança de schema (F2.03, F2.04, F2.17).
- Policies de Storage e configuração de Auth (não fazem parte do `db pull` do schema `public`; registrar no README o que ficou de fora).
- Criar o projeto de desenvolvimento (F2.02).

## Critérios de aceite
- [ ] `supabase/migrations/` contém um único arquivo, o baseline, e `supabase migration list --linked` mostra a mesma versão em LOCAL e REMOTE.
- [ ] `supabase db push --linked --dry-run` responde que não há migrations pendentes.
- [ ] `supabase/README.md` documenta as FKs, NOT NULLs, RLS e índices das tabelas afetadas pela fase, com a observação de que Storage e Auth não estão no baseline.
- [ ] Nenhum arquivo versionado contém ref de projeto, senha de banco ou chave.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] `supabase migration list --linked` e `supabase db push --linked --dry-run` com o output colado no PR (sem o ref do projeto)

## Notas técnicas
- Comandos confirmados na referência da CLI (Context7, 2026-10-17): `supabase init`, `supabase link --project-ref`, `supabase db pull [migration name]` (padrão `--linked`, `--schema` para filtrar), `supabase migration list`, `supabase migration repair <versão> --status applied|reverted`, `supabase db push --dry-run`.
- O `db pull` pede a senha do banco; usar `-p` só no shell interativo, nunca em script versionado.
- Só o Mauri executa esta issue; os demais agentes dependem do arquivo gerado.
