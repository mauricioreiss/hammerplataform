---
id: F3.12
title: "F3.12 - Sessão de treino: cronômetros pelo relógio, quebra em componentes e visual"
labels: [fase-3, frontend]
depends_on: [F3.10]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-023 (decisão derivada: intervalo e sessão pelo relógio), cenários 3.3, 3.5, 3.9, 3.10, 3.11, 3.13, casos de borda (320 px, teclado virtual, sessão restaurada, ilustração ausente, nomes longos). Plano, seção 7.3. O fluxo não muda: carga obrigatória, séries em ordem, intervalo entre séries, finalização só com 100%, fim do intervalo fecha sozinho e destaca o próximo.

## Objetivo
`workout-session.tsx`, `exercise-item.tsx`, `rest-timer-modal.tsx` e `exercise-history-modal.tsx` no tema, quebrados em componentes burros com hooks, com os dois cronômetros baseados em `Date.now()`.

## Escopo
- Hooks: `src/hooks/use-rest-timer.ts` (`endAt`, pausa congela, retomar continua, `visibilitychange` recalcula, `onComplete` uma vez, expõe `lateByMs` para F3.13), `use-session-clock.ts` (elapsed por relógio, compatível com `loadSession`), `use-workout-session.ts` (estado que hoje vive no componente: séries, cargas, expandido, persistência; sem mudança de regra).
- Componentes: `SessionHeader` (título em `display`, `SessionClock` em `numeral` tabular, `ProgressBar` interpolada), `ExerciseCard` (`ExpandableCard`; cabeçalho é `button` com `aria-expanded`, Enter e Espaço), `ExerciseFigure`, `LoadField` (`AppTextField` 16 px, `inputMode="decimal"`, erro em `InlineAlert`), `SetChips` (`SetChip`: concluída verde com ícone, próxima em prata, seguintes neutras desabilitadas; quebram linha em 320 px), `RestTimerDial` (SVG drena com `stroke-dashoffset` linear, Michroma no centro, reduz de tamanho em 320 px; pausado com `StatusChip` âmbar), `RestTimerDialog` (`AppDialog` com pausar e pular), `ExerciseHistoryDialog`.
- Selo "Treino concluído" em verde no modo leitura (dia já feito), sem cronômetro.
- Hidratação: `loadSession` sai do `useMemo` no render e vai para um efeito com estado `restoring` que mostra o esqueleto da sessão até restaurar, sem piscar o estado inicial.
- Toast próprio da sessão trocado por `useToast()`.

## Fora de escopo
- Vibração, som, comemoração, erro ao finalizar e `clientSessionId` (F3.13).
- Mudar regras de carga, ordem de séries ou finalização.

## Critérios de aceite
- [ ] Intervalo de 60 s: colocar o app em segundo plano por 20 s e voltar mostra 40 s restantes (tolerância de 1 s); voltar depois do fim mostra o cronômetro já fechado e o próximo exercício em destaque.
- [ ] Pausar congela o valor; o tempo em pausa não conta; retomar continua do valor congelado.
- [ ] Cronômetro da sessão: 2 min em segundo plano somam 2 min ao tempo exibido.
- [ ] Cabeçalho do exercício focável por Tab, expande com Enter e Espaço, anuncia `aria-expanded`.
- [ ] Em 320 px: chips de série quebram linha, o relógio do intervalo não corta números, sem rolagem horizontal; nome de exercício longo trunca sem sobrepor.
- [ ] Ao focar o campo de carga no iOS a página não dá zoom e o campo fica visível acima do teclado.
- [ ] Recarregar a página no meio da sessão restaura séries, cargas e tempo sem piscar o estado inicial.
- [ ] Barra e percentual interpolam; com reduzir movimento saltam.
- [ ] Nenhum arquivo tocado passa de 200 linhas; sem `lucide-react`, hex ou `zinc-*`.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/aluno/treino/[id]` em 320, 390 e 1280 px com intervalo aberto, pausado, nos últimos 5 s e sessão concluída; emulação de reduzir movimento; axe; iPhone real para o teclado virtual

## Notas técnicas
- A persistência (`workout-storage-utils.ts`) continua; ganha os campos `restEndAt` e `restPausedRemaining` para o intervalo sobreviver a um recarregamento (sem mudar o formato das chaves existentes).
- Tick por `setInterval` de 250 ms calculando `endAt - Date.now()`; nunca decrementar contador.
