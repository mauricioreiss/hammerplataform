# Plano técnico: Reformulação visual

**Spec**: [spec.md](./spec.md) | **ADR**: [0001](../../adr/0001-material-ui-como-design-system.md) | **Criado em**: 2026-10-17 | **Depende de**: Fase 2 (agenda semanal) entregue

Este plano define o COMO da Fase 3. O QUÊ está fechado na spec e não é reaberto aqui. As issues ficam em `issues/NN-slug.md`; a rastreabilidade RF -> issue está no final.

## 1. Resumo técnico

Trocamos o visual da plataforma inteira por um tema próprio sobre o Material UI v9, mantendo o Tailwind v4 só para layout e espaçamento, conforme o ADR 0001. A fundação (tema, tokens, providers, componentes base) entra primeiro e é validada numa tela de amostra (home do aluno) que precisa de aprovação antes de qualquer outra tela mudar. Depois a migração segue tela a tela na ordem combinada: app do aluno, painel do professor, login e landing. No final, shadcn/Base UI, lucide, `tw-animate-css` e a fonte Geist saem do projeto.

As únicas mudanças de comportamento são as da spec: cronômetros pelo relógio (RF-023), vibração e som (RF-021, RF-022), comemoração ao finalizar (RF-024) e finalização idempotente com botão que não trava (RF-025). O RF-025 toca o servidor e é tratado numa issue própria de backend, coordenada com a Fase 2.

Durante a migração, `workout-builder.tsx` (1135 linhas) e `student-profile.tsx` (816 linhas) são quebrados em componentes com menos de 200 linhas, com a lógica em hooks, sem mudar o que fazem.

## 2. Contexto técnico

### Versões atuais (package.json em 7b7714c)

| Pacote | Versão | Situação na fase |
|---|---|---|
| next | 16.2.6 | mantém |
| react / react-dom | 19.2.4 | mantém |
| typescript | ^5 (strict) | mantém |
| tailwindcss / @tailwindcss/postcss | ^4 (CSS-first, sem `tailwind.config`) | mantém, só layout e espaçamento |
| recharts | ^3.10.1 | mantém, recebe a paleta via props |
| qrcode.react | ^4.2.0 | mantém |
| zod | ^4.4.3 | mantém |
| @base-ui/react | ^1.5.0 | **remover ao final** (RF-034) |
| shadcn | ^4.8.0 | **remover ao final** |
| lucide-react | ^1.16.0 (47 arquivos importam) | **remover ao final** (RF-004) |
| tw-animate-css | ^1.4.0 | **remover ao final** (animações passam a transições do tema) |
| class-variance-authority, clsx, tailwind-merge | | `clsx`/`tailwind-merge` ficam se `cn()` continuar útil para classes de layout; `class-variance-authority` sai com o shadcn |
| Geist / Geist_Mono (next/font) | | **remover** (RF-003) |

### Pacotes a adicionar

| Pacote | Para quê |
|---|---|
| `@mui/material` (v9) | componentes e `createTheme` |
| `@mui/material-nextjs` | `AppRouterCacheProvider` com `enableCssLayer` |
| `@emotion/react`, `@emotion/styled`, `@emotion/cache` | runtime do MUI (peer deps) |
| `@mui/icons-material` (v9) | Material Icons, variante Sharp (`NomeSharp`) |
| `@axe-core/playwright` ou `@axe-core/cli` (dev) | auditoria de contraste e acessibilidade por rota |
| `@playwright/test` (dev) | screenshots em 320, 390 e 1280 px e roteiro de QA visual; não vira suíte de testes de interface (fora de escopo), só ferramenta de QA |

Sem lib de animação (Motion/Framer). As transições da fase cabem em `transition` CSS com os tokens do tema e nos componentes de transição do próprio MUI (`Fade`, `Collapse`, `Dialog`), que respeitam `theme.motion.reducedMotion`.

Sem lib de toast. O aviso transitório é um `Snackbar` do MUI com `Alert`, um único em toda a plataforma, controlado por um hook.

## 3. Arquitetura do design system

```
src/
  theme/
    tokens.ts            # valores primitivos (cores, raios, durações, curvas) tipados e sem uso direto em tela
    palette.ts           # papéis de cor (semânticos) montados a partir dos primitivos
    typography.ts        # escala Montserrat/Michroma, pisos de 12 e 14 px, números tabulares
    components.ts        # styleOverrides e defaultProps por componente MUI (ripple off, sombras, raios)
    theme.ts             # createTheme({ cssVariables, colorSchemes: { dark }, modularCssLayers, motion })
    theme.d.ts           # module augmentation: tokens novos (surface.reading, status.*, chart.*)
    ThemeRegistry.tsx    # "use client": AppRouterCacheProvider + ThemeProvider + CssBaseline + Snackbar host
  components/
    ui/                  # UM componente por tipo (inventário na seção 6). Burros, tipados, < 200 linhas
      app-button.tsx, app-text-field.tsx, app-select.tsx, app-dialog.tsx, confirm-dialog.tsx,
      status-chip.tsx, app-skeleton.tsx, inline-alert.tsx, toast-host.tsx, ...
    aluno/, admin/, landing/   # telas, compostas só com components/ui e layout Tailwind
  hooks/
    use-toast.ts, use-rest-timer.ts, use-session-clock.ts, use-haptics.ts, use-interval-sound.ts,
    use-reduced-motion.ts, use-confirm.ts
  app/
    layout.tsx           # fontes (Montserrat, Michroma), ThemeRegistry, viewport com viewportFit cover e themeColor
    globals.css          # @layer theme, base, mui, components, utilities; @import "tailwindcss"; tokens de espaçamento
    manifest.ts          # ícones maskable, theme_color da paleta
    dev/componentes/     # página interna de componentes (só em desenvolvimento) com cada tipo em cada estado
```

### Onde fica cada coisa

- **Tokens e tema**: só em `src/theme/`. Componente de tela nunca escreve cor, fonte, raio, sombra ou duração; usa `sx` com chaves do tema (`color: "text.secondary"`, `bgcolor: "background.paper"`) ou `theme.vars.*`. `cssVariables: true` expõe tudo como `--mui-*`, o que permite que `globals.css` (e qualquer CSS do Tailwind) referencie a mesma fonte de verdade sem duplicar valores. Confirmado na doc: `createTheme` com `cssVariables` e `colorSchemes` gera as variáveis, e tokens extras na `palette` viram `theme.vars.palette.*` com augmentation TypeScript.
- **Providers**: `ThemeRegistry` é o único client boundary da fundação e envolve `children` no root layout. `AppRouterCacheProvider` com `options={{ enableCssLayer: true }}` coloca o CSS do Emotion em `@layer mui`. O import é `@mui/material-nextjs/v15-appRouter` (a doc diz "ou `v1X-appRouter` conforme a major do Next"); **confirmar na doc / README do pacote se existe `v16-appRouter` na versão instalada**; se não existir, `v15-appRouter` é o entry documentado.
- **Convivência com o Tailwind v4**: `globals.css` começa com `@layer theme, base, mui, components, utilities;` antes de `@import "tailwindcss";` e o tema usa `modularCssLayers: "@layer theme, base, mui, components, utilities;"`. Resultado: utilitários do Tailwind (`p-4`, `gap-3`, `grid`) ganham do CSS do MUI quando os dois tocam a mesma propriedade, sem `!important`. Confirmado na doc de integração Tailwind v4 do MUI.
- **O que o Tailwind faz**: layout (`flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `max-w-*`, `hidden md:flex`, `truncate`, `aspect-*`). A escala de espaçamento é a do Tailwind (base 4 px). O `spacing` do tema MUI é alinhado a 4 px (`spacing: 4`) para que `sx={{ p: 4 }}` e `p-4` deem o mesmo 16 px e ninguém precise converter.
- **O que o Tailwind não faz mais**: cor, fonte, raio, sombra, animação. A paleta padrão é apagada no `@theme` (`--color-*: initial`) junto com a limpeza final, para `bg-red-600` deixar de existir por acidente; até lá, o lint da issue de limpeza aponta cada uso.
- **Componentes base** (`components/ui`): wrappers finos sobre o MUI que fixam variante, tamanho, ícone e textos de acessibilidade do projeto. Regra: se o componente só repassa props sem fixar nada, não existe (usa-se o MUI direto). Se fixa decisão de design (ex.: `ConfirmDialog` com título, ação nomeada e botão destrutivo), existe. Um por tipo (RF-008, CS-014).
- **Telas**: compostas só com `components/ui`, `components/<área>` e utilitários de layout. Estado e efeitos em hooks (`src/hooks`), componente visual puro e tipado, menos de 200 linhas.
- **Página interna de componentes** (`/dev/componentes`): renderiza cada componente do inventário em cada estado (padrão, hover, foco, desabilitado, carregando, erro). Serve para a verificação do RF-007 (nada do visual padrão do MUI) e para o QA de contraste. Protegida por `process.env.NODE_ENV !== "production"` com `notFound()`, para não publicar rota de desenvolvimento no deploy da Vercel.

## 4. Decisões com trade-offs

| Decisão | Alternativa descartada | Por quê |
|---|---|---|
| `cssVariables: true` + `colorSchemes: { dark: {...} }` sem `light` | `palette.mode: "dark"` simples | Variáveis CSS permitem referenciar os tokens em `globals.css`, no `theme-color` e em SVG sem duplicar hex; e evitam o flash de tema no SSR. Só o esquema escuro é definido (spec: sem tema claro). **Confirmar na doc** se `colorSchemes: { dark: {...} }` sem `light` exige `defaultColorScheme: "dark"` no `createTheme` e no `InitColorSchemeScript`; se o MUI gerar `light` por padrão, fixar `defaultColorScheme: "dark"` e não renderizar seletor. |
| Ripple desligado globalmente (`MuiButtonBase.defaultProps.disableRipple`) e feedback por `transform: scale(0.98)` no `:active` | Ripple do Material | O ripple é a assinatura mais reconhecível do Material (RF-007) e anima `opacity` + `transform` em um pseudo-elemento extra. Compressão ao pressionar é o feedback da spec. Confirmado na doc. |
| `motion.reducedMotion: "system"` no tema + `useReducedMotion` para o que o MUI não controla (interpolação de número, pulsar de esqueleto) | Só media query em CSS | O MUI v9 tem a opção no tema, que faz `Fade`, `Collapse`, `Dialog` e `Snackbar` saltarem ao estado final. Confirmado na doc. O que é nosso (contador animado, barra, esqueleto) consulta `matchMedia("(prefers-reduced-motion: reduce)")` num hook. |
| Esqueleto: `Skeleton` do MUI com `animation="wave"` desligado quando reduzir movimento, caso contrário `pulse` com amplitude baixa | Shimmer gradiente em cada bloco | Shimmer em dezenas de blocos pesa em celular de entrada (Motion-com-Proposito). A variação de luminosidade sutil da spec é o `pulse` do MUI com `opacity` reduzida no override. |
| Modal: `Dialog` do MUI com `fullScreen` abaixo de `sm` | Modal próprio `fixed inset-0` | O `Dialog` já entrega `role="dialog"`, `aria-modal`, foco preso, Escape e devolução de foco (RF-014). Em celular ocupa a tela e respeita a área segura via `PaperProps.sx` com `env(safe-area-inset-*)`. |
| Confirmação: um `ConfirmDialog` único com `title`, `description`, `confirmLabel`, `destructive` | Um modal de confirmação por tela | Hoje há três confirmações feitas à mão e uma nativa; uma só com ação nomeada atende RF-010. |
| Aviso transitório: um `Snackbar` + `Alert` montado no `ThemeRegistry`, acionado por `useToast()` | Sonner ou toast por componente | Um só host com `role="status"` para sucesso e `role="alert"` para erro (RF-018). O `workout-session` hoje tem o próprio toast; passa a usar o host. |
| Seletor: `Select` do MUI com `MenuProps` fixando a superfície do tema | `<select>` nativo estilizado | O nativo não deixa controlar o visual do popup em iOS e Android e quebra a regra "mesma aparência em todas as telas" (RF-009). Para listas longas (biblioteca de exercícios), `Autocomplete`. |
| Gráficos continuam em recharts com cores vindas de `theme.vars` | MUI X Charts | Não há motivo funcional para trocar; MUI X é mais um pacote e outra API. As cores entram por props (`stroke`, `fill`, `contentStyle`) lidas do tema via `useTheme()`. |
| Cronômetros por `performance.now()`/`Date.now()` com `requestAnimationFrame` de 250 ms | `setInterval` de 1 s contando ticks | Ticks atrasam em segundo plano (gotcha 35) e é a causa do RF-023. Com relógio, o tempo restante é `endAt - now`; pausar guarda `remainingAtPause`. |
| Som por `HTMLAudioElement` pré-carregado na primeira interação + `AudioContext` como fallback de desbloqueio no iOS | Web Audio puro gerando o tom | A spec pede arquivo próprio aprovado (RF-037). O elemento de áudio é o mais simples; o `AudioContext.resume()` na primeira interação destrava o som no iOS quando o aparelho não está no silencioso físico. |
| Vibração por `navigator.vibrate` com guard `typeof navigator.vibrate === "function"` | Nada | iOS Safari não implementa; o guard retorna `false` sem erro (RF-021). |
| Marca em SVG inline como componente React (`BrandMark`) com `currentColor` | PNG/JPEG existentes | Vetor escala no cabeçalho, no splash e no ícone; `currentColor` pega a prata do tema. PNG/ICO dos ícones instalados são gerados a partir do mesmo SVG. |
| `viewport` exportado no root layout com `viewportFit: "cover"` e `themeColor` da paleta | Meta tag manual no `<head>` | É a API do Next para isso; `viewport-fit=cover` é o que faz `env(safe-area-inset-*)` deixar de ser zero (gotcha 39). **Confirmar na doc** o nome exato do campo `viewportFit` no tipo `Viewport`. |

## 5. Tokens

Os valores abaixo são a proposta técnica. A aprovação da paleta acontece na tela de amostra (RF-035); ajuste de tom muda o valor do token, nunca o componente.

### 5.1 Papéis de cor (paleta monocromática metálica, só escuro)

| Papel (token) | Valor | Uso |
|---|---|---|
| `background.default` | `#0A0A0B` | fundo base do app |
| `background.paper` (superfície 1) | `#151618` | cards, listas, cabeçalho |
| `background.raised` (superfície 2) | `#1E2023` | modal, menu, popover, toast |
| `divider` | `#26282C` | divisores |
| `border.subtle` | `#2E3136` | borda decorativa de card |
| `border.strong` | `#6B6F76` | borda de campo e de botão secundário (3,6:1 sobre superfície 1) |
| `text.primary` | `#F2F2F0` | texto principal |
| `text.secondary` | `#A8ABB1` | texto secundário, rótulos |
| `text.disabled` | `#858990` | desabilitado |
| `primary.main` | `#C9CCD1` | ação primária (prata escovada), aba ativa, progresso, chip da próxima série |
| `primary.light` / `primary.dark` | `#DADDE1` / `#B5B9BF` | hover e pressionado; o gradiente metálico discreto do botão primário vai de `light` a `dark` |
| `primary.contrastText` | `#0A0A0B` | texto sobre prata |
| `secondary` (ação secundária) | superfície 1 com `border.strong` e texto `text.primary` | botão secundário |
| `success.main` / `success.light` | `#3DBE70` / `#5FD68B` | preenchimento / texto e ícone de status concluído |
| `warning.main` / `warning.light` | `#E0A93A` / `#F0BE55` | atenção |
| `error.main` / `error.light` | `#C43C3C` / `#F07A7A` | botão destrutivo / texto e ícone de erro |
| `status.successBg` / `warningBg` / `errorBg` | `#1B3A28` / `#3A2E12` / `#3A1A1A` | fundo dos chips de status |
| `focusRing` | `#E6E8EB` | anel de foco, 2 px, offset 2 px, em toda superfície |
| `surface.reading` / `surface.readingText` / `surface.readingMuted` | `#F4F4F2` / `#141414` / `#4A4D52` | **única superfície clara**: card da análise de IA (RF-036) |
| `chart.series1` / `series2` / `series3` | `#C9CCD1` / `#8E9299` / `#6E7279` | séries de dados |
| `chart.up` / `chart.down` / `chart.flat` | `success.light` / `error.light` / `text.secondary` | tendência; variação zero em neutro (RF-033) |
| `overlay` | `rgba(10,10,11,0.80)` | fundo de modal |

### 5.2 Contraste AA conferido (fórmula WCAG 2.x, calculada)

| Par | Razão | Exige | Resultado |
|---|---|---|---|
| `text.primary` sobre base / superfície 1 / superfície 2 | 17,7 / 16,2 / 14,6 | 4,5 | passa |
| `text.secondary` sobre base / superfície 1 / superfície 2 | 8,6 / 7,9 / 7,1 | 4,5 | passa |
| `text.disabled` sobre superfície 1 / superfície 2 | 5,2 / 4,7 | 4,5 | passa |
| `primary.contrastText` sobre `primary.main` / `primary.light` | 12,3 / 14,5 | 4,5 | passa |
| `text.primary` sobre `error.main` (botão destrutivo) | 4,6 | 4,5 | passa |
| `success.light` / `warning.light` / `error.light` sobre superfície 1 | 9,9 / 10,5 / 6,7 | 4,5 | passa |
| `success.light` / `warning.light` / `error.light` sobre superfície 2 | 8,9 / 9,5 / 6,0 | 4,5 | passa |
| texto de chip sobre `status.*Bg` | 6,8 / 7,7 / 5,8 | 4,5 | passa |
| `border.strong` sobre superfície 1 (componente) | 3,6 | 3,0 | passa |
| `primary.main` sobre superfície 1 (componente, barra de progresso) | 11,2 | 3,0 | passa |
| `error.main` sobre superfície 1 (componente) | 3,5 | 3,0 | passa |
| `focusRing` sobre base / superfície 1 / superfície 2 | 16,1 / 14,8 / 13,3 | 3,0 | passa |
| `surface.readingText` / `readingMuted` sobre `surface.reading` | 16,7 / 7,7 | 4,5 | passa |
| `chart.series2` / `series3` sobre superfície 1 (gráfico) | 5,8 / 3,8 | 3,0 | passa |

`border.subtle` (1,4:1) e `divider` são decorativos e não entram na regra. A verificação automatizada por rota (CS-001) é feita com axe na issue de QA de cada área.

### 5.3 Tipografia

Fontes via `next/font/google` com `variable` (`--font-montserrat`, `--font-michroma`), `subsets: ["latin"]`, `display: "swap"`; o tema lê `var(--font-montserrat)` em `typography.fontFamily`. Confirmado na doc do Next. **Confirmar na doc / Google Fonts**: cobertura de acentos do português em Michroma (a premissa da spec); se faltar glifo, Michroma fica só nos números e nos títulos sem acento, e o título com acento cai em Montserrat 700 (regra registrada no token `typography.display`).

| Variante do tema | Família | Tamanho / peso / tracking | Uso |
|---|---|---|---|
| `display` (nova) | Michroma | 28 px / 400 / 0 | nome da ficha, título de seção principal |
| `numeral` (nova) | Michroma, `font-variant-numeric: tabular-nums` | 40 px / 400 | cronômetro da sessão e do intervalo, carga, percentual, indicadores |
| `h1` | Montserrat | 24 px / 700 | título de página |
| `h2` | Montserrat | 20 px / 700 | |
| `h3` | Montserrat | 16 px / 600 | título de card |
| `body1` | Montserrat | 16 px / 400 | corpo |
| `body2` | Montserrat | 14 px / 400 | corpo secundário, botão (piso 14) |
| `button` | Montserrat | 14 px / 600 / 0,02 em, sem caixa alta | botão |
| `label` (nova) | Montserrat | 12 px / 600 / 0,08 em, caixa alta | rótulo curto, chip (piso 12) |
| `caption` | Montserrat | 12 px / 400 | legenda |

Nada abaixo de 12 px (CS-020). `textTransform: "none"` em `button` para o Material não impor caixa alta. Pesos carregados: 400, 600, 700 (Montserrat) e 400 (Michroma).

### 5.4 Raios

`shape.borderRadius: 8` (controles: botão, campo, chip). `radius.card: 12`, `radius.dialog: 16`, `radius.full: 9999` (avatar, chip de série). Cantos retos nos ícones (Sharp) e raio contido nos controles mantêm o contraste com a marca.

### 5.5 Elevações

Dois níveis por luminosidade, não por sombra colorida: superfície 1 sobre o fundo, superfície 2 sobre a superfície 1. `shadows` do tema: índice 0 `none`, 1 `0 1px 2px rgba(0,0,0,.4)` (card), 2 `0 8px 24px rgba(0,0,0,.5)` (modal, menu); o restante da escala do MUI aponta para o índice 2 para nunca aparecer uma sombra padrão. Sem `glow`.

### 5.6 Movimento

Tokens no tema (`transitions.duration` e `transitions.easing`): `fast` 150 ms (toque, hover, chip), `base` 250 ms (modal, menu, toast, transição de aba), `slow` 400 ms (comemoração). Curvas: entrada `cubic-bezier(0.2, 0, 0, 1)`, saída `cubic-bezier(0.4, 0, 1, 1)` com 70% da duração. Só `transform` e `opacity` (e `background-color` em elemento pequeno). Interpolação de números e barras: `requestAnimationFrame` de 400 ms com a curva de entrada; o cronômetro de intervalo drena com `transition: stroke-dashoffset 250ms linear`. Com reduzir movimento: `motion.reducedMotion: "system"` no tema e o hook `useReducedMotion` zeram a interpolação e o pulsar do esqueleto; vibração e som continuam (RF-020).

Transição entre telas só no app do aluno (RF-019): troca de aba e abrir ou fechar a sessão com `opacity 0 -> 1` e `translateY(8px) -> 0` em 250 ms no container da página (`template.tsx` em `app/aluno/`, que remonta por navegação). Painel, login e landing sem `template.tsx`.

## 6. Inventário de componentes por tipo

Um componente por tipo; a coluna "Hoje" lista onde a variação existe no código atual e será substituída.

| Tipo | Componente (`components/ui`) | Base MUI | Hoje (a substituir) |
|---|---|---|---|
| Botão primário / secundário / destrutivo | `AppButton` (`variant`) | `Button` | botões `bg-red-600`, `bg-zinc-900`, `bg-green-600` em todas as telas |
| Botão de ícone | `AppIconButton` (`aria-label` obrigatório na tipagem) | `IconButton` | sino, avatar, fechar modal, chevrons, lixeira |
| Campo de texto | `AppTextField` | `TextField` (variant outlined, label flutuante desligado, label acima) | inputs com `INPUT_CLASS` no funil, login, modais, carga |
| Área de texto | `AppTextField multiline` | `TextField multiline` | `textarea` de observações, texto de descanso (Fase 2) |
| Seletor de opções | `AppSelect` | `Select` + `MenuItem`; `Autocomplete` para listas longas | 6 `<select>` nativos: add-exercise-modal, add-student-form (2), anamnese-modal, plan-manager, workout-builder; 5 no funil |
| Seletor de data | `AppDateField` | `TextField type="date"` com o mesmo visual | data da avaliação |
| Caixa de seleção | `AppCheckbox` | `Checkbox` + `FormControlLabel` | aceite dos termos (funil), dias da semana (Fase 2) |
| Resposta Sim/Não (PAR-Q) | `YesNoToggle` | `ToggleButtonGroup exclusive` | botões duplos em anamnese-modal e funil |
| Modal | `AppDialog` | `Dialog` (`fullScreen` abaixo de `sm`) | 12 arquivos com `fixed inset-0`: rest-timer, exercise-history, aluno-header (upload), workout-builder (creator, erro IA), student-profile (bloquear, excluir), anamnese, add-avaliacao, reset-password, add-exercise, plan-manager, comparativo |
| Diálogo de confirmação | `ConfirmDialog` | `AppDialog` | confirmações de bloquear/excluir aluno (feitas à mão) e `confirm()` de excluir ficha |
| Menu de ações | `ActionMenu` | `Menu` + `MenuItem` | menu do avatar (aluno e admin), menu de ações do perfil, menu da ficha |
| Abas | `AppTabs` | `Tabs` + `Tab` com `role` nativo | abas do perfil (Avaliações/Fichas/Agenda), abas da Evolução (Física/Treino) |
| Chip de status | `StatusChip` (`tone: success / warning / error / neutral`, ícone + texto) | `Chip` | escada de status do plano (student-profile, payment-manager, student-list-item), rascunho IA (roxo), status do dia (Fase 2) |
| Chip de série | `SetChip` (`state: done / next / locked`) | `Chip clickable` | botões de série em exercise-item |
| Card | `AppCard` | `Paper` (superfície 1, `border.subtle`) | `bg-zinc-900 border-zinc-800 rounded-xl` em todas as telas |
| Card expansível | `ExpandableCard` (cabeçalho é `button` com `aria-expanded`) | `AppCard` + `Collapse` | exercise-item (header `div` clicável), WorkoutCard, sessões recentes |
| Aviso em linha | `InlineAlert` | `Alert` (`severity`) | `<p className="text-red-500">`, caixas de erro no login, funil, payment-manager, analysis-view |
| Aviso transitório | `ToastHost` + `useToast` | `Snackbar` + `Alert` | toast próprio de workout-session, "Copiado!" |
| Esqueleto | `AppSkeleton` (`variant: text / rect / circle`, geometria por prop) | `Skeleton` | 9 `loading.tsx` com `animate-pulse` e divs `bg-zinc-800` |
| Barra de progresso | `ProgressBar` (valor interpolado, `aria-valuenow`) | `LinearProgress determinate` | barra da sessão, barra de passos do funil |
| Cronômetro de intervalo | `RestTimerDial` (SVG, drena, Michroma) | próprio + `AppDialog` | rest-timer-modal |
| Cronômetro da sessão | `SessionClock` (Michroma, tabular) | `Typography variant="numeral"` | `formatDuration(elapsed)` em workout-session |
| Navegação inferior | `BottomNav` | `BottomNavigation` + `BottomNavigationAction` (`Link` do Next) | aluno-bottom-nav, admin-bottom-nav |
| Navegação superior / lateral | `TopNav` (aluno, desktop) e `SideNav` (admin) | `Tabs` com `Link` / `List` + `ListItemButton` | aluno-desktop-nav, admin-sidebar |
| Cabeçalho | `AppHeader` | `AppBar position="sticky"` + `Toolbar` | aluno-header, admin-header |
| Avatar com upload | `AvatarUpload` | `Avatar` + `AppDialog` + input file | aluno-header (modal de upload), admin-settings-form |
| Contador de não lidas | `UnreadBadge` | `Badge` | sino em notification-panel |
| Painel de notificações | `NotificationPanel` | `Popover` | notification-panel (overlay feito à mão) |
| Marca | `BrandMark` (SVG, `size`, `currentColor`) e `BrandMarkProvisional` (Michroma "FH" inclinado) | | texto "FH" em aluno-header e admin-header |
| Gráfico de linha | `TrendLineChart` | recharts `LineChart` com cores do tema | evolucao/client-page |
| Indicador de tendência | `TrendDelta` (`up / down / flat`, ícone + texto, flat neutro) | `StatusChip` | TREND_ICON em student-profile, badges em evolucao |
| KPI | `KpiCard` (Michroma no número) | `AppCard` | kpi-card |
| QR do PIX | `PixQrCode` | `qrcode.react` dentro de `AppCard`; o quadro do QR usa `surface.reading` (fundo claro é exigência de leitura do código pelos bancos e é o único token claro permitido) | payment-manager |
| Card de plano | `PlanCard` | `AppCard` | plan-manager, funil (escolha de plano) |
| Ilustração de exercício | `ExerciseFigure` (reserva `aspect-square`, ícone neutro no fallback) | `Box` + `next/image` | exercise-item, exercise-editor |
| Lista de dias da agenda | `WeekDayRow` (ícone + texto + `StatusChip`) | `AppCard` | aba Treinos e aba Agenda (Fase 2) |
| Tela de comemoração | `SessionCelebration` | `AppDialog fullScreen` | não existe (RF-024) |
| Estado vazio | `EmptyState` (ícone Sharp + título + texto) | `Box` + `Typography` | blocos "Nenhuma ..." em várias telas |
| Convite de instalação | `InstallPrompt` | `AppCard` + `AppButton` | install-prompt (mantém o mecanismo do navegador) |

Ícones: só `@mui/icons-material/<Nome>Sharp`, importados pelo caminho (`import DeleteSharp from "@mui/icons-material/DeleteSharp"`), nunca o barrel. Confirmado na doc: a variante Sharp é o sufixo `Sharp` e o import por caminho é o recomendado. Um ícone por conceito: `FitnessCenterSharp` (ficha), `TimerSharp` (intervalo), `CheckCircleSharp` (concluído), `WarningSharp` (atenção), `ErrorSharp` (erro), `HotelSharp` (descanso), `EventAvailableSharp` (feito), `EventBusySharp` (não realizado), `AutoAwesomeSharp` (origem por IA, com rótulo "Rascunho da IA").

## 7. Interatividade

### 7.1 Vibração (RF-021, RF-022)

`useHaptics()` devolve `{ tapDone(), intervalEnd() }`. Implementação: `const canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function"`; `tapDone` = `navigator.vibrate(30)`; `intervalEnd` = `navigator.vibrate([120, 60, 120])`. Sem suporte (iOS Safari, desktop) retorna `false` e nada acontece. Só é chamado em handler de interação ou no fim do intervalo (o Chrome ignora `vibrate` sem interação prévia na página; a série marcada é a interação).

### 7.2 Som (RF-022, RF-037)

Arquivo `public/sounds/interval-end.mp3` (e `.ogg` opcional), curto (< 1 s), próprio, aprovado pelo Mauri (issue própria). `useIntervalSound()`:
- na primeira interação da sessão (marcar série) cria `new Audio("/sounds/interval-end.mp3")`, `preload = "auto"`, chama `load()` e, no iOS, cria um `AudioContext` e `resume()` para destravar o áudio;
- `play()` retorna uma Promise; o `catch` é silencioso (`NotAllowedError` quando o sistema bloqueia). Sem pedido de permissão e sem aviso de "som bloqueado".
- iOS no silencioso físico: o `HTMLAudioElement` segue o interruptor e não toca; o fallback é a vibração (que o iOS também não tem) e o fluxo visual. É o comportamento aceito pela spec.
- Reduzir movimento não afeta o som.

### 7.3 Relógio do intervalo e da sessão (RF-023)

`useRestTimer({ totalSeconds, onComplete })`:
- estado: `endAt` (ms), `pausedRemaining` (ms | null), `remaining` (derivado a cada tick);
- tick por `requestAnimationFrame` limitado a 4 vezes por segundo (ou `setInterval` de 250 ms; o importante é que `remaining = endAt - Date.now()`, não a contagem de ticks);
- pausar: `pausedRemaining = endAt - now`, para o tick; retomar: `endAt = now + pausedRemaining`;
- `visibilitychange` para visível: recalcula imediatamente; se `remaining <= 0`, chama `onComplete` uma vez (guard por ref) e sinaliza som e vibração **só se** `now - endAt <= 10 s` (o "há poucos segundos" da spec; valor em constante `LATE_SIGNAL_WINDOW_MS`);
- pular: `onSkip` sem som nem vibração.

`useSessionClock({ startedAt, accumulatedBefore })` faz o mesmo para o cronômetro da sessão: `elapsed = accumulatedBefore + (now - resumedAt)`; o `loadSession` já corrige o delta de segundo plano e continua valendo. A duração exibida na comemoração é esse `elapsed`; a gravada no histórico é calculada no servidor a partir de `startedAt`, então as duas batem desde que o relógio do dispositivo não esteja errado, o que a spec aceita.

### 7.4 Comemoração (RF-024)

`SessionCelebration` recebe `{ durationSeconds, exercisesDone, setsDone, countsFor }` onde `countsFor` é `{ kind: "day", weekday, status: "done" | "makeup" } | { kind: "standalone" }`, derivado do que a sessão já sabe pela Fase 2 (o dia ligado à sessão), sem consulta nova. Entrada com `opacity` e `scale(0.98 -> 1)` em 400 ms; números interpolados; com reduzir movimento, estado final direto. Botão "Voltar ao início" (`AppButton` primário) navega para `/aluno`.

### 7.5 Erro ao finalizar e tentar de novo (RF-024, RF-025)

Cliente: `handleFinish` passa a usar um `clientSessionId` (UUID v4 gerado na primeira vez que a sessão é criada e persistido em `PersistedSession`). Em falha, `useToast().error("Não foi possível salvar o treino. Tente de novo.")`, `finishing = false`, dados locais intactos. Em sucesso, `clearSession` e comemoração.

Servidor: resolvido pela Fase 2 (issue F2.11). A sessão é criada no servidor ao iniciar, com id próprio, e a finalização recebe esse id e roda numa transação que, se a sessão já estiver concluída, devolve o mesmo resultado sem inserir nada. Como a finalização não insere sessão, repetir depois de um timeout não cria uma segunda sessão. A ideia de uma coluna `client_session_id`, que estava na issue F3.08, ficou desnecessária e a F3.08 foi removida.

**Onde entra**: nesta fase só o cliente muda (F3.13): aviso de erro padronizado, botão que volta a ficar disponível após falha e tentar de novo com o mesmo id de sessão.

### 7.6 Reduzir movimento

`useReducedMotion()` lê `matchMedia("(prefers-reduced-motion: reduce)")` com listener de mudança e devolve `boolean`; o estado inicial no servidor é `false` e é corrigido no primeiro efeito (sem piscar: nada depende disso no primeiro paint). Consumido por `ProgressBar`, `SessionClock`, `SessionCelebration`, `AppSkeleton` e `template.tsx` do aluno. O que é do MUI é coberto por `motion.reducedMotion: "system"`.

## 8. PWA e marca

- **FH em SVG**: redesenhado a partir de `public/logo.jpeg`, `logo2.jpeg` e `Logo3.png`, mantendo a inclinação; entregue como `public/brand/fh-mark.svg` (fundo transparente, traçado em `currentColor`) e `fh-mark-filled.svg` (prata sobre grafite, para ícones). Aprovação do professor registrada na issue F3.06 antes de aparecer em cabeçalho, splash ou ícone (RF-005). Até lá, `BrandMarkProvisional` com "FH" em Michroma inclinado por `transform: skewX(-8deg)`.
- **Ícones instalados** (RF-027): gerados do SVG aprovado por script em `scripts/brand/` (não versionado, como os demais one-shot) ou por ferramenta de geração de favicon: `icon-192.png`, `icon-512.png` com `purpose: "any"` e `icon-192-maskable.png`, `icon-512-maskable.png` com `purpose: "maskable"` e a marca ocupando no máximo 80% do quadro (zona segura). `apple-touch-icon.png` 180x180 sem transparência. **Confirmar na doc**: o tipo `MetadataRoute.Manifest` aceita `purpose` em `icons[]`; é campo do padrão Web App Manifest e o tipo do Next segue o padrão, mas conferir no `.d.ts` instalado.
- **theme-color** (RF-027): `viewport.themeColor = "#0A0A0B"` no root layout e `theme_color: "#0A0A0B"`, `background_color: "#0A0A0B"` no manifest. `appleWebApp.statusBarStyle: "black-translucent"` continua, e o cabeçalho ganha `paddingTop: env(safe-area-inset-top)`; a navegação inferior, `paddingBottom: env(safe-area-inset-bottom)`; modais e comemoração, os dois. Só funciona com `viewportFit: "cover"` (RF-026).
- **Notificações push** (RF-028): `sw.js` passa a referenciar `/icon-192-maskable.png` (icon) e `/badge-96.png` (badge monocromático branco sobre transparente, gerado da marca). O payload `url` continua como está (mudar o destino do clique é fora de escopo).
- **Splash no iOS** (RF-029): conjunto de `apple-touch-startup-image` com `media` por tamanho de aparelho, gerado da marca aprovada sobre `#0A0A0B`, declarado em `metadata.appleWebApp.startupImage` do root layout. No Android, o splash vem do manifest (`background_color` + ícone).
- **Login sem marca d'água** (RF-006): a imagem atual sai; o fundo passa a ser `background.default` com textura em CSS (`repeating-linear-gradient` de baixíssimo contraste, sem imagem externa).

## 9. Desempenho

- **Base antes da fase** (CS-015, premissa da spec): issue F3.01 roda Lighthouse em celular (Moto G4 simulado, 4x CPU) nas rotas `/`, `/login`, `/aluno`, `/aluno/treino`, `/aluno/treino/[id]`, `/aluno/evolucao`, `/aluno/assinatura`, `/admin`, `/admin/alunos`, `/admin/alunos/[id]`, `/admin/exercicios`, `/admin/ia/[id]`, `/admin/configuracoes`, e grava desempenho, acessibilidade, CLS e o tamanho do JS "First Load" por rota (`next build` imprime) em `docs/specs/003-reformulacao-visual/baseline.md`. Também screenshots de cada rota em 320, 390 e 1280 px em `baseline/` (não versionados, só referência local, ou versionados se o Mauri preferir).
- **Orçamento**: First Load JS compartilhado não cresce mais de 90 kB gzip em relação à base (MUI + Emotion ficam nessa faixa quando importados por caminho); nenhuma rota cai mais de 5 pontos de desempenho (CS-015); CLS < 0,1 (CS-006). Medido ao final de cada área (aluno, professor, login/landing) na issue correspondente.
- **Como manter o orçamento**: imports por caminho em `@mui/material/Button` e `@mui/icons-material/XSharp` (a doc marca o barrel como mais lento e maior); `optimizePackageImports` do Next já cobre `@mui/material` e `@mui/icons-material` por padrão (**confirmar na doc** a lista padrão na versão 16.2); recharts carregado com `next/dynamic` e esqueleto só na Evolução e no histórico de exercício; `qrcode.react` com `next/dynamic` na Assinatura; sem `motion`; fontes com `display: swap` e dois pesos a mais no máximo.
- **CSS**: `enableCssLayer` evita o `!important` e o CSS duplicado; ao final, `--color-*: initial` no `@theme` reduz o CSS do Tailwind gerado.

## 10. Segurança

A fase é visual, mas toca três pontos com superfície de ataque. Regra do repositório público: as issues descrevem a mudança, não a fraqueza.

- **Card da análise de IA** (`analysis-view.tsx`): a issue F3.17 renderiza o markdown da análise com um componente que produz nós React a partir do texto, sem HTML cru. É a forma mais simples de aplicar a tipografia do tema a títulos, listas e ênfase (o `prose` atual não tem efeito, gotcha 41) e segue a regra da persona de frontend de não introduzir HTML cru a partir de texto externo.
- **Página interna de componentes**: só em desenvolvimento (`notFound()` fora de `development`), sem dados reais e sem chamadas a server actions.
- **Idempotência ao finalizar** (RF-025): `clientSessionId` é validado com `uuidSchema` no servidor, escopado por `user.id` no índice único e na consulta; nunca é aceito como chave global. Não muda a autorização existente da action.
- **Som e marca**: arquivos estáticos em `public/`, sem URL externa; `remotePatterns` não muda.
- **Secrets**: a fase não cria variável de ambiente nova. O `sw.js` continua sem segredo.
- **Lint de cor fixa** (CS-003): regra ESLint `no-restricted-syntax` para `bg-[#`, `text-[#`, `#[0-9a-f]{3,6}` e `rgba(` em `className`/`sx` fora de `src/theme/`, na issue de limpeza; impede que um valor solto volte.

Os itens de robustez já registrados no mapa do código ficam para a fase seguinte; não entram aqui porque mudam contrato e comportamento.

## 11. Estratégia de testes e QA visual

Não há testes automatizados de interface (fora de escopo). A verificação é:

1. **Por issue**: `npm run lint`, `npm run build` (o build é o typecheck), e o roteiro visual da issue.
2. **QA visual** com Playwright (script em `scripts/qa/screenshots.ts`, ou o MCP do Chrome DevTools na sessão): cada rota da área em 320, 390 e 1280 px, tema escuro, com `prefers-reduced-motion: reduce` em uma segunda passada nas rotas do aluno (CS-011). Screenshots comparados a olho com a base (não há baseline automatizado).
3. **Contraste e acessibilidade**: axe por rota (CS-001, CS-012 >= 95) e Lighthouse em celular (CS-006, CS-015). A paleta foi conferida numericamente na seção 5.2; o axe confirma na tela.
4. **Roteiro manual por teclado** (CS-005): abrir e fechar cada modal com Escape, Tab circulando dentro, foco devolvido; menus com setas; abas com setas; checkbox com Espaço.
5. **Aparelhos reais** (CS-009, CS-010, CS-018): um Android (vibra, som, ícone maskable, push com ícone e selo) e um iPhone com notch instalado como PWA (áreas seguras, splash, sem vibração, sem erro). Registrado na issue de limpeza e QA final.
6. **Regressão manual** (CS-017) ao final de cada área: login, primeiro acesso, paywall, sessão completa com reposição, publicação de ficha, agenda semanal, pagamento PIX, notificações.
7. **Inventário contra o código** (CS-014): ao final de cada área, `grep` por `fixed inset-0`, `<select`, `confirm(`, `alert(`, `lucide-react`, `text-[` e `bg-red` na área entregue; zero ocorrências.

## 12. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Entry `@mui/material-nextjs` para Next 16 não existir e `v15-appRouter` apresentar aviso ou incompatibilidade | fundação travada | F3.02 confirma no README do pacote; se `v15` funcionar sem aviso no build, segue; se não, usar `@emotion/cache` + `useServerInsertedHTML` conforme a doc de "custom cache" do MUI |
| Michroma sem glifos acentuados | título com acento cai em fallback (viola CS-013) | F3.03 testa "Evolução", "Sessão", "Ficha Avulsa" renderizados; regra de fallback explícita no token `display` (Montserrat 700) |
| Aprovação da tela de amostra demora | bloqueia aluno, professor, login | F3.09 é a trava; enquanto espera, F3.06 e F3.07 (marca e som) andam em paralelo |
| Marca não aprovada até o fim | ícones e splash não mudam | spec já prevê: cabeçalho com provisório; F3.19 só executa após F3.06 |
| Bundle sobe mais que o orçamento | CS-015 falha | imports por caminho, `next/dynamic` em recharts e QR, medição por área; se estourar, cortar `Autocomplete` por `Select` e revisar imports |
| Quebra de `workout-builder` e `student-profile` muda comportamento | regressão no professor | quebra por extração mecânica (mover JSX e handlers para arquivos) antes de trocar o visual; roteiro de regressão da área |
| Som bloqueado no iOS mesmo após interação | só vibração/visual | aceito pela spec; `AudioContext.resume()` reduz os casos |
| `env(safe-area-inset-*)` continua 0 | elementos sob o notch | `viewportFit: "cover"` é pré-requisito e é verificado no iPhone real em F3.10 |
| Tailwind e MUI brigando por cascata | estilos "ganhando" errado | `@layer` definido antes do `@import "tailwindcss"` e `modularCssLayers` com a mesma string; página de componentes mostra o problema cedo |

## 13. Plano de entrega (ordem da spec)

| Etapa | Issues | Trava |
|---|---|---|
| 0. Base de medição | F3.01 | Fase 2 entregue |
| 1. Fundação | F3.02 fundação MUI, F3.03 tema e tokens, F3.04 componentes lote 1, F3.05 componentes lote 2 e popups nativos | |
| 1b. Paralelo | F3.06 marca FH (aprovação do professor), F3.07 som (aprovação do Mauri) | |
| 2. Tela de amostra | F3.09 home do aluno + aprovação | **trava da História 1: nada além da home muda sem a aprovação** |
| 3. App do aluno | F3.10 shell e navegação, F3.11 Treinos/Evolução/Assinatura/senha, F3.12 sessão com relógio e quebra de componentes, F3.13 vibração, som, comemoração e tentar de novo | F3.13 depende de F3.07 e da F2.11 (Fase 2) |
| 4. Painel do professor | F3.14 shell/dashboard/alunos, F3.15 perfil do aluno, F3.16 construtor de fichas, F3.17 biblioteca/IA/configurações/notificações | |
| 5. Login e landing | F3.18 | |
| 6. PWA e marca | F3.19 (ícones, splash, push, cabeçalho com a marca) | depende de F3.06 |
| 7. Limpeza e QA final | F3.20 remoção do shadcn/Base UI/lucide/tw-animate/Geist, lint, aparelhos reais, CS-* | |

Cada issue deixa o app funcionando sozinha: a fundação convive com as telas antigas (o Tailwind continua ativo até a limpeza), e a migração é por tela.

## 14. Rastreabilidade RF -> issue

| RF | Issues |
|---|---|
| RF-001 tema único, tokens | F3.03, F3.20 (lint) |
| RF-002 paleta metálica, cromático só status, destrutivo em vermelho | F3.03, F3.04 |
| RF-003 Montserrat/Michroma, sem itálico caixa alta, Geist removida | F3.02, F3.03, F3.20 |
| RF-004 Material Icons Sharp, lucide removido | F3.04, F3.05, F3.10 a F3.18 (troca por área), F3.20 |
| RF-005 marca FH vetorial, aprovação, provisório | F3.06, F3.10 (provisório), F3.19 |
| RF-006 login sem marca d'água | F3.18 |
| RF-007 nada do visual padrão | F3.03, F3.09 (verificação na amostra) |
| RF-008 um componente por tipo, inventário | plano seção 6, F3.04, F3.05 |
| RF-009 modais, menus, seletores e abas padronizados | F3.05, F3.11, F3.12, F3.15, F3.16, F3.17, F3.18 |
| RF-010 sem popups nativos; confirmações existentes em diálogo | F3.05 (push-manager, excluir ficha), F3.15 (bloquear, excluir aluno), F3.16 |
| RF-011 avisos padronizados | F3.04, F3.11, F3.13, F3.15 a F3.18 |
| RF-012 esqueleto com geometria final | F3.04, F3.10, F3.11, F3.14, F3.17 |
| RF-013 estado por ícone e texto | F3.04 (StatusChip, SetChip), F3.11, F3.12 |
| RF-014 modal com semântica, Escape, foco | F3.05 |
| RF-015 aria-label e label | F3.04, todas as telas |
| RF-016 teclado e foco visível; botões reais | F3.03 (anel), F3.12 (cabeçalho do exercício) |
| RF-017 contraste AA e pisos de tamanho | F3.03 (tokens), F3.20 (axe por rota) |
| RF-018 avisos anunciados sem roubar foco | F3.04 (ToastHost, InlineAlert) |
| RF-019 microinterações; transição só no aluno | F3.03, F3.04, F3.10 |
| RF-020 reduzir movimento | F3.03, F3.04, F3.12, F3.13, F3.20 (CS-011) |
| RF-021 vibração ao concluir série | F3.13 |
| RF-022 som e vibração no fim do intervalo; janela ao voltar; pular sem sinal | F3.07, F3.13 |
| RF-023 cronômetros pelo relógio | F3.12 |
| RF-024 comemoração e erro padronizado | F3.13 |
| RF-025 finalização idempotente, botão não trava | F2.11 (servidor, Fase 2), F3.13 (cliente) |
| RF-026 áreas seguras | F3.10, F3.14, F3.13 (comemoração), F3.19 |
| RF-027 ícones maskable, theme-color | F3.19 |
| RF-028 ícones das notificações | F3.19 |
| RF-029 splash iOS | F3.19 |
| RF-030 app do aluno inteiro | F3.09 a F3.13 |
| RF-031 painel do professor inteiro | F3.14 a F3.17 |
| RF-032 login, recuperação, landing, funil; ordem de entrega | F3.18 e a ordem da seção 13 |
| RF-033 gráficos com a paleta; variação zero neutra | F3.11, F3.15 (TrendDelta no perfil) |
| RF-034 remoção do design system anterior | F3.20 |
| RF-035 tela de amostra aprovada | F3.09 |
| RF-036 superfície de leitura | F3.03 (token), F3.17 (card da IA) |
| RF-037 som aprovado | F3.07 |
