---
id: F1.01
title: "F1.01 - Configurar o Vitest com alias @/ e script de teste"
labels: [fase-1, infra, testes]
depends_on: []
---
## Contexto
A fase exige testes de domínio escritos antes da implementação (TDD), e o projeto não tem framework de testes nem script `test`. Esta issue cria a base; as demais escrevem testes em cima dela. Spec: docs/specs/001-idade-aluno/spec.md (seção "Critérios de sucesso", CS-002). Plano: docs/specs/001-idade-aluno/plan.md (decisão D8).

## Objetivo
`npm run test` executa o Vitest em ambiente `node`, resolve o alias `@/` a partir do `tsconfig.json` e termina com um teste real passando.

## Escopo
- Instalar como devDependencies `vitest` e `vite-tsconfig-paths` (versões mais recentes em 2026-10-17: 5.0.5 e 6.1.1; reconferir com `npm view` no dia). Não instalar `jsdom`, `@vitejs/plugin-react` nem Testing Library nesta fase.
- Criar `vitest.config.mts` na raiz com `plugins: [tsconfigPaths()]`, `test.environment: "node"` e `test.include: ["src/**/*.test.ts"]`. Sem `globals`.
- Adicionar ao `package.json`: `"test": "vitest run"` e `"test:watch": "vitest"`.
- Escrever `src/lib/rest-timer-utils.test.ts` cobrindo `parseRestTimeToSeconds` com os comportamentos já existentes em `src/lib/rest-timer-utils.ts`: `"60s"` -> 60, `"90"` -> 90, `"1:30"` -> 90, `"2 min"` -> 120, `""`/`null`/`undefined`/`"abc"` -> 60. Importar pelo alias (`@/lib/rest-timer-utils`) para provar a resolução.
- Confirmar que `npm run lint` e `npm run build` continuam passando com o arquivo de configuração e o teste incluídos pelo `tsconfig.json` (`**/*.mts`, `**/*.ts`).

## Fora de escopo
- Testes de componente (jsdom, Testing Library) e E2E.
- Cobertura, CI e script `typecheck`.
- Qualquer alteração em código de produção.

## Critérios de aceite
- [ ] `npm run test` executa e reporta o arquivo `src/lib/rest-timer-utils.test.ts` com todos os casos passando.
- [ ] Um teste que importa por `@/lib/...` resolve sem configuração extra além do `vite-tsconfig-paths`.
- [ ] `vitest.config.mts` usa ambiente `node` e `include: ["src/**/*.test.ts"]`.
- [ ] `package.json` tem os scripts `test` (`vitest run`) e `test:watch` (`vitest`).
- [ ] `npm run lint` e `npm run build` passam com os arquivos novos.
- [ ] Nenhum arquivo de produção foi alterado (`git diff --stat` mostra só `package.json`, `package-lock.json`, `vitest.config.mts` e o arquivo de teste).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test (reportar o output literal: nome do arquivo, número de testes, tempo)
- [ ] Trocar temporariamente uma asserção para falhar, rodar `npm run test`, confirmar que o processo sai com código diferente de zero, e desfazer.

## Notas técnicas
- Guia oficial do Next (nextjs.org/docs/app/guides/testing/vitest): `vitest.config.mts` + `vite-tsconfig-paths`; `@vitejs/plugin-react` e `jsdom` só para componentes. O guia avisa que Server Components `async` não são suportados pelo Vitest; esta fase não os testa.
- `.mts` porque o `package.json` não declara `"type": "module"`; evita ambiguidade CJS/ESM no carregamento da config.
- `vitest run` sem nenhum arquivo de teste termina com erro; por isso o teste real de `parseRestTimeToSeconds` entra aqui e não um placeholder.
- Node local v24.13.0 atende `engines` do Vitest 5 (`^22.12.0 || ^24.0.0 || >=26.0.0`).
