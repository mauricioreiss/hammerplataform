# Hammer

Plataforma de acompanhamento de treino entre um professor e seus alunos: o professor prescreve e acompanha, o aluno executa e registra.

## Linguagem

### Pessoas

**Professor**:
O treinador responsável pelos alunos, que prescreve fichas, avalia e confirma pagamentos.
_Avoid_: admin, treinador, Head Coach, personal

**Aluno**:
A pessoa acompanhada pelo professor, que executa as fichas e paga a assinatura.
_Avoid_: cliente, student, usuário

**Visitante**:
A pessoa na página pública de vendas que ainda não tem conta; vira aluno ao concluir o cadastro.
_Avoid_: lead, prospect, usuário

### Prescrição

**Anamnese**:
O questionário de saúde e hábitos do aluno, preenchido no cadastro ou pelo professor, que inclui o PAR-Q, a data de nascimento e os dias da semana em que o aluno pode treinar.
_Avoid_: ficha de saúde, questionário

**Idade**:
A idade do aluno calculada a partir da data de nascimento registrada na anamnese; nunca é registrada como número.

**Ficha**:
Um conjunto de exercícios prescrito pelo professor para ser executado numa sessão; pode ocupar mais de um dia da agenda semanal.
_Avoid_: treino (quando se refere ao plano), workout, divisão

**Rascunho**:
Uma ficha ainda não publicada pelo professor, invisível ao aluno, incluindo as sugeridas pela IA.
_Avoid_: draft

**Ficha avulsa**:
Uma ficha publicada que não está em nenhum dia da agenda semanal; o aluno pode executá-la sem que conte para dia algum.
_Avoid_: ficha extra, ficha solta

**Agenda semanal**:
A atribuição, para cada dia da semana de um aluno, de uma ficha, de um dia de descanso ou de nada; um dia que aponta para um rascunho aparece livre para o aluno.
_Avoid_: rotina, cronograma, rodízio

**Dia de descanso**:
Um dia da agenda semanal sem ficha, com recomendações em texto livre escritas pelo professor para aquele aluno.
_Avoid_: folga, off

**Dia livre**:
Um dia da agenda semanal sem ficha publicada e sem descanso.
_Avoid_: dia vazio, sem treino

### Execução

**Semana**:
O período de segunda a domingo no horário de Brasília, que delimita o status dos dias e as reposições; a semana corrente é a que contém o dia de hoje.

**Intervalo**:
O tempo de descanso entre séries de um exercício, prescrito na ficha e cronometrado durante a sessão de treino.
_Avoid_: descanso (reservado a Dia de descanso), pausa

**Treino do dia**:
A ficha que a agenda semanal atribui ao dia de hoje.
_Avoid_: próximo treino

**Sessão de treino**:
Uma execução de uma ficha pelo aluno, do início à finalização, com as cargas registradas; conta para no máximo um dia da agenda semanal (hoje ou um dia já passado da semana corrente), e para nenhum quando a ficha é avulsa.
_Avoid_: treino realizado, workout session

**Status do dia**:
A situação de um dia da semana corrente quanto à execução: feito, reposto, não realizado ou pendente; derivada da existência de uma sessão de treino ligada ao dia, que prevalece sobre o que o dia aponta no momento.

**Feito**:
O status de um dia cuja sessão de treino foi iniciada no próprio dia.

**Reposto**:
O status de um dia cuja sessão de treino foi iniciada depois dele, na mesma semana.

**Pendente**:
O status de um dia de hoje ou futuro, com ficha publicada atribuída, ainda sem sessão de treino.
_Avoid_: a fazer, em aberto

**Não realizado**:
O status de um dia já passado da semana corrente que tem ficha publicada atribuída e ainda não tem sessão de treino; o aluno pode repor até o fim da semana.
_Avoid_: falta, perdido

**Reposição**:
Uma sessão de treino feita depois do dia a que pertence, dentro da mesma semana e em qualquer dia dela, que conta para o dia reposto; não existe adiantar um dia futuro.
_Avoid_: compensação, treino atrasado
