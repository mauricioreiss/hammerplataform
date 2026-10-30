---
id: F1.05
title: "F1.05 - Perfil do aluno: idade no cabeçalho, no card Anamnese e no topo do construtor de fichas"
labels: [fase-1, frontend]
depends_on: [F1.02]
---
## Contexto
O professor não vê a idade em lugar nenhum do painel. A página do perfil já carrega a anamnese atual; falta calcular a idade uma vez, no servidor, e exibi-la nos três pontos em que o professor trabalha sobre o aluno, inclusive no construtor em tela cheia que cobre o cabeçalho. Spec: docs/specs/001-idade-aluno/spec.md (Histórias 1 e 5, RF-013 a RF-016, RF-018 a RF-020; cenários 1.1 a 1.6, 5.1 a 5.3). Plano: docs/specs/001-idade-aluno/plan.md (D4, D5, contratos de props).

## Objetivo
No perfil, a idade (ou "Idade não informada") aparece ao lado do nome em todas as abas, no card "Anamnese" junto da data de nascimento em `dd/mm/aaaa`, e no topo do construtor de fichas (criar, editar, revisar rascunho), sempre a partir da mesma anamnese e sem o professor recarregar depois de salvar.

## Escopo
- `src/app/admin/alunos/[id]/page.tsx` (server): `const today = todayInBrasilia()` e `const studentAge = describeStudentAge(anamnesis?.birth_date, today)`; passar `studentAge={{ ageLabel, birthDateLabel }}` para `StudentProfile`.
- `src/components/admin/student-profile.tsx`:
  - Prop nova `studentAge: { ageLabel: string; birthDateLabel: string | null }`.
  - Cabeçalho: exibir `ageLabel` ao lado do nome, na linha dos badges de status (mesmo estilo `text-[9px] font-bold uppercase` dos vizinhos). Fica fora do conteúdo das abas, logo visível em ambas.
  - Card "Dados da Anamnese": nova célula "Idade" na grade, com `ageLabel` e, quando `birthDateLabel` existir, a data ao lado no estilo dos dados vizinhos. Quando não há anamnese, mostrar "Idade não informada" junto do texto atual "Nenhuma anamnese inicial registrada."
  - Passar `studentName={student.full_name}` e `ageLabel={studentAge.ageLabel}` para `WorkoutBuilder`.
- `src/components/admin/workout-builder.tsx`: props novas `studentName` e `ageLabel` em `WorkoutBuilder` e em `WorkoutCreatorModal`; no cabeçalho fixo do modal em tela cheia (`fixed inset-0`), abaixo ou ao lado do título ("Construtor de Treino" / "Editar Ficha" / "Revisar Treino IA"), mostrar `{studentName} - {ageLabel}` no estilo das labels existentes. Mesmo texto nos três modos.
- Nenhuma regra de idade nos componentes: só exibição de props.

## Fora de escopo
- Modal de anamnese (F1.06) e tela da IA (F1.07).
- Mudança de layout, cores ou biblioteca de UI; a idade entra no visual atual, no estilo dos dados vizinhos.
- Critério de qual anamnese é a atual.
- Exibir a idade ao aluno.

## Critérios de aceite
- [ ] Aluno com data de nascimento: cabeçalho mostra "N anos" ao lado do nome; card "Anamnese" mostra o mesmo "N anos" e a data em `dd/mm/aaaa` (ex.: nascido em 17/10/1994, em 17/10/2026, "32 anos" e "17/10/1994").
- [ ] Aluno com anamnese sem data: cabeçalho e card mostram "Idade não informada"; o card não mostra data alguma.
- [ ] Aluno sem anamnese: cabeçalho mostra "Idade não informada"; o card mostra "Idade não informada" junto do aviso de ausência de anamnese.
- [ ] Alternando entre "Fichas de Treino" e "Avaliações Físicas", a idade continua no cabeçalho.
- [ ] Construtor aberto para criar ficha nova, editar ficha existente e revisar rascunho da IA mostra o nome e a idade (ou "Idade não informada") no topo, visíveis durante toda a montagem.
- [ ] Depois de salvar uma data pelo modal de anamnese (tela atual), cabeçalho e card atualizam sem recarregar manualmente.
- [ ] Idade 1 aparece como "1 ano"; 0 como "0 anos" (dados de teste pelo modal).
- [ ] Nenhum `new Date()` nem chamada a `todayInBrasilia()` dentro do render de componente client; o valor vem da page.
- [ ] Nunca um espaço vazio, traço ou erro nos três pontos, para os três tipos de aluno.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual com três alunos (com data, com anamnese sem data, sem anamnese): cabeçalho nas duas abas, card, construtor nos três modos. Screenshots do cabeçalho, do card e do topo do construtor.
- [ ] QA manual: editar a data no modal e confirmar a atualização sem F5 (RF-019).
- [ ] QA manual em viewport de celular: o topo do construtor não quebra nem esconde o botão de fechar.

## Notas técnicas
- A página já faz `getAnamneseByUserId` em paralelo; a idade é derivada dali (mesma anamnese do card, RF-018). Um único `describeStudentAge` por request.
- `router.refresh()` em `anamnese-modal.tsx` e `RealtimeProfileListener` (escuta `anamnesis` por `user_id`) já refazem a página; a atualização pós-salvamento sai de graça. Só verificar.
- `WorkoutBuilder` é renderizado dentro da aba "Fichas de Treino"; o construtor (`WorkoutCreatorModal`) é um overlay `fixed inset-0 z-50` com cabeçalho `shrink-0`, lugar natural para nome + idade.
- Sem `aria-label` extra: o texto é visível. Sem valores mágicos de estilo; reusar as classes dos vizinhos.
