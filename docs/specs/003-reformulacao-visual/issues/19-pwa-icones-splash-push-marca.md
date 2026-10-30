---
id: F3.19
title: "F3.19 - PWA e marca: ícones maskable, splash no iOS, ícones das notificações e marca no cabeçalho"
labels: [fase-3, frontend, infra, design]
depends_on: [F3.06, F3.10]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-005 (marca aprovada entra no cabeçalho, splash e ícones), RF-027, RF-028, RF-029, CS-010, CS-016. Os ícones só mudam uma vez, depois da aprovação, para não obrigar reinstalação dupla no iOS. Plano, seção 8.

## Objetivo
Ícones instalados gerados da marca aprovada com finalidade de máscara, splash do iOS por tamanho de aparelho, ícones de notificação existentes e `BrandMark` no cabeçalho do aluno e do professor.

## Escopo
- Gerar de `public/brand/fh-mark-filled.svg`: `icon-192.png`, `icon-512.png` (`purpose: "any"`), `icon-192-maskable.png`, `icon-512-maskable.png` (`purpose: "maskable"`, marca dentro de 80% do quadro), `apple-touch-icon.png` 180x180 opaco, `badge-96.png` monocromático; conjunto de `apple-touch-startup-image` para os tamanhos de iPhone com notch e os mais comuns sem notch, sobre `#0A0A0B`. Script de geração em `scripts/brand/` (não versionado) ou ferramenta registrada nas notas.
- `src/app/manifest.ts`: ícones com `purpose`, `theme_color` e `background_color` da paleta, `name` e `short_name` revisados ("Hammer").
- `src/app/layout.tsx`: `appleWebApp.startupImage` com `media` por tamanho; `apple-touch-icon` apontando para o arquivo novo; `viewport.themeColor` já em F3.10.
- `public/sw.js`: `icon` e `badge` apontando para arquivos que existem.
- Trocar `BrandMarkProvisional` por `BrandMark` em `AppHeader` (aluno e professor) e no login.
- Remover `icon-192.png`, `icon-512.png` antigos, `logo.jpeg`, `logo2.jpeg`, `Logo3.png` e os SVGs de exemplo do Next (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) de `public/`.

## Fora de escopo
- Destino do clique na notificação (`url` do payload).
- `start_url` por papel.

## Critérios de aceite
- [ ] Android real: ícone instalado exibido com máscara, legível; notificação push com ícone e selo da marca.
- [ ] iPhone com notch real: ícone instalado correto, tela de abertura com a marca sobre o fundo da paleta, barra de status na cor do fundo.
- [ ] Lighthouse PWA/Manifest sem avisos de ícone maskable ausente.
- [ ] `BrandMark` no cabeçalho do aluno e do professor com a mesma altura em 320 e 1280 px.
- [ ] Nenhuma referência a arquivo inexistente em `sw.js` ou `layout.tsx`.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: cabeçalhos em 320, 390 e 1280 px; manifest em `/manifest.webmanifest` inspecionado; aparelhos reais (CS-010)

## Notas técnicas
- Confirmar na doc / `.d.ts` do Next que `MetadataRoute.Manifest` aceita `purpose` nos ícones (plano, seção 8).
- A lista de tamanhos de splash do iOS muda por geração de aparelho; registrar a lista usada nas notas para repetir.
