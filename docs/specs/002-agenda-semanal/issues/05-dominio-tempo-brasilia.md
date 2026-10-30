---
id: F2.05
title: "F2.05 - Domínio: dia e semana em Brasília (funções puras com testes)"
labels: [fase-2, backend, testes]
depends_on: [F1.01]
---
## Contexto
Toda regra de "hoje" e "semana corrente" passa a usar o horário de Brasília, independentemente do fuso do servidor (UTC na Vercel) ou do dispositivo. Spec: docs/specs/002-agenda-semanal/spec.md, RF-004, RF-017, cenários 1.8, 1.9, 4.7, 4.8, 4.10 e o caso de borda de horário de verão. Assinaturas em plan.md, "Regras de domínio".

## Objetivo
Módulo `src/core/domain/schedule/brasilia-time.ts`, sem dependências, com testes Vitest escritos antes da implementação (TDD), cobrindo T01 a T08 do plano.

## Escopo
- Testes primeiro: `src/core/domain/schedule/brasilia-time.test.ts` com os casos T01 a T08 (instantes UTC que caem em domingo 21:30 e segunda 00:00 em Brasília; limites de semana; ida e volta de `brasiliaMidnightInstant`; `addDays` em virada de ano e 29/02; resultados idênticos com `process.env.TZ` em `UTC` e em `America/Sao_Paulo`).
- Domínio: implementar `toBrasiliaDate(instant)`, `weekdayOf(date)`, `addDays(date, days)`, `weekBoundsOf(date)`, `dateOfWeekday(weekStart, weekday)`, `brasiliaMidnightInstant(date)`, `compareLocalDates(a, b)` e a constante `BRASILIA_TIME_ZONE`, usando `Intl.DateTimeFormat` com `timeZone: "America/Sao_Paulo"` e `formatToParts`; o offset de `brasiliaMidnightInstant` é derivado do próprio `Intl` (dois passos: chute em UTC, correção pelo offset observado), nunca `-03:00` fixo.
- Tipos exportados: `LocalDate` (string `YYYY-MM-DD`) e `Weekday` (1 a 7, ISO).
- Arquivos prováveis: `src/core/domain/schedule/brasilia-time.ts`, `src/core/domain/schedule/brasilia-time.test.ts`.

## Fora de escopo
- Qualquer regra de agenda ou sessão (F2.06, F2.07).
- Uso de bibliotecas de data (nenhuma dependência nova).
- Alterar `getWeekStart()` de `actions.ts` (substituída em F2.13).

## Critérios de aceite
- [ ] Os testes T01 a T08 existem, falharam antes da implementação e passam depois (commits separados ou evidência no PR).
- [ ] `toBrasiliaDate(new Date("2026-10-19T00:30:00Z"))` é `"2026-10-18"` e `toBrasiliaDate(new Date("2026-10-19T03:00:00Z"))` é `"2026-10-19"`.
- [ ] `weekBoundsOf("2026-10-18")` é segunda 2026-10-12 a domingo 2026-10-18.
- [ ] `brasiliaMidnightInstant("2026-10-19").toISOString()` é `2026-10-19T03:00:00.000Z` e a composição com `toBrasiliaDate` é identidade; um milissegundo antes cai no dia anterior.
- [ ] A suíte passa com `TZ=UTC` e com `TZ=America/Sao_Paulo`.
- [ ] Nenhum `import` de framework ou de `@/lib` no módulo; nenhuma leitura de `Date.now()` interna.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] Sem QA manual: módulo puro

## Notas técnicas
- `vi.useFakeTimers`/`vi.setSystemTime` e `process.env.TZ` no `vitest.config.ts` confirmados na doc do Vitest (Context7, 2026-10-17). Aqui o "agora" é parâmetro, então os fakes só servem para o teste de `TZ`.
- Confirmar na doc do Node: tzdata completa (full-icu) no runtime usado pela Vercel; Node 20 e 22 trazem por padrão.
- `Temporal` não está disponível em Node 20/22 sem polyfill; não usar.
- Horário de verão: hoje não existe; o algoritmo segue o tzdata, então um retorno do horário de verão não exige mudança de código.
