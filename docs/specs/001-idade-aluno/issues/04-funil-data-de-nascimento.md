---
id: F1.04
title: "F1.04 - Funil: campo Data de nascimento com validação ao avançar do passo 1"
labels: [fase-1, frontend]
depends_on: [F1.03]
---
## Contexto
O passo "Seus Dados" do funil pede "Idade" como número e descarta o valor. Passa a pedir a data de nascimento, obrigatória, com verificação ao tentar avançar do passo, e a envia ao servidor, que já valida e grava (F1.03). Spec: docs/specs/001-idade-aluno/spec.md (História 2, RF-002 a RF-005, RF-009; cenários 2.1 a 2.7). Plano: docs/specs/001-idade-aluno/plan.md (D4, D6, contratos de `FunnelForm`).

## Objetivo
O visitante informa a data de nascimento num campo com rótulo visível, recebe no próprio passo a mensagem do que está errado (obrigatória, inválida, futura, menor de 18, mais de 120) sem perder o que preencheu, e o cadastro concluído grava a data.

## Escopo
- `src/components/landing/funnel-form.tsx`:
  - Substituir o estado `idade` por `dataNascimento` (string `YYYY-MM-DD`) e o `<input type="number" placeholder="Idade">` por `<label htmlFor="birth-date">Data de nascimento</label>` + `<input id="birth-date" type="date">`, no mesmo lugar da grade (ao lado de "Sexo"), com as classes de input já usadas no passo. O rótulo é texto visível, não placeholder.
  - Novo estado `birthDateError: string` exibido logo abaixo do campo (`<p>` com o estilo de erro já usado no passo 4), com `aria-invalid` e `aria-describedby` no input.
  - Handler `handleNextStep`: no passo 1, se `dataNascimento` está vazia -> `BIRTH_DATE_MESSAGES.missing`; senão `validateBirthDate(dataNascimento, todayInBrasilia(), { minimumAge: FUNNEL_MINIMUM_AGE_YEARS })` e, em falha, `BIRTH_DATE_MESSAGES[reason]`. Em falha, não avança e mantém todos os campos. Limpar o erro ao editar o campo ou ao validar com sucesso.
  - `handleComplete`: enviar `birth_date: formData.dataNascimento` em `registerFromLanding`.
  - O erro devolvido pelo servidor no passo 4 continua aparecendo onde já aparece.
- Importar só funções puras de `@/core/domain/age` (sem Zod no cliente).

## Fora de escopo
- Validar os outros campos do passo 1 (nome, e-mail, senha) ao avançar; o comportamento atual deles não muda.
- Coletar ou gravar sexo, WhatsApp, experiência, estresse, anabolizantes.
- Mudança de layout, cores ou biblioteca de UI (Fase 3).
- Outras proteções do funil, tratadas fora desta fase.

## Critérios de aceite
- [ ] No passo 1 existe o rótulo visível "Data de nascimento" associado a um `<input type="date">` e não existe mais o campo "Idade".
- [ ] Ao clicar em "Próximo Passo" com o campo vazio, o funil fica no passo 1, mostra "Data de nascimento é obrigatória." abaixo do campo e mantém nome, e-mail, senha e demais valores.
- [ ] Com data inexistente (ex.: `31/02`) ou futura, o funil fica no passo 1 e mostra a mensagem do motivo.
- [ ] Com data que resulta em menos de 18 anos em Brasília, o funil fica no passo 1 e mostra "O cadastro pela página é só para maiores de 18 anos."
- [ ] Com data de quem completa 18 anos exatamente hoje em Brasília, o funil avança.
- [ ] Com data que resulta em mais de 120 anos, o funil fica no passo 1 e mostra a mensagem do motivo.
- [ ] Concluindo o cadastro com data válida, a anamnese criada tem `birth_date` preenchida (conferir no perfil do aluno em F1.05 ou no banco).
- [ ] O erro some ao corrigir o campo; navegação por Tab alcança o campo e o botão; sem `any`.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no navegador (desktop e viewport de celular): os sete cenários da História 2 (válida de maior, vazia, inexistente, futura, menor de 18, 18 hoje, mais de 120), conferindo mensagem e permanência dos campos.
- [ ] QA manual: concluir um cadastro válido e abrir o perfil do aluno no painel; a anamnese deve ter a data (a idade aparece na tela a partir de F1.05).
- [ ] Screenshot do passo 1 com o campo e com uma mensagem de erro.

## Notas técnicas
- `todayInBrasilia()` roda dentro do handler de clique (não no render), então não há risco de divergência entre SSR e hidratação. O fuso do dispositivo não importa: a função força `America/Sao_Paulo`.
- `<input type="date">` devolve `YYYY-MM-DD` em todos os navegadores; é o mesmo formato que o servidor espera. Não há conversão.
- A validação na tela é conveniência; a regra vale no servidor (F1.03). Mesmo texto nos dois lados por vir de `BIRTH_DATE_MESSAGES`.
- O botão "Próximo Passo" hoje só chama `setStep`; passa a chamar `handleNextStep`, que valida apenas no passo 1.
