---
id: F2.02
title: "F2.02 - Projeto Supabase de desenvolvimento com baseline, seed e .env.development.local"
labels: [fase-2, infra, banco]
depends_on: [F2.01]
---
## Contexto
Hoje só existe o projeto de produção. As migrations, a migração de dados (RF-045 a RF-048) e o QA das histórias precisam de um projeto separado, sem dado real. Spec: docs/specs/002-agenda-semanal/spec.md (História 3, "Teste independente"; premissa de entrega). Vault: Ambientes-e-Configuracao ("Staging sem dado real").

## Objetivo
Um projeto Supabase de desenvolvimento com o baseline aplicado, usuários de teste sintéticos e um `.env.development.local` fora do git, usado por `npm run dev` e pelo script de migração em modo dev.

## Escopo
- Checklist para o Mauri (só ele tem acesso):
  1. Criar o projeto de desenvolvimento no painel do Supabase (região e plano a critério dele).
  2. `supabase link --project-ref <ref do dev>` e `supabase db push --linked` para aplicar o baseline. Conferir com `supabase migration list --linked`.
  3. Preencher `.env.development.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` do dev, mais `OPENAI_API_KEY` (pode ser a mesma), `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
  4. Rodar o seed (abaixo) e conferir o login do professor e de um aluno de teste em `npm run dev`.
  5. Documentar em `supabase/README.md` como alternar o `link` entre dev e prod (o ref fica fora do repositório).
- Infra (agente): `supabase/seed.sql` com dados sintéticos: um professor, três alunos (um com três fichas publicadas, um com nove fichas publicadas e dois rascunhos, um sem ficha), biblioteca mínima de exercícios, um plano. Nomes e e-mails fictícios (`aluno-um@exemplo.test`). Usuários de Auth criados por um script TypeScript `tools/seed-dev-users.ts` via `auth.admin.createUser` (o `seed.sql` não consegue criar usuários de Auth com senha de forma suportada), lendo as chaves do ambiente do shell.
- Infra: `.env.example` versionado com todas as chaves e valores vazios (hoje não existe; o README cita um arquivo que não está no repositório).
- Arquivos prováveis: `supabase/seed.sql`, `tools/seed-dev-users.ts`, `.env.example`, `supabase/README.md`.

## Fora de escopo
- Migrations novas (F2.03, F2.04, F2.17).
- Cópia ou anonimização de dados de produção; o seed é 100% sintético.
- Storage buckets e ilustrações.

## Critérios de aceite
- [ ] `supabase migration list --linked` no dev mostra o baseline aplicado.
- [ ] `npm run dev` com `.env.development.local` do dev permite login do professor e de um aluno de teste.
- [ ] O seed cria os três perfis de aluno descritos e pode ser rodado de novo sem duplicar (upsert por e-mail).
- [ ] `.env.example` lista as oito variáveis sem valor; `git status` não mostra nenhum `.env*`.
- [ ] Nenhum dado pessoal real no seed.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: login do professor, abrir o perfil dos três alunos de teste

## Notas técnicas
- Next carrega `.env.development.local` em `next dev` e `.env.production.local` em `next build`/`next start` (confirmar na doc do Next 16 a ordem de precedência antes de depender disso).
- `supabase db push --include-seed` aplica `supabase/seed.sql` quando configurado em `config.toml`; alternativa é rodar o arquivo no SQL Editor. Confirmar na doc da CLI qual das duas formas usar com o projeto linkado.
- Se o `tools/seed-dev-users.ts` exigir `tsx`, a devDependency é a mesma pedida em F2.19; pedir o ok do Mauri uma vez só.
