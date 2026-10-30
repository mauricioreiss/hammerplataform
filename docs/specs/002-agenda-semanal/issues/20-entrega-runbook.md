---
id: F2.20
title: "F2.20 - Entrega: backup, migrations em produção, migração de dados, deploy, verificação e reversão"
labels: [fase-2, infra, banco]
depends_on: [F2.11, F2.12, F2.13, F2.14, F2.15, F2.16, F2.17, F2.18, F2.19]
---
## Contexto
A entrega acontece logo após 00:00 de uma segunda-feira em Brasília, para que a primeira semana com agenda comece limpa (premissa da spec). Spec: docs/specs/002-agenda-semanal/spec.md, RF-018, RF-048; CS-001 a CS-008. Runbook completo em plan.md, "Migração de dados e runbook de entrega". Vault: Banco-em-Producao (migração antes do código, rollback de código, backup com restore testado).

## Objetivo
Executar a entrega com checklist auditável: backup lógico com restore testado, `db push` em produção, migração de dados, verificação por contagens, deploy na Vercel, smoke test e plano de reversão. Só o Mauri executa.

## Escopo
- Preparação (sexta anterior, Mauri): PR final revisado e com preview na Vercel; `supabase migration list --linked` em produção mostrando só o baseline; ensaio completo no dev (F2.19) refeito sobre a branch final; restore do dump do dev testado em projeto descartável ou local; aviso ao professor sobre a janela.
- Entrega (segunda, 00:05 a 01:00 em Brasília, Mauri):
  1. Backup: `supabase db dump --linked -f backup/<data>-schema.sql` e `supabase db dump --linked --data-only --use-copy -f backup/<data>-data.sql`; contagens de `workouts`, `workout_sessions`, `exercise_logs` anotadas.
  2. `supabase db push --linked --dry-run`; revisar; `supabase db push --linked`.
  3. `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx tools/migrate-schedules.ts --env prod --dry-run`; revisar; sem `--dry-run`; guardar a saída.
  4. Verificação SQL: contagens iguais às do passo 1; `schedule_days` com um aluno por aluno com ficha publicada; nenhum `workout_title`/`exercise_name` nulo quando a origem existe.
  5. Deploy: merge na `master` (push só com ok explícito do Mauri); confirmar o deployment na Vercel.
  6. Smoke: aluno de teste em produção (ou o professor) vê a ficha de segunda na home, sete dias na aba Treinos, aba Agenda no perfil; professor troca um dia e o aluno vê ao recarregar.
  7. Monitorar até o meio-dia: logs da Vercel das actions novas; primeira sessão real aparece em "Últimos Treinos".
- Reversão: redeploy do deployment anterior na Vercel (código antigo é compatível com o schema novo); `schedule_days` fica inerte; nunca reverter migration em produção; restore do dump só em último caso.
- Registro: `docs/runbooks/entrega-fase-2.md` com o checklist preenchido (horários, contagens, saída do script sem ids de projeto) e `docs/runbooks/restore-log.md` com o teste de restore.
- Arquivos prováveis: `docs/runbooks/entrega-fase-2.md`, `docs/runbooks/restore-log.md`, `.gitignore` (`backup/`).

## Fora de escopo
- Qualquer código novo; esta issue é operacional.
- Mudanças de visual (Fase 3).

## Critérios de aceite
- [ ] Backup gerado antes do `db push`, com restore testado em ambiente descartável e registrado.
- [ ] `supabase migration list --linked` em produção mostra baseline + migrations da fase, iguais às do dev.
- [ ] Contagens de `workout_sessions` e `exercise_logs` idênticas antes e depois (CS-004).
- [ ] Todo aluno com ao menos uma ficha publicada tem ao menos um dia com ficha; nenhum aluno com oito ou mais fichas perdeu acesso (CS-003).
- [ ] Nenhuma agenda existente foi alterada (RF-048) e nenhuma sessão anterior foi perdida (RF-018).
- [ ] Smoke test aprovado pelo professor na segunda-feira; o caso relatado (quarta não feita mostrando na quinta) não se reproduz (CS-002).
- [ ] Runbook preenchido e versionado sem segredos, refs de projeto ou dados pessoais.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: ensaio completo do runbook (passos 1 a 6) na sexta anterior, com os tempos anotados

## Notas técnicas
- Comandos da CLI confirmados no Context7 (2026-10-17): `db dump --linked --data-only --use-copy -f`, `db push --linked --dry-run`, `migration list --linked`.
- A ordem "migração antes do código" vale porque as migrations são compatíveis com o código antigo (colunas novas nullable ou com default; FKs só mudam a ação de delete).
- Se o `db push` falhar no meio, a CLI aplica cada arquivo em transação; corrigir e repetir; não editar migration já aplicada.
