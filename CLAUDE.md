# Hammer Plataforma

## Codebase Overview

Plataforma de personal training (um treinador, vários alunos) com painel do treinador em `/admin`, app PWA do aluno em `/aluno` e funil de vendas público em `/`. O treinador monta fichas (manual ou rascunho por OpenAI), registra avaliações e anamnese e confirma pagamentos PIX manuais. O aluno executa treinos com timer, registra cargas e acompanha a evolução.

**Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Supabase (Auth, Postgres, Storage, Realtime), Zod 4, OpenAI, web-push, recharts. Deploy na Vercel.

**Estrutura:** quase toda a lógica de servidor está em `src/app/actions.ts` (server actions, cliente service role). Notificações e push já seguem Clean Architecture em `src/core` + `src/infrastructure`. A UI fica em `src/components/{admin,aluno,landing}`. O schema do Supabase **não está versionado** no repositório.

**Comandos:** `npm run dev`, `npm run build`, `npm run lint`, `npm run test` (Vitest, ambiente node, `src/**/*.test.ts`). Não há script de typecheck; o `build` faz o typecheck.

Para arquitetura detalhada, modelo de dados inferido, fluxos e gotchas, ver `docs/CODEBASE_MAP.md`. O mapa é só local: está no `.gitignore` e não existe num clone do repositório.

## Pontos de atenção antes de mexer

- Todo export de um arquivo `"use server"` (como `src/app/actions.ts`) é um endpoint do servidor: autorizar dentro de cada action (`requireAuth`/`getAuthUser`) e escopar toda leitura e escrita pelo dono do recurso. O cliente admin do Supabase não aplica RLS, então a checagem de posse é da action ou do use case.
- Regras de acesso (plano ativo, troca de senha no primeiro login) valem no servidor; os guards de UI (`PaywallGuard`, `FirstLoginGuard`) são só experiência.
- `updateWorkoutWithExercises` apaga e recria os exercícios da ficha, o que quebra o histórico de cargas por `exercise_id`.
- O README está desatualizado em tabelas e variáveis de ambiente; o mapa local lista as divergências.
