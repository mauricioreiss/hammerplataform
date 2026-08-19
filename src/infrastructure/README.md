# Infrastructure
Esta pasta contem a implementacao de detalhes e a comunicacao com o mundo externo.
Nada daqui deve vazar para a pasta `src/core`.

- `/repositories`: Implementacoes de acesso a banco de dados (ex: `SupabaseUserRepository`), seguindo as interfaces definidas no core.
- `/services`: Implementacoes de servicos externos como envio de push notification (Web Push), chamadas para IA (OpenAI), ou sistemas de pagamento.
