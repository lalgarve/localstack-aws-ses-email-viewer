# Formatos de dados: emails enviados com template

## Mensagem do LocalStack (entrada)

**Formato:** email enviado com `SendTemplatedEmail`
**Origem do exemplo:** capturado de LocalStack 4.7, enviado com boto3
(`send_templated_email`); o mesmo formato apareceu na saída que a Leila colou do ambiente
do `jogo-acoes`. Fixture: `test/fixtures/ses-templated-messages.json`.

```json
{"Id": "qcrzvipbzxrycvci-ecuxfnam-orvq-iczm-omgi-vzbiwhnmgvqn-cirhga", "Region": "us-east-1", "Source": "no-reply@jogo-acoes.example", "Template": "jogo-acoes__login-link", "TemplateData": "{\"name\": \"Administrator\", \"link\": \"/login-links/cbce55b1\"}", "Destination": {"ToAddresses": ["success+admin@simulator.amazonses.com"]}, "Timestamp": "2026-10-13T01:00:47"}
```

| Campo | Tipo | Sempre presente? | Observação |
|---|---|---|---|
| `Id` | string | sim | |
| `Region` | string | sim | Região onde o template precisa ser buscado |
| `Source` | string | sim | |
| `Template` | string | sim | Nome do template |
| `TemplateData` | string (JSON) | sim | JSON serializado; pode ser inválido se o cliente mandou lixo |
| `Destination.ToAddresses` | string[] | sim | |
| `Destination.CcAddresses` / `BccAddresses` | string[] | não | Só aparecem quando enviados |
| `Timestamp` | string | sim | ISO sem fuso |

**Como distinguir dos demais formatos:** tem `Template`; não tem `RawData` nem `Body`.

## Resposta de `GetTemplate` (entrada)

`POST /` com `Action=GetTemplate&Version=2010-12-01&TemplateName=<nome>` e cabeçalho
`Authorization: AWS4-HMAC-SHA256 Credential=test/<data>/<região>/ses/aws4_request, ...`.
Fixtures: `test/fixtures/get-template.xml`, `get-template-text-only.xml`,
`get-template-not-found.xml`.

```xml
<GetTemplateResponse xmlns="http://ses.amazonaws.com/doc/2010-12-01/"><GetTemplateResult><Template><TemplateName>jogo-acoes__login-link</TemplateName><SubjectPart>Hello {{name}}, your login link</SubjectPart><TextPart>Hi {{name}}, log in at {{link}}</TextPart><HtmlPart>&lt;p&gt;Hi {{name}},&lt;/p&gt;...</HtmlPart></Template></GetTemplateResult>...</GetTemplateResponse>
```

- Partes ausentes vêm como elemento vazio (`<HtmlPart />`).
- Template inexistente: HTTP 400 com `<Code>TemplateDoesNotExist</Code>`.

## Objeto "email" (saída de `createEmail()`)

| Campo | Tipo | Valor para este formato |
|---|---|---|
| `subject` | string | `SubjectPart` renderizado; `[template not found: <nome>]` ou `[template error: <nome>]` no fallback |
| `to` / `cc` / `bcc` | array | `Destination.*Addresses` |
| `html` | string | `HtmlPart` renderizado; senão `TextPart` renderizado dentro de `<pre>`; no fallback, vazio |
| `attachments` | array | `[]` |
| `isDownloadable` | boolean | `false` (sem `RawData`) |
| `template` | objeto | `{ name, data }`: nome e `TemplateData` formatado, para a página do email |

## Invariantes

- Nenhuma rota lança exceção para um formato de mensagem conhecido (RawData, Body simples,
  Template).
- Os campos de mensagens RawData e Body simples não mudam.
