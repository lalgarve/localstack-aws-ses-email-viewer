# Specs

Cada feature não trivial ganha uma pasta `NNN-nome-da-feature/` aqui (numeração sequencial
de 3 dígitos, nome em kebab-case), copiada a partir de `templates/`:

```
specs/
  001-nome-da-feature/
    spec.md            # requisitos + critérios de aceite (o QUÊ e POR QUÊ)
    plan.md             # decisões técnicas (o COMO)
    data-model.md         # só se a feature introduzir/alterar formatos de mensagem do LocalStack
    contracts/
      routes.md             # rotas HTTP criadas ou alteradas pela feature
    tasks.md                # tarefas, espelhadas como Issues no GitHub
```

Ver `memory/constitution.md` (seções "Documentação viva por feature" e "Rastreamento de
trabalho via Issues") para o fluxo completo: `spec.md`/`plan.md` são escritos antes do
código, cada feature tem uma Issue-épico no GitHub, e `tasks.md` é a fonte de verdade das
tarefas que essa Issue rastreia.
