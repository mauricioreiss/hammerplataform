# Material UI como design system, no lugar do shadcn/ui

O projeto já tinha o shadcn/ui configurado sobre Base UI e ícones lucide, mas quase nada era usado: a UI era feita com classes Tailwind soltas e cores fixas. Na reformulação visual, o Mauri escolheu o Material UI (MUI v9) com os Material Icons no estilo Sharp, por preferência estética, com um tema próprio derivado da logo (monocromático metálico, escuro, Montserrat e Michroma). O visual padrão do Material é evitado de propósito.

## Considered Options

- **shadcn/ui sobre Base UI + lucide**: já instalado e era a recomendação técnica (componentes dentro do repositório, sem runtime de CSS-in-JS). Foi rejeitado por preferência visual do cliente.
- **MUI com o tema padrão**: rejeitado porque denuncia aparência de template.

## Consequences

- O MUI convive com o Tailwind v4 pela integração oficial de camadas CSS (`@layer theme, base, mui, components, utilities` e `AppRouterCacheProvider` com `enableCssLayer`). O Tailwind fica para layout e espaçamento, e o MUI para componentes e tema.
- A migração é tela a tela. Ao final, o shadcn/Base UI e o lucide saem do projeto, para não manter dois design systems.
- Componentes MUI rodam no client e usam Emotion, o que aumenta o bundle em relação à alternativa rejeitada.
