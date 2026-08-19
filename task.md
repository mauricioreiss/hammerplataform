# Escopo Ativo (Tarefas)

## [BACKEND]
- `[x]` Em `src/app/actions.ts`: Na função `finishWorkoutSession`, após a inserção bem-sucedida do treino em `workout_sessions` e `exercise_logs`, adicionar bloco `try-catch` para notificação.
- `[x]` Buscar o nome completo do aluno (`full_name`) na tabela `users` baseado no `user.id`.
- `[x]` Buscar o título do treino (`title`) na tabela `workouts` baseado no `workoutId`.
- `[x]` Buscar o ID do admin (usuário com `role = 'admin'`).
- `[x]` Inserir na tabela `notifications` direcionado ao admin com a mensagem "O aluno [Nome do Aluno] acabou de finalizar o treino: [Título do Treino]". Falhas nesta etapa devem fazer log apenas no console e não afetar a finalização do treino.
