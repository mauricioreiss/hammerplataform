# Escopo Ativo (Tarefas)

## [BACKEND]
- `[x]` Em `src/app/auth/actions.ts`: Criar a função `requestPasswordReset(email: string)`.
- `[x]` Na função, utilizar `createAdminClient` para buscar via `admin.auth.admin.listUsers()` o usuário pelo e-mail passado.
- `[x]` Se o usuário existir, buscar na tabela `users` o nome completo dele. Em seguida, buscar o `id` do usuário que tem `role = 'admin'`.
- `[x]` Chamar o insert na tabela `notifications` destinando ao admin a mensagem "O aluno [Nome] (email) solicitou redefinição de senha". Retornar `{ success: true }` independentemente se o usuário foi encontrado ou não para evitar user enumeration.

## [FRONTEND]
- `[x]` Em `src/app/login/page.tsx`: Criar estado `isForgotPassword` (boolean, default false).
- `[x]` Na UI, se `isForgotPassword` for true, esconder campos de senha e mostrar apenas e-mail. Alterar título de "Entrar" para "Recuperar Senha".
- `[x]` O botão "Entrar" se torna "Solicitar Nova Senha". Alterar o handler `handleSubmit` para verificar qual o estado atual. Se for esqueci senha, chamar a nova action `requestPasswordReset`.
- `[x]` Exibir mensagem de sucesso após o envio ("Sua solicitação foi enviada. Seu treinador enviará a nova senha via WhatsApp.") e permitir o retorno para o formulário de login padrão. Adicionar botão "Voltar para Login" ou "Lembrei minha senha".
