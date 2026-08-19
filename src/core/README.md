# Core Domain & Application
Esta pasta contem as regras de negocio puras da aplicacao, sem depender de bibliotecas externas como Next.js ou Supabase.

- `/domain/entities`: Classes e interfaces que representam os modelos do negocio.
- `/application/use-cases`: A logica do negocio encapsulada. Cada Use Case tem apenas um metodo principal (`execute`).
- `/application/interfaces`: Contratos para Inversao de Dependencia (ex: Repositorios).
