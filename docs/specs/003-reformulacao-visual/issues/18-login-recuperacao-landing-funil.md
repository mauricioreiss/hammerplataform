---
id: F3.18
title: "F3.18 - Login, recuperação de senha, landing e funil de cadastro"
labels: [fase-3, frontend]
depends_on: [F3.16, F3.17]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, História 5 (cenários 5.1 a 5.4), RF-006 (fundo sem marca d'água), RF-009, RF-011, RF-018, RF-019 (sem transição de rota), RF-032 (por último na ordem). Plano, seção 8 (fundo texturizado em CSS).

## Objetivo
Visitante percorre landing, funil e login no tema, apenas pelo teclado em 320 px, com campos rotulados, seletores do sistema, caixa de aceite funcional e erros anunciados.

## Escopo
- `src/app/login/page.tsx`: fundo `background.default` com textura CSS (sem imagem), `BrandMarkProvisional` (ou `BrandMark` se F3.19 já tiver entrado), `AppTextField` com rótulos, botão de mostrar senha com `aria-label` e alcançável por Tab, `AppButton` primário em prata, erro em `InlineAlert` com `role="alert"` sem mover o foco; recuperação de senha com sucesso em `InlineAlert` de status.
- `src/components/landing/landing-hero.tsx`, `landing-results.tsx`, `sales-funnel.tsx`: tipografia e botões do tema; fotos de banco mantidas (conteúdo, fora de escopo).
- `funnel-form.tsx` quebrado em `FunnelStepper` (`ProgressBar` ou `Stepper` do MUI com os quatro passos), `StepAccount`, `StepBody`, `StepLifestyle` (dias da semana da Fase 2 em `AppCheckbox`, PAR-Q em `YesNoToggle`), `StepPlan` (`PlanCard` selecionável como `ToggleButton`, termos em `AppCheckbox` ligado por `label`); hook `useFunnelForm` com o estado e o envio; os cinco `<select>` nativos em `AppSelect`.
- Remover `ai-loading.tsx` e `landing/paywall.tsx` (código morto confirmado no mapa) se o Mauri concordar; caso contrário, migrar o visual.

## Fora de escopo
- Mudar campos coletados, validações ou o fluxo pós-cadastro.
- Fotos reais na seção de resultados.

## Critérios de aceite
- [ ] Login sem marca d'água; rótulos visíveis; mostrar senha por Tab e com rótulo; erro em vermelho anunciado e foco mantido no campo.
- [ ] Funil pelo teclado em 320 px: chega ao aceite, marca com Espaço, segue com Enter, completa o cadastro, cai no login e entra.
- [ ] Landing em 320 px rolada até o fim sem rolagem horizontal; fontes e ícones da fase.
- [ ] Sem transição de rota nestas telas.
- [ ] Arquivos sem `lucide-react`, `<select>`, hex ou `zinc-*`; nenhum acima de 200 linhas.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/`, funil nos quatro passos e `/login` em 320, 390 e 1280 px; axe; roteiro de teclado

## Notas técnicas
- A textura do fundo: `repeating-linear-gradient` com dois tons de `background.default` e `background.paper` a 3% de diferença, em `MuiCssBaseline` só para a rota de login; sem imagem externa.
- O envio continua chamando `registerFromLanding` e depois `signInWithPassword`; nada muda ali.
