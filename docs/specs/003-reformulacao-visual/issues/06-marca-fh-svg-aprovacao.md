---
id: F3.06
title: "F3.06 - Marca FH em SVG e aprovação do professor"
labels: [fase-3, design]
depends_on: [F2]
---
## Contexto
Spec docs/specs/003-reformulacao-visual/spec.md, RF-005 e CS-016: a marca "FH" é redesenhada em vetor a partir de `public/logo.jpeg`, `public/logo2.jpeg` e `public/Logo3.png`, mantendo a inclinação, e precisa da aprovação do professor antes de entrar no cabeçalho, na tela de abertura ou nos ícones. Esta issue depende de pessoas, por isso é própria.

## Objetivo
Ter `public/brand/fh-mark.svg` (traçado em `currentColor`, fundo transparente) e `public/brand/fh-mark-filled.svg` (prata sobre grafite, para ícones) aprovados e registrados.

## Escopo
- Redesenho vetorial com as proporções e a inclinação da marca original; sem o nome completo (fora de escopo).
- Prova em três contextos: cabeçalho 32 px de altura, ícone 192 px em máscara circular e splash 1170x2532 px sobre `#0A0A0B`.
- Apresentar ao professor (via Mauri) e registrar o resultado no checklist abaixo. Se pedir ajuste, nova rodada até aprovar.
- Componente `BrandMark` em `src/components/ui/brand-mark.tsx` (SVG inline, `size`, `aria-label="Hammer"`), ainda sem uso em tela.

## Fora de escopo
- Trocar o cabeçalho, os ícones instalados e o splash (F3.19).
- Nome completo, assinaturas e papelaria.

## Critérios de aceite
- [ ] Os dois SVGs existem, validam no navegador e têm menos de 8 kB cada.
- [ ] Prova nos três contextos anexada ou referenciada.
- [ ] Professor aprovou (data e quem registrou): ______ / ______
- [ ] Pedido de ajuste (se houver) descrito e atendido: ______

## Verificação
- [ ] npm run lint
- [ ] npm run build
- [ ] QA visual: `BrandMark` em 24, 32 e 192 px na página `/dev/componentes` (não acusa pixelização nem corte)

## Notas técnicas
- `currentColor` permite o cabeçalho pintar a marca com `primary.main` sem outra cópia do arquivo.
- A versão `filled` é a origem única dos PNGs de F3.19; nunca editar os PNGs à mão.
