---
id: F3.04
title: "F3.04 - Componentes base, lote 1: botões, campos, seletores, chips, card, avisos e esqueleto"
labels: [fase-3, frontend]
depends_on: [F3.03]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-008 (um componente por tipo), RF-011, RF-012, RF-013, RF-015, RF-018, RF-019; inventário na seção 6 do plano.

## Objetivo
Criar em `src/components/ui/` os componentes do lote 1, burros, tipados, com menos de 200 linhas cada, e exibi-los em cada estado na página interna de componentes.

## Escopo
- `AppButton` (`variant: primary | secondary | destructive | text`, `loading`, ícone opcional), `AppIconButton` (`aria-label` obrigatório na tipagem).
- `AppTextField` (label acima, `hint`, `error` ligado por `aria-describedby`, `multiline`), `AppDateField`, `AppSelect` (`Select` + `MenuItem`, e `Autocomplete` quando `searchable`), `AppCheckbox`, `YesNoToggle`.
- `StatusChip` (`tone: success | warning | error | neutral`, ícone Sharp + texto), `SetChip` (`state: done | next | locked`, ícone + "Série N"), `TrendDelta` (`up | down | flat`, flat neutro).
- `AppCard`, `ExpandableCard` (cabeçalho é `button` com `aria-expanded` e `aria-controls`, abre com Enter e Espaço).
- `InlineAlert` (`severity`, `role="alert"` para erro e `role="status"` para o resto), `ToastHost` + `useToast()` (um `Snackbar` montado no `ThemeRegistry`; `error()` usa `role="alert"`; não rouba foco).
- `AppSkeleton` (`variant: text | rect | circle`, largura e altura por prop; sem pulsar com reduzir movimento), `ProgressBar` (valor interpolado por `requestAnimationFrame`, salto direto com reduzir movimento, `aria-valuenow`), `EmptyState`.
- Página `/dev/componentes` com cada um em padrão, hover, foco, desabilitado, carregando e erro.

## Fora de escopo
- Modal, confirmação, menu, abas, navegações, cabeçalho, avatar, cronômetros (F3.05 e issues de área).
- Usar os componentes em telas de produto.

## Critérios de aceite
- [ ] Cada componente tem um único arquivo em `components/ui`, exporta uma função nomeada, tipagem sem `any`, menos de 200 linhas.
- [ ] `AppIconButton` sem `aria-label` não compila.
- [ ] `StatusChip`, `SetChip` e `TrendDelta` comunicam estado por ícone e texto, não só por cor.
- [ ] `useToast().error("x")` aparece com `role="alert"` e o foco permanece onde estava.
- [ ] `ProgressBar` interpola de 25% a 75% em 400 ms e, com reduzir movimento, salta.
- [ ] Nenhum componente visível na página tem cor, fonte, elevação, ripple ou forma reconhecível do Material padrão (checagem lado a lado com a demo do MUI).
- [ ] Rótulos e chips com 12 px no mínimo, corpo e botões com 14 px no mínimo.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/dev/componentes` em 320, 390 e 1280 px; axe sem violações; Tab percorre todos os controles com anel de foco visível

## Notas técnicas
- Ícones só de `@mui/icons-material/<Nome>Sharp`, import por caminho.
- `AppTextField` para carga usa `inputMode="decimal"` e tamanho de fonte de 16 px no celular para o iOS não dar zoom ao focar.
- `ExpandableCard` anima com `Collapse` do MUI (respeita `motion.reducedMotion`).
