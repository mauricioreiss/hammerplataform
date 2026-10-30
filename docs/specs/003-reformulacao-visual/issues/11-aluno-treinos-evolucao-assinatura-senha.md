---
id: F3.11
title: "F3.11 - App do aluno: aba Treinos, Evolução, Assinatura e troca de senha"
labels: [fase-3, frontend]
depends_on: [F3.10]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, História 2 (cenários 2.1, 2.2, 2.3, 2.5, 2.6), RF-009, RF-011, RF-012, RF-013, RF-030, RF-033 (gráficos e variação zero neutra). As telas da Fase 2 (agenda de segunda a domingo, "Outras fichas", dia já feito) entram aqui com os textos e estados que a Fase 2 definiu.

## Objetivo
Todas as telas de leitura do aluno no tema, com esqueletos da geometria final, estados vazios da Fase 2 e gráficos na paleta.

## Escopo
- `src/app/aluno/treino/page.tsx` e `loading.tsx`: `WeekDayRow` por dia (ícone + texto + `StatusChip` só quando há status do dia: verde feito ou reposto, âmbar não realizado; pendente, descanso e livre sem cor cromática), hoje em destaque por borda `primary.main` e rótulo "Hoje", seção "Outras fichas" com `AppCard`.
- `src/app/aluno/evolucao/client-page.tsx` quebrado em `EvolucaoTabs`, `PhysicalComparison`, `LoadTrendCard` e `TrendLineChart` (recharts com `next/dynamic` e esqueleto próprio); cores por `useTheme()` (`chart.series1`, grid em `divider`, tooltip em superfície 2); `TrendDelta` com verde para melhora, vermelho para piora (semântica atual: perda de peso e gordura é melhora) e neutro para variação zero.
- `src/components/aluno/payment-manager.tsx` quebrado em `PlanStatusCard`, `PixPaymentStep` (`PixQrCode` sobre `surface.reading`) e o hook `usePaymentNotify`; "Copiado!" vira toast de sucesso; erro em `InlineAlert`; escada de status em `StatusChip`.
- `src/components/aluno/change-password-form.tsx`: `AppTextField` com rótulo e botão de mostrar senha com `aria-label`; erros em `InlineAlert`.
- `src/app/aluno/trocar-senha/loading.tsx` criado (hoje não existe).

## Fora de escopo
- Sessão de treino e histórico de exercício (F3.12).
- Separar erro de vazio nas leituras.

## Critérios de aceite
- [ ] Aba Treinos com agenda preenchida (feito, não realizado, descanso, livre, avulsa) mostra cada estado por ícone e texto, cor só onde há status, em 320 px sem rolagem horizontal.
- [ ] Agenda vazia mostra as mensagens da Fase 2 com `EmptyState`.
- [ ] Esqueletos de Treinos, Evolução, Assinatura e troca de senha substituídos sem deslocamento (CLS < 0,1).
- [ ] Gráficos usam só cores do tema; indicador com variação zero aparece neutro (sem verde nem vermelho).
- [ ] `/aluno/assinatura` com plano pendente, em análise, vencendo, atrasado, bloqueado e ativo mostra o chip no tom certo.
- [ ] Nenhum arquivo tocado passa de 200 linhas; nenhum `lucide-react`, `<select>`, hex ou `zinc-*` restante nesses arquivos.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: as quatro rotas em 320, 390 e 1280 px nos estados listados; axe; Lighthouse CLS

## Notas técnicas
- `getTreinoEvolution` e as datas `YYYY-MM-DD` continuam como estão (fuso é fora de escopo); só a apresentação muda.
- O `PixQrCode` é o único lugar, além do card de IA, que usa o token claro; qualquer outro uso falha CS-003.
