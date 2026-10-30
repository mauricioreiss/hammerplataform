# Especificação: Agenda semanal

**Branch**: `002-agenda-semanal` | **Criada em**: 2026-10-17 | **Status**: Aprovada
**Entrada**: O Mauri (desenvolvedor do projeto) relatou: "tenho o treino de quarta, falto e não faço; na quinta aparece o treino de quarta (isso não está certo)". Ele quer que o treino do dia siga o dia da semana, que a aba Treinos do aluno liste os dias de segunda a domingo e que o professor possa marcar dias de descanso com recomendações escritas por ele.

## Problema e motivação

Hoje o app não conhece dia da semana. O "treino de hoje" é calculado por rodízio: a próxima ficha, em ordem alfabética de título, depois da última ficha que o aluno finalizou. Consequências observadas:

- Um aluno que não executa a ficha de quarta vê a ficha de quarta na quinta, na sexta e em qualquer dia seguinte, até executá-la. O dia não realizado empurra toda a semana.
- A aba Treinos lista fichas em ordem alfabética com a etiqueta "Próximo", sem relação com o calendário. O aluno não sabe o que fazer em cada dia.
- "Concluído nesta semana" é marcado por ficha, não por dia. A mesma ficha não pode ocupar dois dias (fazer na segunda bloquearia a quinta) e não há como distinguir um dia não realizado de um dia reposto.
- A semana vira no horário do servidor, não no horário de Brasília: o bloqueio semanal reinicia no domingo às 21:00 para o aluno (com o servidor em UTC, inferido).
- Não existe dia de descanso: o professor não tem onde escrever recomendações para os dias em que o aluno não executa ficha.

A agenda semanal resolve isso: cada aluno passa a ter sete dias (segunda a domingo) e cada dia aponta para uma ficha, um dia de descanso ou nada. O treino do dia é a ficha do dia da semana de hoje. A sessão de treino passa a contar para um dia da agenda, não para uma ficha (ver ADR 0002), o que permite a mesma ficha em vários dias, reposição de dias não realizados dentro da semana e status por dia. O rodízio e o bloqueio semanal por ficha deixam de existir.

## Quem usa

- **Professor**: monta e ajusta a agenda semanal de cada aluno no perfil do aluno, escreve as recomendações dos dias de descanso e acompanha o status de cada dia da semana corrente.
- **Aluno**: vê o treino do dia na home, a agenda de segunda a domingo na aba Treinos, executa a ficha do dia, repõe dias não realizados da semana e executa fichas avulsas quando quiser.
- **Visitante do funil**: ao se cadastrar, informa em quais dias da semana pode treinar, o que alimenta a anamnese e os dias da agenda que o rascunho gerado por IA aponta para seus rascunhos.

## Cenários de uso e testes (obrigatório)

### História 1 - Treino do dia pelo dia da semana (Prioridade: P1)

Como aluno, quero que a home mostre a ficha que meu professor atribuiu ao dia da semana de hoje, e que a aba Treinos mostre minha agenda de segunda a domingo com o dia de hoje em destaque, para saber exatamente o que fazer em cada dia sem depender do que fiz ou deixei de fazer antes.

**Por que esta prioridade**: É o bug relatado. Sem isso, o restante (reposição, status, descanso) não tem base.

**Teste independente**: Com uma agenda configurada diretamente para um aluno de teste (ex.: Treino A na segunda e na quinta, Treino B na terça, Treino C na quarta, Treino D na sexta, sábado e domingo livres), abrir a home e a aba Treinos em dias diferentes da semana (simulando a data no horário de Brasília) e verificar o treino do dia, a ordem dos dias e o destaque. Não precisa de status, reposição, descanso nem IA.

**Cenários de aceite**:

1. **Dado** um aluno com Treino B na terça, Treino C na quarta e Treino D na quinta, **Quando** ele não executa nada na quarta e abre a home na quinta, **Então** a home mostra Treino D como treino do dia, e Treino C não aparece como treino do dia.
2. **Dado** um aluno com Treino A na segunda e na quinta, **Quando** ele finaliza a sessão de Treino A na segunda e abre a home na quinta, **Então** a home mostra Treino A como treino do dia e ele consegue iniciar a sessão de quinta (não há bloqueio semanal por ficha).
3. **Dado** um aluno com agenda configurada, **Quando** ele abre a aba Treinos, **Então** vê sete linhas na ordem segunda, terça, quarta, quinta, sexta, sábado e domingo, cada uma com o título da ficha ou a indicação de dia livre, o dia de hoje em destaque e, abaixo das sete linhas, a seção "Outras fichas" com as fichas avulsas publicadas em ordem alfabética de título.
4. **Dado** um aluno cuja agenda não tem nenhum dia com ficha publicada nem descanso, **Quando** ele abre a home, **Então** vê a mensagem "Seu professor está montando sua agenda" e nenhum treino do dia.
5. **Dado** um aluno cujo dia de hoje é livre, **Quando** ele abre a home, **Então** vê "Dia livre" e nenhum treino do dia.
6. **Dado** um aluno cuja segunda aponta para uma ficha ainda em rascunho, **Quando** ele abre a home ou a aba Treinos na segunda, **Então** a segunda aparece como dia livre; quando o professor publica a ficha, a segunda passa a mostrar a ficha na próxima abertura ou atualização da tela, sem nova ação do aluno.
7. **Dado** um aluno com Treino E na sexta, **Quando** na quinta ele abre a sexta pela aba Treinos, **Então** vê a ficha em modo de leitura, com o início da sessão desabilitado e a mensagem de que esse dia ainda não chegou.
8. **Dado** que são 21:30 de domingo no horário de Brasília (já segunda em UTC), **Quando** o aluno abre a home, **Então** o treino do dia é a ficha de domingo e a semana corrente ainda é a que termina nesse domingo.
9. **Dado** que são 23:59 de domingo no horário de Brasília e a home mostra a ficha de domingo, **Quando** o aluno atualiza a home depois de 00:00 de segunda em Brasília, **Então** a home mostra a ficha de segunda e a aba Treinos mostra a nova semana.
10. **Dado** um aluno com Treino A na segunda e uma ficha avulsa "Treino Cardio" publicada, **Quando** na segunda ele abre "Treino Cardio" pela seção "Outras fichas", finaliza a sessão e volta à home, **Então** a home continua mostrando Treino A como treino do dia, disponível para iniciar, e "Treino Cardio" continua na seção "Outras fichas", abrível de novo.
11. **Dado** um aluno com uma ficha em rascunho, **Quando** ele tenta abrir essa ficha diretamente pelo endereço dela, **Então** o sistema não exibe a ficha nem revela sua existência.

### História 2 - Professor monta a agenda do aluno (Prioridade: P1)

Como professor, quero uma aba "Agenda" no perfil do aluno, ao lado de "Fichas de Treino", com sete linhas (segunda a domingo) onde escolho, para cada dia, uma ficha, um dia de descanso ou nada, para prescrever a semana do aluno sem sair do perfil.

**Por que esta prioridade**: Sem a aba o professor não consegue criar nem corrigir a agenda, e a História 1 só funcionaria com a migração automática.

**Teste independente**: Abrir o perfil de um aluno com fichas publicadas e em rascunho, montar a agenda nos sete dias, salvar, e conferir no app do aluno que a home e a aba Treinos refletem a agenda. Não precisa de status, reposição nem texto de descanso.

**Cenários de aceite**:

1. **Dado** um aluno com as fichas Treino A, Treino B e Treino C publicadas, **Quando** o professor abre a aba Agenda, **Então** vê sete linhas (segunda a domingo) e em cada linha pode escolher uma das fichas do aluno, marcar descanso ou deixar o dia livre.
2. **Dado** a aba Agenda aberta, **Quando** o professor atribui Treino A à segunda e também à quinta e salva, **Então** as duas linhas mostram Treino A, sem erro de duplicidade, e o aluno vê Treino A nos dois dias.
3. **Dado** a aba Agenda aberta, **Quando** o professor atribui à terça uma ficha que está em rascunho e salva, **Então** a aba Agenda mostra a ficha com a indicação de rascunho, e o aluno vê a terça como dia livre até a ficha ser publicada.
4. **Dado** uma alteração na agenda salva pelo professor, **Quando** o aluno abre ou atualiza a home, **Então** vê a alteração, e nenhuma notificação push é enviada por causa da mudança de agenda (o push continua sendo enviado apenas na publicação de uma ficha, como hoje).
5. **Dado** a aba Agenda aberta, **Quando** o professor troca a ficha da quarta de Treino C para Treino B e salva, **Então** o aluno vê Treino B na quarta na próxima abertura da home ou da aba Treinos.
6. **Dado** o perfil de um aluno, **Quando** o aluno tenta alterar a própria agenda por qualquer meio, **Então** a alteração é recusada; só o professor edita a agenda.
7. **Dado** a aba Agenda aberta na quinta, **Quando** o professor atribui Treino B à terça (dia já passado) e salva, **Então** a aba Agenda avisa que a terça aparecerá como não realizada para o aluno até ser reposta, e a atribuição é salva.
8. **Dado** a ficha Treino C atribuída à quarta, **Quando** o professor exclui Treino C na aba "Fichas de Treino", **Então** o sistema avisa que a ficha está na agenda antes de confirmar e, após a exclusão, a quarta passa a dia livre.

### História 3 - Migração das fichas atuais para a agenda (Prioridade: P1)

Como professor, quero que, no momento da entrega, as fichas já publicadas de cada aluno sejam distribuídas automaticamente nos dias da semana, para que nenhum aluno fique sem treino do dia enquanto eu ajusto as agendas manualmente.

**Por que esta prioridade**: Na entrega, todos os alunos existentes têm fichas mas nenhuma agenda. Sem a migração, todos veriam "Seu professor está montando sua agenda" ao mesmo tempo.

**Teste independente**: Em um ambiente com os dados atuais, executar a migração e conferir aluno a aluno a agenda resultante, as fichas avulsas e a contagem de sessões no histórico, sem depender das outras histórias.

**Cenários de aceite**:

1. **Dado** um aluno com as fichas publicadas "Treino A", "Treino B" e "Treino C" e nenhum rascunho, **Quando** a migração roda, **Então** a agenda fica Treino A na segunda, Treino B na terça, Treino C na quarta e quinta a domingo livres; nenhuma ficha avulsa.
2. **Dado** um aluno com nove fichas publicadas de títulos "Treino A" a "Treino I", **Quando** a migração roda, **Então** as sete primeiras em ordem alfabética ocupam segunda a domingo (Treino A na segunda até Treino G no domingo) e "Treino H" e "Treino I" ficam como fichas avulsas na seção "Outras fichas".
3. **Dado** um aluno com duas fichas publicadas e três rascunhos, **Quando** a migração roda, **Então** só as duas publicadas entram na agenda (segunda e terça); os rascunhos ficam fora da agenda e continuam inacessíveis ao aluno, inclusive pela abertura direta da ficha (RF-005).
4. **Dado** um aluno sem nenhuma ficha publicada, **Quando** a migração roda, **Então** a agenda fica sem dias com ficha e o aluno vê "Seu professor está montando sua agenda".
5. **Dado** qualquer aluno com sessões de treino anteriores à entrega, **Quando** a migração roda, **Então** todas as sessões anteriores continuam no histórico, com a mesma ficha, data, duração e cargas de antes.
6. **Dado** a migração concluída, **Quando** o professor abre a aba Agenda de um aluno, **Então** consegue trocar qualquer dia (ex.: mover Treino C da quarta para a sexta e marcar a quarta como descanso) e a mudança vale na hora.
7. **Dado** um aluno com as fichas publicadas "Treino 10", "Treino 2" e "treino Água", **Quando** a migração roda, **Então** a ordem é "Treino 2" na segunda, "Treino 10" na terça e "treino Água" na quarta (ordenação natural, sem diferenciar acentos nem maiúsculas).
8. **Dado** um aluno com duas fichas de título idêntico "Treino A", **Quando** a migração roda, **Então** a criada antes ocupa a segunda e a criada depois ocupa a terça.
9. **Dado** um aluno com uma ficha no status legado que ele hoje enxerga como publicada, **Quando** a migração roda, **Então** essa ficha entra na agenda como publicada, na mesma ordem alfabética das demais.
10. **Dado** um aluno que já tem agenda com ao menos um dia apontando para ficha ou descanso, **Quando** a migração roda, **Então** a agenda dele não é alterada.

### História 4 - Status dos dias e reposição (Prioridade: P2)

Como aluno, quero ver o status de cada dia da semana corrente e que um dia com ficha que eu deixei passar apareça como não realizado e possa ser reposto até o fim da semana, para recuperar a semana sem empurrar os dias seguintes. Como professor, quero ver o mesmo status na aba Agenda e no histórico do perfil.

**Por que esta prioridade**: Resolve a segunda metade do pedido (o que fazer com o dia não realizado) e dá ao professor a visão de adesão. Depende da História 1 e da História 2.

**Teste independente**: Com uma agenda configurada, simular dias da semana no horário de Brasília, deixar um dia passar sem sessão, repor em um dia posterior e conferir os status na aba Treinos do aluno e na aba Agenda do professor.

**Cenários de aceite**:

1. **Dado** um aluno com Treino C na quarta e Treino D na quinta que não executou nada na quarta, **Quando** ele abre a aba Treinos na quinta, **Então** a quarta aparece como não realizada e a quinta (Treino D) como pendente.
2. **Dado** um aluno com Treino A na segunda e na quinta, **Quando** ele finaliza a sessão de Treino A na segunda, **Então** a segunda fica feita e a quinta continua pendente; fazer a segunda não marca a quinta.
3. **Dado** a quarta não realizada e o sábado como dia livre, **Quando** no sábado o aluno abre a quarta pela aba Treinos, executa Treino C e finaliza, **Então** a quarta passa a reposta e o sábado continua como dia livre, sem status.
4. **Dado** um aluno com Treino C na quarta (não realizada) e hoje é quinta com Treino D (pendente), **Quando** ele executa Treino D e, no mesmo dia, em seguida repõe a quarta, **Então** a quinta fica feita e a quarta fica reposta: duas sessões no mesmo dia, cada uma contando para um dia diferente, e a reposição é permitida mesmo com a quinta já feita.
5. **Dado** um aluno com a terça não realizada e a quarta como dia de descanso, **Quando** na quarta ele abre a terça pela aba Treinos e repõe, **Então** a reposição é permitida, a terça fica reposta e a quarta continua como descanso, sem status.
6. **Dado** um aluno com Treino E na sexta, **Quando** na quinta ele tenta iniciar uma sessão para a sexta, **Então** o sistema bloqueia; não existe adiantar dia futuro, e o servidor recusa qualquer sessão ligada a um dia futuro.
7. **Dado** um aluno com a quarta não realizada, **Quando** ele atualiza a aba Treinos depois de 00:00 de segunda em Brasília sem ter reposto, **Então** a quarta da semana anterior não aparece mais como não realizada nem pode ser reposta, e a nova semana começa com todos os dias com ficha publicada como pendentes.
8. **Dado** que são 21:30 de domingo em Brasília (00:30 de segunda em UTC) e a quarta está não realizada, **Quando** o aluno abre a quarta para repor, **Então** a reposição é permitida, porque a semana corrente em Brasília ainda é a mesma.
9. **Dado** um aluno que abre a ficha de terça às 23:40 de terça e mantém a sessão aberta, **Quando** finaliza às 00:15 de quarta (horário de Brasília), **Então** a sessão conta para a terça, que fica feita (o dia foi fixado no início); a quarta continua pendente com a própria ficha.
10. **Dado** um aluno que abre a ficha de domingo às 23:40 de domingo e mantém a sessão aberta, **Quando** finaliza às 00:15 de segunda (horário de Brasília), **Então** o servidor aceita a finalização, a sessão conta para o domingo da semana que acabou (dia fixado no início) e a segunda da nova semana continua pendente.
11. **Dado** a aba Agenda aberta pelo professor na quinta, **Quando** ele observa as linhas, **Então** vê o status de cada dia da semana corrente que tem ficha publicada: segunda a quarta como feito, reposto ou não realizado; quinta a domingo como pendentes; dias de descanso, dias livres e dias que apontam para rascunho sem status.
12. **Dado** um aluno com sessão de Treino A ligada à segunda desta semana, **Quando** o professor troca a ficha da segunda para Treino B, **Então** a segunda continua feita para o professor e para o aluno, mostrando Treino A como a ficha executada, e o histórico da sessão continua apontando para Treino A.
13. **Dado** um aluno com sessão ligada à terça desta semana, **Quando** o professor muda a terça para descanso, para dia livre ou para uma ficha em rascunho, **Então** a terça continua feita (ou reposta) e mostra a ficha executada.
14. **Dado** um dia já feito ou reposto, **Quando** o aluno abre esse dia na aba Treinos, **Então** vê a ficha executada com as cargas registradas e a indicação de concluído, em modo de leitura, sem poder iniciar nova sessão para esse dia.
15. **Dado** um dia livre ou de descanso que já passou e não tem sessão, **Quando** o aluno abre a aba Treinos, **Então** esse dia não aparece como não realizado, porque não havia ficha para fazer.
16. **Dado** um aluno cujo dia de hoje é livre e que tem a quarta não realizada, **Quando** ele abre a home, **Então** vê "Dia livre" e um atalho para repor os dias não realizados.
17. **Dado** um aluno cujo dia de hoje é de descanso (ou já está feito) e que tem a quarta não realizada, **Quando** ele abre a home, **Então** vê o descanso (ou o dia feito) e o mesmo atalho para repor os dias não realizados.
18. **Dado** um aluno com Treino C na quarta (não realizada), hoje é quinta com Treino D (pendente) e uma ficha avulsa "Treino Cardio" publicada, **Quando** ele abre "Treino Cardio" pela seção "Outras fichas" e finaliza a sessão, **Então** a quarta continua não realizada, a quinta continua pendente e a sessão aparece no histórico sem dia.
19. **Dado** um aluno com uma sessão de Treino C em andamento para a quarta, **Quando** o professor troca a ficha da quarta para Treino B durante a sessão e o aluno finaliza, **Então** a finalização é aceita, a sessão conta para a quarta com Treino C, a quarta fica feita mostrando Treino C, e só ao abrir a quarta de novo o aluno veria Treino B.
20. **Dado** um aluno que abriu a ficha de terça na terça, fechou o app sem finalizar e reabre no sábado da mesma semana, **Quando** a sessão em andamento é retomada, **Então** ela continua e, ao finalizar, conta para a terça, que fica feita.
21. **Dado** um aluno que abriu a ficha de domingo no domingo, fechou o app sem finalizar e reabre na quarta da semana seguinte, **Quando** a sessão em andamento é retomada, **Então** o sistema avisa que a semana daquele dia já acabou e oferece finalizar como sessão sem dia (preservando as cargas) ou descartar; nada é descartado sem a escolha do aluno.
22. **Dado** um aluno com a segunda feita com Treino A, **Quando** o professor volta Treino A a rascunho, **Então** a segunda continua feita e mostra só o título "Treino A" em modo de leitura, com as cargas da sessão, sem permitir abrir os exercícios atuais do rascunho.
23. **Dado** um aluno com a segunda feita com Treino A, **Quando** o professor exclui Treino A, **Então** a sessão e as cargas continuam no histórico, a segunda continua feita mostrando o título "Treino A", e os outros dias que apontavam para Treino A sem sessão passam a dias livres.
24. **Dado** a aba Agenda aberta na quinta, **Quando** o professor atribui Treino B à terça (dia já passado) e salva, **Então** a terça passa a não realizada para o aluno e para o professor, e o aluno pode repô-la até o fim da semana.
25. **Dado** um aluno que fez Treino A na segunda e repôs a quinta (também Treino A) no sábado, **Quando** o professor abre o perfil do aluno no domingo, **Então** "Frequência da Semana" conta duas sessões e "Últimos Treinos" lista as duas sessões de Treino A, ambas dentro da semana de Brasília.
26. **Dado** uma sessão finalizada às 22:00 de domingo em Brasília, **Quando** o professor abre o perfil do aluno às 23:00 do mesmo domingo, **Então** "Frequência da Semana" e "Últimos Treinos" incluem essa sessão na semana corrente (e não na próxima).

### História 5 - Dia de descanso com recomendações (Prioridade: P2)

Como professor, quero marcar dias de descanso na agenda de um aluno e escrever recomendações em texto livre para aquele aluno e aquele dia, para orientar o que ele faz fora do treino de musculação.

**Por que esta prioridade**: Pedido explícito, mas não bloqueia o treino do dia nem a reposição.

**Teste independente**: Marcar um dia como descanso com texto na aba Agenda e conferir o texto na home do aluno (no dia) e na linha do dia na aba Treinos.

**Cenários de aceite**:

1. **Dado** a aba Agenda aberta, **Quando** o professor marca a quarta como descanso e escreve "Mobilidade de quadril e 20 minutos de bicicleta leve" e salva, **Então** o texto fica salvo para aquele aluno e aquele dia, sem afetar outros alunos nem outros dias.
2. **Dado** a quarta marcada como descanso com texto, **Quando** o aluno abre a home na quarta, **Então** vê a indicação de dia de descanso e o texto do professor, sem treino do dia.
3. **Dado** a quarta marcada como descanso com texto, **Quando** o aluno abre a aba Treinos em qualquer dia, **Então** a linha de quarta mostra a indicação de descanso e o texto.
4. **Dado** a aba Agenda aberta, **Quando** o professor marca descanso sem escrever texto, **Então** o dia é salvo como descanso e o aluno vê apenas a indicação de descanso, sem texto padrão.
5. **Dado** um dia de descanso com texto e sem sessão ligada, **Quando** o professor troca o dia para uma ficha, **Então** o texto de descanso daquele dia deixa de ser exibido ao aluno.
6. **Dado** a aba Agenda aberta, **Quando** o professor escreve um texto de descanso com 501 caracteres e salva, **Então** o sistema recusa e informa o limite de 500 caracteres; com 500 caracteres, salva.

### História 6 - Anamnese com dias disponíveis e rascunhos da IA apontados na agenda (Prioridade: P3)

Como professor, quero que a anamnese registre em quais dias da semana o aluno pode treinar, em vez de apenas quantos dias, e que o rascunho de fichas gerado pela IA já aponte os dias marcados para as fichas em rascunho, para revisar e publicar com menos trabalho.

**Por que esta prioridade**: Melhora o fluxo de prescrição, mas o professor consegue montar a agenda manualmente sem isso.

**Teste independente**: Cadastrar um aluno pelo funil marcando dias específicos, gerar o rascunho por IA e conferir, na aba Agenda, que os dias marcados apontam para as fichas em rascunho e os demais estão livres.

**Cenários de aceite**:

1. **Dado** o passo "Estilo de Vida" do funil, **Quando** o visitante tenta avançar sem marcar nenhum dia, **Então** o funil bloqueia o avanço e pede ao menos um dia; se o cadastro chegar ao servidor sem nenhum dia marcado, o servidor recusa.
2. **Dado** o passo "Estilo de Vida" do funil, **Quando** o visitante marca segunda, quarta e sexta, **Então** a anamnese registra esses três dias, e o número de dias por semana exibido ao professor é 3 (derivado, não digitado).
3. **Dado** o modal de anamnese do professor, **Quando** ele salva sem marcar dias, **Então** a anamnese é salva normalmente (campo opcional para o professor).
4. **Dado** um aluno com segunda, quarta e sexta marcadas na anamnese e agenda sem nenhum dia com ficha ou descanso, **Quando** o rascunho por IA é gerado, **Então** são pedidas três fichas em rascunho à IA, a segunda-feira passa a apontar para a primeira, a quarta para a segunda e a sexta para a terceira, os demais dias ficam livres e nenhum dia recebe texto de descanso.
5. **Dado** um aluno novo do funil cuja agenda foi preenchida só com rascunhos da IA, **Quando** ele abre a home antes da publicação, **Então** vê "Seu professor está montando sua agenda", porque nenhum dia tem ficha publicada nem descanso.
6. **Dado** dias da agenda apontando para as fichas em rascunho criadas pela IA, **Quando** o professor revisa, ajusta e publica as fichas, **Então** o aluno passa a ver as fichas nesses dias e recebe o push de publicação, como hoje.
7. **Dado** um aluno com cinco dias marcados, **Quando** a IA devolve três fichas, **Então** os três primeiros dias marcados passam a apontar para elas, os outros dois dias marcados ficam livres e a divergência fica registrada para o professor ver na revisão.
8. **Dado** um aluno com três dias marcados, **Quando** a IA devolve cinco fichas, **Então** os três dias marcados apontam para as três primeiras, as duas excedentes ficam como rascunhos fora da agenda e a divergência fica registrada para o professor ver na revisão.
9. **Dado** um aluno com segunda e quarta marcadas, a segunda já apontando para Treino A publicado e a quarta livre, **Quando** o rascunho por IA é gerado, **Então** só a quarta passa a apontar para um rascunho da IA; a segunda continua com Treino A.
10. **Dado** um aluno com segunda e quarta marcadas, ambas já com ficha ou descanso, **Quando** o rascunho por IA é gerado, **Então** as fichas são criadas em rascunho sem nenhum dia da agenda ser alterado, e o professor atribui manualmente.
11. **Dado** um aluno sem nenhum dia marcado na anamnese (anamnese legada com o número 4, modal salvo sem dias, ou sem anamnese), **Quando** o rascunho por IA é gerado, **Então** são pedidas 4 fichas (ou 3, quando não há número) e nenhum dia da agenda passa a apontar para os rascunhos; o professor continua vendo o número legado enquanto não houver dias marcados.

### Casos de borda

- **Aluno sem dia com ficha publicada nem descanso, mas com fichas avulsas publicadas**: a home mostra "Seu professor está montando sua agenda" e a aba Treinos mostra os sete dias livres mais a seção "Outras fichas" com as avulsas executáveis.
- **Todos os dias como descanso**: a agenda está configurada; a home mostra o descanso de hoje e nunca a mensagem de "montando sua agenda".
- **Ficha publicada que o professor volta a rascunho enquanto está na agenda**: os dias que apontam para ela e não têm sessão passam a aparecer como livres para o aluno; os dias com sessão ligada mantêm o status feito ou reposto e mostram só o título da ficha executada, em modo de leitura, com as cargas da sessão (RF-013).
- **Ficha excluída que estava na agenda**: as sessões e o título exibido são preservados; os dias com sessão continuam feitos ou repostos; os dias sem sessão viram livres; o professor é avisado antes de excluir (RF-014).
- **Ficha apontada por um dia já feito**: a ficha exibida no dia é a executada na sessão, não a que o dia aponta hoje.
- **Professor troca a ficha do dia enquanto o aluno tem uma sessão em andamento**: a sessão continua com a ficha iniciada e, ao finalizar, conta para o dia com essa ficha (RF-021).
- **Sessão em andamento salva localmente antes da entrega**: ao retomar, conta para hoje se a ficha for a de hoje; senão como reposição de um dia passado não realizado da semana corrente com a mesma ficha; senão é finalizada sem dia, preservando as cargas (RF-049).
- **Sessão abandonada e retomada dias depois**: continua se a semana do dia ligado ainda for a corrente; senão o sistema avisa e oferece finalizar sem dia ou descartar (RF-022).
- **Professor atribui ficha a um dia que já passou na semana corrente, ou monta a agenda de aluno novo no meio da semana**: vale a regra geral (dia passado com ficha publicada e sem sessão é não realizado, reponível até o fim da semana) e o professor é avisado ao atribuir (RF-024).
- **Ficha que está em um dia e a seção "Outras fichas"**: a seção "Outras fichas" só lista fichas publicadas que não estão em nenhum dia; uma ficha que está em qualquer dia (mesmo em vários) nunca aparece em "Outras fichas".
- **Aluno com a aba Treinos aberta na virada da semana**: a tela reflete a semana corrente no momento em que os dados foram carregados; a nova semana aparece ao atualizar depois de 00:00 de segunda em Brasília.
- **Dia passado que aponta para rascunho**: sem status para o aluno (dia livre) e para o professor (linha com a indicação de rascunho, sem status).
- **Horário de verão**: hoje o horário de Brasília não tem horário de verão; se voltar a ter, a semana e o dia seguem o horário oficial de Brasília, não um deslocamento fixo em relação ao UTC.
- **Aluno com plano bloqueado ou pendente**: as regras de paywall atuais continuam valendo antes de qualquer tela de agenda; esta funcionalidade não muda o paywall.

## Requisitos

### Requisitos funcionais

Modelo e treino do dia

- **RF-001**: O sistema DEVE manter, para cada aluno, uma agenda semanal com exatamente sete dias (segunda a domingo), em que cada dia aponta para uma ficha do aluno, para um dia de descanso ou para nada (dia livre).
- **RF-002**: O sistema DEVE permitir que a mesma ficha seja atribuída a mais de um dia da agenda do mesmo aluno.
- **RF-003**: O sistema DEVE determinar o treino do dia exclusivamente pela ficha atribuída ao dia da semana de hoje no horário de Brasília. O rodízio por última ficha concluída (home e aba Treinos) DEVE deixar de existir, e o bloqueio semanal por ficha (abertura de uma ficha) DEVE deixar de existir.
- **RF-004**: O sistema DEVE considerar como semana corrente o período de segunda 00:00:00 a domingo 23:59:59 no horário de Brasília que contém o dia de hoje, independentemente do fuso do servidor ou do dispositivo do aluno.
- **RF-005**: O sistema DEVE tratar um dia que aponta para uma ficha em rascunho como dia livre para o aluno (home e aba Treinos), sem revelar o título nem a existência do rascunho, até a ficha ser publicada. Rascunhos DEVEM ser inacessíveis ao aluno por qualquer meio, inclusive pela abertura direta da ficha. A única exceção é o dia já feito ou reposto cuja ficha executada voltou a rascunho (RF-013).
- **RF-006**: O sistema DEVE considerar ficha avulsa toda ficha publicada do aluno que não está em nenhum dia da agenda, e DEVE permitir ao aluno executá-la em qualquer dia sem que a sessão conte para dia algum.
- **RF-007**: O sistema DEVE tratar as fichas no status legado que o aluno hoje enxerga como publicadas como fichas publicadas, na migração, na regra de ficha avulsa e nas validações do servidor.

Sessão, reposição e status

- **RF-008**: O sistema DEVE ligar cada sessão de treino iniciada a partir da agenda a no máximo um dia da agenda da semana corrente, e esse dia DEVE ser fixado no início da sessão: o dia de hoje em Brasília ou um dia já passado da semana corrente no momento do início. A sessão fica sem dia nos casos do RF-022 e do RF-049.
- **RF-009**: O servidor NÃO DEVE aceitar o início de sessão ligada a um dia futuro nem a um dia fora da semana corrente, avaliados no momento do início; o servidor DEVE aceitar a finalização de uma sessão cujo dia foi fixado no início, mesmo que a finalização aconteça depois da meia-noite ou depois da virada da semana. Essa regra DEVE ser aplicada no servidor, não apenas na interface.
- **RF-010**: O sistema DEVE derivar o status de cada dia da semana corrente a partir da existência de uma sessão ligada àquele dia: feito (sessão iniciada no próprio dia), reposto (sessão iniciada em dia posterior da mesma semana), não realizado (dia passado com ficha publicada e sem sessão) e pendente (dia de hoje ou futuro com ficha publicada e sem sessão). O status vale pela data do dia ligado, não pela data de fim da sessão.
- **RF-011**: Um dia com sessão ligada na semana corrente DEVE mostrar o status feito ou reposto e a ficha executada na sessão, mesmo que o dia aponte hoje para outra ficha, para uma ficha em rascunho, para descanso, para nada ou para uma ficha excluída. A sessão prevalece sobre o que o dia aponta no momento.
- **RF-012**: Um dia sem sessão ligada que é dia de descanso ou dia livre (inclusive o que aponta para rascunho) NÃO DEVE ter status de execução, nem para o aluno nem para o professor; ele nunca aparece como não realizado nem como pendente.
- **RF-013**: Quando a ficha executada em um dia feito ou reposto voltou a rascunho, o sistema DEVE mostrar ao aluno apenas o título da ficha executada, em modo de leitura, com as cargas registradas na sessão, sem permitir abrir os exercícios atuais do rascunho.
- **RF-014**: Excluir uma ficha NÃO DEVE apagar as sessões de treino nem as cargas dessa ficha, nem o título exibido no histórico e nos dias já feitos ou repostos; os dias sem sessão que apontavam para ela DEVEM passar a dias livres; e o sistema DEVE avisar o professor, antes de confirmar a exclusão, quando a ficha estiver em algum dia da agenda.
- **RF-015**: O sistema DEVE permitir ao aluno abrir um dia passado não realizado da semana corrente e executar a ficha daquele dia como reposição em qualquer dia da semana corrente, inclusive em dia de descanso, em dia livre, em dia pendente de hoje e em dia de hoje já feito.
- **RF-016**: O sistema DEVE preservar no histórico da sessão a ficha efetivamente executada, mesmo que a agenda daquele dia mude depois.
- **RF-017**: O sistema DEVE encerrar a possibilidade de reposição de um dia ao fim da semana corrente (00:00 de segunda em Brasília); dias não realizados de semanas anteriores não são reponíveis nem exibidos como não realizados, nem ao aluno nem ao professor; resta o histórico de sessões.
- **RF-018**: O sistema DEVE manter íntegras todas as sessões de treino anteriores à entrega, com ficha, datas, duração e cargas, sem exigir que estejam ligadas a um dia da agenda.
- **RF-019**: O servidor DEVE determinar ou validar o dia ligado à sessão e o momento de início que define feito ou reposto; esses valores NUNCA DEVEM ser aceitos do dispositivo do aluno sem validação.
- **RF-020**: O servidor DEVE recusar o início de uma sessão nos seguintes casos: ligada a um dia que é livre para o aluno (inclusive dia que aponta para rascunho); ligada a um dia cuja ficha é diferente da ficha que será executada; de ficha avulsa com dia ligado; de ficha não publicada; ou de ficha de outro aluno. A comparação entre a ficha do dia, a publicação e o dia livre é feita no momento do início da sessão.
- **RF-021**: Quando o professor troca a ficha do dia enquanto o aluno tem uma sessão em andamento para esse dia, a sessão DEVE continuar com a ficha com que foi iniciada até ser finalizada ou descartada; ao finalizar, a sessão conta para o dia e o dia fica feito ou reposto com essa ficha; o aluno só vê a ficha nova ao abrir o dia de novo. O progresso do aluno NÃO DEVE ser interrompido nem apagado.
- **RF-022**: Ao retomar uma sessão em andamento guardada localmente, o sistema DEVE continuá-la quando a semana do dia ligado ainda for a semana corrente, contando para esse dia ao finalizar; quando a semana do dia ligado já tiver terminado, o sistema DEVE avisar o aluno e oferecer finalizar como sessão sem dia (preservando as cargas) ou descartar. O sistema NUNCA DEVE descartar uma sessão em andamento em silêncio.
- **RF-023**: Um dia da agenda DEVE receber no máximo uma sessão de treino; ao abrir um dia já feito ou reposto, o sistema DEVE mostrar a ficha executada com as cargas e a indicação de concluído, em modo de leitura, sem permitir iniciar nova sessão para esse dia.
- **RF-024**: Quando o professor atribui uma ficha publicada a um dia já passado da semana corrente (inclusive ao montar a agenda de um aluno no meio da semana), o dia DEVE seguir a regra geral de status (não realizado até ser reposto ou a semana acabar), e a aba Agenda DEVE avisar o professor, no momento da atribuição, que o dia aparecerá como não realizado para o aluno até ser reposto.

Aluno

- **RF-025**: A home do aluno DEVE mostrar, conforme o dia de hoje: a ficha do dia com o status (pendente ou feito); a indicação de dia de descanso com o texto do professor; "Dia livre"; ou "Seu professor está montando sua agenda" quando nenhum dia da agenda tem ficha publicada nem descanso.
- **RF-026**: Quando houver dias não realizados na semana corrente, a home DEVE mostrar um atalho para repor, em dia livre, em dia de descanso e em dia já feito.
- **RF-027**: A aba Treinos do aluno DEVE listar os sete dias na ordem segunda a domingo, com hoje em destaque e, para cada dia: o título da ficha (a executada, se houver sessão ligada; senão a apontada), a indicação de descanso com o texto, ou a indicação de dia livre, mais o status do dia quando houver.
- **RF-028**: A aba Treinos DEVE exibir, abaixo dos sete dias, a seção "Outras fichas" com as fichas avulsas publicadas em ordem alfabética de título, cada uma abrível e executável a qualquer momento.
- **RF-029**: A partir da aba Treinos, o aluno DEVE poder abrir e executar o dia de hoje (quando pendente) e qualquer dia passado não realizado da semana corrente; um dia futuro DEVE abrir apenas em modo de leitura, com o início da sessão desabilitado e a mensagem de que o dia ainda não chegou.

Professor

- **RF-030**: O perfil do aluno DEVE ter uma aba "Agenda" ao lado de "Fichas de Treino", com sete linhas (segunda a domingo) em que o professor escolhe, para cada dia, uma ficha do aluno (publicada ou em rascunho), descanso com texto livre, ou dia livre.
- **RF-031**: A aba Agenda DEVE mostrar, em cada linha, o status do dia na semana corrente (feito, reposto, não realizado, pendente) quando houver, a ficha executada quando houver sessão ligada, e identificar visualmente quando a ficha atribuída está em rascunho; um dia que aponta para rascunho e não tem sessão aparece sem status, só com a indicação de rascunho.
- **RF-032**: Alterações salvas na agenda DEVEM valer imediatamente para o aluno, sem passo de publicação da agenda.
- **RF-033**: O sistema NÃO DEVE enviar notificação push por mudança de agenda; o push continua sendo enviado apenas na publicação de uma ficha, como hoje.
- **RF-034**: O sistema DEVE permitir apenas ao professor editar a agenda e os textos de descanso; o aluno só lê, e o servidor DEVE recusar alterações vindas do aluno.
- **RF-035**: No perfil do aluno, "Frequência da Semana" e "Últimos Treinos" DEVEM usar a semana corrente no horário de Brasília, e "Últimos Treinos" DEVE listar todas as sessões da semana, sem deduplicar por ficha; a contagem de "Frequência da Semana" continua por sessão e as duas seções não mudam de desenho.

Descanso

- **RF-036**: O texto de descanso DEVE ser livre, escrito pelo professor, e pertencer a um aluno e a um dia da semana; não existe texto padrão global nem compartilhado entre alunos.
- **RF-037**: O sistema DEVE aceitar dia de descanso sem texto e, nesse caso, exibir ao aluno apenas a indicação de descanso.
- **RF-038**: O texto de descanso DEVE ter no máximo 500 caracteres, validado no servidor.

Anamnese e IA

- **RF-039**: A anamnese DEVE registrar em quais dias da semana (segunda a domingo) o aluno pode treinar, em vez de um número de dias; o número de dias por semana exibido DEVE ser derivado da quantidade de dias marcados.
- **RF-040**: No passo "Estilo de Vida" do funil, a marcação de dias DEVE ser obrigatória, com pelo menos um dia, validada no servidor; no modal de anamnese do professor, DEVE ser opcional.
- **RF-041**: O rascunho de fichas gerado pela IA DEVE pedir uma ficha em rascunho por dia marcado na anamnese (mantém o comportamento atual, em que a quantidade de fichas pedida é igual ao número de dias; não gera repetição do tipo A/B/A/B) e DEVE apontar cada dia marcado que esteja livre para a ficha em rascunho correspondente, nunca sobrescrevendo um dia que já aponta para ficha ou descanso; se nenhum dia marcado estiver livre, as fichas são criadas em rascunho sem alterar a agenda. Os demais dias ficam como estão; a IA NÃO DEVE escrever texto de descanso nem marcar dias de descanso.
- **RF-042**: Sem nenhum dia marcado na anamnese (anamnese legada só com o número, modal salvo sem dias, ou aluno sem anamnese), o rascunho por IA DEVE pedir a quantidade de fichas igual ao número legado (ou 3, quando não há número) e NÃO DEVE apontar nenhum dia da agenda para os rascunhos; o professor continua vendo o número legado enquanto não houver dias marcados.
- **RF-043**: Quando a IA devolve menos fichas que os dias marcados, os primeiros dias marcados DEVEM apontar para as fichas devolvidas e os demais dias marcados ficam livres; quando devolve mais, os dias marcados apontam para as primeiras e as excedentes ficam como rascunhos fora da agenda; em ambos os casos a divergência DEVE ficar registrada para o professor ver na revisão.
- **RF-044**: Os dias da agenda que apontam para rascunhos criados pela IA só se tornam visíveis ao aluno quando essas fichas são publicadas pelo professor (consequência do RF-005).

Migração na entrega

- **RF-045**: Na entrega, o sistema DEVE montar a agenda de cada aluno a partir das fichas publicadas, em ordem alfabética de título com ordenação natural (números comparados pelo valor), sem diferenciar acentos nem maiúsculas, com desempate pela data de criação (mais antiga primeiro): a primeira na segunda, a segunda na terça, e assim até a sétima no domingo, sem repetir ficha; os dias restantes ficam livres.
- **RF-046**: Na migração, da oitava ficha publicada em diante (na mesma ordem) as fichas DEVEM permanecer publicadas e fora da agenda, ou seja, como fichas avulsas.
- **RF-047**: Na migração, fichas em rascunho DEVEM ficar fora da agenda.
- **RF-048**: A migração NÃO DEVE alterar agendas já existentes (agenda existente é a que tem ao menos um dia apontando para ficha ou descanso; uma agenda com os sete dias livres não conta como existente) e NÃO DEVE apagar nem alterar sessões existentes.
- **RF-049**: Ao retomar uma sessão em andamento guardada localmente antes da entrega (que conhece a ficha, mas não o dia), o sistema DEVE ligá-la ao dia de hoje se a ficha for a do dia de hoje na agenda; senão, a um dia passado não realizado da semana corrente que aponte para a mesma ficha, como reposição; caso contrário, DEVE finalizá-la como sessão sem dia, preservando as cargas. O progresso NUNCA DEVE ser descartado sem avisar o aluno.

### Entidades-chave (sem detalhe de implementação)

- **Agenda semanal**: pertence a um aluno; composta por exatamente sete dias da agenda, um por dia da semana (segunda a domingo).
- **Dia da agenda**: dia da semana; tipo (ficha, descanso ou livre); a ficha apontada quando o tipo é ficha; o texto de recomendação (até 500 caracteres) quando o tipo é descanso. Um dia aponta para no máximo uma ficha; a mesma ficha pode aparecer em vários dias.
- **Ficha**: já existe; ganha a característica derivada "avulsa" (publicada e ausente de todos os dias da agenda). Publicada ou rascunho continuam como hoje; o título de uma ficha excluída continua disponível para o histórico e os dias já feitos.
- **Sessão de treino**: já existe (aluno, ficha executada, início, fim, duração, cargas); passa a ter o dia da agenda para o qual conta, identificado pela data e fixado no início da sessão (ou nenhum, no caso de ficha avulsa, das sessões anteriores à entrega e das sessões finalizadas sem dia).
- **Status do dia**: valor derivado: feito, reposto, não realizado ou pendente; calculado a partir das sessões da semana corrente ligadas ao dia e do que o dia aponta, com a sessão prevalecendo.
- **Anamnese**: já existe; o campo "quantos dias por semana" dá lugar a "em quais dias pode treinar" (conjunto de dias da semana); o número passa a ser derivado.

## Critérios de sucesso

- **CS-001**: Para qualquer aluno com agenda configurada, o treino do dia exibido na home corresponde à ficha do dia da semana de hoje em Brasília em 100% dos casos testados, inclusive entre 21:00 e 23:59 de Brasília.
- **CS-002**: Um dia não realizado nunca aparece como treino do dia em um dia seguinte; o caso relatado (ficha de quarta não executada, quinta mostra a ficha de quarta) não se reproduz após a entrega.
- **CS-003**: Após a migração, todo aluno com ao menos uma ficha publicada tem ao menos um dia da agenda com ficha, e nenhum aluno com oito ou mais fichas publicadas perde acesso a qualquer ficha (as excedentes aparecem em "Outras fichas").
- **CS-004**: A quantidade de sessões de treino e de cargas registradas é idêntica antes e depois da migração, e continua idêntica depois de o professor excluir qualquer ficha.
- **CS-005**: O professor consegue montar a agenda completa de um aluno (sete dias, com ao menos um descanso com texto) sem sair do perfil do aluno e sem nenhum passo além de escolher cada dia e salvar.
- **CS-006**: Uma reposição feita em um sábado livre para a quarta deixa a quarta como reposta e o sábado como dia livre, sem status, em 100% dos casos testados; uma tentativa de iniciar sessão ligada a um dia futuro é recusada em 100% dos casos, inclusive por chamada direta ao servidor.
- **CS-007**: Todo cadastro novo pelo funil tem ao menos um dia da semana marcado na anamnese, verificado no servidor.
- **CS-008**: Uma sessão iniciada às 23:40 de domingo e finalizada às 00:15 de segunda (Brasília) conta para o domingo em 100% dos casos testados, e nenhuma sessão em andamento é descartada sem escolha do aluno.

## Premissas

- O horário de Brasília vale para todos os alunos e para o professor, inclusive alunos que estejam em outros fusos do Brasil ou fora dele; é a única referência de dia e semana.
- "Hoje" e "semana corrente" são calculados no servidor pelo horário de Brasília, não pelo relógio do dispositivo do aluno.
- A entrega desta fase acontece logo após 00:00 de uma segunda-feira no horário de Brasília; por isso não existem sessões da semana corrente anteriores à entrega, e a primeira semana com agenda começa limpa.
- A migração roda uma única vez, no momento da entrega, para todos os alunos existentes, respeitando o RF-048.
- O comportamento de paywall, primeiro login e notificações de publicação não muda.
- Esta fase não altera o visual nem a biblioteca de UI (Fase 3); as novas telas seguem o padrão visual atual.

## Fora de escopo

- Gamificação (sequências, pontos, medalhas).
- Texto padrão de descanso, global ou por professor.
- Adiantar um dia futuro.
- Notificação push por mudança de agenda.
- Mudanças visuais ou troca de biblioteca de UI (Fase 3).
- Idade e data de nascimento na anamnese (Fase 1, especificada à parte).
- Redesenho das seções "Frequência da Semana" e "Últimos Treinos" do perfil do aluno (só o mínimo do RF-035).
- Como consequência do modelo de uma agenda de sete dias: agenda com mais de uma semana (periodização) ou por data específica; mais de uma ficha no mesmo dia; relatórios de adesão além do status da semana corrente.

## Notas

- Comportamento atual que esta spec substitui: a home e a aba Treinos escolhem a "próxima" ficha pela última sessão finalizada em ordem alfabética (rodízio); a abertura de uma ficha bloqueia a execução quando já existe sessão dessa ficha desde a segunda 00:00 no horário do servidor. Os três pontos (rodízio, bloqueio por ficha e semana no horário do servidor) deixam de existir nas telas do aluno e na aba Agenda; o histórico do professor passa para a semana de Brasília pelo RF-035.
- A ADR 0002 registra a decisão de que a sessão conta para o dia da agenda, não para a ficha, e as alternativas descartadas.
- Hoje o rascunho da IA pede N fichas, sem garantia de que a IA devolva N (tratado no RF-043), em que N é o número de dias por semana da anamnese (padrão 3 quando ausente). Com os dias marcados, N passa a ser a quantidade de dias marcados.
- A sessão em andamento do aluno é guardada localmente no dispositivo por ficha e não expira; com a agenda, a sessão em andamento passa a saber também para qual dia conta (RF-022 e RF-049).
- O início da sessão e o dia ligado a ela são determinados ou validados pelo servidor, nunca aceitos do dispositivo do aluno; os RF-019 e RF-020 decorrem da decisão de aplicar as regras no servidor.
- Hoje excluir uma ficha apaga a ficha e seus exercícios, e o efeito sobre as sessões depende de uma regra do banco que não está versionada; o RF-014 fixa o comportamento esperado.
- A anamnese atual do funil só oferece as opções de 3 a 6 dias; a marcação por dia da semana permite de 1 a 7.
- Consequências do modelo, não decisões tomadas com o Mauri: descanso sem texto é aceito (RF-037), porque o texto é livre e nada exige preenchimento; ficha avulsa pode ser executada quantas vezes o aluno quiser (RF-006), porque não há dia nem bloqueio ligado a ela.
- O histórico do professor no perfil do aluno usa hoje a semana no horário do servidor: "Frequência da Semana" conta sessões na semana do servidor (fichas avulsas inclusive); "Últimos Treinos" mostra só a sessão mais recente de cada ficha na semana. O RF-035 corrige a semana e a deduplicação.
- Diferença entre os RF-009 e RF-022: a sessão que atravessa a meia-noite ou a virada da semana com o app aberto é finalizada normalmente e conta para o dia fixado no início; o aviso com a opção de finalizar sem dia só aparece ao reabrir o app com uma sessão guardada localmente cuja semana já terminou.

## Esclarecimentos

### Sessão 2026-10-17

- P: O que o aluno vê quando o professor troca a ficha do dia durante uma sessão em andamento? -> R: A sessão continua com a ficha iniciada até finalizar ou descartar; ao finalizar, o dia fica feito ou reposto com essa ficha; a ficha nova só aparece ao abrir o dia de novo; o progresso nunca é apagado (RF-021).
- P: O que fazer com uma sessão em andamento guardada localmente antes da entrega, que conhece a ficha mas não o dia? -> R: Conta para hoje se a ficha for a de hoje; senão como reposição de um dia passado não realizado da semana corrente com a mesma ficha; senão finaliza sem dia, preservando as cargas; nunca descartar sem avisar (RF-049).
- P: Um dia já feito ou reposto pode receber uma segunda sessão? -> R: Não; o dia concluído abre em modo de leitura; treino extra é feito por ficha avulsa (RF-023).
- P: O que acontece ao excluir uma ficha que está na agenda? -> R: Excluir não apaga sessões, cargas nem o título exibido; os dias com sessão continuam feitos ou repostos com o título; os dias sem sessão viram livres; o professor é avisado antes de excluir (RF-014).
- P: O dia da sessão é fixado no início ou no fim da sessão? -> R: No início. A sessão de terça 23:40 finalizada na quarta 00:15 conta para terça; a de domingo 23:40 finalizada na segunda 00:15 conta para domingo, e o servidor aceita essa finalização mesmo após a virada (RF-008, RF-009, RF-010).
- P: Como tratar sessões da semana corrente finalizadas antes da entrega? -> R: A entrega acontece logo após segunda 00:00 (Brasília), então não existem sessões da semana corrente anteriores à entrega (premissa de entrega).
- P: Como tratar as fichas no status legado que o aluno hoje enxerga como publicadas? -> R: Como publicadas, na migração, na regra de ficha avulsa e nas validações do servidor (RF-007).
- P: Em que ordem aparecem as "Outras fichas"? -> R: Ordem alfabética de título (RF-028).
- P: O rascunho por IA mexe na agenda de um aluno que já tem agenda? -> R: Só preenche dias marcados que estão livres, nunca sobrescreve; se nenhum dia marcado estiver livre, cria os rascunhos sem tocar na agenda (RF-041).
- P: E o rascunho por IA sem dias marcados (anamnese legada, modal sem dias, sem anamnese)? -> R: Pede o número legado de fichas (ou 3) e não aponta nenhum dia; o professor vê o número legado enquanto não houver dias marcados (RF-042).
- P: A reposição é permitida em dia de descanso e em dia de hoje já feito, e o atalho aparece nesses dias? -> R: Sim, opção (a): reposição em qualquer dia da semana corrente, inclusive descanso e dia já feito; o atalho aparece também nesses dias (RF-015, RF-026).
- P: O aluno pode visualizar um dia futuro sem executar? -> R: Sim, em modo de leitura, com o início desabilitado e a mensagem de que o dia ainda não chegou (RF-029).
- P: Qual o limite do texto de descanso? -> R: 500 caracteres, validado no servidor (RF-038).
- P: Qual o status, para o professor, de um dia passado que aponta para rascunho? -> R: Sem status de execução, só com a indicação de rascunho (RF-012, RF-031).
- P: O que acontece com uma sessão abandonada e retomada dias depois, inclusive na semana seguinte? -> R: Continua se a semana do dia ligado ainda for a corrente; senão o sistema avisa e oferece finalizar sem dia (preservando as cargas) ou descartar; nunca descarta em silêncio (RF-022).
- P: E se a IA devolve menos ou mais fichas que os dias marcados? -> R: Menos: primeiros dias marcados apontam para as devolvidas, demais ficam livres; mais: excedentes ficam como rascunhos fora da agenda; a divergência fica registrada para o professor (RF-043).
- P: O histórico do professor ("Frequência da Semana" e "Últimos Treinos") entra no escopo? -> R: Entra o mínimo: semana em Brasília nas duas seções e "Últimos Treinos" sem deduplicar por ficha; sem redesenho (RF-035).
- P: Abrir exceção para atribuição retroativa ou agenda montada no meio da semana? -> R: Não; vale a regra geral (dia passado sem sessão é não realizado, reponível até o fim da semana) e a aba Agenda avisa o professor ao atribuir ficha a dia passado (RF-024).
- P: Qual o critério de ordenação alfabética na migração? -> R: Ordenação natural (números pelo valor), sem diferenciar acentos nem maiúsculas, desempate pela data de criação (RF-045).
- P: O que mostrar em um dia já feito cuja ficha executada voltou a rascunho? -> R: Exceção restrita ao dia feito ou reposto: só o título da ficha executada, em leitura, com as cargas da sessão, sem abrir os exercícios atuais do rascunho (RF-013).
