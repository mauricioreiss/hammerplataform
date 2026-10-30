---
id: F3.16
title: "F3.16 - Painel do professor: construtor de fichas quebrado em componentes com seletores do sistema"
labels: [fase-3, frontend]
depends_on: [F3.15]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, cenário 4.2 (seletor padronizado no construtor), 4.1 (excluir ficha em diálogo), RF-009, RF-010, RF-011, teste independente da História 4 (criar ficha com dois exercícios pelo teclado e publicar). `workout-builder.tsx` tem 1135 linhas e cinco subcomponentes internos; precisa ser quebrado sem mudar comportamento.

## Objetivo
Construtor de fichas no tema, dividido em arquivos com menos de 200 linhas, com `AppSelect`/`Autocomplete` para grupo muscular e exercício da biblioteca, `AppDialog` no editor, `ConfirmDialog` na exclusão (já ligado em F3.05) e avisos padronizados.

## Escopo
- Dividir `src/components/admin/workout-builder.tsx` em `src/components/admin/workout-builder/`: `WorkoutBuilder` (lista e ações), `WorkoutCreatorDialog`, `ExerciseDraftRow`, `WorkoutCard`, `InlineAddExercise`, `AiDraftNotice` (ícone e rótulo em âmbar, sem roxo), `AiErrorDialog` (`AppDialog`, link para o billing em `AppButton` secundário); hooks `useWorkoutDraft` (estado do editor) e `useWorkoutActions` (publicar, salvar, excluir, gerar por IA).
- Grupo muscular em `AppSelect`; exercício da biblioteca em `Autocomplete` (lista longa); `MUSCLE_GROUPS` duplicado com `add-exercise-modal.tsx` consolidado em `src/lib/muscle-groups.ts`.
- Botão de arrastar decorativo (`GripVertical`) removido do visual, já que não há ordenação (fora de escopo mudar isso); nada mais muda na lógica.
- Erros de salvar e publicar em `InlineAlert` dentro do diálogo; sucesso em toast.
- Remover o import morto de `getMuscleGroups`.

## Fora de escopo
- Ordenação de exercícios, recriação de exercícios ao editar, transações (fase de robustez).
- Biblioteca de exercícios (F3.17).

## Critérios de aceite
- [ ] Só pelo teclado: criar uma ficha com dois exercícios escolhendo grupo muscular pelo seletor e publicar; nenhum popup nativo.
- [ ] Seletor de grupo muscular tem a mesma aparência do seletor de ciclo nas configurações (F3.17) e dos demais do sistema.
- [ ] Excluir ficha pede confirmação nomeada e, ao confirmar, exclui como antes.
- [ ] Rascunho da IA identificado por ícone e rótulo em âmbar; nenhum roxo.
- [ ] Nenhum arquivo passa de 200 linhas; `npm run build` sem avisos de import não usado.
- [ ] Roteiro de regressão: criar, editar, adicionar exercício inline, publicar, excluir, gerar por IA (com e sem créditos) funcionam como antes.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: aba Fichas de Treino com editor aberto em 320, 390 e 1280 px; axe; roteiro de teclado

## Notas técnicas
- Quebra mecânica primeiro, commit, depois visual (mesma regra de F3.15).
- `Autocomplete` carrega a biblioteca que já vem por props; sem chamada nova.
