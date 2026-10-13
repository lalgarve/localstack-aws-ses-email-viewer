# Spec: emails enviados com template

**Status:** em revisão
**Issue:** — (Issues desligadas no fork; `tasks.md` é a fonte de verdade)

## Resumo

O viewer passa a listar e exibir emails enviados com `SendTemplatedEmail`, mostrando o
assunto e o corpo já renderizados com os dados do envio.

## Motivação

Quando uma aplicação envia email com template do SES, o LocalStack guarda só o nome do
template e os dados (`Template`, `TemplateData`), sem `RawData` nem `Body`. Hoje o viewer
quebra com qualquer mensagem desse tipo: `createEmail()` lê `message.Body.html_part` e a
página inicial inteira devolve 500 ("Something broke!"), escondendo também os emails
comuns. O primeiro projeto afetado é o `jogo-acoes`, que envia o link de login com o
template `jogo-acoes__login-link`.

## Cenários (comportamento esperado)

```gherkin
Scenario: Templated email appears in the list
  Given LocalStack has a message sent with template "jogo-acoes__login-link"
  And the template still exists in the message's region
  When I open the email list
  Then the page loads with status 200
  And the row shows the recipients and the rendered subject

Scenario: Templated email is shown rendered
  Given LocalStack has a message sent with template "jogo-acoes__login-link"
  And TemplateData is {"name":"Administrator","link":"/login-links/cbce55b1"}
  When I open that email
  Then I see the HTML part with "Administrator" and the link filled in
  And I see the template name and the TemplateData used

Scenario: Template with only a text part
  Given the template has SubjectPart and TextPart but no HtmlPart
  When I open an email sent with it
  Then I see the rendered text part

Scenario: Template no longer exists
  Given the template was deleted after the email was sent
  When I open the email list or that email
  Then the page loads with status 200
  And the subject says the template could not be found
  And the email page shows the template name and the TemplateData

Scenario: Mixed message types
  Given LocalStack has raw, simple and templated messages
  When I open the email list
  Then every message is listed

Scenario: Templated email cannot be downloaded
  Given a templated message
  When I request its download
  Then I get status 400, as for other messages without RawData
```

## Requisitos funcionais

- RF1: `/`, `/emails/:id` e `/emails/latest` funcionam com mensagens de template, sozinhas
  ou misturadas com os formatos já suportados.
- RF2: O template é buscado no LocalStack (`GetTemplate`), na região da mensagem, e
  renderizado com `TemplateData`: assunto, HTML e texto.
- RF3: Se o template não existir mais ou não puder ser renderizado, a mensagem continua
  aparecendo, com assunto indicando o problema e o nome do template e os dados visíveis.
- RF4: A página do email mostra o nome do template e o `TemplateData` usados.

## Requisitos não-funcionais

- Cada template é buscado no máximo uma vez por requisição do viewer, mesmo que vários
  emails o usem.
- Os formatos já suportados (RawData, Body simples) não mudam de comportamento.

## Fora de escopo

- Encaminhamento SMTP de emails com template (o encaminhador já ignora tudo que não tem
  `RawData`).
- Download `.eml` de emails com template.
- `SendBulkTemplatedEmail` e templates da API SESv2 (o LocalStack 4.7 community não emula
  SESv2: `InternalFailure` ao chamar `/v2/email/templates`).
- Mostrar a versão do template do momento do envio: o LocalStack não guarda isso, então o
  viewer renderiza com o template atual.

## Decisões em aberto

Nenhuma.
