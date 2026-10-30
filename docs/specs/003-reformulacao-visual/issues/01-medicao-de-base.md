---
id: F3.01
title: "F3.01 - Medição de base de desempenho, acessibilidade e screenshots"
labels: [fase-3, testes, infra]
depends_on: [F2]
---
## Contexto
A spec (docs/specs/003-reformulacao-visual/spec.md, Premissas e CS-012, CS-015) exige que a pontuação de desempenho e de acessibilidade de cada rota principal seja medida antes da primeira tela ser alterada. Esta issue cria essa base e as ferramentas de QA visual que as demais issues reutilizam. Cobre CS-006, CS-012, CS-015 (base) e a seção 9 e 11 do plano.

## Objetivo
Registrar a base numérica e visual do estado atual e deixar pronto o script de screenshots por largura.

## Escopo
- Adicionar `@playwright/test` e `@axe-core/playwright` como devDependencies e o script `scripts/qa/screenshots.ts` que, com o dev server no ar e uma sessão de aluno e uma de professor, captura cada rota em 320, 390 e 1280 px em `docs/specs/003-reformulacao-visual/baseline/` (pasta ignorada no git, salvo decisão contrária do Mauri).
- Rodar Lighthouse em celular (CPU 4x) nas rotas: `/`, `/login`, `/aluno`, `/aluno/treino`, `/aluno/treino/[id]`, `/aluno/evolucao`, `/aluno/assinatura`, `/admin`, `/admin/alunos`, `/admin/alunos/[id]`, `/admin/exercicios`, `/admin/ia/[id]`, `/admin/configuracoes`.
- Registrar em `docs/specs/003-reformulacao-visual/baseline.md`: por rota, desempenho, acessibilidade, CLS, e o "First Load JS" impresso por `npm run build`.
- Rodar axe em cada rota e registrar a contagem de violações por tipo (sem corrigir nada).
- Adicionar o script `npm run qa:screens` no package.json.

## Fora de escopo
- Qualquer correção visual ou de acessibilidade.
- Suíte de testes de interface.

## Critérios de aceite
- [ ] `baseline.md` tem as 13 rotas com desempenho, acessibilidade, CLS e First Load JS.
- [ ] Screenshots das 13 rotas nas três larguras existem localmente e o script roda de novo sem ajuste manual.
- [ ] Contagem de violações do axe por rota registrada.
- [ ] O app continua funcionando sem nenhuma mudança de comportamento.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run qa:screens gera as imagens
- [ ] Lighthouse e axe executados com o output colado no baseline.md

## Notas técnicas
- Usar contas de teste já existentes no ambiente de desenvolvimento; não criar dados em produção.
- Lighthouse pode rodar pelo MCP do Chrome DevTools (`lighthouse_audit`) ou pelo CLI; registrar qual foi usado para repetir igual no final da fase.
