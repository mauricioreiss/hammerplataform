---
id: F3.02
title: "F3.02 - Fundação: MUI v9 no App Router, camadas CSS com Tailwind e fontes"
labels: [fase-3, frontend, infra]
depends_on: [F3.01]
---
## Contexto
O ADR 0001 define MUI v9 convivendo com o Tailwind v4 por camadas CSS. Esta issue instala e liga a fundação sem alterar nenhuma tela. Spec: docs/specs/003-reformulacao-visual/spec.md, RF-003 (fontes) e seção 3 do plano. Cobre RF-003 (parte das fontes).

## Objetivo
Ter `AppRouterCacheProvider`, `ThemeProvider` e as fontes Montserrat e Michroma funcionando no root layout, com o Tailwind ainda ativo, build verde e visual atual intacto.

## Escopo
- Instalar `@mui/material`, `@mui/material-nextjs`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@emotion/cache`.
- Criar `src/theme/ThemeRegistry.tsx` ("use client") com `AppRouterCacheProvider options={{ enableCssLayer: true }}`, `ThemeProvider` com um tema mínimo (`modularCssLayers: "@layer theme, base, mui, components, utilities;"`, `cssVariables: true`) e `CssBaseline`.
- `src/app/globals.css`: primeira linha `@layer theme, base, mui, components, utilities;` antes de `@import "tailwindcss";`. Manter o restante por enquanto.
- `src/app/layout.tsx`: trocar Geist por `Montserrat` (pesos 400, 600, 700) e `Michroma` (400) via `next/font/google` com `variable` e `display: "swap"`; envolver `children` no `ThemeRegistry`; `suppressHydrationWarning` no `<html>` conforme a doc.
- Confirmar o entry do pacote `@mui/material-nextjs` para o Next 16 (ver Notas).

## Fora de escopo
- Tokens, paleta, overrides de componentes (F3.03).
- Remover shadcn, lucide ou Geist do package.json (F3.20); só deixar de usar Geist no layout.

## Critérios de aceite
- [ ] `npm run build` passa e nenhuma rota muda de aparência além da fonte base.
- [ ] No DevTools, o CSS do Emotion aparece dentro de `@layer mui` e os utilitários do Tailwind seguem ganhando (testar com um `p-4` sobre um `Box` com `sx={{ p: 1 }}` na página interna temporária, depois remover).
- [ ] As fontes renderizadas na aba Fonts do DevTools listam Montserrat (e Michroma quando usada); sem fallback.
- [ ] Sem aviso de hidratação no console em `/aluno` e `/admin`.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/aluno`, `/admin`, `/login` em 390 px comparados com a base de F3.01 (só a fonte pode ter mudado)

## Notas técnicas
- Doc do MUI: import `@mui/material-nextjs/v15-appRouter` "ou `v1X-appRouter` conforme a major do Next". Conferir no README do pacote instalado se existe `v16-appRouter`; se não existir e o `v15` compilar sem aviso, usar `v15` e registrar aqui. Marcado no plano como "confirmar na doc".
- Com `cssVariables: true` e só o esquema escuro, conferir se é preciso `defaultColorScheme: "dark"` (plano, seção 4).
- Michroma: testar os caracteres "ã ç é ê ô" renderizados; se faltar glifo, registrar e aplicar a regra de fallback do plano (seção 5.3) em F3.03.
