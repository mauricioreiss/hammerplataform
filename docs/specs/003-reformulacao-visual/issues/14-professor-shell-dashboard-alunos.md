---
id: F3.14
title: "F3.14 - Painel do professor: layout, dashboard, lista e cadastro de alunos"
labels: [fase-3, frontend]
depends_on: [F3.09]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, História 4, RF-009, RF-011, RF-012, RF-019 (sem transição de rota no painel), RF-026, RF-031, cenários 4.3 (chip de status) e 4.7 (esqueletos). Plano, seções 3 e 6.

## Objetivo
Shell do painel no tema (barra lateral e cabeçalho no computador, navegação inferior no celular), dashboard, lista e cadastro de alunos, com esqueletos da geometria final.

## Escopo
- `src/app/admin/layout.tsx`: `SideNav`, `AppHeader` (com `BrandMarkProvisional` no celular), `BottomNav`, áreas seguras; sem `template.tsx`.
- `src/components/admin/admin-sidebar.tsx`, `admin-header.tsx`, `admin-bottom-nav.tsx`, `kpi-card.tsx` (número em `numeral`), `training-queue-item.tsx`, `student-list-with-search.tsx`, `student-list-item.tsx` (`StatusChip` para o plano), `add-student-form.tsx` (`AppTextField`, `AppSelect` nos dois seletores nativos, `InlineAlert`), `realtime-*` sem mudança.
- `src/app/admin/page.tsx`, `admin/alunos/page.tsx` e os dois `loading.tsx` com `AppSkeleton` na geometria final.
- Lista de alunos: linha inteira como `ListItemButton` com link, sem contêiner genérico clicável.

## Fora de escopo
- Perfil do aluno (F3.15), construtor (F3.16), biblioteca, IA, configurações e notificações (F3.17).

## Critérios de aceite
- [ ] Em 1280 px: barra lateral com item ativo indicado por ícone preenchido e borda além da cor; em 390 px: navegação inferior com itens legíveis.
- [ ] Chip de status na lista: verde ativo, âmbar pendente, em análise ou vencendo, vermelho bloqueado, atrasado ou expirado, com ícone e texto.
- [ ] Cadastro de aluno pelo teclado: Tab percorre campos e seletores, seletores abrem com Enter e navegam com setas, erro aparece em `InlineAlert` anunciado.
- [ ] Esqueletos de `/admin` e `/admin/alunos` sem deslocamento ao carregar.
- [ ] Sem transição de rota entre as páginas do painel.
- [ ] Arquivos tocados sem `lucide-react`, `<select>`, hex ou `zinc-*`; nenhum acima de 200 linhas.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `/admin` e `/admin/alunos` em 320, 390 e 1280 px; axe; Lighthouse CLS

## Notas técnicas
- `RealtimeStudentListener` e seu `router.refresh()` não mudam (fora de escopo).
- O avatar gerado pelo dicebear em `training-queue-item.tsx` sai: o `Avatar` do tema com iniciais cobre o caso e deixa de enviar o nome a um serviço externo. É a única troca de implementação, justificada por usar o componente padronizado.
