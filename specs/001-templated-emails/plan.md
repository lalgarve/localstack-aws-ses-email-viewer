# Plan: emails enviados com template

Traduz `spec.md` em decisões técnicas. Valida contra `memory/constitution.md`.

## Contexto técnico

- Node.js + Express 5 + Pug, ESM. Dependência nova: `handlebars`.
- Verificado contra LocalStack 4.7 (`localstack/localstack:4.7`, só `ses`), com emails
  enviados por boto3 (`send_templated_email`). Formatos em `data-model.md`.

## Decisões de arquitetura

| Pergunta | Decisão | Status | Raciocínio |
|---|---|---|---|
| Renderizar o template ou só mostrar nome e dados? | Renderizar, com fallback para nome e dados | resolvida | O objetivo é ver o email como o destinatário veria. Só nome e dados não mostram erro de template, que é justamente o que se quer pegar em desenvolvimento |
| Como obter o conteúdo do template? | `GetTemplate` da API SES v1 (protocolo query, `POST /` no LocalStack) | resolvida | É a única API de template que o LocalStack community emula (SESv2 devolve `InternalFailure`). Alternativa considerada: `ListTemplates`, que não traz o conteúdo |
| Usar o AWS SDK para chamar `GetTemplate`? | Não: `fetch` direto, como já é feito com `/_aws/ses` | resolvida | O SDK traria muitas dependências para uma chamada só. O LocalStack aceita requisições sem assinatura válida; o cabeçalho `Authorization` só é usado para escolher a região |
| Como ler a resposta XML? | Extrair `SubjectPart`, `HtmlPart` e `TextPart` com regex e decodificar entidades XML | resolvida | Resposta pequena e de formato fixo (fixtures reais em `test/fixtures/`). Um parser XML seria mais uma dependência para três campos |
| Qual região consultar? | O campo `Region` da mensagem; `us-east-1` se ausente | resolvida | Templates são por região no LocalStack: o mesmo nome consultado em `eu-west-1` devolve `TemplateDoesNotExist` |
| Motor de template | Handlebars | resolvida | É a sintaxe documentada pelo SES (`{{var}}`, `{{#if}}`, `{{#each}}`) |
| Escapar HTML nos valores? | Sim na `HtmlPart` (padrão do Handlebars); não em assunto e texto | resolvida | Assunto e texto são texto puro, escapar só poluiria. No HTML, o escape padrão do Handlebars evita que dados de teste quebrem a página, e `{{{var}}}` continua disponível para quem precisa de HTML cru |
| Template ausente ou com erro | Fallback: assunto `[template not found: <nome>]` ou `[template error: <nome>]`, corpo com nome e dados | resolvida | A mensagem não pode sumir nem derrubar a lista (RF3) |
| Cache de templates | Só dentro da requisição (um `Map` passado para `createEmail`) | resolvida | Evita N chamadas para N emails do mesmo template sem esconder um template editado entre duas visitas |

## Estrutura de módulos

- `lib/ses-templates.js` (novo): `fetchTemplate(apiHost, region, name)`,
  `parseGetTemplateResponse(xml)` e `renderTemplatedEmail(message, template)`.
- `app.js`: `createEmail()` ganha o ramo de mensagens com `Template`; as rotas passam um
  cache por requisição.
- `views/email.pug`: bloco com nome do template e `TemplateData` quando o email é de
  template.
- `test/fixtures/`: respostas reais capturadas do LocalStack 4.7.
- `test/ses-templates.test.js` (novo) e cenários novos em `test/app.test.js`.

## Riscos e trade-offs

- O viewer mostra o template **atual**, não o do momento do envio. Se o template for
  editado depois, a renderização muda. Mitigado mostrando nome e dados na página.
- O Handlebars do viewer pode divergir em detalhes do renderizador real do SES (ex.:
  helpers específicos). Fora do escopo cobrir esses casos.
- Cada carregamento da lista faz uma chamada `GetTemplate` por template distinto.
