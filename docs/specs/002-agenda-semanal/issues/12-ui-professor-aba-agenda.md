---
id: F2.12
title: "F2.12 - UI do professor: aba Agenda no perfil do aluno"
labels: [fase-2, frontend]
depends_on: [F2.10, F1.05]
---
## Contexto
O professor monta a agenda no perfil do aluno, ao lado de "Fichas de Treino", escolhendo para cada dia uma ficha, um descanso com texto ou nada, e vê o status da semana corrente. Spec: docs/specs/002-agenda-semanal/spec.md, RF-001, RF-002, RF-024, RF-030, RF-031, RF-036, RF-037; cenários 2.1 a 2.5, 2.7, 3.6, 4.11, 4.12, 4.13, 4.24, 5.1, 5.4, 5.5, 5.6. Visual atual (a reformulação é a Fase 3).

## Objetivo
Componente `src/components/admin/schedule-editor.tsx` montado em uma nova aba "Agenda" de `student-profile.tsx`, com sete linhas, seletor por dia, texto de descanso, status do dia, indicação de rascunho e aviso ao atribuir ficha a dia passado.

## Escopo
- Frontend: `student-profile.tsx` ganha a aba `"agenda"` (`activeTab` passa a `"treinos" | "avaliacoes" | "agenda"`), com o mesmo estilo das duas abas existentes.
- Frontend: `ScheduleEditor` recebe `studentId`, `week` (audiência teacher) e `workouts`; renderiza sete linhas (segunda a domingo) com: nome do dia e data da semana corrente; `<select>` nativo com opções "Dia livre", "Descanso" e as fichas do aluno (rascunhos com sufixo "(rascunho)"); `<textarea maxLength={500}>` visível só em descanso, com contador; status do dia (feito, reposto, não realizado, pendente) e a ficha executada quando houver sessão; sem status em descanso, livre e rascunho.
- Frontend: botão "Salvar agenda" chama `saveStudentSchedule`; estado local em `useState`, loading no botão, erro em texto, `router.refresh()` após sucesso (padrão do projeto). Se `pastDaysAssigned` vier preenchido, exibir aviso "A terça aparecerá como não realizada para o aluno até ser reposta" (RF-024), após salvar.
- Frontend: a página `src/app/admin/alunos/[id]/page.tsx` passa a carregar `getStudentSchedule` em paralelo com as demais queries e repassa a `StudentProfile`.
- Acessibilidade mínima: `label` associado a cada `select` e `textarea`; botões com texto.
- Arquivos prováveis: `src/components/admin/schedule-editor.tsx`, `src/components/admin/student-profile.tsx`, `src/app/admin/alunos/[id]/page.tsx`.

## Fora de escopo
- Aviso na exclusão de ficha e histórico em Brasília (F2.13).
- Troca de biblioteca de UI, componentes padronizados ou modais (Fase 3).
- Edição de ficha dentro da aba Agenda.

## Critérios de aceite
- [ ] A aba Agenda aparece ao lado de "Fichas de Treino" e mostra sete linhas na ordem segunda a domingo (cenário 2.1, CS-005).
- [ ] Atribuir a mesma ficha à segunda e à quinta e salvar funciona sem erro (cenário 2.2).
- [ ] Ficha em rascunho aparece marcada como rascunho na linha e o dia não tem status (cenário 2.3, RF-031).
- [ ] Marcar descanso, escrever texto e salvar persiste o texto; descanso sem texto é aceito; 501 caracteres não passam do `maxLength` e o servidor recusa se forçado (cenários 5.1, 5.4, 5.6).
- [ ] Trocar o dia de descanso para ficha remove o texto da linha (cenário 5.5).
- [ ] Na quinta, atribuir ficha publicada à terça e salvar mostra o aviso de não realizado (cenários 2.7, 4.24).
- [ ] Linhas com sessão mostram feito ou reposto com a ficha executada mesmo após trocar a ficha, o descanso ou voltar a rascunho (cenários 4.11 a 4.13).
- [ ] Componente com menos de 200 linhas; zero `any`; `npm run build` verde.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run test
- [ ] QA manual no projeto Supabase de desenvolvimento: os cenários acima com o aluno de teste, conferindo a home do aluno após cada salvamento (Chrome DevTools ou Playwright)

## Notas técnicas
- Status na UI usa as cores já existentes no projeto: verde (feito, reposto), amarelo (não realizado), zinc (pendente); texto além da cor.
- Datas exibidas como `dd/mm` a partir de `LocalDate` por formatação de string, nunca `new Date("YYYY-MM-DD")` (gotcha 23 do mapa).
- Nenhuma dependência nova.
