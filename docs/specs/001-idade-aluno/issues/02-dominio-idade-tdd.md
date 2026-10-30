---
id: F1.02
title: "F1.02 - Módulo de domínio da idade com testes primeiro (TDD)"
labels: [fase-1, backend, testes]
depends_on: [F1.01]
---
## Contexto
Hoje existe um único cálculo de idade, dentro de `src/app/actions.ts`, que usa o relógio do servidor e `new Date(string)`, errando na virada do dia em Brasília e deslocando datas em um dia. A spec fixa as regras (anos completos, 29/02, "hoje" em Brasília, limite de 120 anos, idade mínima do funil, rótulos) e exige uma regra única para todo o sistema. Spec: docs/specs/001-idade-aluno/spec.md (RF-001, RF-004, RF-009 a RF-013, RF-020, RF-021; casos de borda). Plano: docs/specs/001-idade-aluno/plan.md (D1 a D3, D6, contratos do domínio, tabela de testes T01 a T37).

## Objetivo
Entregar `src/core/domain/age/` com funções puras, sem dependência de framework ou lib, cobertas por testes escritos antes da implementação e que passam na tabela completa de casos da spec.

## Escopo
- Domínio (`src/core/domain/age/`):
  - `calendar-date.ts`: `CalendarDate` (`{ year, month, day }`, mês 1 a 12), `parseCalendarDate` (formato `YYYY-MM-DD` estrito e dia existente no calendário, via `Date.UTC` e leitura de volta com `getUTC*`), `todayInBrasilia(now = new Date())` (`Intl.DateTimeFormat` com `timeZone: "America/Sao_Paulo"` e `formatToParts`), `compareCalendarDates`, `formatCalendarDateBr` (`dd/mm/aaaa`), `formatCalendarDateIso` (`YYYY-MM-DD`).
  - `age.ts`: `MAX_AGE_YEARS = 120`, `FUNNEL_MINIMUM_AGE_YEARS = 18`, `calculateAgeInYears`, `validateBirthDate(value, today, rules?)` devolvendo a união discriminada `{ ok: true, birthDate, age } | { ok: false, reason }` com motivos `invalid | future | too_old | under_minimum_age` nessa ordem de precedência, `BIRTH_DATE_MESSAGES` (textos exatos do plano, incluindo `missing`), `AGE_NOT_INFORMED_LABEL`, `formatAgeLabel`, `describeStudentAge(birthDate, today)` devolvendo `{ age, ageLabel, birthDateLabel }` e tratando `null`, vazio, ilegível, futuro e acima de 120 como ausente.
- Testes (`calendar-date.test.ts`, `age.test.ts` ao lado dos fontes): os casos T01 a T37 da tabela do plano, um `it` por linha, com o cenário em português no nome. Escrever e rodar antes de implementar (red), implementar (green), simplificar.
- Nenhum `new Date()` sem parâmetro fora de `todayInBrasilia`; nenhuma importação de `next`, `zod`, `@supabase/*`.

## Fora de escopo
- Trocar os chamadores (`actions.ts`, componentes): fica para F1.03 a F1.07.
- Mensagens para outros campos; qualquer regra fora de data de nascimento e idade.
- Use case, repositório ou interface de anamnese.

## Critérios de aceite
- [ ] `src/core/domain/age/calendar-date.ts` e `age.ts` existem, exportam exatamente o contrato do plano e não importam nada de `src/app`, `src/lib`, `next`, `zod` ou `@supabase/*`.
- [ ] Os 37 casos da tabela do plano estão nos testes e passam (`npm run test`).
- [ ] Aniversário hoje conta o ano novo; amanhã não (T10, T11); 29/02 completa em 01/03 em ano não bissexto e em 29/02 em bissexto (T15 a T18).
- [ ] `todayInBrasilia` devolve o dia 17 para `2026-10-18T02:59:59Z` e o dia 18 para `2026-10-18T03:00:00Z` (T02, T03).
- [ ] `validateBirthDate` aceita idade exatamente 120 e recusa 121 (T23, T24); aceita 18 anos completos hoje e recusa quem completa amanhã quando `minimumAge: 18` (T26, T27); sem `minimumAge` aceita menor de idade (T28).
- [ ] `formatAgeLabel` devolve `"0 anos"`, `"1 ano"`, `"32 anos"` e `"Idade não informada"` (T30).
- [ ] `describeStudentAge` nunca devolve idade negativa e trata dado ilegível ou fora de faixa como ausente (T32 a T34).
- [ ] Nenhuma função com mais de 30 linhas; nomes revelam a intenção; comentários só onde há porquê (ex.: por que `Date.UTC` e não `new Date(string)`).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test (reportar output literal: 2 arquivos, 37 testes ou mais, todos passando)
- [ ] Evidência do TDD: colar o output do primeiro `npm run test` com os testes falhando antes da implementação.

## Notas técnicas
- `Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)` devolve `{ type, value }[]`; ler `year`, `month`, `day` e converter com `Number`. API confirmada no MDN (Context7). Node em produção tem ICU completo; não há dependência nova.
- `parseCalendarDate`: regex `^\d{4}-\d{2}-\d{2}$`, depois `const utc = new Date(Date.UTC(y, m - 1, d))` e comparar `getUTCFullYear/getUTCMonth/getUTCDate` com os valores lidos; se diferirem (31/02 vira 03/03), a data não existe.
- Anos completos: `today.year - birth.year`, menos 1 se `(today.month, today.day) < (birth.month, birth.day)`. O 29/02 cai certo sem caso especial.
- Idioma: identificadores em inglês; textos das mensagens em pt-BR com acento, exatamente como no plano (D6), porque a spec fixa esses textos.
- Testes sem fake timers: `todayInBrasilia` recebe `now` por parâmetro.
