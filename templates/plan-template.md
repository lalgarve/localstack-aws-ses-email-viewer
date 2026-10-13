# Plan: <nome da feature>

Traduz `spec.md` em decisões técnicas. Valida contra `memory/constitution.md`.

## Contexto técnico

<Node.js + Express + Pug; dependências novas que a feature precisa (e por quê); versão do
LocalStack contra a qual o comportamento foi verificado>

## Decisões de arquitetura

| Pergunta | Decisão | Status | Raciocínio |
|---|---|---|---|
| <ex.: renderizar o template no viewer ou exibir os dados crus?> | <ex.: renderizar> | resolvida / em aberto | <por quê, alternativas consideradas> |

Decisões marcadas "em aberto" viram commit `decision:` quando resolvidas (ver
`memory/constitution.md`), atualizando esta tabela no mesmo commit.

## Estrutura de módulos

<onde o código desta feature mora: rota em `app.js`, módulo novo em `lib/`, view em
`views/`, fixtures em `test/fixtures/`>

## Riscos e trade-offs

<o que pode dar errado, o que foi conscientemente deixado de fora>
