---
id: F3.03
title: "F3.03 - Tema próprio: tokens de cor, tipografia, raio, elevação e movimento"
labels: [fase-3, frontend, design]
depends_on: [F3.02]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-001, RF-002, RF-003, RF-007, RF-016, RF-017, RF-019, RF-020, RF-036, e seção 5 do plano (valores e contraste conferido). Esta issue materializa o tema; nenhuma tela ainda o consome além da página interna de componentes.

## Objetivo
`src/theme/` completo: paleta monocromática metálica com os papéis e valores do plano, tipografia Montserrat/Michroma com variantes `display`, `numeral` e `label`, raios, duas elevações, tokens de movimento, `motion.reducedMotion: "system"`, ripple desligado e o token `surface.reading`.

## Escopo
- `src/theme/tokens.ts`, `palette.ts`, `typography.ts`, `components.ts`, `theme.ts`, `theme.d.ts` (module augmentation para `background.raised`, `border.subtle/strong`, `status.*Bg`, `focusRing`, `surface.reading*`, `chart.*`, variantes tipográficas novas).
- `createTheme({ cssVariables: true, colorSchemes: { dark: { palette } }, modularCssLayers, spacing: 4, shape: { borderRadius: 8 }, motion: { reducedMotion: "system" }, transitions: { duration, easing } })`.
- `components.ts`: `MuiButtonBase.defaultProps.disableRipple: true`; `MuiButton` (sem caixa alta, altura mínima 44 px no celular, `:active` com `scale(0.98)`, gradiente metálico discreto no `contained`); `MuiOutlinedInput` (borda `border.strong`, foco com `focusRing`); `MuiPaper` (superfícies 1 e 2 por `elevation` 1 e 2, sem imagem de gradiente do Material); `MuiDialog`, `MuiMenu`, `MuiSnackbar`, `MuiChip`, `MuiTabs`, `MuiSkeleton`, `MuiLinearProgress`; `MuiCssBaseline` com `color-scheme: dark`, seleção de texto em prata e `::focus-visible` global.
- `src/hooks/use-reduced-motion.ts`.
- `src/app/dev/componentes/page.tsx` (só em desenvolvimento, `notFound()` fora dele) mostrando a paleta, a escala tipográfica e, a partir de F3.04, cada componente em cada estado.

## Fora de escopo
- Componentes base (F3.04, F3.05).
- Aplicar o tema em qualquer tela de produto.

## Critérios de aceite
- [ ] Toda cor, fonte, raio, sombra e duração está em `src/theme/`; nenhum hex fora dessa pasta foi criado por esta issue.
- [ ] A página `/dev/componentes` mostra a paleta com os pares da seção 5.2 do plano e o axe não acusa contraste em nenhum par de texto.
- [ ] `Button` padrão renderiza sem ripple, sem caixa alta, sem a sombra do Material e com o `:active` comprimindo.
- [ ] Com `prefers-reduced-motion: reduce` emulado, um `Dialog` de teste abre no estado final sem animação.
- [ ] `/dev/componentes` responde 404 em `npm run build && npm run start`.
- [ ] Michroma renderiza "Evolução" e "Sessão" sem fallback, ou a regra de fallback do plano está aplicada e registrada.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/dev/componentes` em 320, 390 e 1280 px; emulação de reduzir movimento no DevTools

## Notas técnicas
- Valores dos tokens: seção 5 do plano. Mudança de tom depois da tela de amostra altera só `tokens.ts`.
- `spacing: 4` alinha `sx={{ p: 4 }}` a `p-4` do Tailwind (16 px).
- `shadows`: índices 0, 1 e 2 definidos; 3 a 24 apontam para o 2 para nunca sair a sombra padrão.
- Doc MUI confirmada para `cssVariables`, `colorSchemes`, `motion.reducedMotion: "system"`, `disableRipple` e `modularCssLayers`.
