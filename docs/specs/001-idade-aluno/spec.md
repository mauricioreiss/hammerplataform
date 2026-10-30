# Especificação: Idade do aluno

**Branch**: `001-idade-aluno` | **Criada em**: 2026-10-17 | **Status**: Aprovada

**Entrada**: O professor precisa saber a idade do aluno enquanto monta a ficha e enquanto revisa a análise da IA. Hoje o funil de cadastro da landing pergunta a idade e descarta a resposta, e a idade não aparece em lugar nenhum do painel. A decisão tomada com o professor é guardar a data de nascimento na anamnese (obrigatória no funil, opcional quando o professor preenche) e calcular a idade sempre na hora de exibir, nos pontos do painel em que o professor trabalha sobre o aluno: cabeçalho do perfil, card "Anamnese" do mesmo perfil, construtor de fichas e tela de análise da IA.

## Problema e motivação

A idade é um dos dados básicos para prescrever treino: muda volume, intensidade, cuidados articulares e cardiovasculares. Hoje o professor não tem esse dado à mão:

- O funil de cadastro da landing pede "idade" como número, mas o valor é jogado fora. O visitante acha que informou; o professor nunca recebe.
- A anamnese já aceita uma data de nascimento quando o professor a preenche, mas nada no painel mostra a idade resultante. O único uso é interno, no rascunho gerado pela IA.
- Guardar a idade como número envelhece mal: um aluno cadastrado com 29 anos continua "29" para sempre. A data de nascimento é o fato; a idade é derivada.

O resultado é o professor perguntando a idade pelo WhatsApp ou montando a ficha sem ela.

## Quem usa

- **Professor**: vê a idade do aluno no perfil (cabeçalho e card "Anamnese"), no construtor de fichas e na tela de análise da IA; informa ou corrige a data de nascimento pelo modal de anamnese; é o único caminho de cadastro de alunos menores de 18 anos.
- **Visitante**: informa a data de nascimento no funil de cadastro da página pública de vendas; precisa ter 18 anos ou mais. Ao concluir o cadastro vira aluno; nesta fase o aluno não vê a própria idade em lugar nenhum do app.

## Cenários de usuário e testes (obrigatório)

### História 1 - Professor vê a idade no perfil do aluno (Prioridade: P1)

O professor abre o perfil de um aluno. No cabeçalho, ao lado do nome, lê a idade do aluno sem precisar rolar nem abrir o modal de anamnese, em qualquer aba do perfil. No card "Anamnese", mais abaixo, a idade aparece junto dos demais dados (peso, altura, lesões), acompanhada da data de nascimento, para o professor conferir erros de digitação sem abrir o modal. Se o aluno não tem data de nascimento registrada, os dois lugares mostram "Idade não informada".

**Por que esta prioridade**: é o motivo do pedido. O perfil é a tela de trabalho do professor sobre cada aluno e é de onde ele parte para montar a ficha; o dado precisa estar ali, sem cliques.

**Teste independente**: abrir o perfil de um aluno com data de nascimento registrada e o de um aluno sem data; conferir o cabeçalho e o card "Anamnese" dos dois, nas duas abas. Não depende do funil nem da tela da IA.

**Cenários de aceite**:

1. **Dado** um aluno com data de nascimento registrada na anamnese, **Quando** o professor abre o perfil desse aluno, **Então** o cabeçalho mostra a idade ao lado do nome e o card "Anamnese" mostra a mesma idade.
2. **Dado** um aluno com data de nascimento 17/10/1994 registrada, **Quando** o professor abre o perfil em 17/10/2026, **Então** o card "Anamnese" mostra "32 anos" e, ao lado, a data de nascimento no formato brasileiro (17/10/1994).
3. **Dado** um aluno com anamnese registrada mas sem data de nascimento, **Quando** o professor abre o perfil, **Então** o cabeçalho e o card "Anamnese" mostram "Idade não informada", e o card não mostra data alguma.
4. **Dado** um aluno sem nenhuma anamnese registrada, **Quando** o professor abre o perfil, **Então** o cabeçalho mostra "Idade não informada" e o card "Anamnese" mostra "Idade não informada" junto do aviso atual de que não há anamnese registrada.
5. **Dado** o perfil de um aluno aberto, **Quando** o professor alterna entre as abas "Fichas de Treino" e "Avaliações Físicas", **Então** a idade continua visível no cabeçalho em ambas.
6. **Dado** que o professor acabou de salvar uma data de nascimento pelo modal de anamnese, **Quando** a gravação é concluída, **Então** o cabeçalho e o card "Anamnese" mostram a idade e a data correspondentes sem o professor recarregar a página manualmente.

### História 2 - Visitante informa a data de nascimento no funil (Prioridade: P1)

Ao se cadastrar pela landing, no passo de dados pessoais, o visitante informa a data de nascimento no lugar do campo "idade" atual. O campo é obrigatório e o visitante precisa ter 18 anos ou mais: ao tentar avançar desse passo sem uma data válida, ou com uma data que resulte em menos de 18 anos, o funil não avança e mostra uma mensagem que diz o que está errado. O servidor repete as mesmas verificações ao concluir o cadastro. A data informada fica registrada na anamnese criada no cadastro e, a partir daí, o professor vê a idade no perfil.

**Por que esta prioridade**: o funil é a principal porta de entrada de alunos e hoje é onde o dado se perde. Sem esta história, a História 1 só funciona para alunos que o professor preencheu à mão. A idade mínima existe porque o cadastro de menores exige consentimento dos pais ou responsável (LGPD, art. 14), que o app não colhe.

**Teste independente**: percorrer o funil com data válida de maior de idade, sem data, com data inválida, com data futura, com data de menor de 18 anos e com data de mais de 120 anos; depois abrir o perfil do aluno recém-criado no painel e conferir a idade.

**Cenários de aceite**:

1. **Dado** o passo de dados pessoais do funil, **Quando** o visitante o visualiza, **Então** existe um campo com o rótulo visível "Data de nascimento" (o rótulo não pode depender de texto de exemplo dentro do campo, que alguns celulares não mostram em campos de data) e não existe mais o campo "Idade".
2. **Dado** um visitante que preencheu todos os passos com uma data de nascimento válida de alguém com 18 anos ou mais, **Quando** conclui o cadastro, **Então** o cadastro é criado e o professor, ao abrir o perfil desse aluno, vê a idade calculada a partir dessa data.
3. **Dado** um visitante que deixou a data de nascimento em branco, **Quando** tenta avançar do passo de dados pessoais, **Então** o funil não avança e mostra uma mensagem que identifica o campo "Data de nascimento" como obrigatório, mantendo tudo o que já foi preenchido.
4. **Dado** um visitante que informou uma data de nascimento no futuro ou inexistente no calendário, **Quando** tenta avançar do passo de dados pessoais, **Então** o funil não avança e mostra uma mensagem clara de que a data é inválida.
5. **Dado** um visitante cuja data de nascimento resulta em menos de 18 anos no horário de Brasília, **Quando** tenta avançar do passo de dados pessoais, **Então** o funil não avança e mostra uma mensagem clara de que o cadastro pela página é só para maiores de 18 anos.
6. **Dado** um visitante que completa 18 anos exatamente hoje (horário de Brasília), **Quando** tenta avançar do passo de dados pessoais, **Então** o funil aceita a data.
7. **Dado** um visitante cuja data de nascimento resulta em mais de 120 anos, **Quando** tenta avançar do passo de dados pessoais, **Então** o funil não avança e mostra uma mensagem clara de que a data é inválida.
8. **Dado** um envio que chega ao sistema sem passar pela tela (por exemplo, com o campo removido ou alterado no navegador), **Quando** falta a data de nascimento, ela é inválida, resulta em menos de 18 anos ou em mais de 120 anos, **Então** o cadastro é recusado, nenhuma conta é criada e a mensagem de erro é mostrada ao visitante. A validação na tela é conveniência; a regra vale no servidor.

### História 3 - Professor informa ou corrige a data de nascimento na anamnese (Prioridade: P2)

No modal de anamnese do perfil do aluno, o professor pode informar, corrigir ou apagar a data de nascimento. O campo continua opcional, porque o professor muitas vezes preenche a anamnese por telefone ou antes de ter todos os dados. Não há idade mínima nesse caminho: alunos menores de 18 anos entram na plataforma somente cadastrados pelo professor, que colhe a autorização do responsável fora do app. Quando preenchido, o campo exige data completa, existente, não futura e que não resulte em mais de 120 anos.

**Por que esta prioridade**: o campo já existe e já salva; o que falta é a validação de data futura e de limite, e a exibição da idade (História 1). É o caminho para alunos cadastrados pelo professor, para menores de idade e para corrigir erros do funil.

**Teste independente**: abrir o modal de anamnese de um aluno, salvar com data válida, com data de menor de idade, com data futura, com data de mais de 120 anos, em branco e apagando uma data existente; conferir o resultado no perfil.

**Cenários de aceite**:

1. **Dado** um aluno cadastrado pelo professor (sem anamnese), **Quando** o professor preenche a anamnese informando a data de nascimento e salva, **Então** o perfil passa a mostrar a idade nos dois lugares.
2. **Dado** o modal de anamnese, **Quando** o professor salva sem informar a data de nascimento, **Então** a anamnese é salva normalmente e o perfil mostra "Idade não informada".
3. **Dado** um aluno com data de nascimento registrada, **Quando** o professor apaga a data no modal e salva, **Então** a anamnese fica sem data e o perfil volta a mostrar "Idade não informada".
4. **Dado** o modal de anamnese, **Quando** o professor informa uma data no futuro ou inexistente no calendário e tenta salvar, **Então** a anamnese não é salva e o professor vê uma mensagem clara de que a data é inválida.
5. **Dado** o modal de anamnese, **Quando** o professor informa uma data que resulta em mais de 120 anos e tenta salvar, **Então** a anamnese não é salva e o professor vê uma mensagem clara de que a data é inválida.
6. **Dado** o modal de anamnese de um aluno menor de 18 anos cadastrado pelo professor, **Quando** o professor informa a data de nascimento e salva, **Então** a anamnese é salva e o perfil mostra a idade (por exemplo, "15 anos").
7. **Dado** um aluno cadastrado pelo funil com data de nascimento errada, **Quando** o professor corrige a data no modal e salva, **Então** a idade exibida passa a refletir a data corrigida.

### História 4 - Professor vê a idade na tela de análise da IA (Prioridade: P2)

Na tela de análise de uma anamnese, no bloco de dados do aluno (peso, altura, dias por semana, lesões), o professor também vê a idade, calculada a partir da data de nascimento daquela anamnese. Sem data, vê "Idade não informada".

**Por que esta prioridade**: o professor usa essa tela para revisar a estratégia sugerida pela IA e precisa julgar a sugestão sabendo a idade do aluno. É P2 porque a tela é consultada menos vezes que o perfil.

**Teste independente**: abrir a tela de análise de uma anamnese com data de nascimento e de outra sem; conferir o bloco de dados do aluno. Não exige gerar análise.

**Cenários de aceite**:

1. **Dado** uma anamnese com data de nascimento, **Quando** o professor abre a tela de análise dela, **Então** o bloco de dados do aluno mostra a idade junto dos demais dados.
2. **Dado** uma anamnese sem data de nascimento, **Quando** o professor abre a tela de análise, **Então** o bloco mostra "Idade não informada" no lugar da idade.
3. **Dado** uma anamnese sem aluno vinculado (exibida como "Aluno sem cadastro"), **Quando** o professor abre a tela de análise, **Então** a regra é a mesma: idade a partir da data daquela anamnese ou "Idade não informada".
4. **Dado** um aluno com mais de uma anamnese, com datas de nascimento diferentes ou ausentes em algumas, **Quando** o professor abre a tela de análise de uma anamnese que não é a considerada atual no perfil, **Então** a idade mostrada é a da anamnese analisada, mesmo que difira da exibida no perfil do aluno.

### História 5 - Professor vê a idade enquanto monta a ficha (Prioridade: P1)

O construtor de fichas abre em tela cheia sobre o perfil e cobre o cabeçalho. Para o professor não perder o dado justamente no momento de prescrever, o topo do construtor mostra o nome e a idade do aluno (ou "Idade não informada").

**Por que esta prioridade**: "ver a idade enquanto monta a ficha" é o pedido literal do professor; sem isto, o cabeçalho do perfil não basta, porque fica coberto.

**Teste independente**: abrir o perfil de um aluno com data de nascimento, criar uma ficha nova, editar uma ficha existente e revisar um rascunho gerado pela IA; conferir o topo do construtor nos três casos. Repetir com um aluno sem data.

**Cenários de aceite**:

1. **Dado** um aluno com data de nascimento registrada, **Quando** o professor abre o construtor para criar uma ficha nova, **Então** o topo do construtor mostra o nome e a idade do aluno.
2. **Dado** um aluno com data de nascimento registrada, **Quando** o professor abre o construtor para editar uma ficha existente ou revisar um rascunho gerado pela IA, **Então** o topo do construtor mostra o nome e a idade do aluno da mesma forma.
3. **Dado** um aluno sem data de nascimento, **Quando** o professor abre o construtor, **Então** o topo mostra o nome do aluno e "Idade não informada".

### Casos de borda

- **Aniversário hoje**: aluno nascido em 17/10/1994, consultado em 17/10/2026 (horário de Brasília), tem 32 anos.
- **Aniversário amanhã**: aluno nascido em 18/10/1994, consultado em 17/10/2026, tem 31 anos. Faz 32 apenas em 18/10/2026.
- **Aniversário ontem**: aluno nascido em 16/10/1994, consultado em 17/10/2026, tem 32 anos.
- **Virada do dia em Brasília**: às 22h de 17/10/2026 em Brasília, o aluno nascido em 18/10/1994 ainda tem 31 anos, mesmo que em outro fuso já seja 18/10. A referência de "hoje" é sempre o horário de Brasília.
- **Virada de ano**: aluno nascido em 01/01/2000, consultado em 31/12/2026, tem 26 anos; em 01/01/2027, 27.
- **Nascido em 29/02**: em ano não bissexto, completa o ano em 1º de março. Exemplo: nascido em 29/02/2004, consultado em 28/02/2026 tem 21 anos; em 01/03/2026 tem 22. Em ano bissexto, completa em 29/02.
- **18 anos no funil**: visitante que completa 18 anos exatamente hoje é aceito; quem completa amanhã é recusado.
- **Menor de idade pelo modal**: o professor pode registrar qualquer data de nascimento de menor de 18 anos; a idade é exibida normalmente.
- **Idade zero**: só pode ocorrer por data registrada pelo modal do professor (menos de 1 ano); é exibida como "0 anos".
- **Mais de 120 anos**: data recusada como inválida em qualquer caminho (funil, modal ou outro). Nunca é registrada.
- **Data de nascimento no futuro**: recusada em qualquer gravação, com mensagem clara. Nunca é registrada.
- **Data incompleta ou inexistente** (por exemplo, 31/02 ou "mês 13"): recusada como inválida.
- **Aluno antigo sem data**: alunos já cadastrados antes desta funcionalidade não têm data de nascimento (a idade digitada no funil antigo foi descartada e não existe para migrar). Mostram "Idade não informada" até o professor preencher pelo modal.
- **Aluno cadastrado pelo professor**: o cadastro pelo painel não cria anamnese; o aluno fica como "Idade não informada" até o professor preencher a anamnese com a data.
- **Aluno cadastrado pelo funil**: sempre tem data de nascimento e tinha 18 anos ou mais no dia do cadastro, porque o funil não conclui de outra forma.
- **Aluno com mais de uma anamnese**: o perfil e o construtor mostram a idade da anamnese considerada atual; a tela da IA mostra a idade da anamnese que está sendo analisada. As duas podem diferir (cenário 4.4).
- **Data registrada corrompida ou ilegível** (dado antigo ou gravado por outro caminho): tratada como ausente; a tela mostra "Idade não informada" e não quebra.
- **Página aberta antes do aniversário e recarregada depois**: a idade exibida é sempre a da data de hoje; uma consulta no dia seguinte ao aniversário mostra a nova idade sem nenhuma ação do professor.
- **Idade de 1 ano**: exibida no singular ("1 ano"), demais no plural ("N anos", inclusive "0 anos").

## Requisitos

### Requisitos funcionais

- **RF-001**: A anamnese DEVE guardar a data de nascimento do aluno. A idade NÃO DEVE ser guardada como número em lugar nenhum; é sempre derivada da data de nascimento no momento da exibição.
- **RF-002**: No passo de dados pessoais do funil de cadastro da landing, o campo "Idade" DEVE ser substituído por um campo com o rótulo visível "Data de nascimento".
- **RF-003**: No funil, a data de nascimento DEVE ser obrigatória. O cadastro NÃO DEVE ser concluído (nenhuma conta criada) sem uma data de nascimento válida.
- **RF-004**: No funil, o cadastro DEVE ser restrito a visitantes com 18 anos completos ou mais no dia de hoje no horário de Brasília. Data que resulte em menos de 18 anos DEVE ser recusada com mensagem clara de que o cadastro pela página é só para maiores de 18 anos.
- **RF-005**: No funil, a verificação da data de nascimento (presença, validade e idade mínima) DEVE acontecer ao visitante tentar avançar do passo de dados pessoais: o funil não avança e mostra, nesse passo, uma mensagem que identifica o campo "Data de nascimento" e o problema, mantendo tudo o que já foi preenchido.
- **RF-006**: A obrigatoriedade, a validade e a idade mínima da data de nascimento no funil DEVEM ser verificadas também no servidor ao concluir o cadastro, independentemente do que a tela faz, recusando o cadastro com a mesma mensagem.
- **RF-007**: A data de nascimento informada no funil DEVE ser registrada na anamnese criada no cadastro, de forma que todo lugar que usa a anamnese (perfil, construtor de fichas, tela da IA, rascunho gerado pela IA) passe a dispor dela.
- **RF-008**: No modal de anamnese do professor, a data de nascimento DEVE continuar opcional e sem idade mínima. O professor DEVE poder informar, corrigir ou apagar a data, inclusive de alunos menores de 18 anos; salvar sem data DEVE ser permitido e resulta em "Idade não informada".
- **RF-009**: Em qualquer gravação da data de nascimento, por qualquer caminho (funil, modal do professor ou outro ponto que registre anamnese), a data, quando informada, DEVE ser uma data de calendário completa e existente (dia, mês e ano), NÃO DEVE estar no futuro em relação ao dia de hoje no horário de Brasília e NÃO DEVE resultar em mais de 120 anos. Data fora dessas regras DEVE ser recusada como inválida, com mensagem clara, tanto na tela quanto no servidor.
- **RF-010**: A idade DEVE ser calculada em anos completos: o aluno completa um ano novo no dia do aniversário (inclusive) e não antes. Aniversário amanhã ainda conta como o ano anterior.
- **RF-011**: Quem nasceu em 29 de fevereiro DEVE completar o ano em 1º de março nos anos não bissextos e em 29 de fevereiro nos bissextos.
- **RF-012**: O "hoje" usado no cálculo da idade, na validação de data futura, no limite de 120 anos e na idade mínima do funil DEVE ser o dia corrente no horário de Brasília, não o do servidor nem o do dispositivo em outro fuso.
- **RF-013**: A idade DEVE ser exibida como "N anos" (inclusive "0 anos" para menos de 1 ano) e "1 ano" quando for exatamente um. Sem data de nascimento, ou com data ilegível, o texto exibido DEVE ser exatamente "Idade não informada".
- **RF-014**: No perfil do aluno, o cabeçalho DEVE mostrar a idade (ou "Idade não informada") ao lado do nome, em todas as abas do perfil.
- **RF-015**: No perfil do aluno, o card "Anamnese" DEVE incluir a idade (ou "Idade não informada") junto dos demais dados da anamnese e, quando houver data de nascimento, DEVE mostrar a data ao lado da idade, no formato brasileiro (dia/mês/ano). Quando não há anamnese registrada, o card DEVE mostrar "Idade não informada" junto do aviso atual de ausência de anamnese, e o cabeçalho mostra "Idade não informada".
- **RF-016**: O construtor de fichas (criação, edição e revisão de rascunho gerado pela IA) DEVE mostrar no topo o nome e a idade do aluno (ou "Idade não informada"), visíveis durante toda a montagem da ficha.
- **RF-017**: Na tela de análise da IA, o bloco de dados do aluno DEVE mostrar a idade (ou "Idade não informada") calculada a partir da data de nascimento da anamnese que está sendo analisada, ainda que ela difira da anamnese considerada atual no perfil.
- **RF-018**: A idade exibida no cabeçalho do perfil, no card "Anamnese" e no construtor de fichas DEVE ser calculada a partir da data de nascimento da mesma anamnese que o card "Anamnese" exibe, para que os três nunca divirjam.
- **RF-019**: Após o professor salvar a data de nascimento pelo modal, a idade e a data nos pontos do perfil DEVEM refletir a nova data sem o professor recarregar a página manualmente.
- **RF-020**: Alunos existentes sem data de nascimento DEVEM continuar funcionando normalmente em todas as telas, exibindo "Idade não informada". Nenhuma migração ou preenchimento automático é feito.
- **RF-021**: As regras de cálculo e exibição (RF-010 a RF-013) DEVEM valer para todo cálculo de idade do sistema, inclusive o que alimenta o rascunho gerado pela IA. NÃO DEVE existir mais de uma regra de idade.

### Entidades-chave (sem detalhe de implementação)

- **Aluno**: a pessoa acompanhada pelo professor. Não guarda idade nem data de nascimento diretamente; ambas vêm da anamnese. Pode ser menor de 18 anos somente quando cadastrado pelo professor.
- **Visitante**: a pessoa na página pública de vendas; só conclui o cadastro com 18 anos ou mais.
- **Anamnese**: o questionário de saúde e hábitos do aluno. Passa a ser a única fonte da data de nascimento. Um aluno pode ter mais de uma anamnese; a que o perfil exibe é a considerada atual.
- **Idade**: valor derivado, em anos completos, calculado a partir da data de nascimento da anamnese e do dia de hoje em Brasília. Nunca é armazenada.

## Critérios de sucesso

- **CS-001**: 100% dos cadastros concluídos pelo funil após a entrega têm data de nascimento registrada na anamnese e correspondem a visitantes com 18 anos ou mais no dia do cadastro; nenhum cadastro é concluído de outra forma.
- **CS-002**: Uma tabela de casos de cálculo (aniversário hoje, amanhã, ontem, virada de ano, 22h em Brasília na véspera do aniversário, 29/02 em ano bissexto e não bissexto, 18 anos hoje e amanhã, 0 anos, 1 ano) é verificada e todos os casos retornam a idade esperada, tanto na exibição quanto no cálculo usado pelo rascunho gerado pela IA.
- **CS-003**: Nos quatro pontos de exibição (cabeçalho do perfil, card "Anamnese", construtor de fichas, tela da IA), para alunos com data de nascimento, sem data e sem anamnese, aparece a idade ou "Idade não informada"; nunca um espaço vazio, um traço ou erro na tela.
- **CS-004**: Uma data de nascimento no futuro, inexistente no calendário ou que resulte em mais de 120 anos é recusada tanto pela tela quanto por um envio direto ao servidor, em todos os caminhos de gravação.
- **CS-005**: No funil, uma data que resulte em menos de 18 anos é recusada ao avançar do passo de dados pessoais e também por um envio direto ao servidor; no modal do professor, a mesma data é aceita.
- **CS-006**: O professor lê a idade do aluno na tela de perfil sem nenhum clique adicional (zero cliques a partir da abertura do perfil) e continua vendo a idade com o construtor de fichas aberto.
- **CS-007**: Alunos cadastrados antes da entrega abrem normalmente no perfil, no construtor e na tela da IA, com "Idade não informada".

## Premissas

- "Horário de Brasília" é o fuso oficial de Brasília, sem horário de verão (não há horário de verão vigente no Brasil nesta data).
- A anamnese considerada atual de um aluno é a mesma que o card "Anamnese" do perfil já exibe hoje; esta fase não muda esse critério.
- A idade digitada no funil antigo não existe em lugar nenhum (era descartada), logo não há dado para migrar para alunos antigos.
- Os demais campos do funil hoje coletados e descartados (sexo, WhatsApp, experiência, nível de estresse, uso de anabolizantes) continuam como estão; não fazem parte desta fase.
- O aluno não vê a própria idade em nenhuma tela do app nesta fase; só o professor.
- A autorização do responsável por aluno menor de 18 anos é colhida pelo professor fora do app; a plataforma não registra nem exige esse documento nesta fase.
- O rascunho gerado pela IA já recebe a idade quando a data existe. Com a data vindo do funil, ele passa a recebê-la para todo aluno cadastrado pela landing, e o cálculo que o alimenta passa a seguir as mesmas regras desta especificação (RF-021).

## Fora de escopo

- Perguntar em quais dias da semana o aluno pode treinar e qualquer mudança na agenda semanal (Fase 2).
- Qualquer alteração visual, de layout ou de biblioteca de interface (Fase 3). A idade entra no visual atual, no estilo dos dados vizinhos.
- Corrigir o bug dos rótulos do PAR-Q na tela da IA (registrado em Notas).
- Incluir a idade como dado de entrada da análise de texto gerada na tela da IA. Isso enviaria mais um dado pessoal do aluno à OpenAI e fica para uma revisão futura de tudo o que já é enviado à OpenAI.
- Exibir a idade ao aluno.
- Coletar ou guardar os outros campos do funil que hoje são descartados.
- Migrar ou estimar idade para alunos antigos.
- Mudar o critério de qual anamnese é a atual do aluno.
- Registrar ou exigir no app a autorização do responsável por aluno menor de idade.

## Notas

- **Bug existente, não tratado aqui**: na tela de análise da IA, as respostas do PAR-Q aparecem como "Pergunta q0", "Pergunta q1" etc., em vez do texto da pergunta, e o mesmo defeito faz a análise gerada não receber o texto das perguntas. Fica registrado para correção em separado.
- **Cálculo atual**: já existe um cálculo de idade interno, usado apenas para o rascunho gerado pela IA. Ele usa o relógio do servidor como "hoje" (presume-se UTC em produção; não confirmado), o que pode errar na virada do dia em Brasília. Interpreta a data de nascimento como meia-noite em UTC e depois lê dia, mês e ano no fuso local do servidor, o que pode deslocar a data em um dia. Devolve "sem idade" silenciosamente a partir de 120 anos e também para data futura. RF-021 obriga esse cálculo a seguir as regras desta fase, e RF-009 passa a recusar essas datas na gravação em vez de escondê-las na exibição.
- **Validação do modal**: o limite de data máxima do campo precisa usar o "hoje" de Brasília, não o de UTC (entre 21h e meia-noite em Brasília os dois divergem). No servidor, a gravação precisa conferir, além do formato, se a data existe no calendário e se não está no futuro. RF-009 e RF-012 cobrem os dois pontos.
- **Funil atual**: a tela só valida no último passo, e apenas o aceite do termo e a escolha do plano; nenhum outro campo é conferido antes do envio, e os erros do servidor aparecem só no último passo. RF-005 muda isso para a data de nascimento, verificada ao avançar do passo de dados pessoais.
- **Idade mínima e LGPD**: o tratamento de dados pessoais de crianças e adolescentes exige consentimento específico de pelo menos um dos pais ou responsável legal (LGPD, art. 14). O funil não tem como colher esse consentimento, por isso recusa menores de 18 anos; o professor, que colhe a autorização pessoalmente, continua podendo cadastrá-los.
- **Anamnese atual**: o critério de "anamnese mais recente" usado pelo painel hoje não é confiável quando o aluno tem mais de uma (a ordenação não é por data). Fora de escopo desta fase, mas afeta qual data de nascimento aparece se houver duplicatas, e explica por que a tela da IA pode mostrar idade diferente da do perfil (cenário 4.4).
- **Dado pessoal**: data de nascimento é dado pessoal do aluno. Não exibir a idade ao aluno, não guardar a idade como número e não enviar a data a lugares que não a usam estão alinhados com a minimização de dados já praticada no restante da anamnese.

## Esclarecimentos

### Sessão 2026-10-17

- P: Quais os limites de plausibilidade da data de nascimento (idade mínima, máxima) e o que exibir para idade zero? -> R: No funil, só maiores de 18 anos; abaixo disso o cadastro é recusado com mensagem clara, por exigência de consentimento dos pais (LGPD, art. 14). Data que resulte em mais de 120 anos é inválida em qualquer caminho. O modal do professor não tem idade mínima; menores só entram cadastrados pelo professor, que colhe a autorização do responsável fora do app. Idade zero só pode ocorrer pelo modal e é exibida como "0 anos".
- P: Quem nasceu em 29 de fevereiro completa o ano em 28/02 ou 01/03 nos anos não bissextos? -> R: Em 1º de março.
- P: Exibir a data de nascimento ao lado da idade no card "Anamnese"? -> R: Sim, o card mostra a data de nascimento ao lado da idade.
- P: Incluir a idade como entrada da análise de texto da IA nesta fase? -> R: Não; fica fora desta fase e vai junto com uma revisão futura dos dados enviados à OpenAI.
- P: Mostrar a idade também dentro do construtor de fichas, que abre em tela cheia e cobre o cabeçalho? -> R: Sim, o construtor mostra nome e idade do aluno no topo.
- P: A verificação da data no funil acontece ao avançar do passo de dados pessoais ou só ao concluir? -> R: Ao avançar do passo de dados pessoais, e também no servidor.
