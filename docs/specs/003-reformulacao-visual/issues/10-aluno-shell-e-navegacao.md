---
id: F3.10
title: "F3.10 - App do aluno: layout, cabeçalho, navegações, áreas seguras e transição de aba"
labels: [fase-3, frontend]
depends_on: [F3.09]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-005 (provisório), RF-019 (transição só no aluno), RF-026 (áreas seguras), RF-030, cenário 2.4 (aba ativa com mais de um sinal) e casos de borda de PWA no iOS e de 320 px. Plano, seções 3, 5.6 e 8.

## Objetivo
Shell do aluno no tema: `AppHeader` com `BrandMarkProvisional`, avatar com `ActionMenu` e `AvatarUpload`, `NotificationPanel` em `Popover`, `BottomNav` no celular e `TopNav` no computador, `viewportFit: "cover"` e `themeColor` da paleta, transição de aba.

## Escopo
- `src/app/layout.tsx`: `export const viewport` com `width: "device-width"`, `initialScale: 1`, `viewportFit: "cover"`, `themeColor: "#0A0A0B"` (valor lido de `tokens.ts`); remover a meta manual.
- `src/app/aluno/layout.tsx`: shell com `AppHeader` (`paddingTop: env(safe-area-inset-top)`), `main` como container de rolagem, `BottomNav` com `paddingBottom: env(safe-area-inset-bottom)`; substituir `.pb-safe` e `selection:bg-red-600`.
- `src/components/aluno/aluno-header.tsx`, `aluno-bottom-nav.tsx`, `aluno-desktop-nav.tsx`, `src/components/notification-panel.tsx`, `push-manager.tsx` (visual) migrados; menu do avatar e painel de notificações sem overlay feito à mão.
- `src/app/aluno/template.tsx` com entrada `opacity` + `translateY(8px)` em 250 ms, desligada com reduzir movimento.
- Corrigir o badge forçado a 1 quando `hasAlert` (`aluno-header.tsx`): o alerta de plano passa a ser um ponto no item "Assinatura" da navegação (já existe) e o contador mostra só notificações. É correção de exibição, não de regra.
- `loading.tsx` de cada rota do aluno revisado para a geometria final do novo layout (sem padding duplicado).

## Fora de escopo
- Conteúdo das abas (F3.11), sessão (F3.12, F3.13), marca definitiva (F3.19).

## Critérios de aceite
- [ ] No iPhone com notch instalado como PWA, cabeçalho abaixo da barra de status, navegação acima da barra inicial, cor da barra de status igual ao fundo.
- [ ] Em 320 px, quatro itens da navegação legíveis com rótulo de 12 px e sem rolagem horizontal em nenhuma rota do aluno.
- [ ] No computador, a aba ativa tem indicador e peso além da cor; o layout é o mesmo do celular adaptado à largura.
- [ ] Troca de aba anima o conteúdo em 250 ms; com reduzir movimento, troca instantânea.
- [ ] Menu do avatar e painel de notificações fecham com Escape e devolvem o foco; todo botão de ícone tem `aria-label`.
- [ ] Nenhum `lucide-react` nos arquivos tocados.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/aluno`, `/aluno/treino`, `/aluno/evolucao`, `/aluno/assinatura` em 320, 390 e 1280 px; emulação de reduzir movimento; axe; iPhone real para áreas seguras

## Notas técnicas
- `template.tsx` remonta a cada navegação, o que dá a transição sem lib; `layout.tsx` não serve para isso.
- Confirmar na doc do Next o nome do campo `viewportFit` no tipo `Viewport` (plano, seção 4).
