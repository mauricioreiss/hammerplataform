---
id: F3.13
title: "F3.13 - Sessão de treino: vibração, som, comemoração e tentar de novo"
labels: [fase-3, frontend]
depends_on: [F3.12, F3.07, F2.11]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-021, RF-022, RF-024, RF-025 (lado do cliente), cenários 3.1, 3.2, 3.4, 3.6, 3.7, 3.8, 3.12, 3.14 e os casos de borda de som bloqueado, aparelho sem vibração, pular o intervalo e falha de rede. Plano, seções 7.1, 7.2, 7.4 e 7.5.

## Objetivo
Os três momentos de interatividade: vibrar ao concluir a série, som e vibração no fim natural do intervalo (com a janela de "poucos segundos" ao voltar do segundo plano), e a tela de comemoração com resumo; em falha, aviso padronizado e botão disponível para tentar de novo sem duplicar a sessão.

## Escopo
- `src/hooks/use-haptics.ts` (`navigator.vibrate` com guard; `tapDone` 30 ms, `intervalEnd` [120, 60, 120]).
- `src/hooks/use-interval-sound.ts` (cria o `Audio` de `public/sounds/interval-end.mp3` na primeira série marcada, `AudioContext.resume()` no iOS, `play()` com `catch` silencioso; sem pedido de permissão nem aviso).
- Ligar ao `useRestTimer`: fim natural emite som e vibração; ao voltar do segundo plano, emite uma vez se `lateByMs <= 10_000`, não emite se passou mais; pular não emite; pausar e retomar não emitem.
- `SessionCelebration` (`AppDialog fullScreen`, áreas seguras, entrada 400 ms com `opacity` e `scale`, números interpolados; com reduzir movimento, estado final): duração, exercícios e séries concluídos, dia da agenda para o qual contou (feito ou reposição de qual dia) ou "ficha avulsa", botão "Voltar ao início".
- `handleFinish` com `clientSessionId` (UUID gerado ao criar a sessão e persistido em `PersistedSession`); sucesso ou `alreadySaved` limpam o local e abrem a comemoração; falha chama `useToast().error(...)`, mantém os dados e libera o botão.
- Fluxo após a última série continua: intervalo abre indicando o final, ao terminar aparece o botão de finalizar.

## Fora de escopo
- Comparação de cargas com a sessão anterior.
- Notificação do sistema no fim do intervalo.
- Mudar o servidor: a finalização idempotente já vem da Fase 2 (F2.11).

## Critérios de aceite
- [ ] Android: marcar série vibra; fim do intervalo toca o som e vibra; o cronômetro fecha e a próxima série fica em destaque sem toque extra.
- [ ] iPhone: o mesmo fluxo completa sem vibração e sem erro no console; com o aparelho fora do silencioso o som toca após a primeira série marcada.
- [ ] Segundo plano durante o intervalo: voltar 5 s depois do fim emite som e vibração uma vez; voltar 30 s depois não emite e o fluxo já seguiu.
- [ ] Pular o intervalo não emite som nem vibração.
- [ ] Finalizar com sucesso abre a comemoração com os quatro dados e volta ao início pelo botão; a duração mostrada bate com a gravada no histórico (tolerância de 2 s).
- [ ] Simular falha de rede ao finalizar: toast de erro, botão volta a ficar disponível, dados locais intactos; tentar de novo com rede grava uma única sessão.
- [ ] Simular timeout após o servidor gravar (atrasar a resposta com o DevTools): a segunda tentativa recebe sucesso e abre a comemoração; uma única linha no banco.
- [ ] Com reduzir movimento, a comemoração aparece sem animação e vibração e som continuam.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: comemoração em 320, 390 e 1280 px, no iPhone com notch; emulação de reduzir movimento; axe
- [ ] Aparelhos reais: um Android e um iPhone, com e sem silencioso (CS-018)

## Notas técnicas
- `LATE_SIGNAL_WINDOW_MS = 10_000` como constante nomeada no hook; é o "poucos segundos" da spec.
- O `clientSessionId` é gerado com `crypto.randomUUID()`; sessões já persistidas antes desta entrega sem o campo recebem um id na primeira restauração.
- O dia para o qual a sessão contou vem do que a Fase 2 já passa ao componente (dia ligado à sessão); sem consulta nova.
