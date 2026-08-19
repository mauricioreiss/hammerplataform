# Plano Técnico (Plan) - Notificação de Treino Finalizado

## 1. Arquitetura e Decisões
- **Serviço**: A lógica principal ocorrerá no Server Action `finishWorkoutSession` dentro de `src/app/actions.ts`.
- **Tratamento de Exceções**: A notificação é um processo não vital para o treino (o treino deve ser salvo mesmo que a notificação falhe). A query de notificação deve ser envolvida em um `try-catch` sem estourar erro pro fluxo principal.
- **Consultas (Queries)**:
  - O nome do aluno virá da tabela `users` baseada no `user.id`.
  - O título do treino pode precisar de consulta na tabela `workouts` baseada em `workoutId`.
  - O ID do admin será obtido com a query `role = 'admin'` na tabela `users`.

## 2. Superfície de Ataque e Riscos (Blast Radius)
- **Risco**: LOW (Baixo). Apenas inserimos uma string informativa em `notifications`. 
- **Verificações**: Nenhuma entrada direta de texto livre pelo usuário que seja propensa a Injection ou XSS severo. Os nomes já estão salvos e higienizados no BD.
- **N+1 Queries**: Faremos requisições isoladas, limitadas a 1 resultado `.single()`. Não causará gargalo.

## 3. Implementação
**[BACKEND]**:
- No final da função `finishWorkoutSession` (após a inserção bem-sucedida em `exercise_logs`), disparar a criação da notificação.
- Utilizar `createAdminClient` já instanciado no escopo da função.
- Capturar possíveis erros via `console.error` em vez de retornar o erro pro Client.
