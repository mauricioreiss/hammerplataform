---
id: F3.07
title: "F3.07 - Som do fim do intervalo e aprovação do Mauri"
labels: [fase-3, design]
depends_on: [F2]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-037 e CS-019: o som do fim do intervalo é um arquivo curto, próprio, livre de direitos, aprovado pelo Mauri antes de entrar no app. Depende de pessoa, por isso é issue própria.

## Objetivo
Ter `public/sounds/interval-end.mp3` (e `.ogg` opcional) aprovado e registrado, pronto para F3.13.

## Escopo
- Produzir ou obter um som curto (0,4 a 0,8 s), com ataque claro e sem cauda longa, com licença que permita uso comercial sem atribuição (CC0 ou criado para o projeto); registrar a origem e a licença em `public/sounds/LICENSE.txt`.
- Normalizar para -14 LUFS aproximados e exportar em MP3 (128 kbps) e OGG; tamanho abaixo de 30 kB cada.
- Apresentar ao Mauri duas opções no máximo; registrar a escolhida.

## Fora de escopo
- Ligar o som ao cronômetro (F3.13).
- Som para outros eventos.

## Critérios de aceite
- [ ] Arquivo e licença no repositório; licença compatível com uso comercial.
- [ ] Mauri aprovou (data): ______ e qual opção: ______
- [ ] O som toca em Android Chrome e iOS Safari a partir de um botão de teste na página `/dev/componentes` (com o aparelho fora do silencioso).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] Teste do som em um Android e um iPhone reais

## Notas técnicas
- No iOS o `HTMLAudioElement` respeita o interruptor de silencioso; isso é esperado e aceito pela spec.
- Não usar som gerado por `OscillatorNode`: a spec pede arquivo próprio aprovado.
