---
id: F1.03
title: "F1.03 - Servidor: validar a data de nascimento nas gravações e usar a regra única de idade"
labels: [fase-1, backend]
depends_on: [F1.02]
---
## Contexto
As server actions são a fronteira do sistema. Com o domínio pronto (F1.02), elas passam a validar a data de nascimento em todo caminho de gravação, o cadastro do funil passa a gravar a data na anamnese e o rascunho da IA passa a usar a mesma regra de idade. Spec: docs/specs/001-idade-aluno/spec.md (RF-001, RF-003, RF-004, RF-006, RF-007, RF-008, RF-009, RF-021; cenário 2.8). Plano: docs/specs/001-idade-aluno/plan.md (D7, D9, seção Contratos).

## Objetivo
Nenhuma gravação de data de nascimento inválida, futura ou acima de 120 anos é aceita pelo servidor; o funil só conclui com data válida de maior de 18; a data do funil fica na anamnese; `calcAge` deixa de existir.

## Escopo
- `src/app/actions.ts`, seção `--- Validation ---`:
  - Criar `birthDateSchema(rules?: { minimumAge?: number })`: `z.iso.date(BIRTH_DATE_MESSAGES.invalid)` seguido de refinamento que chama `validateBirthDate(value, todayInBrasilia(), rules)` e, em falha, emite `BIRTH_DATE_MESSAGES[reason]`.
  - `anamneseSchema.birth_date = birthDateSchema().optional()` (substitui o regex atual; sem idade mínima).
  - `registerSchema.birth_date = birthDateSchema({ minimumAge: FUNNEL_MINIMUM_AGE_YEARS })` obrigatório, com a mensagem `BIRTH_DATE_MESSAGES.missing` quando ausente.
- `registerFromLanding`: desestruturar `birth_date` e incluí-la no insert de `anamnesis`. Nada mais muda no fluxo.
- `upsertAnamnesis`: ausência ou vazio continua gravando `null` (apagar a data). Remover o `console.log` de depuração que imprime o payload da anamnese. Em `getAnamneseByUserId`, remover o `console.log` de depuração equivalente. Não adicionar nenhum log com o campo.
- `createAiWorkoutDraft`: substituir `calcAge(...)` por `describeStudentAge(anamnese?.birth_date, todayInBrasilia()).age`; apagar `calcAge`.
- `saveAnamnese` não muda de código: usa `anamneseSchema` e herda a regra.
- Confirmar no dashboard do Supabase que `anamnesis.birth_date` é do tipo `date` (inferido no plano) e registrar o resultado no PR.

## Fora de escopo
- Qualquer mudança de tela (F1.04 a F1.07).
- Outras proteções do funil, tratadas fora desta fase.
- Outros campos do funil hoje descartados; outros logs do projeto; prompt da análise da IA (`admin/ia/actions.ts`).
- Mudança de schema ou migração.

## Critérios de aceite
- [ ] `registerFromLanding` recusa, sem criar conta nem linha em `users`/`anamnesis`, um payload: sem `birth_date`; com `birth_date` fora de `YYYY-MM-DD`; com data inexistente (`2026-02-31`); com data futura; com idade abaixo de 18 em Brasília; com idade acima de 120. A mensagem devolvida é a do motivo, conforme `BIRTH_DATE_MESSAGES`.
- [ ] `registerFromLanding` aceita quem completa 18 anos exatamente hoje em Brasília e grava `birth_date` na anamnese criada.
- [ ] `upsertAnamnesis` e `saveAnamnese` recusam data inexistente, futura ou acima de 120 anos com a mensagem do motivo; aceitam data de menor de 18 anos; aceitam ausência de data e gravam `null`.
- [ ] `calcAge` não existe mais em `src/app/actions.ts`; `createAiWorkoutDraft` obtém a idade pelo domínio.
- [ ] Nenhum `console.log`/`console.error` novo com `birth_date`; os dois logs de depuração da anamnese foram removidos.
- [ ] Tipo da coluna `birth_date` confirmado e anotado no PR.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual (dev local, com o funil ainda enviando o campo antigo): o cadastro pelo funil deve ser recusado com a mensagem de campo obrigatório, provando a regra no servidor antes da tela mudar.
- [ ] QA manual: no modal de anamnese (tela atual), salvar com data futura e confirmar a recusa com a mensagem do servidor; salvar com data de menor de 18 e confirmar que grava; apagar a data e confirmar `null`.
- [ ] QA manual: com um aluno com data e outro sem, disparar "Gerar Treino com IA" e confirmar no log do prompt que a idade enviada bate com a regra (para o aluno sem data, "nao informada").

## Notas técnicas
- `z.iso.date()` é a API top-level do Zod 4 (`z.string().date()` está depreciada). Confirmar em zod.dev/api a API de refinamento da versão instalada: `.superRefine((value, ctx) => ctx.addIssue({ code: "custom", message }))` continua disponível; `.check()` é a nova. Qualquer uma serve.
- A existência do dia no calendário é sempre decidida por `parseCalendarDate` (domínio); o Zod só garante a forma.
- `todayInBrasilia()` é chamada dentro do refinamento, no momento da validação, e não na definição do schema (o módulo é carregado uma vez por instância).
- A ordem das regras no domínio (`invalid` -> `future` -> `too_old` -> `under_minimum_age`) define qual mensagem sai quando mais de uma falha.
- Texto das mensagens com acento, importado de `BIRTH_DATE_MESSAGES`; não redigitar.
