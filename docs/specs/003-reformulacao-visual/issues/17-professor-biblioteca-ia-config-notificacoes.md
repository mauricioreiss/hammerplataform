---
id: F3.17
title: "F3.17 - Painel do professor: biblioteca de exercícios, análise por IA, configurações, planos e notificações"
labels: [fase-3, frontend]
depends_on: [F3.14]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, cenário 4.8 (card da análise de IA em superfície de leitura), 4.2 (seletor de ciclo), 4.7 (esqueletos nas telas que hoje não têm), RF-009, RF-011, RF-012, RF-031, RF-036. Plano, seções 6 e 10.

## Objetivo
Restante do painel no tema: `/admin/exercicios` e `[id]`, `/admin/ia` e `[id]`, `/admin/configuracoes` (perfil, PIX, planos) e o painel de notificações já migrado em F3.10 conferido no contexto do professor.

## Escopo
- `src/app/admin/exercicios/page.tsx`, `add-exercise-modal.tsx` (`AppDialog`, `AppSelect`), `seed-exercises-button.tsx`, `exercicios/[id]/exercise-editor.tsx` (`ExerciseFigure`, botão de upload rotulado, remover ilustração sem confirmação nova), `loading.tsx` de `[id]` criado.
- `src/app/admin/ia/page.tsx`, `ia/[id]/analysis-view.tsx`: card de leitura com `surface.reading`, `surface.readingText` e `surface.readingMuted`; o markdown da análise é renderizado por um componente de markdown que gera nós React (sem HTML cru), com a tipografia do tema para títulos, listas e ênfase; botão "Gerar nova análise" desabilitado enquanto carrega; `loading.tsx` de `[id]` criado. Ícone e rótulo de IA sem roxo.
- `src/app/admin/configuracoes/page.tsx`, `admin-settings-form.tsx` (`AvatarUpload`, `AppTextField`), `plan-manager.tsx` quebrado em `PlanList`, `PlanForm` (`AppSelect` no ciclo), `PlanCard`; `loading.tsx` revisado.
- `NotificationPanel` conferido no cabeçalho do professor (já migrado em F3.10).

## Fora de escopo
- Corrigir o mapeamento das perguntas do PAR-Q na análise (gotcha 22, fora de escopo funcional), exceto que o rótulo exibido deixa de mostrar "Pergunta q0" se a correção couber em uma linha de apresentação; registrar se não couber.
- Chave PIX como payload BR Code.

## Critérios de aceite
- [ ] Card da análise de IA é a única superfície clara da plataforma, com texto legível (contraste da seção 5.2) e títulos, listas e negrito renderizados.
- [ ] A análise é renderizada por nós React gerados pelo componente de markdown (inspeção do DOM); nenhuma string de HTML montada no cliente.
- [ ] Seletor de ciclo nos planos idêntico ao do construtor de fichas.
- [ ] `/admin/exercicios/[id]` e `/admin/ia/[id]` têm esqueleto próprio com a geometria final.
- [ ] Cadastro de exercício e de plano funcionam como antes no roteiro de regressão.
- [ ] Arquivos sem `lucide-react`, `<select>`, hex, `zinc-*` ou `purple-*`; nenhum acima de 200 linhas.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: as cinco rotas em 320, 390 e 1280 px; axe; Lighthouse CLS

## Notas técnicas
- Componente de markdown: `react-markdown` sem plugins de HTML, ou um parser mínimo próprio que produza React para `#`, `##`, `###`, `**`, `-` e parágrafos, suficiente para a saída atual. Decidir pelo tamanho no bundle (o orçamento da seção 9 do plano); registrar a escolha.
- `surface.reading` nunca é exportado como utilitário genérico; só o `ReadingCard` o consome.
