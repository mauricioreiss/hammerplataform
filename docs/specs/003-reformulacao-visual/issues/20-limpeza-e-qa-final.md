---
id: F3.20
title: "F3.20 - Limpeza do design system anterior, lint de cor fixa e QA final da fase"
labels: [fase-3, frontend, infra, testes]
depends_on: [F3.11, F3.13, F3.18, F3.19]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-003 (fonte anterior removida), RF-004 (família de ícones anterior removida), RF-034 (design system anterior removido), e os critérios de sucesso CS-001 a CS-020 medidos ao final. ADR 0001: não coexistem dois design systems.

## Objetivo
Projeto sem shadcn, Base UI, lucide, `tw-animate-css` e Geist; `globals.css` reduzido ao necessário; lint que impede cor fixa; todos os critérios de sucesso da spec verificados e registrados contra a base de F3.01.

## Escopo
- Remover dependências: `shadcn`, `@base-ui/react`, `lucide-react`, `tw-animate-css`, `class-variance-authority`; manter `clsx` e `tailwind-merge` só se `cn()` ainda for usado para classes de layout (senão remover também). Apagar `components.json`, `src/components/ui/button.tsx` (shadcn), `src/lib/supabase.ts` (morto) e `src/lib/utils.ts` se ficar sem uso.
- `src/app/globals.css`: manter `@layer ...`, `@import "tailwindcss"`, `@theme` com `--color-*: initial` (paleta padrão apagada), `--spacing` base 4 px e as fontes como `--font-sans`/`--font-display` apontando para as variáveis do `next/font`; remover os tokens do shadcn, `.dark`, `.pb-safe`, `tw-animate-css`.
- Regra ESLint (`no-restricted-syntax`) proibindo em `className` e `sx` fora de `src/theme/`: `#` seguido de hex, `rgba(`, `rgb(`, `bg-[`, `text-[`, `zinc-`, `red-`, `green-`, `yellow-`, `purple-`, `font-black`, `italic`, `animate-in`.
- `grep` de verificação em todo `src`: `lucide-react`, `fixed inset-0`, `<select`, `alert(`, `confirm(`, `animate-pulse`, `shadow-[` com zero ocorrências.
- QA final: repetir Lighthouse e axe de F3.01 nas 13 rotas, screenshots nas três larguras, passada com reduzir movimento nas rotas do aluno, roteiro de teclado dos modais, roteiro de regressão manual (CS-017) e aparelhos reais (CS-009, CS-010, CS-018). Registrar em `docs/specs/003-reformulacao-visual/qa-final.md` com a tabela CS por CS.
- Atualizar `docs/CODEBASE_MAP.md` (seções Componentes, Convenções e os gotchas 30 a 42 que esta fase resolveu) e o README onde cita shadcn.

## Fora de escopo
- Itens da fase futura de robustez.

## Critérios de aceite
- [ ] `package.json` sem os pacotes listados; `npm ls lucide-react` vazio; `npm run build` passa.
- [ ] Lint falha ao inserir `className="text-[#fff]"` em um componente de tela (teste manual, depois revertido).
- [ ] Todos os `grep` de verificação com zero ocorrências.
- [ ] `qa-final.md` com CS-001 a CS-020 marcados e evidência (números, screenshots, quem testou no aparelho).
- [ ] Desempenho por rota não caiu mais de 5 pontos em relação a `baseline.md`; acessibilidade >= 95; CLS < 0,1; First Load JS dentro do orçamento da seção 9 do plano.
- [ ] Fontes renderizadas por rota: só Montserrat e Michroma.
- [ ] Inventário da seção 6 do plano conferido contra `src/components/ui`: um arquivo por tipo, zero duplicatas.

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] npm run qa:screens nas 13 rotas, três larguras
- [ ] Lighthouse, axe, roteiro de teclado, regressão manual e aparelhos reais com output em qa-final.md

## Notas técnicas
- `--color-*: initial` só entra aqui porque, antes, alguma tela não migrada ainda usa `zinc-*`; nesta issue nenhuma usa.
- Se a Fase 2 tiver adicionado componentes depois do início desta fase, incluí-los no inventário e migrá-los aqui antes de fechar.
