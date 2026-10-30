---
id: F3.15
title: "F3.15 - Painel do professor: perfil do aluno quebrado em componentes, abas, menu e confirmações"
labels: [fase-3, frontend]
depends_on: [F3.14]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, História 4, cenários 4.1 (confirmações existentes em diálogo), 4.3, 4.4 (rascunho da IA em âmbar), 4.5 (aba Agenda com os componentes da aba Treinos), 4.6, RF-009, RF-010, RF-033 (TrendDelta neutro), teste independente da História 4 (só pelo teclado). `student-profile.tsx` tem 816 linhas e precisa ser quebrado sem mudar comportamento.

## Objetivo
Perfil do aluno no tema, dividido em componentes com menos de 200 linhas, com `AppTabs` (Avaliações, Fichas de Treino, Agenda), `ActionMenu`, `ConfirmDialog` para bloquear e excluir, e os modais de anamnese, avaliação e redefinição de senha em `AppDialog`.

## Escopo
- Quebrar `src/components/admin/student-profile.tsx` em: `StudentProfileHeader` (avatar, nome, `StatusChip`, `ActionMenu`), `StudentFinanceCard`, `StudentAnamnesisCard`, `StudentQuickStatus` (`TrendDelta` com variação zero e primeira vez em neutro), `RecentSessionsList` (`ExpandableCard`), `StudentProfileTabs`; hook `useStudentProfileActions` (pagamento, bloquear, desbloquear, excluir, carregar detalhe de sessão).
- Confirmações de bloquear e excluir aluno em `ConfirmDialog` com ação e alvo nomeados ("Bloquear Fulano", "Excluir Fulano"), destrutivo em vermelho.
- `anamnese-modal.tsx` (`AppSelect`, `YesNoToggle` no PAR-Q, dias da semana da Fase 2 em `AppCheckbox`), `add-avaliacao-modal.tsx` (`AppDateField`, campos numéricos, upload com botão rotulado), `reset-password-modal.tsx`, `avaliacao-card.tsx`, `comparativo-view.tsx` no tema.
- Aba Agenda (Fase 2): `WeekDayRow` com `AppSelect` por dia (ficha, descanso, livre), área de texto do descanso, `StatusChip` igual ao da aba Treinos; rascunho identificado por `AutoAwesomeSharp` e rótulo "Rascunho" em âmbar; sem roxo.
- `src/app/admin/alunos/[id]/loading.tsx` com a geometria final.

## Fora de escopo
- Construtor de fichas (F3.16); aqui ele continua montado no visual antigo dentro da aba.
- Confirmações novas para ações que hoje não pedem.
- Falhas de carga parcial.

## Critérios de aceite
- [ ] Só pelo teclado: abrir o perfil, trocar de aba com setas, abrir o menu de ações, abrir e cancelar com Escape a confirmação de exclusão.
- [ ] Bloquear, excluir aluno pedem confirmação no diálogo padronizado; ao confirmar, o comportamento é o de hoje.
- [ ] Nenhum popup nativo em nenhuma ação do perfil.
- [ ] Rascunho da IA aparece com ícone e rótulo em âmbar; nenhum roxo restante no perfil.
- [ ] Indicador de evolução sem variação aparece neutro.
- [ ] Aba Agenda usa os mesmos componentes e representação de status da aba Treinos do aluno.
- [ ] Modais em 390 px ocupam a tela com área segura e botão primário embaixo.
- [ ] Nenhum arquivo resultante passa de 200 linhas; comportamento idêntico no roteiro de regressão (pagamento, bloqueio, exclusão, anamnese, avaliação, senha).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/admin/alunos/[id]` nas três abas em 320, 390 e 1280 px; cada modal aberto; axe; roteiro de teclado

## Notas técnicas
- Quebra mecânica primeiro (mover JSX e handlers), commit, depois o visual; facilita revisar que nada mudou.
- A escada de status duplicada com `payment-manager.tsx` vira uma função única `planStatusTone()` em `src/lib/plan-status.ts`, consumida pelos dois (é consolidação de apresentação, não de regra).
