---
id: F3.09
title: "F3.09 - Tela de amostra: home do aluno com o tema e aprovação"
labels: [fase-3, frontend, design]
depends_on: [F3.04, F3.05]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-035, RF-007 e cenários 1.1, 1.2, 1.7, 1.8: a home do aluno com paleta, tipografia e componentes aplicados é a tela de amostra e precisa da aprovação do Mauri ou do professor antes de qualquer outra tela receber o tema. É a trava da História 1.

## Objetivo
`/aluno` inteiramente no tema (treino do dia, alerta de pagamento, convite de instalação, estados vazios da Fase 2 e esqueleto), aprovada e registrada.

## Escopo
- `src/app/aluno/page.tsx`, `loading.tsx`, `src/components/aluno/workout-day-card.tsx`, `payment-alert.tsx`, `install-prompt.tsx` migrados para `components/ui` (AppCard, AppButton, StatusChip, InlineAlert em âmbar ou vermelho conforme o plano, AppSkeleton com a geometria final).
- Estados da Fase 2 na home ("Seu professor está montando sua agenda", "Dia livre", descanso com texto, atalho de reposição) com `EmptyState` e os componentes padronizados; textos iguais aos da Fase 2.
- Verificação do RF-007 na própria tela: cada componente comparado com o padrão do MUI.
- Apresentar ao Mauri ou ao professor em celular (390 px) e registrar a aprovação.

## Fora de escopo
- Cabeçalho, navegação e layout do aluno (F3.10); eles continuam no visual antigo nesta issue, o que é aceitável porque a amostra é a área de conteúdo.
- Qualquer outra rota.

## Critérios de aceite
- [ ] Toda cor da home vem do tema (inspeção no DevTools: só `--mui-*` e tokens); nenhum `zinc-*`, `red-*` ou hex no JSX desta tela.
- [ ] Texto em Montserrat, título em Michroma; nenhum `font-black italic uppercase`.
- [ ] Esqueleto substituído pelo conteúdo sem deslocamento (CLS medido abaixo de 0,1).
- [ ] Sem rolagem horizontal em 320 px.
- [ ] Aprovação registrada (quem e data): ______ / ______
- [ ] Ajustes pedidos (se houver) aplicados nos tokens, não na tela: ______

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/aluno` em 320, 390 e 1280 px, nos estados: treino do dia pendente, dia feito, dia livre, descanso, agenda vazia, plano vencendo, plano atrasado; axe sem violações; Lighthouse CLS

## Notas técnicas
- Enquanto a aprovação não vier, nenhuma outra issue de tela (F3.10 em diante, F3.14 em diante) começa. F3.06 e F3.07 podem andar.
- Um pedido de mudança de tom muda `src/theme/tokens.ts`; se mudar a família tipográfica, reabrir a decisão com o Mauri porque a spec a fixa.
