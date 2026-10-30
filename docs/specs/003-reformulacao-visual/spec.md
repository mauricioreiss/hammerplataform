# Especificação: Reformulação visual

**Branch**: `003-reformulacao-visual` | **Criada em**: 2026-10-17 | **Status**: Aprovada
**Entrada**: O Mauri, desenvolvedor do projeto, pediu "melhorias no frontend, visual seguindo as cores da logo, um app bem bonito e interativo" e escolheu o Material UI como biblioteca de componentes, por preferência estética, conforme o ADR 0001. A fase troca a aparência e a interação de toda a plataforma (app do aluno, painel do professor, login e landing) sem mudar o que ela faz.

## Problema e motivação

A plataforma funciona, mas a aparência denuncia que foi montada tela a tela, sem um sistema:

- **A marca não está no app.** A logo é prata escovada sobre grafite e preto; o app usa vermelho como cor principal, com brilhos vermelhos em botões, barras e cronômetro. O cabeçalho mostra um "FH" em texto comum, não a marca. O ícone do app instalado não declara finalidade de máscara e traz o nome completo em texto, ilegível em tamanho pequeno; a imagem de fundo do login carrega uma marca d'água de ferramenta de IA no canto.
- **Não há componentes, há variações.** Modais, menus, abas e seletores foram feitos à mão em cada tela, cada um de um jeito. Dois lugares ainda usam os popups nativos do navegador (um aviso no gerenciador de push e a confirmação de exclusão de ficha). Rótulos de 8 a 10 pixels, botões que são contêineres clicáveis e uma fonte de interface que não chega a ser aplicada completam o quadro.
- **Acessibilidade e detalhes de plataforma ficaram para trás.** Modal não fecha com Escape nem prende o foco; botões de ícone não têm rótulo; o app instalado no iPhone não respeita a área do notch; os ícones referenciados pelas notificações push não existem.
- **O app é discreto nos momentos que importam.** O fluxo da sessão já reage: concluir uma série abre o intervalo, o fim do intervalo fecha o cronômetro sozinho e abre o próximo exercício, e finalizar mostra "Treino Finalizado!" com o tempo total. Mas tudo acontece só na tela: não há vibração ao concluir a série, o intervalo termina em silêncio (o aluno precisa ficar olhando o celular para saber que acabou) e a finalização é um botão verde com uma linha de texto, sem resumo nem comemoração.

A reformulação resolve isso com um tema próprio derivado da logo sobre uma biblioteca de componentes (decisão registrada no ADR 0001), um conjunto único de componentes padronizados, correção de acessibilidade e de PWA, e microinterações com propósito. O comportamento funcional da plataforma, incluindo a agenda semanal entregue na Fase 2, não muda; além das mudanças decididas (RF-021, RF-022, RF-024), as únicas mudanças derivadas são o RF-023 e o RF-025, justificados no próprio texto.

## Quem usa

- **Aluno**: usa o app instalado no celular, dentro da academia, muitas vezes com uma mão, suado, sob luz forte ou fraca, entre uma série e outra. Precisa de alvos de toque grandes, números legíveis de longe e retorno imediato ao tocar. É a prioridade desta fase.
- **Professor**: usa o painel no computador durante a prescrição e no celular no dia a dia (confirmar pagamento, olhar quem treinou). Precisa de densidade de informação sem perder a consistência com o app do aluno. É também o dono da marca: aprova o redesenho vetorial do "FH" antes de ele entrar no app e, ele ou o Mauri, a tela de amostra com a paleta e a tipografia antes de elas serem replicadas no resto do app.
- **Visitante**: chega pela landing, percorre o funil de cadastro e cai no login. É o primeiro contato com a marca.

## Cenários de uso e testes (obrigatório)

### História 1 - Fundação: identidade, tema e componentes (Prioridade: P1)

Antes de qualquer tela ser redesenhada, existe um único tema derivado da logo (paleta, tipografia, ícones, movimento) e um conjunto de componentes padronizados que todas as telas passam a usar. A marca "FH" é redesenhada em vetor e submetida ao professor. A home do aluno, com a paleta, a tipografia e os componentes aplicados, serve de tela de amostra e é aprovada pelo Mauri ou pelo professor antes de o tema ser replicado nas demais telas; essa aprovação é a trava desta história. Nada de visual padrão da biblioteca escolhida: o tema é 100% próprio.

**Por que esta prioridade**: todas as outras histórias consomem o tema e os componentes. Sem fundação, cada tela voltaria a inventar sua variação, que é o problema que esta fase resolve.

**Teste independente**: a tela de amostra (a home do aluno com a paleta e a tipografia aplicadas) mais uma página interna de componentes exibem cada componente padronizado em cada estado, com as fontes e os ícones da fase. É possível verificar contraste, foco, teclado e "reduzir movimento" nessas telas sem depender das demais histórias, e registrar a aprovação da tela de amostra antes de qualquer outra tela ser alterada.

**Cenários de aceite**:

1. **Dado** a tela de amostra com todos os componentes, **Quando** se inspeciona qualquer cor em uso, **Então** ela pertence à paleta monocromática metálica ou a uma das três cores de status (verde, âmbar, vermelho); nenhuma cor é definida fora do tema.
2. **Dado** a tela de amostra, **Quando** se inspeciona qualquer texto, **Então** ele é renderizado em Montserrat, exceto títulos curtos e números grandes, renderizados em Michroma.
3. **Dado** qualquer ícone do sistema, **Quando** se verifica a origem, **Então** ele pertence aos Material Icons no estilo Sharp; nenhum ícone da família anterior permanece.
4. **Dado** um modal padronizado aberto, **Quando** o aluno ou o professor pressiona Escape, **Então** o modal fecha e o foco volta ao elemento que o abriu; **Quando** navega com Tab, **Então** o foco circula apenas dentro do modal.
5. **Dado** o redesenho vetorial do "FH", **Quando** ele é apresentado ao professor, **Então** o professor aprova ou pede ajuste antes de a marca aparecer em cabeçalho, tela de abertura ou ícone do app.
6. **Dado** o sistema com "reduzir movimento" ativado, **Quando** qualquer componente anima, **Então** a animação não essencial (definida no RF-020) é suprimida ou substituída por uma troca instantânea de estado, sem perda de informação.
7. **Dado** a tela de amostra, **Quando** se compara cada componente com o visual padrão da biblioteca, **Então** nenhuma cor, fonte, elevação, efeito de toque ou forma padrão da biblioteca é reconhecível (ver RF-007).
8. **Dado** a home do aluno com a paleta e a tipografia aplicadas, **Quando** é apresentada ao Mauri ou ao professor, **Então** a aprovação é registrada antes de qualquer outra tela receber o tema; sem a aprovação, nenhuma outra tela é alterada (RF-035).

### História 2 - App do aluno: navegação e telas (Prioridade: P1)

O aluno abre o app instalado e encontra a nova identidade em todas as telas: início (treino do dia, alerta de pagamento, convite para instalar), aba Treinos (agenda semanal de segunda a domingo e "Outras fichas"), Evolução (gráficos), Assinatura (PIX e status do plano), troca de senha, cabeçalho com avatar e notificações, navegação inferior no celular e superior no computador. Toda tela que carrega dados mostra um esqueleto com a geometria final enquanto carrega; os estados e as mensagens da agenda são os definidos na Fase 2.

**Por que esta prioridade**: o aluno é quem usa a plataforma todo dia e quem o professor quer impressionar; é a primeira entrega da ordem combinada.

**Teste independente**: com a Fase 2 entregue, um aluno com agenda preenchida (um dia feito, um não realizado, um dia de descanso, um dia livre, uma ficha avulsa) percorre todas as abas em um celular de 320 px de largura e em um iPhone com notch instalado como PWA; nenhuma tela mostra rolagem horizontal, conteúdo sob a barra de status ou sob a barra inicial.

**Cenários de aceite**:

1. **Dado** o aluno na aba Treinos, **Quando** a agenda semanal é exibida, **Então** cada dia mostra o que a Fase 2 define (ficha com status do dia, dia de descanso com texto, dia livre, hoje em destaque) por ícone e texto, com cor de status apenas onde há status do dia: verde para feito ou reposto, âmbar para não realizado, nenhuma cor cromática para pendente, dia de descanso ou dia livre.
2. **Dado** uma tela que ainda está carregando, **Quando** o conteúdo chega, **Então** o esqueleto é substituído pelo conteúdo sem deslocamento de layout.
3. **Dado** o aluno cuja agenda está vazia, **Quando** abre o início ou a aba Treinos, **Então** vê as mensagens e os estados definidos na Fase 2 ("Seu professor está montando sua agenda", sete dias livres, "Outras fichas"), com os componentes padronizados desta fase.
4. **Dado** o aluno no computador, **Quando** navega entre as abas, **Então** a navegação superior indica a aba ativa por mais de um sinal (não apenas cor) e o conteúdo é o mesmo layout responsivo do celular adaptado à largura, sem tela própria de computador.
5. **Dado** o aluno com o plano vencendo, **Quando** abre o início, **Então** o alerta de pagamento usa o componente de aviso padronizado em âmbar e leva à Assinatura; **Dado** o plano atrasado, **Então** o mesmo componente em vermelho.
6. **Dado** uma falha ao carregar os dados de uma tela de leitura, **Quando** a tela é exibida, **Então** ela mostra o estado vazio existente (na agenda, as mensagens da Fase 2), como hoje; a separação entre erro e vazio está fora de escopo desta fase.

### História 3 - Sessão de treino com momentos de interatividade (Prioridade: P1)

Durante a sessão de treino, o aluno vê o título da ficha, o cronômetro da sessão em números grandes, a barra de progresso e a lista de exercícios em cards expansíveis. Ao registrar a carga e tocar na série, o aparelho vibra brevemente. O intervalo abre em um cronômetro redesenhado; ao terminar, o aparelho emite um som e vibra, e o fluxo segue como hoje: o cronômetro fecha e o próximo exercício ou a próxima série fica em destaque. Ao finalizar a sessão de treino, uma tela de comemoração mostra o resumo da sessão. Nada do fluxo muda: carga obrigatória antes da série, séries em ordem, intervalo entre séries, finalização só com 100%.

**Por que esta prioridade**: é o momento central do produto e o único em que o pedido de "app interativo" é sentido fisicamente pelo aluno.

**Teste independente**: um aluno executa uma ficha de dois exercícios com duas séries cada, em um Android (vibra) e em um iPhone (não vibra), com o aparelho no silencioso e fora dele, colocando o app em segundo plano durante um intervalo. O fluxo completo deve terminar na comemoração nos quatro casos.

**Cenários de aceite**:

1. **Dado** um exercício com carga válida registrada, **Quando** o aluno toca na próxima série, **Então** a série é marcada, o aparelho vibra brevemente se houver suporte, o chip da série muda para o estado concluído (verde) com animação curta, e o intervalo abre como hoje.
2. **Dado** o intervalo em andamento, **Quando** a contagem chega a zero, **Então** o aparelho vibra e emite um som (quando o sistema permitir) e o fluxo segue como hoje, sem toque adicional: o cronômetro fecha e a próxima série ou o próximo exercício fica em destaque (ver Notas, consequências da decisão "comportamento não muda").
3. **Dado** o intervalo em andamento, **Quando** o aluno coloca o app em segundo plano e volta antes do fim, **Então** o tempo restante corresponde ao tempo real decorrido (RF-023).
4. **Dado** o intervalo em andamento, **Quando** o aluno coloca o app em segundo plano e volta depois do fim, **Então** o intervalo já está encerrado e a próxima série ou o próximo exercício está em destaque, sem toque extra; o som e a vibração são emitidos uma vez nesse retorno se o fim ocorreu há poucos segundos e não são emitidos se faz mais tempo (RF-022).
5. **Dado** o intervalo em andamento, **Quando** o aluno pausa, **Então** a contagem congela no valor exibido e o tempo em pausa não conta; **Quando** retoma, **Então** a contagem continua do valor congelado, sem som nem vibração ao pausar ou retomar.
6. **Dado** a série que conclui a ficha, **Quando** o aluno a conclui, **Então** o intervalo abre como hoje indicando o final da sessão e, ao terminar, o botão de finalizar aparece, como hoje.
7. **Dado** todas as séries concluídas com carga, **Quando** o aluno toca em finalizar e o registro é salvo, **Então** a tela de comemoração aparece com o resumo da sessão (duração total, exercícios e séries concluídos, o dia da agenda para o qual a sessão contou ou a indicação de ficha avulsa) e um botão de volta ao início (RF-024).
8. **Dado** todas as séries concluídas, **Quando** o registro falha, **Então** a comemoração não aparece, o aluno vê o aviso de erro padronizado, o botão de finalizar volta a ficar disponível e ele pode tentar de novo; nenhum dado da sessão é perdido (RF-025).
9. **Dado** o progresso da sessão mudando, **Quando** a barra e o percentual atualizam, **Então** o valor é animado até o novo estado, e com "reduzir movimento" ativado ele salta direto ao valor final.
10. **Dado** um dia da agenda já feito ou reposto, **Quando** o aluno o abre, **Então** vê a ficha conforme a Fase 2, com o selo de concluído em verde e sem cronômetro em andamento; se o dia permite ou não nova sessão é regra da Fase 2, não desta.
11. **Dado** o cabeçalho de um card de exercício, **Quando** o aluno navega por teclado, **Então** o cabeçalho é focável, expande com Enter ou Espaço e anuncia seu estado expandido ou recolhido.
12. **Dado** uma tentativa de finalizar que expirou sem resposta mas que o servidor chegou a gravar, **Quando** o aluno tenta de novo, **Então** o sistema não cria uma segunda sessão de treino para a mesma execução e segue para a comemoração (RF-025).
13. **Dado** o cronômetro da sessão em andamento, **Quando** o aluno coloca o app em segundo plano e volta, **Então** o tempo exibido corresponde ao tempo real decorrido e a duração mostrada na comemoração bate com a gravada no histórico (RF-023).
14. **Dado** o som do fim do intervalo proposto, **Quando** ele é apresentado ao Mauri, **Então** só entra no app depois de aprovado, e é um som curto próprio, livre de direitos (RF-037).

### História 4 - Painel do professor (Prioridade: P2)

O professor encontra o painel com a mesma identidade do app do aluno: barra lateral e cabeçalho no computador, navegação inferior no celular; dashboard com indicadores e fila de alunos aguardando ficha; lista e cadastro de alunos; perfil do aluno com abas padronizadas (Avaliações, Fichas de Treino, Agenda), menu de ações, as confirmações já existentes (bloquear, excluir aluno, excluir ficha) em diálogo padronizado, modais de anamnese, avaliação e redefinição de senha, construtor de fichas com seletores do sistema; biblioteca de exercícios; análise por IA; configurações e planos; painel de notificações. Os seletores nativos, os menus e as abas feitos à mão e a confirmação nativa de exclusão são substituídos.

**Por que esta prioridade**: o professor é uma pessoa só e usa principalmente o computador; a inconsistência incomoda, mas não compromete a percepção do produto pelos alunos.

**Teste independente**: o professor, apenas pelo teclado, abre o perfil de um aluno, troca de aba, abre o menu de ações, abre e cancela a confirmação de exclusão, cria uma ficha com dois exercícios escolhendo grupo muscular pelo seletor do sistema e publica. Nenhum popup nativo de janela aparece.

**Cenários de aceite**:

1. **Dado** o perfil do aluno, **Quando** o professor escolhe excluir o aluno, bloquear o aluno ou excluir uma ficha, **Então** a confirmação, que já existe hoje, passa a ser um diálogo do sistema com a ação nomeada, cancelável com Escape, e nunca o popup nativo do navegador. Ações que hoje não pedem confirmação continuam sem pedir (ver Notas, consequências da decisão "comportamento não muda").
2. **Dado** o construtor de fichas, **Quando** o professor escolhe grupo muscular ou qualquer outra opção de lista, **Então** usa o seletor padronizado, com a mesma aparência em todas as telas, inclusive no ciclo de plano nas configurações.
3. **Dado** o status do plano de um aluno, **Quando** ele é exibido no perfil ou na lista, **Então** usa o chip de status padronizado: verde para ativo, âmbar para pendente, em análise ou vencendo, vermelho para bloqueado, atrasado ou expirado.
4. **Dado** um rascunho de ficha sugerido pela IA, **Quando** aparece no perfil, **Então** é identificado por ícone e rótulo como rascunho (âmbar, cor de atenção), sem a cor roxa usada hoje para "IA".
5. **Dado** a aba Agenda do perfil do aluno, **Quando** o professor atribui uma ficha, um dia de descanso ou nada a um dia, **Então** a interação usa os mesmos componentes e a mesma representação de cada status do dia da aba Treinos do aluno; o que só o professor vê (ficha em rascunho no dia, por exemplo) segue a Fase 2.
6. **Dado** o painel no celular, **Quando** o professor abre qualquer modal, **Então** o modal ocupa a tela com área segura respeitada e o botão primário alcançável com o polegar.
7. **Dado** uma tela do painel carregando, **Quando** o conteúdo chega, **Então** o esqueleto tinha a geometria final (inclusive nas telas que hoje não têm esqueleto próprio).
8. **Dado** a análise de IA de uma anamnese, **Quando** é exibida, **Então** o texto aparece em um card claro de leitura, definido por um token próprio do tema, a única superfície clara de toda a plataforma (RF-036).

### História 5 - Login e landing (Prioridade: P3)

O visitante vê a marca na landing e no login com a nova identidade: fundo em grafite texturizado sem a marca d'água, formulário com campos rotulados, botão primário em prata, mensagens de erro e sucesso nos componentes padronizados. O funil de cadastro em quatro passos usa os mesmos campos, seletores e botões do resto da plataforma, e a caixa de aceite dos termos funciona por teclado.

**Por que esta prioridade**: são telas de passagem, vistas uma vez por aluno; vêm por último na ordem combinada com o professor.

**Teste independente**: um visitante percorre landing, funil e login apenas pelo teclado em um celular de 320 px; completa o cadastro, cai no login e entra.

**Cenários de aceite**:

1. **Dado** a tela de login, **Quando** é exibida, **Então** o fundo não contém a marca d'água, os campos de e-mail e senha têm rótulo visível ou acessível, e o botão de mostrar senha tem rótulo e é alcançável por Tab.
2. **Dado** um erro de login, **Quando** é exibido, **Então** usa o componente de erro padronizado em vermelho, anunciado para leitores de tela, e o campo em foco permanece o mesmo.
3. **Dado** o funil de cadastro, **Quando** o visitante chega ao aceite de termos, **Então** consegue marcar a caixa com Espaço e seguir com Enter.
4. **Dado** a landing em 320 px, **Quando** é rolada até o fim, **Então** não há rolagem horizontal, e as fontes e os ícones são os da fase.

### Casos de borda

- **"Reduzir movimento" ativado no sistema**: transições entre telas, animação de números e barras, feedback de toque animado e zoom de modais são suprimidos ou trocados por mudança instantânea. Esqueletos não pulsam. Vibração e som continuam, porque são retorno sensorial, não movimento na tela (RF-020).
- **Aparelho sem suporte a vibração** (iOS Safari, computador): o app não vibra e não mostra erro; o retorno visual (mudança de estado do chip, do cronômetro) é suficiente por si só. Nenhum recurso depende da vibração para ser compreendido.
- **Som bloqueado ou aparelho no silencioso**: o som só é reproduzido depois de uma interação do aluno na página (marcar a série já conta); se o sistema bloquear mesmo assim, o fim do intervalo é sinalizado por vibração e pelo fluxo visual. O app não pede permissão de áudio nem exibe aviso de "som bloqueado".
- **App em segundo plano durante o intervalo**: o tempo restante é calculado pelo relógio (RF-023). Se o fim ocorreu enquanto o app estava em segundo plano, ao voltar o intervalo já está encerrado e o fluxo seguiu; o sinal é emitido uma vez se o fim ocorreu há poucos segundos e não é emitido se faz mais tempo (RF-022). Notificação do sistema avisando o fim do intervalo está fora de escopo.
- **Intervalo pausado**: a contagem congela e o tempo em pausa não conta (cenário 3.5); se o app for para segundo plano durante a pausa, ao voltar a contagem continua congelada.
- **Pular o intervalo**: o fluxo segue como hoje, sem som nem vibração; só o fim natural do intervalo sinaliza (RF-022).
- **Intervalo depois da série que conclui a ficha**: o intervalo abre como hoje indicando o final da sessão; ao terminar, o botão de finalizar aparece, como hoje (cenário 3.6).
- **Tela pequena (320 px de largura)**: nenhuma rota tem rolagem horizontal; os chips de série quebram linha; o cronômetro de intervalo reduz de tamanho sem cortar os números; a navegação inferior mantém quatro itens legíveis.
- **PWA instalado no iOS com notch**: o cabeçalho fica abaixo da barra de status, a navegação inferior acima da barra inicial, modais e a tela de comemoração respeitam as duas áreas, e a cor da barra de status combina com o fundo do app.
- **Teclado virtual aberto sobre o campo de carga**: o campo permanece visível acima do teclado e a página não dá zoom ao focar.
- **Sessão restaurada após recarregar a página**: a sessão de treino em andamento volta no mesmo estado (séries, cargas, tempo) com a mesma aparência, sem piscar o estado inicial antes de restaurar.
- **Ilustração do exercício ausente ou que falha ao carregar**: o espaço reservado mantém a geometria com um ícone neutro, sem deslocar o conteúdo.
- **Nomes longos de exercício ou de ficha**: truncam ou quebram sem sobrepor outros elementos, inclusive em Michroma, cuja largura é maior que a de Montserrat.
- **Erro ao finalizar a sessão de treino**: a comemoração não aparece; os dados continuam salvos localmente e o aluno pode tentar de novo (cenário 3.8).
- **Falha de rede ao finalizar**: hoje o botão pode ficar travado em "Salvando..."; com o RF-025, após a falha o botão volta a ficar disponível e o aviso de erro aparece.
- **Tentar de novo depois de um tempo esgotado em que o servidor já gravou**: hoje criaria uma segunda sessão de treino, que com a Fase 2 ligaria duas sessões ao mesmo dia; com o RF-025, a segunda tentativa não duplica a sessão (cenário 3.12).
- **Marca ainda não aprovada**: o restante da reformulação segue; o cabeçalho mostra o "FH" provisório em Michroma, e os ícones do app instalado e a tela de abertura só mudam depois da aprovação (RF-005).
- **Falha de carga parcial no painel** (uma das várias consultas do perfil do aluno falha): a seção continua aparecendo vazia, como hoje; o tratamento dessa falha está fora de escopo desta fase.
- **Indicador de evolução sem variação** (mesma carga, mesmo peso): hoje aparece vermelho no gráfico e amarelo no perfil; passa a neutro, sem cor cromática (RF-033).

## Requisitos

### Requisitos funcionais

Identidade e tema

- **RF-001**: O sistema DEVE ter um único tema, escuro, com todas as cores, fontes, raios, elevações e sombras definidos como tokens do tema; nenhuma tela DEVE definir cor, fonte ou sombra fora dos tokens. O espaçamento segue a escala do utilitário de layout que convive com a biblioteca, conforme o ADR 0001.
- **RF-002**: A paleta DEVE ser monocromática metálica derivada da logo (prata escovada, grafite, preto e branco); cores cromáticas DEVEM existir apenas com função de status: verde para concluído ou ativo, âmbar para atenção, vermelho para erro ou bloqueio. O vermelho DEIXA de ser cor de marca, de botão primário e de destaque. Botões de ação destrutiva DEVEM usar o vermelho de status (decisão derivada de "vermelho = erro ou bloqueio": a cor avisa a perda antes do clique).
- **RF-003**: Todo texto de interface DEVE usar Montserrat; Michroma DEVE ser usada apenas em títulos curtos e em números grandes (cronômetro, carga, progresso, indicadores do dashboard). O estilo atual "preto itálico caixa alta" dos títulos DEVE sair: a hierarquia vem de tamanho, peso e família; caixa alta só em rótulos curtos. A fonte atual DEVE ser removida.
- **RF-004**: Todos os ícones DEVEM pertencer aos Material Icons no estilo Sharp; a família de ícones atual DEVE ser removida ao final da fase, conforme o ADR 0001.
- **RF-005**: A marca "FH" DEVE ser redesenhada em vetor a partir das imagens existentes e aprovada pelo professor antes de entrar no app. Após a aprovação, ela DEVE aparecer no cabeçalho do aluno e do professor, na tela de abertura do app instalado e nos ícones do app instalado. Até a aprovação, o cabeçalho DEVE mostrar o "FH" em Michroma como provisório, e os ícones do app instalado e a tela de abertura DEVEM esperar a aprovação, para não obrigar reinstalação no iOS duas vezes. O "FH" da logo continua inclinado, como na marca original.
- **RF-006**: O fundo do login DEVE deixar de exibir a marca d'água presente na imagem atual.
- **RF-007**: Nenhuma cor, fonte, elevação, efeito de toque ou forma padrão da biblioteca de componentes DEVE ser visível em nenhuma tela; a verificação é feita na tela de amostra da História 1, comparando cada componente com o padrão da biblioteca. O visual padrão é evitado de propósito, conforme o ADR 0001. A aprovação da tela de amostra (RF-035) inclui essa verificação.

Componentes e consistência

- **RF-008**: O sistema DEVE ter um único componente padronizado por tipo de elemento de interface. A lista mínima é: botão (primário, secundário, de ícone), campo de texto, seletor de opções, caixa de seleção, modal, menu de ações, abas, chip de status, card, aviso em linha, aviso transitório e esqueleto. O inventário completo dos tipos existentes (seletor de data, área de texto, resposta Sim/Não do PAR-Q, barra de progresso, navegações, avatar com upload, cronômetros, gráfico, QR do PIX, cards de plano, contador de não lidas e os demais) fica no plano, com a mesma regra: um componente por tipo.
- **RF-009**: Todos os modais, menus, seletores e abas feitos à mão DEVEM ser substituídos pelos componentes padronizados.
- **RF-010**: Nenhuma tela DEVE usar os popups nativos de janela do navegador (aviso, confirmação ou prompt); os dois usos atuais DEVEM ser substituídos por componentes padronizados. As confirmações que já existem hoje (bloquear aluno, excluir aluno, excluir ficha) DEVEM usar o diálogo de confirmação padronizado, que nomeia a ação e o alvo. Nenhuma confirmação nova é acrescentada (ver Notas, consequências da decisão "comportamento não muda"). O convite de instalação do app, que usa o mecanismo do navegador, continua.
- **RF-011**: Mensagens de sucesso, erro e validação que já existem DEVEM usar os componentes de aviso padronizados (em linha para campos e formulários, transitório para resultado de ação), nunca texto solto colorido.
- **RF-012**: Toda tela que carrega dados DEVE ter estado de carregamento com esqueleto da geometria final, substituído sem deslocamento de layout. O estado vazio continua o existente (na agenda, as mensagens da Fase 2); a separação entre erro e vazio nas leituras está fora de escopo. Falhas de ações (como finalizar a sessão) usam o aviso de erro padronizado (RF-011).
- **RF-013**: Os chips de série, o selo de concluído e os status do dia da agenda semanal DEVEM comunicar estado por ícone e texto além da cor.

Acessibilidade

- **RF-014**: Todo modal DEVE ter semântica de diálogo, fechar com Escape, prender o foco enquanto aberto e devolver o foco ao elemento que o abriu.
- **RF-015**: Todo botão que exibe apenas ícone DEVE ter rótulo acessível; todo campo DEVE ter rótulo associado.
- **RF-016**: Toda ação DEVE ser alcançável e acionável por teclado, com indicação visível de foco; elementos clicáveis DEVEM ser botões ou links, não contêineres genéricos.
- **RF-017**: Texto e ícones informativos DEVEM atingir contraste WCAG AA sobre o fundo em que aparecem; nenhum rótulo ou chip DEVE ter menos de 12 px, e nenhum corpo de texto ou botão menos de 14 px.
- **RF-018**: Avisos de erro e de sucesso DEVEM ser anunciados a leitores de tela sem roubar o foco.

Movimento e momentos de treino

- **RF-019**: O sistema DEVE ter microinterações com propósito: retorno visual ao toque em botões e chips, esqueletos com a geometria final e animação de números e barras de progresso até o valor novo. Transição entre telas DEVE existir apenas no app do aluno (troca de aba e abrir ou fechar a sessão de treino); o painel do professor, o login e a landing NÃO DEVEM ter transição de rota.
- **RF-020**: Quando o sistema operacional sinaliza "reduzir movimento", o app DEVE suprimir as animações não essenciais e trocar estados instantaneamente, sem perda de informação. Animação não essencial é a que não carrega informação própria: transições de entrada e saída, feedback de toque animado, interpolação de números e barras, pulsar de esqueleto, zoom de modal. A contagem do cronômetro e o avanço do arco do intervalo são conteúdo, não animação, e continuam.
- **RF-021**: Ao concluir uma série, o aparelho DEVE vibrar brevemente quando houver suporte; sem suporte, nada DEVE falhar nem ser avisado.
- **RF-022**: Ao fim do intervalo, o aparelho DEVE emitir um som curto e vibrar quando o sistema permitir; o fluxo DEVE seguir como hoje, sem passo adicional: o cronômetro fecha e o próximo exercício ou a próxima série fica em destaque (ver Notas, consequências da decisão "comportamento não muda"). Se o fim ocorreu com o app em segundo plano, o sinal DEVE ser emitido uma vez ao voltar quando o fim foi há poucos segundos, e NÃO DEVE ser emitido quando faz mais tempo. Pular o intervalo NÃO DEVE emitir som nem vibração.
- **RF-023** (decisão derivada): O cronômetro de intervalo DEVE basear o tempo restante no relógio, de modo que o app em segundo plano não atrase a contagem; se o fim ocorrer em segundo plano, ao voltar o intervalo DEVE estar encerrado e o fluxo seguido. Pausar congela a contagem e o tempo em pausa não conta; retomar continua do valor congelado. Esta é a única mudança de comportamento do cronômetro nesta fase e é compatível com a decisão de "comportamento funcional não muda" porque é pré-requisito do som e da vibração no fim do intervalo (sem relógio, o sinal dispararia atrasado) e corrige o atraso em segundo plano registrado no mapa do código. O cronômetro da sessão DEVE seguir a mesma regra de relógio, para que a duração exibida na comemoração bata com a gravada no histórico.
- **RF-024**: Ao finalizar a sessão de treino com sucesso, o sistema DEVE exibir uma tela de comemoração com o resumo da sessão: duração total, número de exercícios e de séries concluídas, o dia da agenda semanal para o qual a sessão contou (feito, ou reposição de um dia anterior da semana) ou a indicação de ficha avulsa, e um botão para voltar ao início; tudo a partir do que a sessão já tem, sem consulta nova. Em caso de falha, a comemoração NÃO DEVE aparecer, o aviso de erro padronizado DEVE ser exibido e o aluno DEVE poder tentar de novo sem perder o registro local.
- **RF-025** (decisão derivada): Ao tentar de novo após uma falha ao finalizar, o sistema NÃO DEVE criar uma segunda sessão de treino para a mesma execução, mesmo quando a tentativa anterior expirou depois de o servidor ter gravado; e o botão de finalizar NÃO DEVE ficar travado após a falha. É derivada do RF-024 (tentar de novo passa a ser um caminho visível) e necessária porque, com a Fase 2, uma sessão duplicada ligaria duas sessões ao mesmo dia da agenda.

PWA e iOS

- **RF-026**: O app instalado DEVE respeitar as áreas seguras do aparelho (barra de status, notch e barra inicial) no cabeçalho, na navegação inferior, nos modais e na tela de comemoração.
- **RF-027**: Os ícones do app instalado DEVEM ser gerados a partir da marca aprovada, com finalidade de máscara declarada e margem de segurança, legíveis em tamanho pequeno; a cor de tema do navegador e da barra de status DEVE pertencer à paleta.
- **RF-028**: As notificações push DEVEM exibir ícone e selo da marca; os ícones hoje referenciados e inexistentes DEVEM ser criados.
- **RF-029**: A tela de abertura do app instalado DEVE mostrar a marca sobre o fundo da paleta, inclusive no iOS, com o conjunto de imagens por tamanho de aparelho gerado a partir da marca aprovada junto com os ícones.

Escopo por área

- **RF-030**: O app do aluno (início, aba Treinos com agenda semanal e "Outras fichas", sessão de treino, Evolução, Assinatura, troca de senha, cabeçalho, navegações) DEVE ser reformulado por inteiro, mantendo as regras de negócio e o fluxo da Fase 2. No computador, o aluno recebe o mesmo layout responsivo do celular adaptado à largura, sem telas próprias; o celular é a referência de desenho e de QA.
- **RF-031**: O painel do professor (dashboard, alunos, perfil do aluno com abas Avaliações, Fichas de Treino e Agenda, construtor de fichas, biblioteca de exercícios, análise por IA, configurações e planos, notificações) DEVE ser reformulado por inteiro, com os mesmos componentes do app do aluno.
- **RF-032**: Login, recuperação de senha, landing e funil de cadastro DEVEM ser reformulados com os mesmos componentes. A ordem de entrega DEVE ser: app do aluno, depois painel do professor, por último login e landing.
- **RF-033**: Os gráficos de evolução DEVEM usar a paleta do tema (tons metálicos para as séries de dados; verde para melhora e vermelho para piora, mantendo a semântica atual de cada indicador, em que perda de peso e de gordura são melhora) e ter esqueleto próprio. Variação zero DEVE aparecer neutra, sem cor cromática (decisão derivada: hoje aparece vermelha no gráfico e amarela no perfil; neutro é o único valor coerente com "verde melhora, vermelho piora").
- **RF-034**: Ao final da fase, o design system anterior e a família de ícones anterior DEVEM ser removidos do projeto, conforme o ADR 0001, para não coexistirem dois sistemas.

Aprovações e exceções

- **RF-035**: A home do aluno, com a paleta, a tipografia e os componentes aplicados, DEVE servir de tela de amostra e ser aprovada pelo Mauri ou pelo professor antes de o tema ser replicado em qualquer outra tela. É a trava da História 1.
- **RF-036**: O card da análise de IA DEVE continuar claro, como exceção documentada no tema, definida por um token próprio ("superfície de leitura"); é a única exceção à paleta escura e nenhuma outra tela DEVE usar superfície clara.
- **RF-037**: O som do fim do intervalo DEVE ser um som curto próprio, livre de direitos, tocado uma vez e carregado após a primeira interação da sessão; ele DEVE ser aprovado pelo Mauri antes de entrar no app.

### Identidade visual (paleta por papel, tipografia, ícones, movimento)

Os valores finais (códigos de cor, tamanhos, durações) são definidos no plano. Aqui ficam os papéis e a intenção.

**Paleta por papel** (monocromática metálica, só tema escuro)

- **Fundo base**: preto quase absoluto, como o fundo da logo em preto e branco. É onde o app "descansa".
- **Superfície**: grafite escuro, com até dois níveis de elevação (card sobre fundo, modal sobre card), diferenciados por luminosidade, não por sombra colorida. Lembra a placa de ardósia da logo.
- **Borda e divisor**: grafite médio, sutil, para separar sem desenhar caixas.
- **Texto primário**: branco levemente quebrado (não puro), para não cansar no escuro.
- **Texto secundário**: prata média; **texto desabilitado**: grafite claro. Ambos com contraste AA sobre as superfícies em que aparecem.
- **Ação primária**: prata escovada, o "metal" da logo. Botões primários, aba ativa, progresso. Texto sobre ela em preto. Sem brilho (glow); profundidade, quando houver, vem de um gradiente metálico discreto, não de sombra colorida. O chip da próxima série usa a ação primária; a série concluída fica em verde e as seguintes em superfície neutra desabilitada; com texto e ícone além da cor, a sequência fica clara sem o vermelho atual.
- **Ação secundária**: superfície com borda em prata. **Ação destrutiva**: vermelho de status, que avisa a perda antes do clique (RF-002).
- **Status concluído**: verde. Série feita, sessão concluída, dia feito ou reposto, plano ativo, pagamento confirmado.
- **Status atenção**: âmbar. Dia não realizado, rascunho, plano pendente, em análise ou vencendo, intervalo pausado, campo faltando.
- **Status erro**: vermelho. Erro de ação, carga inválida ao tentar marcar série, plano bloqueado, atrasado ou expirado.
- **Foco**: anel em prata clara, sempre visível, sobre qualquer superfície.
- **Gráficos**: tons metálicos para as séries de dados; verde e vermelho só para tendência, com a semântica atual de cada indicador; variação zero em neutro (RF-033).
- **Exceção de leitura**: o card da análise de IA, hoje branco por escolha registrada no commit bc51c17, continua claro, com token próprio de "superfície de leitura"; é a única exceção à paleta escura (RF-036).

A cor roxa usada hoje para "IA" desaparece: a origem por IA é indicada por ícone e rótulo. O vermelho não aparece em marca, botão primário, barra de progresso, cronômetro nem seleção de texto.

**Tipografia**

- **Montserrat** em todo o texto de interface, em pesos que cubram corpo, rótulo, ênfase e botão. O estilo atual "preto itálico caixa alta" dos títulos sai: a hierarquia vem de tamanho, peso e família (Montserrat e Michroma), e caixa alta fica só em rótulos curtos, com espaçamento entre letras ajustado. O "FH" da logo continua inclinado; isso é marca, não tipografia de interface.
- **Michroma** só em títulos curtos (nome da ficha, título de seção principal) e em números grandes (cronômetro da sessão e do intervalo, carga registrada, percentual de progresso, indicadores do dashboard). Como é uma fonte larga, nunca em parágrafos, botões ou listas. Também no "FH" provisório do cabeçalho, até a aprovação da marca (RF-005).
- Piso de tamanho de texto: 12 px para rótulos e chips, 14 px para corpo e botões, acima dos 8 a 10 pixels usados hoje em rótulos (RF-017).
- Números tabulares (mesma largura) no cronômetro, para que os dígitos não "pulem".

**Ícones**

- Material Icons, estilo Sharp: cantos retos, que combinam com as arestas da marca. Um ícone por conceito em toda a plataforma (o mesmo ícone para "ficha" no app do aluno e no painel do professor).
- Tamanhos fixos do tema; ícones informativos com o mesmo contraste exigido do texto.

**Movimento**

- Duração curta e curvas de desaceleração; nada chama atenção para si. Animações não deslocam o layout.
- **Feedback de toque**: leve compressão ou mudança de superfície ao pressionar botão ou chip.
- **Transição entre telas**: só no app do aluno (troca de aba e abrir ou fechar a sessão de treino), com entrada discreta do conteúdo, sem deslizar a tela inteira; painel do professor, login e landing sem transição de rota (RF-019).
- **Esqueleto**: mesma geometria do conteúdo final, com variação sutil de luminosidade.
- **Números e barras**: progresso e percentual interpolam até o valor novo; o cronômetro de intervalo drena de forma contínua.
- **Momentos**: série concluída (chip muda de estado com vibração), fim do intervalo (som, vibração, fluxo segue como hoje), finalização (comemoração com resumo).
- Com "reduzir movimento": as animações não essenciais (RF-020) viram troca instantânea; som e vibração continuam.

## Critérios de sucesso

- **CS-001**: 100% dos textos e ícones informativos atingem contraste WCAG AA, verificado por auditoria automatizada em cada rota e por amostragem manual nos chips de status e nos estados desabilitados.
- **CS-002**: Zero chamadas a aviso, confirmação ou prompt nativos de janela do navegador em todo o código de interface (o convite de instalação do app não conta).
- **CS-003**: Zero cores definidas fora dos tokens do tema nas telas (nenhum código de cor, nome de cor ou classe de cor fixa em componente de tela); a única superfície clara é o token de "superfície de leitura" do card da análise de IA (RF-036).
- **CS-004**: Zero ícones de outra família além dos Material Icons Sharp; a família anterior não está mais instalada ao final da fase.
- **CS-005**: 100% dos modais fecham com Escape, prendem o foco e devolvem o foco ao abrir e fechar, verificados em roteiro manual por teclado.
- **CS-006**: Deslocamento cumulativo de layout (CLS) abaixo de 0,1 em cada rota principal, medido em celular, com esqueletos substituídos pelo conteúdo final.
- **CS-007**: 100% das telas que carregam dados têm esqueleto com a geometria final; o estado vazio existente é mantido em 100% delas.
- **CS-008**: Nenhuma rota apresenta rolagem horizontal a 320 px de largura.
- **CS-009**: No app instalado em iPhone com notch, nenhum elemento interativo fica sob a barra de status ou sob a barra inicial, verificado em aparelho real.
- **CS-010**: Ícone do app instalado exibido corretamente (com máscara e legível) em Android e iOS, e notificação push exibindo ícone e selo da marca em Android, verificados em aparelho real.
- **CS-011**: Com "reduzir movimento" ativado, nenhuma animação não essencial (conforme a definição do RF-020) é executada, verificado nas rotas do aluno e na sessão de treino.
- **CS-012**: Pontuação de acessibilidade da auditoria automatizada igual ou superior a 95 em cada rota principal.
- **CS-013**: Em cada rota principal, a inspeção de fontes renderizadas pela ferramenta de desenvolvedor do navegador lista apenas Montserrat e Michroma para texto (a fonte de ícones, se houver, não conta); zero ocorrências de fonte de substituição.
- **CS-014**: O inventário de componentes do plano tem exatamente um componente por tipo; zero duplicatas, verificado por revisão do inventário contra o código ao final de cada área entregue.
- **CS-015**: Pontuação de desempenho da auditoria automatizada em celular não cai mais de 5 pontos em relação à medição de base feita antes da fase (ver Premissas), em cada rota principal.
- **CS-016**: Aprovação do professor registrada para a marca vetorial "FH" antes de ela entrar em cabeçalho, tela de abertura ou ícones.
- **CS-019**: Aprovação do Mauri ou do professor registrada para a tela de amostra (home do aluno) antes de qualquer outra tela receber o tema, e aprovação do Mauri registrada para o som do fim do intervalo antes de ele entrar no app.
- **CS-020**: Nenhum rótulo ou chip abaixo de 12 px e nenhum corpo de texto ou botão abaixo de 14 px em nenhuma rota, verificado por inspeção dos tokens de tipografia e por amostragem nas telas.
- **CS-017**: Roteiro de regressão manual dos fluxos existentes (login, primeiro acesso, paywall, sessão de treino completa com reposição, publicação de ficha, agenda semanal, pagamento PIX, notificações) passa 100% ao final de cada área entregue, já que não há testes automatizados.
- **CS-018**: Em aparelho real, a sessão de treino completa com vibração ao concluir série, som e vibração ao fim do intervalo e comemoração ao finalizar, no Android; no iPhone, o mesmo fluxo completa sem vibração e sem erro.

## Premissas

- A Fase 2 (agenda semanal: início com treino do dia, aba Treinos de segunda a domingo com "Outras fichas", aba Agenda no perfil do aluno) está entregue e estável antes do início desta fase; suas telas, estados e mensagens fazem parte do escopo visual e não são redefinidos aqui.
- A biblioteca de componentes, a integração com o estilo existente e a estratégia de migração tela a tela são as do ADR 0001; esta spec não as reabre.
- Não existe arquivo vetorial da marca; o redesenho parte das três imagens existentes e é um entregável desta fase, sujeito à aprovação do professor. A reformulação das telas não espera essa aprovação, só a troca da marca em si. A paleta e a tipografia são aprovadas na tela de amostra (RF-035) antes de qualquer outra tela.
- Montserrat e Michroma estão disponíveis como fontes web licenciadas para uso livre e cobrem os caracteres acentuados do português (a cobertura de Michroma é confirmada no plano).
- Os Material Icons Sharp têm equivalentes para todos os ícones usados hoje; onde não houver equivalente exato, escolhe-se o conceito mais próximo da mesma família.
- Não há testes automatizados no projeto; a verificação é por auditoria automatizada de acessibilidade e desempenho, roteiro manual e aparelhos reais (um Android e um iPhone com notch).
- Antes da primeira tela ser alterada, a pontuação de desempenho e de acessibilidade de cada rota principal é medida e registrada como base para CS-012 e CS-015.
- O professor é um só; o painel não precisa prever múltiplos professores.
- O som do fim do intervalo só pode tocar após uma interação do aluno na página; marcar a série que inicia o intervalo é essa interação.
- Os dados de leitura das telas chegam hoje sem distinção entre "vazio" e "falha" (a falha vira lista vazia); por isso a separação entre erro e vazio nas leituras fica fora desta fase.

## Fora de escopo

- Tema claro ou alternância de tema.
- Gamificação (pontos, sequências, medalhas, ranking).
- Novas funcionalidades e mudanças de regra de negócio, inclusive as apontadas no mapa do código (integridade de dados, fuso horário, ordenação de exercícios), exceto as decisões derivadas explicitadas nesta spec (RF-023 nos dois cronômetros, RF-025 e a variação zero do RF-033).
- Separação entre estado de erro e estado vazio nas telas de leitura, e tratamento das falhas de carga parcial do painel do professor: ficam para uma fase futura de robustez, porque exigem mudar o contrato de dados das consultas. Nesta fase, falha de leitura continua aparecendo como vazio, como hoje.
- Notificação do sistema avisando o fim do intervalo com o app fechado ou em segundo plano.
- Comparação de cargas com a sessão anterior na tela de comemoração.
- Troca das fotos de banco de imagens da landing por fotos reais (é conteúdo, não visual; registrado em Notas).
- Redesenho da marca além do "FH" (nome completo, assinaturas, papelaria).
- Testes automatizados de interface.

## Notas

- O ADR 0001 registra a escolha da biblioteca, a convivência com o estilo atual e a remoção do design system anterior ao final; esta spec só referencia.
- Evidências do estado atual que motivam os requisitos: um aviso nativo no gerenciador de push e uma confirmação nativa ao excluir ficha; seis componentes com seletor nativo; doze arquivos com modal ou overlay feito à mão; nenhum uso de vibração ou som na sessão de treino (a notificação push já vibra) e nenhum tratamento de "reduzir movimento"; cor de tema do navegador em vermelho; manifest sem finalidade de máscara nos ícones e ícone com texto ilegível em tamanho pequeno; ícones de notificação referenciados e inexistentes; fonte da interface definida de forma autorreferente e provavelmente nunca aplicada.
- Referência de comportamento da sessão de treino que esta spec preserva: concluir uma série abre o intervalo; o fim do intervalo fecha o cronômetro sozinho e abre o próximo exercício (ou indica o final da sessão depois da última série); pausar e pular existem; finalizar mostra "Treino Finalizado!" com o tempo total. O que muda é só o que está nos RF-021 a RF-025.
- Consequências da decisão "comportamento não muda", não decisões do professor: (a) o fim do intervalo em primeiro plano continua fechando o cronômetro sozinho e abrindo o próximo exercício, sem toque adicional; o som e a vibração são o aviso, e exigir um toque seria mudança funcional. (b) Nenhuma confirmação nova é acrescentada às ações que hoje não pedem (excluir plano, remover exercício da ficha, remover ilustração, remover foto); só as confirmações existentes trocam de componente. Acrescentar confirmações fica registrado para uma fase de UX.
- O mapa de cores de status já existente no painel (verde ativo, amarelo pendente, vermelho bloqueado) é mantido como semântica; só a tonalidade e o componente mudam.
- O card da análise de IA é branco por escolha registrada no commit bc51c17, feita pelo Mauri para leitura; continua claro como exceção documentada no tema (RF-036).
- As fotos de banco de imagens na seção "Resultados Reais" da landing são um risco de credibilidade; vale pedir ao professor fotos reais com autorização, em paralelo a esta fase.
- A troca dos ícones do app instalado no iOS exige que o aluno reinstale o app para ver o ícone novo; por isso os ícones só mudam uma vez, depois da aprovação da marca.
- Tela de abertura do app instalado: no Android ela é gerada automaticamente a partir do manifest; no iOS é preciso um conjunto de imagens por tamanho de aparelho, e em navegador comum não existe tela de abertura. O conjunto do iOS entra nesta fase, gerado junto com os ícones (RF-029).
- Os detalhes de padrão de vibração (duração dos pulsos), curvas e durações de animação, tamanhos de fonte e valores de cor são do plano, não desta spec.

## Esclarecimentos

### Sessão 2026-10-17

- P: Som do fim do intervalo: arquivo próprio ou som gerado pelo navegador? -> R: Som curto próprio, livre de direitos, tocado uma vez e carregado após a primeira interação da sessão; o Mauri aprova o som antes de ele entrar (RF-037).
- P: O que exatamente a comemoração mostra? -> R: Duração total, número de exercícios e de séries concluídas, o dia da agenda semanal para o qual a sessão contou (ou ficha avulsa) e um botão para voltar ao início; sem comparação de cargas (RF-024).
- P: Transição entre telas em todas as rotas ou só no app do aluno? -> R: Só no app do aluno (troca de aba e abrir ou fechar a sessão de treino); painel do professor, login e landing sem transição de rota (RF-019).
- P: Intervalo encerrado em segundo plano: emitir som e vibração ao voltar? -> R: Emitir uma vez ao voltar se o fim ocorreu há poucos segundos; se faz mais tempo, apenas seguir o fluxo (RF-022).
- P: O que vai no cabeçalho, na tela de abertura e nos ícones enquanto o "FH" vetorial não é aprovado? -> R: Cabeçalho com o "FH" em Michroma como provisório; ícones do app instalado e tela de abertura esperam a aprovação (RF-005).
- P: O conjunto de imagens de tela de abertura para iOS entra nesta fase? -> R: Sim, gerado a partir da marca aprovada junto com os ícones (RF-029).
- P: "Reduzir movimento" deve desligar também vibração e som? -> R: Não; são retorno sensorial, não movimento; continuam (RF-020).
- P: O estilo "preto itálico caixa alta" dos títulos sai por completo? -> R: Sim; a hierarquia vem de tamanho, peso e família (Montserrat e Michroma), caixa alta só em rótulos curtos; o "FH" da logo continua inclinado (RF-003).
- P: Chip da próxima série em prata (ação primária) ou destacado de outro modo? -> R: Prata, como todo botão primário; concluído em verde; seguintes em superfície neutra desabilitada (Identidade visual).
- P: O aluno no computador ganha layout próprio ou só o responsivo do celular? -> R: Só o responsivo; o celular é a referência de desenho e de QA (RF-030).
- P: O cronômetro da sessão também passa a contar pelo relógio? -> R: Sim, para a duração da comemoração bater com a gravada no histórico (RF-023).
- P: Estados de erro e de vazio separados nas telas que carregam dados? -> R: Fora desta fase, junto com as falhas de carga parcial do painel (fase futura de robustez); falha de leitura continua aparecendo como vazio; falhas de ações usam o aviso de erro padronizado (RF-012, Fora de escopo).
- P: A aprovação da paleta e da tipografia é trava para a primeira tela do aluno? -> R: Sim; a home do aluno com paleta e tipografia aplicadas é a tela de amostra, aprovada pelo Mauri ou pelo professor antes de replicar no resto do app; é a trava da História 1 (RF-035).
- P: O card da análise de IA, branco por escolha registrada no commit bc51c17, continua claro com "só tema escuro"? -> R: Sim, como exceção documentada no tema com token próprio; é a única exceção à paleta escura (RF-036).
- P: Vermelho em botão destrutivo? -> R: Sim, como decisão derivada de "vermelho = erro ou bloqueio"; a cor avisa a perda antes do clique (RF-002).
- P: Pular o intervalo emite som ou vibração? -> R: Não; só o fim natural sinaliza (RF-022).
- P: Piso de tamanho de rótulo e de corpo de texto? -> R: 12 px para rótulos e chips, 14 px para corpo e botões (RF-017).
