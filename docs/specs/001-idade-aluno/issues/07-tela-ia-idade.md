---
id: F1.07
title: "F1.07 - Tela de análise da IA: idade no bloco de dados do aluno"
labels: [fase-1, backend, frontend]
depends_on: [F1.02]
---
## Contexto
Na tela de análise, o bloco "Dados do Aluno" mostra peso, altura, dias por semana e lesões, mas a consulta da anamnese nem seleciona a data de nascimento. A idade exibida deve ser a da anamnese analisada, ainda que difira da anamnese atual do perfil. Spec: docs/specs/001-idade-aluno/spec.md (História 4, RF-013, RF-017, RF-020; cenários 4.1 a 4.4). Plano: docs/specs/001-idade-aluno/plan.md (D4, D5, contratos de `getAnamneseById` e `AnalysisView`).

## Objetivo
O bloco "Dados do Aluno" mostra "N anos" calculado a partir da data de nascimento daquela anamnese, ou "Idade não informada", para anamneses com e sem aluno vinculado.

## Escopo
- `src/app/admin/ia/actions.ts`: `AnamneseRow` ganha `birth_date: string | null`; os `select` de `getAnamneses` e `getAnamneseById` incluem `birth_date`. `buildPrompt` e `analyzeAnamnese` não mudam: a idade não entra no prompt da análise.
- `src/app/admin/ia/[id]/page.tsx` (server): `const ageLabel = describeStudentAge(anamnese.birth_date, todayInBrasilia()).ageLabel` e passar `ageLabel` para `AnalysisView`.
- `src/app/admin/ia/[id]/analysis-view.tsx`: prop nova `ageLabel: string`; nova célula "Idade" na grade "Dados do Aluno", no estilo das células vizinhas, mostrando `ageLabel`.

## Fora de escopo
- Corrigir os rótulos do PAR-Q ("Pergunta q0"); registrado na spec como bug separado.
- Incluir a idade ou a data no prompt enviado à OpenAI.
- Mudança de layout ou biblioteca de UI.
- Lista `/admin/ia` (não exibe idade nesta fase).

## Critérios de aceite
- [ ] Anamnese com data de nascimento: o bloco "Dados do Aluno" mostra "N anos" junto dos demais dados.
- [ ] Anamnese sem data: o bloco mostra "Idade não informada" no lugar da idade; sem traço, vazio ou erro.
- [ ] Anamnese sem aluno vinculado ("Aluno sem cadastro"): mesma regra, a partir da data daquela anamnese.
- [ ] Aluno com mais de uma anamnese, com datas diferentes: a tela mostra a idade da anamnese analisada, mesmo que difira da do perfil.
- [ ] O prompt da análise (`buildPrompt`) continua sem idade e sem data de nascimento.
- [ ] `AnamneseRow.birth_date` está tipado e selecionado nas duas consultas (o tipo não mente).

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual: abrir a análise de uma anamnese com data e de outra sem; de uma sem aluno vinculado (se houver no banco; senão, criar via `saveAnamnese` ou inserir no dashboard); e, para um aluno com duas anamneses com datas diferentes, comparar a tela da IA com o perfil. Screenshot do bloco com "N anos" e com "Idade não informada".
- [ ] QA manual: gerar uma análise e conferir no log do servidor que o prompt não contém idade nem data.

## Notas técnicas
- `todayInBrasilia()` roda na page (server), uma vez por request; `AnalysisView` só exibe a prop.
- `getAnamneseById` busca por `id` da anamnese, não do aluno, então a data é naturalmente a da anamnese analisada (cenário 4.4).
- Não enviar idade à OpenAI é decisão da spec ("Fora de escopo"); qualquer mudança no prompt fica para a revisão futura dos dados enviados.
