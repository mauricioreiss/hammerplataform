# A sessão de treino conta para o dia da agenda, não para a ficha

O app tinha um rodízio: o treino do dia era a próxima ficha depois da última concluída, e "concluído nesta semana" era marcado por ficha. Com isso, um treino perdido na quarta continuava aparecendo na quinta. Passamos a uma agenda semanal (segunda a domingo, horário de Brasília) em que cada dia aponta para uma ficha, um descanso ou nada, e cada sessão de treino fica ligada a um único dia dessa agenda. Como a mesma ficha pode ocupar vários dias (ex.: Treino A na segunda e na quinta), a conclusão por ficha marcaria a quinta como feita depois do treino de segunda; a conclusão por dia não tem esse problema.

## Considered Options

- **Conclusão por ficha (rodízio atual)**: não suporta a mesma ficha em dois dias nem distingue o dia perdido do dia reposto.
- **Uma ficha por dia, duplicando para repetir**: resolveria a conclusão, mas fragmentaria o histórico de cargas entre as cópias.

## Consequences

- O status de um dia (feito, reposto, não realizado, pendente) é derivado da existência de uma sessão ligada àquele dia na semana corrente, mesmo que a ficha do dia seja trocada depois.
- A sessão só pode ser ligada a hoje ou a um dia já passado da semana corrente (reposição); adiantar um dia futuro não existe.
- Sessões de fichas avulsas, fora da agenda, não contam para nenhum dia.
