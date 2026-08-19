# Especificação: Solicitação de Reset de Senha

## 1. O Problema
Atualmente, se um aluno esquecer sua senha, ele não tem como recuperá-la ou avisar o professor de forma automatizada pelo aplicativo. O fluxo atual exige que ele entre em contato com o professor por fora (ex: WhatsApp) para que o professor faça o reset manual pelo painel de admin.

## 2. A Solução
Adicionar um botão/link de "Esqueci minha senha" na tela de Login. Ao preencher o e-mail cadastrado, o sistema irá buscar o usuário e enviar uma notificação interna para o Painel do Treinador. O treinador (admin) será alertado para alterar a senha e entrar em contato com o aluno via WhatsApp.

## 3. Cenários de Uso

### Cenário 1: Aluno solicita reset com sucesso
- O aluno acessa a página de login.
- Clica em "Esqueci minha senha".
- Um modal (ou estado do formulário) aparece pedindo o e-mail.
- O aluno digita seu e-mail e clica em "Solicitar".
- O sistema mostra uma mensagem de sucesso: "Solicitação enviada. Seu treinador entrará em contato via WhatsApp com a nova senha."
- Uma notificação é gerada no painel do administrador.

### Cenário 2: Treinador recebe a notificação
- O treinador loga no seu painel.
- O ícone de sino de notificações tem um aviso não lido.
- O treinador abre a notificação e lê: "O aluno [Nome do Aluno] (email@teste.com) solicitou redefinição de senha."
- O treinador acessa o perfil do aluno, reseta a senha (forçando a troca no próximo login) e avisa o aluno no WhatsApp.

## 4. Critérios de Aceite
- O fluxo de solicitação na página de login não deve exigir que o usuário esteja logado.
- A notificação deve ser endereçada exclusivamente ao usuário com a `role` igual a `admin`.
- O sistema não deve acusar visualmente na UI de login se o e-mail existe ou não na base de dados (segurança para não vazar lista de e-mails de alunos), sempre retornando mensagem de sucesso na tela. Mas a notificação no backend só deve ser gerada se um aluno com aquele e-mail for de fato encontrado.
