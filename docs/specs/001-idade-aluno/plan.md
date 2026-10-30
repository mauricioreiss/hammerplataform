# Plano técnico: Idade do aluno

**Spec**: [spec.md](spec.md) (aprovada) | **Branch**: `001-idade-aluno` | **Criado em**: 2026-10-17 | **Status**: Proposto

Este plano diz COMO entregar a spec. Não reabre decisões de produto. Onde a spec define um texto ou uma regra, o texto e a regra valem; aqui fica a arquitetura, os contratos, os testes e a ordem de entrega.

## Resumo técnico

- As regras de idade (calendário, "hoje" em Brasília, anos completos, 29/02, limite de 120 anos, idade mínima do funil, rótulo "N anos") viram funções puras em `src/core/domain/age/`, sem Next, Supabase ou Zod. É a única regra de idade do sistema (RF-021); `calcAge` de `src/app/actions.ts` deixa de existir.
- As server actions continuam sendo a fronteira: Zod valida a forma do payload e chama o domínio para a regra; o cliente só repete a mesma função para dar feedback imediato.
- Nenhuma mudança de schema: `anamnesis.birth_date` já existe e já é gravada pelo modal do professor. O funil passa a gravá-la também.
- "Hoje" é lido uma vez por request no servidor (`Intl.DateTimeFormat` com `timeZone: "America/Sao_Paulo"`, sem dependência nova) e os componentes recebem o resultado pronto como props. Nos pontos em que o cliente valida antes de enviar (funil e modal), a mesma função roda no navegador dentro do handler do evento.
- Vitest entra no projeto nesta fase (primeira issue). Os testes do domínio são escritos antes da implementação (TDD) e cobrem a tabela de casos de borda da spec.
- Sete issues, ordenadas: infra de testes, domínio, servidor, funil, perfil + construtor, modal, tela da IA.

## Contexto técnico

Versões do `package.json` no commit `7b7714c`:

| Pacote | Versão | Observação |
|---|---|---|
| `next` | 16.2.6 | App Router; `after()` já usado em `registerFromLanding` |
| `react` / `react-dom` | 19.2.4 | |
| `typescript` | ^5 | `strict: true`, `moduleResolution: bundler`, alias `@/* -> ./src/*`, `include` cobre `**/*.ts`, `**/*.tsx` e `**/*.mts` |
| `zod` | ^4.4.3 | `z.iso.date()` disponível (API top-level do Zod 4) |
| `@supabase/ssr` / `@supabase/supabase-js` | ^0.10.3 / ^2.106.2 | |
| `openai` | ^6.39.0 | |
| `tailwindcss` | ^4 | CSS-first |
| `eslint` / `eslint-config-next` | ^9 / 16.2.6 | flat config em `eslint.config.mjs` |

Ambiente verificado em 2026-10-17 (`node --version`, `npm --version`, `npm view`):

- Node v24.13.0, npm 11.6.2.
- `vitest` 5.0.5 (engines `^22.12.0 || ^24.0.0 || >=26.0.0`); `vite-tsconfig-paths` 6.1.1.
- O vault do Mauri validou Vitest 5.0.3 em Node 24 (nota `TypeScript-Setup`); a diferença para 5.0.5 é patch.

Scripts hoje: `dev`, `build`, `start`, `lint`. Não há `test` nem `typecheck`. O deploy na Vercel roda só `next build`; os testes rodam localmente (e em CI, quando houver).

Fuso: a Vercel roda em UTC. Brasília é UTC-3 sem horário de verão (premissa da spec). Entre 21h e 23h59 em Brasília o servidor já está no dia seguinte, e é exatamente aí que o cálculo atual erra.

## Arquitetura e camadas

O projeto já começou a migrar para Clean Architecture em `src/core` (use cases e interfaces de notificação) e `src/infrastructure` (implementações Supabase e web-push). O `src/core/README.md` reserva `/domain` para "classes e interfaces que representam os modelos do negócio". A idade é regra de domínio pura, sem I/O, então entra em `src/core/domain/age/`. Não há use case nem repositório novo: a leitura da anamnese já é feita pelas actions, e criar `IAnamnesisRepository` para um único consumidor seria abstração de uso único.

```
src/core/domain/age/
  calendar-date.ts        # CalendarDate, parse estrito, hoje em Brasília, comparação, formatos
  calendar-date.test.ts
  age.ts                  # anos completos, validação da data de nascimento, rótulos, mensagens
  age.test.ts
```

Regra de dependência: `src/core/domain/age` não importa nada do projeto nem de lib. Quem importa o domínio:

| Camada | Arquivo | O que faz com o domínio |
|---|---|---|
| Fronteira (server actions) | `src/app/actions.ts` | Zod valida forma; `validateBirthDate` decide; `describeStudentAge` alimenta o rascunho da IA |
| Fronteira (server actions) | `src/app/admin/ia/actions.ts` | passa a selecionar `birth_date` (sem regra) |
| Apresentação (server pages) | `src/app/admin/alunos/[id]/page.tsx`, `src/app/admin/ia/[id]/page.tsx` | lêem `todayInBrasilia()` uma vez e montam o view model (`ageLabel`, `birthDateLabel`) |
| Apresentação (client) | `student-profile.tsx`, `workout-builder.tsx`, `analysis-view.tsx` | só exibem props; nenhuma regra |
| Apresentação (client, handlers) | `funnel-form.tsx`, `anamnese-modal.tsx` | chamam `validateBirthDate` no handler de avançar/salvar para feedback imediato |

### Fluxo de dados

Cadastro pelo funil:

```
FunnelForm (passo 1, clique em "Próximo Passo")
  -> validateBirthDate(valor, todayInBrasilia(), { minimumAge: 18 })   # no navegador, só UX
  -> ... passos 2 a 4 ...
  -> registerFromLanding({ ..., birth_date })
       -> registerSchema (Zod: z.iso.date obrigatório + refinamento com validateBirthDate, mínimo 18)
       -> insert anamnesis { ..., birth_date }
       -> after(): createAiWorkoutDraft -> describeStudentAge(birth_date, todayInBrasilia()).age -> prompt
```

Perfil do aluno:

```
page.tsx (server)
  today = todayInBrasilia()
  studentAge = describeStudentAge(anamnesis?.birth_date, today)   # { age, ageLabel, birthDateLabel }
  -> <StudentProfile studentAge={studentAge} ...>
       cabeçalho: studentAge.ageLabel
       card Anamnese: studentAge.ageLabel + studentAge.birthDateLabel
       -> <WorkoutBuilder studentName ageLabel>  -> <WorkoutCreatorModal> topo: nome + ageLabel
       -> <AnamneseModal>  max = formatCalendarDateIso(todayInBrasilia()) (lazy state, só no cliente)
```

Depois de salvar pelo modal, `router.refresh()` (já existe em `anamnese-modal.tsx`) e o `RealtimeProfileListener` (já escuta `anamnesis` filtrada por `user_id`) refazem a página; o view model é recalculado no servidor e as três exibições mudam juntas (RF-018, RF-019). Nenhum código novo para isso; só verificação.

Tela da IA:

```
admin/ia/[id]/page.tsx (server)
  anamnese = getAnamneseById(id)        # select passa a incluir birth_date
  ageLabel = describeStudentAge(anamnese.birth_date, todayInBrasilia()).ageLabel
  -> <AnalysisView anamnese ageLabel>   # bloco "Dados do Aluno" ganha a célula "Idade"
```

Complexidade: tudo O(1). Nenhuma query nova; uma coluna a mais em dois `select` existentes.

## Decisões com trade-offs

### D1. Domínio puro em `src/core/domain/age/`, sem use case nem repositório

- **Escolhido**: funções puras em `src/core/domain/age/`; as actions continuam lendo a tabela.
- **Alternativa A**: manter `calcAge` em `actions.ts` e espalhar cópias nos componentes. Rejeitada: viola RF-021 e repete o bug de fuso em cada cópia.
- **Alternativa B**: use case `GetStudentAgeUseCase` + `IAnamnesisRepository` em `core/application`. Rejeitada: não há orquestração nem I/O na regra; seria camada para um único consumidor. Se a anamnese um dia migrar para o core, o domínio já está no lugar certo.

### D2. "Hoje em Brasília" com `Intl.DateTimeFormat`, sem dependência

- **Escolhido**: `new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)` e leitura das partes `year`, `month`, `day`. API confirmada no MDN via Context7 (`formatToParts` devolve `{ type, value }[]`; `timeZone` aceita identificador IANA). Node em produção tem ICU completo desde a versão 13, então `America/Sao_Paulo` resolve; nos navegadores atuais também.
- **Alternativa A**: `date-fns-tz` ou `luxon`. Rejeitadas: dependência nova para uma função de dez linhas.
- **Alternativa B**: `Temporal`. Rejeitada: disponibilidade no Node 24 da Vercel não confirmada; não arriscar runtime por API de calendário.
- **Alternativa C**: somar 3 horas em UTC. Rejeitada: funciona hoje por não haver horário de verão, mas quebra em silêncio se a regra mudar; o identificador IANA segue a tz database.
- `todayInBrasilia(now: Date = new Date())` recebe o instante como parâmetro para o teste injetar `now` sem fake timers.

### D3. Datas de calendário como `{ year, month, day }`, nunca `Date`

- **Escolhido**: tipo `CalendarDate` (mês 1 a 12) e aritmética por comparação de campos. `parseCalendarDate` exige `YYYY-MM-DD` e confirma que o dia existe fazendo `Date.UTC(y, m - 1, d)` e lendo de volta `getUTCFullYear/Month/Date` (31/02 vira 03/03 e é recusado; 29/02/2026 também).
- **Alternativa**: `new Date("1994-10-17")` + `getDate()` como hoje. Rejeitada: interpreta como meia-noite UTC e lê no fuso do servidor, deslocando o dia (nota "Cálculo atual" da spec).
- Consequência: 29/02 funciona sem caso especial. Em 28/02/2026 o mês é igual e `28 < 29`, então ainda não fez aniversário (21); em 01/03/2026 o mês é maior (22). Em ano bissexto, 29/02 é igual (RF-011).

### D4. "Hoje" lido no servidor para exibição; no handler para validação no cliente

- **Escolhido**: as páginas server (`alunos/[id]/page.tsx`, `ia/[id]/page.tsx`) chamam `todayInBrasilia()` uma vez e passam o view model pronto. Os componentes ficam puros (mesmo HTML no SSR e na hidratação). No funil e no modal, `todayInBrasilia()` roda dentro do handler de clique/submit, que não é render, então não há risco de hidratação.
- **Alternativa**: `new Date()` dentro do render do client component. Rejeitada: render impuro e risco de mismatch de hidratação na virada do dia.
- Limite aceito: um funil aberto por horas na virada do dia valida com o "hoje" do clique, o que é o correto; o servidor revalida de qualquer forma (RF-006).

### D5. View model (`ageLabel`, `birthDateLabel`) montado na page, não nos componentes

- **Escolhido**: `describeStudentAge(birthDate, today)` devolve `{ age, ageLabel, birthDateLabel }`. A page calcula uma vez e passa para cabeçalho, card e construtor. RF-018 fica garantido pela estrutura: um cálculo, uma anamnese.
- **Alternativa**: cada componente calcula. Rejeitada: três chamadas da mesma regra com a mesma entrada e três chances de divergir.

### D6. Mensagens de erro no módulo de domínio

- **Escolhido**: `BIRTH_DATE_MESSAGES` (mapa motivo -> texto pt-BR) vive em `age.ts`, ao lado do tipo `BirthDateRejection`. RF-006 exige "a mesma mensagem" na tela e no servidor; RF-013 fixa o texto "Idade não informada". Como a spec torna o texto parte da regra, ele fica com a regra, em um único lugar.
- **Alternativa**: mensagens em cada action e em cada componente. Rejeitada: duplicação garantida de divergir.

### D7. Zod valida a forma; o domínio valida a regra

- **Escolhido**: campo `birth_date` como `z.iso.date(...)` (API top-level do Zod 4, confirmada no Context7: aceita `YYYY-MM-DD`, recusa `2020-1-1` e `2020-01-32`) seguido de um refinamento que chama `validateBirthDate(valor, todayInBrasilia(), regras)` e devolve `BIRTH_DATE_MESSAGES[motivo]`. Um único schema `birthDateSchema({ minimumAge? })` definido na seção `--- Validation ---` de `actions.ts` e reutilizado por `anamneseSchema` (opcional, sem idade mínima) e `registerSchema` (obrigatório, mínimo 18).
- Não depender da regra de calendário do Zod: a existência do dia é sempre decidida por `parseCalendarDate` no domínio, então tanto faz o quanto `z.iso.date()` confere além do formato.
- **Confirmar na doc** (zod.dev/api, seção Refinements) qual API de refinamento usar na versão instalada: `.superRefine((value, ctx) => ctx.addIssue(...))` (mantida no Zod 4) ou `.check(...)` (nova). Ambas resolvem; o implementador escolhe depois de conferir.

### D8. Vitest com `vite-tsconfig-paths`, ambiente `node`, sem jsdom nesta fase

- **Escolhido**: `vitest` + `vite-tsconfig-paths` como devDependencies; `vitest.config.mts` na raiz com `plugins: [tsconfigPaths()]`, `test.environment: "node"`, `test.include: ["src/**/*.test.ts"]`; script `"test": "vitest run"`. O guia oficial do Next (Context7, nextjs.org/docs/app/guides/testing/vitest) usa `vitest.config.mts`, `vite-tsconfig-paths` e, para componentes, `@vitejs/plugin-react` + `jsdom`. Esta fase só testa domínio, então `plugin-react` e `jsdom` ficam de fora; entram quando houver teste de componente.
- **Alternativa**: `resolve.alias: { "@": "./src" }` sem plugin. Rejeitada: duplica o alias do `tsconfig.json` em dois lugares, que dessincronizam. O plugin lê o `tsconfig` e mantém uma fonte.
- `.mts` evita ambiguidade de módulo: o `package.json` não tem `"type": "module"`. O `tsconfig.json` já inclui `**/*.mts`, então `next build` tipa o arquivo (precisa das devDependencies instaladas, o que já é o caso no build da Vercel).
- `vitest run` sem arquivos de teste sai com erro, então a issue de setup inclui um teste real de função pura existente (`parseRestTimeToSeconds`) que prova o runner e o alias `@/`.

### D9. Dado pessoal em log

- A fase torna `birth_date` obrigatória para todo aluno do funil. `upsertAnamnesis` tem um `console.log` de depuração que imprime o payload inteiro da anamnese; ele passaria a imprimir a data de nascimento de cada aluno a cada edição. A issue do servidor remove esse log e o de `getAnamneseByUserId` (mesmo padrão) e não adiciona nenhum outro. É o mínimo para não piorar a minimização de dados que a spec cita; o restante dos logs com PII está fora do escopo e registrado em Riscos.

## Modelo de dados

**Sem mudança de schema.** Evidência no código:

- `src/lib/types.ts:87`: `Anamnesis.birth_date: string | null`.
- `src/app/actions.ts:30-33`: `anamneseSchema.birth_date` com regex `^\d{4}-\d{2}-\d{2}$`.
- `src/app/actions.ts:533`: `upsertAnamnesis` grava `birth_date`.
- `src/app/actions.ts:854,873`: `createAiWorkoutDraft` seleciona `birth_date` e calcula idade.
- `src/components/admin/anamnese-modal.tsx:32,111`: o valor cru alimenta `<input type="date" value=...>`, que só exibe `YYYY-MM-DD`; logo a coluna devolve esse formato.

Tipo da coluna inferido como `date` (Supabase devolve `date` como string `YYYY-MM-DD`). Confirmar no dashboard do Supabase na issue F1.03; se fosse `timestamptz`, `parseCalendarDate` recusaria o valor e a tela mostraria "Idade não informada" (sem quebrar), o que o QA manual pegaria na hora.

O que muda nos dados: `registerFromLanding` passa a preencher `birth_date` no insert da anamnese (hoje omite). Nenhuma migração, nenhum backfill (RF-020).

## Contratos

### Domínio (`src/core/domain/age/`)

```ts
// calendar-date.ts
export type CalendarDate = { year: number; month: number; day: number }; // month 1..12
export function parseCalendarDate(value: string): CalendarDate | null;    // YYYY-MM-DD estrito + dia existente
export function todayInBrasilia(now?: Date): CalendarDate;                // America/Sao_Paulo
export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number; // <0, 0, >0
export function formatCalendarDateBr(date: CalendarDate): string;         // "17/10/1994"
export function formatCalendarDateIso(date: CalendarDate): string;        // "1994-10-17"

// age.ts
export const MAX_AGE_YEARS = 120;
export const FUNNEL_MINIMUM_AGE_YEARS = 18;
export function calculateAgeInYears(birthDate: CalendarDate, today: CalendarDate): number;

export type BirthDateRejection = "invalid" | "future" | "too_old" | "under_minimum_age";
export type BirthDateValidation =
  | { ok: true; birthDate: CalendarDate; age: number }
  | { ok: false; reason: BirthDateRejection };
export function validateBirthDate(
  value: string,
  today: CalendarDate,
  rules?: { minimumAge?: number },
): BirthDateValidation;

export const BIRTH_DATE_MESSAGES: Record<BirthDateRejection | "missing", string>;
export const AGE_NOT_INFORMED_LABEL = "Idade não informada";
export function formatAgeLabel(age: number | null): string;              // "0 anos" | "1 ano" | "N anos" | "Idade não informada"
export function describeStudentAge(
  birthDate: string | null | undefined,
  today: CalendarDate,
): { age: number | null; ageLabel: string; birthDateLabel: string | null };
```

Regras de `validateBirthDate`, nesta ordem: `invalid` (parse falhou) -> `future` (data > hoje) -> `too_old` (idade > 120) -> `under_minimum_age` (idade < `minimumAge`, só quando informado). Idade exatamente 120 é aceita ("mais de 120" é o limite); 18 anos completos hoje é aceito (RF-004).

`describeStudentAge` trata como ausente: `null`, `undefined`, string vazia, formato ilegível, data futura e idade acima de 120 (dado antigo ou gravado por outro caminho; RF-009 impede que entre a partir de agora). Nunca devolve idade negativa.

Mensagens (texto exato, pt-BR):

| Motivo | Texto |
|---|---|
| `missing` | Data de nascimento é obrigatória. |
| `invalid` | Data de nascimento inválida. |
| `future` | Data de nascimento não pode ser uma data futura. |
| `too_old` | Data de nascimento inválida: resulta em mais de 120 anos. |
| `under_minimum_age` | O cadastro pela página é só para maiores de 18 anos. |

### `registerFromLanding(formData)` (público)

- Entrada: campos atuais + `birth_date: string` **obrigatório**, `YYYY-MM-DD`.
- Validação: `registerSchema` ganha `birth_date: birthDateSchema({ minimumAge: FUNNEL_MINIMUM_AGE_YEARS })`. Ausente -> `missing`; demais -> motivo correspondente. Qualquer falha devolve `{ success: false, error }` antes de criar conta (nada é gravado).
- Efeito: insert em `anamnesis` inclui `birth_date`.
- Saída: inalterada (`{ success, error? }`).

### `upsertAnamnesis(userId, formData)` e `saveAnamnese(formData)` (admin)

- Entrada: `birth_date?: string` continua opcional. Ausente ou vazia -> grava `null` (apaga a data).
- Validação: `anamneseSchema.birth_date = birthDateSchema().optional()`; sem idade mínima. Falha devolve `{ success: false, error }` com a mensagem do motivo, sem gravar.
- Saída: inalterada. `saveAnamnese` não tem chamador hoje, mas é export público de `"use server"`; por usar o mesmo schema, segue a mesma regra sem código extra (RF-009 "qualquer caminho").

### `createAiWorkoutDraft(userId)` (interno)

- `age: describeStudentAge(anamnese?.birth_date, todayInBrasilia()).age` substitui `calcAge`. Contrato com `generateWorkoutDraft` (`age: number | null`) não muda. `calcAge` é removida.

### `getAnamneseById(id)` e `getAnamneses()` (`admin/ia/actions.ts`)

- `AnamneseRow` ganha `birth_date: string | null`; os dois `select` passam a incluir a coluna (para o tipo não mentir). `buildPrompt` **não** recebe a idade (fora de escopo: não enviar à OpenAI).

### Props de componentes

| Componente | Prop nova | Tipo |
|---|---|---|
| `StudentProfile` | `studentAge` | `{ ageLabel: string; birthDateLabel: string \| null }` |
| `WorkoutBuilder` | `studentName`, `ageLabel` | `string`, `string` |
| `WorkoutCreatorModal` (interno) | `studentName`, `ageLabel` | `string`, `string` |
| `AnalysisView` | `ageLabel` | `string` |
| `AnamneseModal` | nenhuma | calcula `max` localmente com `formatCalendarDateIso(todayInBrasilia())` em `useState` lazy |
| `FunnelForm` | nenhuma | estado `dataNascimento` substitui `idade`; `birthDateError` por passo |

## Segurança

Modelo de ameaça desta fase (persona CyberSec, só o que a fase toca):

- **Entrada pública** (`registerFromLanding`): o único caminho não autenticado. O campo novo é uma string de 10 caracteres com formato fixo, validada no servidor por Zod + domínio antes de qualquer gravação; payload sem o campo, com formato alterado, data futura, idade abaixo de 18 ou acima de 120 é recusado e nenhuma conta é criada (RF-006, cenário 2.8). O tamanho fixo elimina strings longas. Nenhum dado desse campo entra em query por concatenação (PostgREST parametriza).
- **Caminhos autenticados** (`upsertAnamnesis`, `saveAnamnese`): já exigem `requireAuth("admin")`; não muda. A validação da data vale igual.
- **Validação no cliente é UX, não segurança**: o funil e o modal chamam a mesma função só para feedback. Nada depende dela.
- **Dado pessoal**: data de nascimento é PII (spec, "Dado pessoal"). A fase não a exibe ao aluno, não a envia à OpenAI (só a idade derivada, como hoje), não a guarda como número e remove o log de depuração que a imprimiria (D9).
- **Fora do escopo**: a proteção do funil contra uso automatizado (limite de taxa, desafio anti-bot) é tratada à parte, nas notas locais. A fase não altera esse ponto.
- **Repositório público**: as issues descrevem requisitos ("o servidor valida X e recusa Y"), não falhas atuais nem passos de exploração; sem segredos, sem valores de env, sem dados pessoais.

## Estratégia de testes

Pirâmide desta fase: muitos testes unitários do domínio (Vitest, ambiente `node`), zero teste de integração automatizado (não há banco de teste nem schema versionado) e QA manual roteirizado por issue nos quatro pontos de exibição e nos dois caminhos de gravação. Testes de componente ficam para quando `jsdom` entrar.

TDD: na issue F1.02, escrever `calendar-date.test.ts` e `age.test.ts` primeiro, rodar e ver falhar (red), implementar até passar (green), simplificar. Convenção: `describe` por função, `it` com o cenário em português, sem `globals` (imports explícitos de `vitest`).

### Casos de teste do domínio

Notação: datas em `YYYY-MM-DD`; "hoje" é um `CalendarDate` injetado. Instantes UTC para `todayInBrasilia`.

| ID | Função | Entrada | Esperado | Origem na spec |
|---|---|---|---|---|
| T01 | `todayInBrasilia` | `2026-10-18T00:30:00Z` (21h30 do dia 17 em Brasília) | `{2026,10,17}` | Virada do dia em Brasília, RF-012 |
| T02 | `todayInBrasilia` | `2026-10-18T02:59:59Z` | `{2026,10,17}` | idem |
| T03 | `todayInBrasilia` | `2026-10-18T03:00:00Z` | `{2026,10,18}` | idem |
| T04 | `parseCalendarDate` | `"1994-10-17"` | `{1994,10,17}` | base |
| T05 | `parseCalendarDate` | `"2026-02-31"` | `null` | Data inexistente |
| T06 | `parseCalendarDate` | `"2026-13-01"` | `null` | "mês 13" |
| T07 | `parseCalendarDate` | `"2026-02-29"` | `null` (não bissexto) | 29/02 |
| T08 | `parseCalendarDate` | `"2024-02-29"` | `{2024,2,29}` | 29/02 bissexto |
| T09 | `parseCalendarDate` | `"17/10/1994"`, `"2026-1-1"`, `"2026-10-17T00:00:00Z"`, `""` | `null` | Data incompleta/ilegível |
| T10 | `calculateAgeInYears` | nasc. `1994-10-17`, hoje `2026-10-17` | 32 | Aniversário hoje |
| T11 | `calculateAgeInYears` | nasc. `1994-10-18`, hoje `2026-10-17` | 31 | Aniversário amanhã |
| T12 | `calculateAgeInYears` | nasc. `1994-10-16`, hoje `2026-10-17` | 32 | Aniversário ontem |
| T13 | `calculateAgeInYears` | nasc. `2000-01-01`, hoje `2026-12-31` | 26 | Virada de ano |
| T14 | `calculateAgeInYears` | nasc. `2000-01-01`, hoje `2027-01-01` | 27 | Virada de ano |
| T15 | `calculateAgeInYears` | nasc. `2004-02-29`, hoje `2026-02-28` | 21 | 29/02 em ano não bissexto |
| T16 | `calculateAgeInYears` | nasc. `2004-02-29`, hoje `2026-03-01` | 22 | RF-011 |
| T17 | `calculateAgeInYears` | nasc. `2004-02-29`, hoje `2028-02-28` | 23 | 29/02 em ano bissexto |
| T18 | `calculateAgeInYears` | nasc. `2004-02-29`, hoje `2028-02-29` | 24 | RF-011 |
| T19 | `calculateAgeInYears` | nasc. `2026-03-01`, hoje `2026-10-17` | 0 | Idade zero |
| T20 | `calculateAgeInYears` | nasc. `2025-10-17`, hoje `2026-10-17` | 1 | Idade de 1 ano |
| T21 | `validateBirthDate` | `"2026-10-18"`, hoje `2026-10-17` | `{ok:false, reason:"future"}` | Data no futuro |
| T22 | `validateBirthDate` | `"2026-10-17"`, hoje `2026-10-17` | `{ok:true, age:0}` | Idade zero pelo modal |
| T23 | `validateBirthDate` | `"1906-10-17"`, hoje `2026-10-17` | `{ok:true, age:120}` | Limite inclusivo |
| T24 | `validateBirthDate` | `"1905-10-17"`, hoje `2026-10-17` | `{ok:false, reason:"too_old"}` | Mais de 120 anos |
| T25 | `validateBirthDate` | `"2026-02-31"`, hoje `2026-10-17` | `{ok:false, reason:"invalid"}` | RF-009 |
| T26 | `validateBirthDate` | `"2008-10-17"`, hoje `2026-10-17`, `{minimumAge:18}` | `{ok:true, age:18}` | 18 anos hoje |
| T27 | `validateBirthDate` | `"2008-10-18"`, hoje `2026-10-17`, `{minimumAge:18}` | `{ok:false, reason:"under_minimum_age"}` | 18 anos amanhã |
| T28 | `validateBirthDate` | `"2011-05-05"`, hoje `2026-10-17`, sem `minimumAge` | `{ok:true, age:15}` | Menor pelo modal |
| T29 | `validateBirthDate` | `"2026-10-18"`, hoje `2026-10-17`, `{minimumAge:18}` | `reason:"future"` (vence a regra de idade mínima) | ordem das regras |
| T30 | `formatAgeLabel` | `null`, `0`, `1`, `32` | `"Idade não informada"`, `"0 anos"`, `"1 ano"`, `"32 anos"` | RF-013 |
| T31 | `describeStudentAge` | `"1994-10-17"`, hoje `2026-10-17` | `{age:32, ageLabel:"32 anos", birthDateLabel:"17/10/1994"}` | Cenário 1.2 |
| T32 | `describeStudentAge` | `null`, `undefined`, `""` | `{age:null, ageLabel:"Idade não informada", birthDateLabel:null}` | RF-020 |
| T33 | `describeStudentAge` | `"lixo"`, `"2026-02-31"` | idem T32 | Dado corrompido |
| T34 | `describeStudentAge` | `"2030-01-01"` (futuro gravado por outro caminho), hoje `2026-10-17` | idem T32 (nunca negativo) | Dado antigo |
| T35 | `formatCalendarDateBr` | `{2000,1,5}` | `"05/01/2000"` | RF-015 |
| T36 | `formatCalendarDateIso` | `{2026,10,7}` | `"2026-10-07"` | `max` do modal |
| T37 | `compareCalendarDates` | `{2026,10,17}` vs `{2026,10,18}`; iguais; `{2027,1,1}` vs `{2026,12,31}` | `<0`; `0`; `>0` | base de `future` |

CS-002 é satisfeito por T10 a T20 mais T26/T27; a mesma função alimenta o rascunho da IA (F1.03), então "tanto na exibição quanto no cálculo da IA" vale por construção.

### QA manual (resumo; os passos completos estão em cada issue)

- Funil: data válida de maior; em branco; `31/02`; futura; menor de 18; 18 hoje (aceita); mais de 120. Conferir que o funil não avança do passo 1 e mantém os campos; depois abrir o perfil do aluno criado.
- Modal: salvar com data válida, sem data, apagando a data, com data futura, com mais de 120, com menor de 18 (aceita). Conferir cabeçalho e card sem recarregar.
- Perfil e construtor: aluno com data, sem data, sem anamnese; nas duas abas; criar, editar e revisar rascunho da IA.
- Tela da IA: anamnese com e sem data; anamnese sem aluno; aluno com mais de uma anamnese.
- Virada do dia: ajustar o relógio do dispositivo ou usar os testes T01 a T03 (o servidor não é manipulável manualmente; o teste unitário é a evidência).

## Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Tipo da coluna `birth_date` diferente de `date` | A tela mostraria "Idade não informada" para todo mundo | Confirmar no dashboard do Supabase em F1.03; QA do perfil pega na hora |
| Uso automatizado do funil público | Custo de OpenAI por cadastro | Proteção tratada fora desta fase, nas notas locais; não detalhar em issue pública |
| Anamnese "mais recente" ordenada por `id` (UUID), não por `created_at` | Aluno com mais de uma anamnese pode mostrar a data da "errada" (cenário 4.4 é esperado pela spec) | Fora do escopo; a spec aceita a divergência. Registrar para a fase que mexer na anamnese |
| `next build` passa a tipar `vitest.config.mts` e `*.test.ts` | Build quebra se as devDependencies faltarem | A Vercel instala devDependencies por padrão; `npm run build` local é critério de aceite de toda issue |
| Fuso do navegador do professor diferente de Brasília | Não afeta: a validação no cliente usa `timeZone: "America/Sao_Paulo"` e a exibição vem do servidor | Teste T01 a T03 |
| Dado pessoal em logs fora dos pontos tocados por esta fase | Fora do escopo; vale uma revisão própria de tudo que vai para log e para a OpenAI (a spec já prevê) | Registrado nas notas locais; não tocar nesta fase além de D9 |
| Hidratação na virada do dia | Evitado por D4 (hoje vem do servidor como prop) | Revisão de código: nenhum `new Date()` em render |

## Plano de entrega

Ordem e dependências:

```
F1.01 Vitest ──> F1.02 Domínio (TDD) ──> F1.03 Servidor ──> F1.04 Funil
                        │                      │
                        ├──> F1.05 Perfil + construtor
                        ├──> F1.06 Modal de anamnese (também depende de F1.03 para o QA do servidor)
                        └──> F1.07 Tela da IA
```

F1.05, F1.06 e F1.07 são independentes entre si e podem ir em paralelo depois de F1.02. Cada issue é commitável sozinha; `npm run lint`, `npm run build` e `npm run test` são gate de todas.

Verificação final da fase (depois de F1.07): percorrer o roteiro de QA manual acima de ponta a ponta com três alunos (funil, cadastrado pelo professor com data, antigo sem anamnese) e registrar o output real de `npm run test` e `npm run build`.

## Rastreabilidade

| RF | Issue(s) |
|---|---|
| RF-001 (data na anamnese, idade nunca guardada) | F1.02, F1.03 |
| RF-002 (campo "Data de nascimento" no funil) | F1.04 |
| RF-003 (obrigatória no funil) | F1.03 (servidor), F1.04 (tela) |
| RF-004 (mínimo 18 no funil, em Brasília) | F1.02 (regra), F1.03 (servidor), F1.04 (tela) |
| RF-005 (verificar ao avançar do passo 1) | F1.04 |
| RF-006 (servidor repete, mesma mensagem) | F1.03 |
| RF-007 (data gravada na anamnese do cadastro) | F1.03 |
| RF-008 (modal opcional, sem mínimo, apagar) | F1.03 (schema), F1.06 (tela) |
| RF-009 (data existente, não futura, até 120, em todo caminho) | F1.02 (regra), F1.03 (servidor), F1.04 e F1.06 (telas) |
| RF-010 (anos completos) | F1.02 |
| RF-011 (29/02) | F1.02 |
| RF-012 (hoje em Brasília) | F1.02 |
| RF-013 (rótulos "N anos", "1 ano", "Idade não informada") | F1.02 |
| RF-014 (cabeçalho do perfil) | F1.05 |
| RF-015 (card Anamnese com data em dd/mm/aaaa) | F1.05 |
| RF-016 (topo do construtor) | F1.05 |
| RF-017 (tela da IA, anamnese analisada) | F1.07 |
| RF-018 (mesma anamnese nos três pontos) | F1.05 |
| RF-019 (atualiza sem recarregar) | F1.05 (verificação), F1.06 |
| RF-020 (alunos antigos sem data) | F1.02, F1.05, F1.07 |
| RF-021 (uma única regra, inclusive na IA) | F1.02, F1.03 |

Critérios de sucesso: CS-001 -> F1.03, F1.04; CS-002 -> F1.02, F1.03; CS-003 -> F1.05, F1.07; CS-004 -> F1.03, F1.04, F1.06; CS-005 -> F1.03, F1.04, F1.06; CS-006 -> F1.05; CS-007 -> F1.05, F1.07.

## Pontos marcados como "confirmar na doc" ou no ambiente

1. API de refinamento do Zod 4.4 (`.superRefine` vs `.check`): confirmar em zod.dev/api antes de F1.03.
2. Tipo da coluna `anamnesis.birth_date` no Supabase (inferido `date`): confirmar no dashboard em F1.03.
3. Versões exatas a instalar em F1.01: `vitest@5.0.5` e `vite-tsconfig-paths@6.1.1` eram as mais recentes em 2026-10-17 (`npm view`); reconferir no dia.
