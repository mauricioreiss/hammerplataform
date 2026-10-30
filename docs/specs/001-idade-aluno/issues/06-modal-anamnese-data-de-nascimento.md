---
id: F1.06
title: "F1.06 - Modal de anamnese: limite de data em Brasília e validação na tela"
labels: [fase-1, frontend]
depends_on: [F1.02, F1.03]
---
## Contexto
O modal de anamnese já salva a data de nascimento, mas calcula o `max` do campo com o relógio em UTC e só mostra erros vindos do servidor. Com o domínio (F1.02) e o servidor validando (F1.03), o modal passa a limitar o campo ao dia de hoje em Brasília e a dar a mesma mensagem antes de enviar. O campo continua opcional e sem idade mínima. Spec: docs/specs/001-idade-aluno/spec.md (História 3, RF-008, RF-009, RF-012; cenários 3.1 a 3.7). Plano: docs/specs/001-idade-aluno/plan.md (D4, D6).

## Objetivo
No modal, o professor informa, corrige ou apaga a data; data inexistente, futura ou acima de 120 anos é recusada na tela com a mesma mensagem do servidor; menor de 18 é aceito; salvar sem data continua permitido.

## Escopo
- `src/components/admin/anamnese-modal.tsx`:
  - `max` do `<input type="date">`: `useState(() => formatCalendarDateIso(todayInBrasilia()))` (inicializador lazy; o modal só monta após clique, não é renderizado no servidor). Substitui `new Date().toISOString().split("T")[0]`.
  - Em `handleSubmit`, antes de chamar `upsertAnamnesis`: se `birthDate` não está vazia, `validateBirthDate(birthDate, todayInBrasilia())` (sem `minimumAge`); em falha, `setError(BIRTH_DATE_MESSAGES[reason])` e não enviar. Vazia continua enviando `undefined` (apaga a data).
  - Associar o rótulo "Data de Nascimento" ao input (`htmlFor`/`id`), como os demais campos deveriam ter.
- Manter o restante do modal como está.

## Fora de escopo
- Outros campos do modal; semântica de diálogo, foco e Escape (dívida já conhecida, fora desta fase).
- Exibição da idade no perfil (F1.05).
- Idade mínima no modal: não existe por decisão da spec.

## Critérios de aceite
- [ ] O campo de data não permite selecionar um dia posterior a hoje em Brasília (`max` igual a `formatCalendarDateIso(todayInBrasilia())`), inclusive entre 21h e 23h59 de Brasília.
- [ ] Data inexistente, futura ou que resulta em mais de 120 anos: a anamnese não é salva e o modal mostra a mensagem do motivo (mesmo texto de `BIRTH_DATE_MESSAGES`).
- [ ] Data de menor de 18 anos: a anamnese é salva e o perfil mostra a idade (ex.: "15 anos").
- [ ] Salvar sem data: salva normalmente; perfil mostra "Idade não informada".
- [ ] Apagar uma data existente e salvar: a anamnese fica sem data; perfil volta a "Idade não informada".
- [ ] Corrigir a data de um aluno vindo do funil: a idade exibida passa a refletir a data corrigida.
- [ ] O rótulo "Data de Nascimento" está associado ao input.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual: os sete cenários da História 3 no navegador, conferindo o resultado no perfil (F1.05) ou, se F1.05 ainda não estiver na branch, no banco.
- [ ] QA manual: digitar uma data futura direto no campo (o `max` não impede digitação em todos os navegadores) e confirmar a recusa na tela sem chamada ao servidor (aba Network).
- [ ] QA manual: forçar o envio direto da action com data futura (ex.: desabilitando a checagem localmente) e confirmar que o servidor recusa com a mesma mensagem (F1.03).

## Notas técnicas
- `todayInBrasilia()` no inicializador lazy do `useState` e no `handleSubmit`: fora do caminho de SSR, sem risco de hidratação. Como o modal pode ficar aberto na virada do dia, o `handleSubmit` recalcula "hoje" em vez de reutilizar o estado.
- A validação na tela é conveniência; a regra vale no servidor (F1.03). Mensagens vêm de `BIRTH_DATE_MESSAGES`, não redigitar.
- `upsertAnamnesis` já grava `null` quando `birth_date` chega `undefined`; apagar a data não precisa de código novo.
