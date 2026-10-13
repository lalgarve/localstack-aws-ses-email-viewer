# Contrato de interface: <nome da feature>

Escrito antes da implementação — a implementação segue o contrato. Neste projeto a interface
pública são as rotas HTTP do Express em `app.js` (e o que as views Pug mostram). Documentar
só as rotas que a feature cria ou altera.

## Rota: `<MÉTODO> <caminho>`

**Exemplo:** `GET /emails/:id`

**Parâmetros:**

| Parâmetro | Onde | Obrigatório | Descrição |
|---|---|---|---|
| `<nome>` | path / query | sim/não | <descrição> |

**Resposta de sucesso:**

| Status | Content-Type | Corpo |
|---|---|---|
| 200 | `text/html` | <página renderizada por `views/<view>.pug`, ou conteúdo bruto> |

**O que a página mostra** (para respostas HTML):

- <campo visível, de onde vem — ex.: assunto, vindo de `email.subject`>

**Erros:**

| Condição | Status | Corpo |
|---|---|---|
| <ex.: id inexistente> | <ex.: 404> | <mensagem> |

**Compatibilidade:** <a rota mudou para formatos de mensagem já suportados (RawData,
Body simples)? Se sim, o que muda para eles>
