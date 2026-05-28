# Hammer Plataforma - Progresso

## O que e o projeto

Plataforma fitness fullstack para o personal trainer Felipe Hammer. Next.js 16 + Supabase + Tailwind. Deploy na Vercel.

- Repo: https://github.com/mauricioreiss/hammerplataform.git
- Branch: master
- Vercel: projeto conectado via GitHub import

## Stack

- Next.js 16 (App Router, Turbopack)
- Supabase (Auth SSR, PostgreSQL, Storage)
- Tailwind CSS
- TypeScript
- Lucide React (icones)
- OpenAI GPT-4o (IA Maker)

## O que ja foi feito

### 1. Estrutura base

- Landing page responsiva (/)
- Login com Supabase Auth (/login)
- Middleware RBAC (admin vs aluno)
- Seed de admin (faugusto49@gmail.com / Vilamatao2)
- Tres clientes Supabase: browser (anon), server (anon+cookies), admin (service_role)

### 2. Area Admin (/admin)

- Dashboard com KPIs (MRR, ativos, novos)
- Lista de alunos com perfil detalhado (/admin/alunos)
- Avaliacoes fisicas com comparativo antes/depois
- Biblioteca de exercicios com ilustracoes (/admin/exercicios)
- IA Maker - analise de anamnese com GPT-4o (/admin/ia)

### 3. Area Aluno (/aluno)

- Dashboard com treino do dia
- Sessao de treino interativa com progresso (/aluno/treino)
- Evolucao fisica com metricas (/aluno/evolucao)
- Assinatura com pagamento PIX (/aluno/assinatura)

### 4. Sistema de ilustracoes

- Coluna `illustration_url` na tabela exercises (SQL manual necessario)
- Bucket Supabase Storage: `exercicios-illustracoes` (publico)
- Upload/delete via admin UI
- 50 imagens baixadas do Free Exercise DB (25 exercicios x 2 posicoes)
- Scripts: `scripts/download-exercises.ts`, `scripts/upload_exercises.ts`, `scripts/migrate-illustration.ts`

### 5. Layout responsivo (ultimo commit: 53ffa91)

- Removido frame max-w-[400px] que simulava celular
- Admin desktop: sidebar lateral (w-64) + conteudo expandido
- Admin mobile: bottom nav (escondido no desktop via md:hidden)
- Aluno desktop: centralizado com max-w-4xl
- Aluno mobile: visual de app mantido
- Padding desktop (md:p-6) em todas as paginas
- Grid de exercicios: 2 colunas mobile, 3 tablet, 4 desktop
- Bottom navs: absolute -> sticky

## Variaveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PIX_KEY=
OPENAI_API_KEY=          # precisa adicionar na Vercel
```

Todas configuradas na Vercel exceto OPENAI_API_KEY.

## Pendencias / Ajustes futuros

### Banco de dados

- [ ] Rodar SQL manual no Supabase Dashboard: `ALTER TABLE exercises ADD COLUMN IF NOT EXISTS illustration_url TEXT;`

### Vercel / Deploy

- [ ] Adicionar OPENAI_API_KEY nas env vars da Vercel (para IA Maker funcionar em prod)
- [ ] Verificar se deploy automatico via GitHub esta funcionando

### Melhorias possiveis

- [ ] Testar layout responsivo no desktop e ajustar se necessario
- [ ] KPI card do admin: considerar grid 3 colunas no desktop (md:grid-cols-3)
- [ ] Aluno bottom nav: avaliar se precisa de md:hidden tambem (depende do design desejado)
- [ ] Dados reais: substituir mock-data por queries Supabase nas paginas do aluno
- [ ] CRUD de treinos pelo admin
- [ ] Notificacoes reais
- [ ] Upload de fotos de avaliacao pelo admin

## Estrutura de arquivos principais

```
src/
  app/
    admin/
      layout.tsx          -- Layout com sidebar + bottom nav
      page.tsx             -- Dashboard admin
      alunos/
        page.tsx           -- Lista de alunos
        [id]/page.tsx      -- Perfil do aluno
      exercicios/
        page.tsx           -- Biblioteca de exercicios
        actions.ts         -- Server actions (CRUD exercicios)
        [id]/
          page.tsx
          exercise-editor.tsx
      ia/
        page.tsx           -- Lista de anamneses
        actions.ts         -- Server actions (analise IA)
        [id]/
          page.tsx
          analysis-view.tsx
    aluno/
      layout.tsx           -- Layout centralizado max-w-4xl
      page.tsx             -- Dashboard aluno
      treino/page.tsx
      evolucao/page.tsx
      assinatura/page.tsx
    auth/
      actions.ts           -- Login/logout server actions
    login/page.tsx
  components/
    admin/
      admin-header.tsx
      admin-bottom-nav.tsx
      admin-sidebar.tsx    -- NOVO (sidebar desktop)
      student-profile.tsx
      kpi-card.tsx
      ...
    aluno/
      aluno-header.tsx
      aluno-bottom-nav.tsx
      workout-session.tsx
      payment-manager.tsx
      exercise-item.tsx
      ...
    landing/...
  lib/
    supabase/
      client.ts            -- Browser client
      server.ts            -- Server client (cookies)
      admin.ts             -- Admin client (service_role)
    mock-data.ts
  middleware.ts             -- RBAC routing
scripts/
  download-exercises.ts
  upload_exercises.ts
  migrate-illustration.ts
```

## Commits recentes

```
53ffa91 feat: add responsive layout with admin sidebar and wider content areas
1d7f9fb chore: clean up duplicate entries in .gitignore
78e47d6 fix: use admin client for users table queries to bypass RLS
c461fad feat: add exercise illustration system with Supabase Storage
1d8a6f1 feat: implement auth system and IA Maker for anamnesis analysis
213713a fix: make landing page responsive for desktop viewports
```
