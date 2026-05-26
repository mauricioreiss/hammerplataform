# Hammer Plataforma

Plataforma fullstack para personal trainers gerenciarem alunos, treinos e avaliações fisicas. O aluno acompanha seu treino, evolução corporal e assinatura direto pelo app. Novos leads entram por um funil de vendas com anamnese integrada.

## O que faz

**Painel do Treinador (admin)**
- Dashboard com KPIs: MRR, alunos ativos, novos do dia
- Fila de alunos aguardando treino
- Lista e busca de alunos
- Perfil do aluno com treinos e avaliações
- Comparativo de evolução com fotos antes/depois e metricas
- Compartilhamento via WhatsApp

**App do Aluno**
- Treino do dia com exercicios, series, reps, descanso e video
- Controle de execução com progresso visual
- Tela de evolução corporal com comparativos
- Gestão de assinatura com pagamento via PIX

**Funil de Vendas (landing page)**
- Hero com CTA
- Prova social com resultados
- Formulário de anamnese em 4 etapas (dados pessoais, PAR-Q, estilo de vida, detalhes finais)
- Loading animado simulando processamento por IA
- Paywall com QR Code PIX

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS v4 |
| Componentes | Shadcn/UI (base-nova) |
| Icones | Lucide React |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (SSR com cookies) |
| Validação | Zod |
| Deploy | Vercel |

## Estrutura

```
src/
├── app/
│   ├── (landing)/       # Funil de vendas (pagina publica)
│   ├── admin/           # Painel do treinador
│   │   └── alunos/[id]/ # Perfil individual do aluno
│   ├── aluno/           # App do aluno
│   │   ├── treino/
│   │   ├── evolucao/
│   │   └── assinatura/
│   └── actions.ts       # Server actions (queries e mutations)
├── components/
│   ├── admin/           # Componentes do painel admin
│   ├── aluno/           # Componentes do app do aluno
│   ├── landing/         # Componentes do funil de vendas
│   └── ui/              # Componentes base (shadcn)
├── lib/
│   ├── supabase/        # Clients: browser, server, admin
│   ├── mock-data.ts     # Dados mock (sera substituido pelo banco)
│   └── utils.ts
└── middleware.ts         # Auth + RBAC por rota
```

## Segurança

- Middleware com controle de acesso por role (admin/student)
- Server actions com verificação de autenticação e permissão
- Validação de input com Zod em todas as mutations
- Validação de UUID em parametros de rota
- Security headers: HSTS, X-Frame-Options, CSP, Referrer-Policy
- Select explicito de colunas (sem SELECT *)
- Service role key restrita ao servidor
- `.env.local` no `.gitignore`

## Setup local

```bash
# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.local.example .env.local
# Preencher com suas chaves do Supabase

# Rodar em desenvolvimento
npm run dev
```

## Variaveis de ambiente

| Variavel | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publica (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin (server-only) |
| `NEXT_PUBLIC_PIX_KEY` | Chave PIX para pagamentos |

## Tabelas no Supabase

| Tabela | Uso |
|---|---|
| `users` | Treinadores e alunos (com campo `role`) |
| `workouts` | Treinos atribuidos aos alunos |
| `exercises` | Exercicios de cada treino |
| `anamnesis` | Dados do formulário de anamnese |
| `assessments` | Avaliações fisicas com fotos e medidas |
