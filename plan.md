# Plano Técnico: Reset de Senha por Notificação

## 1. Arquitetura e Decisões
- **Frontend (Login)**: 
  - Adicionar um estado visual no componente `src/app/login/page.tsx` para alternar entre "Formulário de Login" e "Formulário de Esqueci a Senha".
  - O form de Esqueci a Senha pedirá apenas o E-mail e usará uma Server Action assíncrona.
- **Backend (Server Actions)**: 
  - Criar a action `requestPasswordReset(email: string)` em `src/app/auth/actions.ts`.
  - Esta action fará uso do Supabase Admin Client (`supabase.auth.admin.listUsers` ou buscar o id via lookup) para encontrar o ID do Auth User associado ao e-mail informado.
  - Com o ID em mãos, busca os dados básicos do usuário (nome) na tabela `users`.
  - Busca o `id` do Treinador (usuário com `role = 'admin'`).
  - Insere uma nova linha na tabela `notifications` usando a função existente `insertNotification`.
- **Segurança (Blast Radius)**:
  - Risco Baixo. Nenhuma operação destrutiva será feita. Trata-se apenas de inserção de notificação e manipulação de estado na UI.
  - Para evitar vazamento de dados, a action deve retornar `success: true` para o Frontend independentemente de ter encontrado o e-mail no banco de dados.

## 2. Mudanças de Código Esperadas

### [FRONTEND]
- Modificar `src/app/login/page.tsx` para incluir o toggle de "Esqueci a Senha".
- Criar a marcação (HTML/Tailwind) para a entrada do E-mail e botão de envio, mantendo a identidade visual premium.

### [BACKEND]
- Modificar `src/app/auth/actions.ts` para adicionar e exportar a função `requestPasswordReset(email: string)`.
- A função instanciará o `adminClient`, buscará os usuários para ver se há match de e-mail usando `admin.auth.admin.listUsers()`, pegará os dados da tabela `users` do aluno e o `id` do admin, e então chamará `admin.from('notifications').insert(...)`.

## 3. Revisão de Riscos (Obrigatório)
- **High / Medium / Low**: LOW
- **Mitigação**: O endpoint não altera estado sensível de dados (apenas insere log de notificação). A resposta visual é padronizada para evitar Account Enumeration.

> **ALERTA PARA O EXECUTOR:**
> Não realizar commits diretos sem que o usuário visualize a alteração e valide o fluxo de UI na tela de login.
