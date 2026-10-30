---
id: F3.05
title: "F3.05 - Componentes base, lote 2: modal, confirmação, menu, abas, navegações e fim dos popups nativos"
labels: [fase-3, frontend]
depends_on: [F3.04]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-008, RF-009, RF-010 (zero popups nativos), RF-014 (diálogo com foco preso e Escape), RF-026 (área segura em modais). Inventário na seção 6 do plano.

## Objetivo
Fechar o inventário de componentes base e remover os dois usos de popups nativos do navegador, trocando por componentes padronizados.

## Escopo
- `AppDialog` (`Dialog` do MUI; `fullScreen` abaixo de `sm`; `PaperProps.sx` com `env(safe-area-inset-top/bottom)`; título com `id` ligado por `aria-labelledby`; botão de fechar com `aria-label`).
- `ConfirmDialog` + `useConfirm()` (título, descrição, `confirmLabel`, `destructive`, Escape cancela, foco inicial no botão de cancelar).
- `ActionMenu` (`Menu` + `MenuItem`, setas, Escape, foco devolvido; item destrutivo em `error.light`).
- `AppTabs` (`Tabs` + `Tab`; indicador por linha em `primary.main` e peso 600, dois sinais além da cor).
- `BottomNav` (`BottomNavigation` com `Link` do Next, rótulo sempre visível com 12 px, `aria-current="page"`), `TopNav`, `SideNav`, `AppHeader` (`AppBar sticky` com `paddingTop: env(safe-area-inset-top)`), `UnreadBadge`, `AvatarUpload`, `BrandMarkProvisional` (Michroma "FH" com `skewX(-8deg)`), `PixQrCode`, `PlanCard`, `KpiCard`, `ExerciseFigure`, `WeekDayRow`, `InstallPrompt`.
- Trocar o `alert()` de `src/components/push-manager.tsx` por `useToast().error(...)` e o `confirm()` de `src/components/admin/workout-builder.tsx` por `useConfirm()` com ação nomeada ("Excluir ficha" e o título da ficha). Só a troca do mecanismo; o comportamento ao confirmar continua igual.
- Página `/dev/componentes` atualizada com todos.

## Fora de escopo
- Migrar o visual das telas que usam esses componentes (issues de área); aqui só os dois popups nativos mudam de mecanismo.
- Cronômetros e comemoração (F3.12, F3.13).

## Critérios de aceite
- [ ] `grep -rn "alert(\|confirm(" src` retorna zero ocorrências (o convite de instalação usa `beforeinstallprompt`, não conta).
- [ ] `AppDialog` aberto: Escape fecha, Tab e Shift+Tab circulam só dentro, ao fechar o foco volta ao botão que abriu; `role="dialog"` e `aria-modal="true"` presentes.
- [ ] `ActionMenu`: setas navegam, Enter ativa, Escape fecha e devolve o foco.
- [ ] `AppTabs`: setas trocam a aba, a aba ativa tem indicador e peso além da cor.
- [ ] Em 390 px o `AppDialog` ocupa a tela e o botão primário fica na parte inferior alcançável.
- [ ] Excluir ficha no construtor pede confirmação no diálogo padronizado e, ao confirmar, exclui como antes.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/dev/componentes` em 320, 390 e 1280 px; roteiro de teclado dos itens acima; axe sem violações

## Notas técnicas
- `Dialog` do MUI já entrega foco preso, Escape e devolução de foco; não reimplementar.
- `BottomNav` no celular tem quatro itens legíveis em 320 px (rótulo 12 px, sem truncar).
