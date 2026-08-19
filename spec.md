# Especificação (Spec) - Notificação de Treino Finalizado

## Problema
Atualmente, quando um aluno finaliza um treino (workout session), o professor (admin) não é ativamente notificado sobre o progresso no painel de notificações.

## Cenário de Uso
1. O aluno acessa a plataforma, abre a ficha de treino e executa os exercícios.
2. Ao terminar, clica em "Finalizar Treino".
3. Imediatamente, uma notificação é gerada no banco de dados e enviada para o painel do administrador avisando que o treino X foi concluído.

## Critérios de Aceitação
- Sempre que a ação `finishWorkoutSession` for concluída com sucesso, o sistema deve registrar um alerta na tabela `notifications` direcionado ao `admin`.
- A mensagem deve conter o nome do aluno e o título do treino finalizado.
- O fluxo de salvamento do treino (sessão e histórico) não pode falhar ou ser bloqueado caso a notificação sofra alguma falha (Fire and Forget).
