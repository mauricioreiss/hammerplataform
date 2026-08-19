# Escopo Ativo (Tarefas)

## [FRONTEND]
- `[x]` Em `src/components/aluno/rest-timer-modal.tsx`: Localizar o componente `<circle>` que renderiza a barra de progresso (linha ~124, sob o comentário `// Draining arc`).
- `[x]` Modificar a propriedade `strokeDasharray` para usar o valor total fixo: `strokeDasharray={circumference}`.
- `[x]` Modificar a propriedade `strokeDashoffset` para que a barra diminua no sentido horário. Utilize a fórmula: `strokeDashoffset={circumference * (1 - remainingRatio)}`. (Substituindo a antiga lógica que alterava o strokeDasharray dinamicamente).
- `[x]` Com essa mudança, ao passar o tempo, a parte vazia crescerá a partir do meio-dia (12h) no sentido horário, acompanhando o ponteiro do relógio em vez de ir na contramão.
