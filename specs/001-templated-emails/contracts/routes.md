# Contrato de interface: emails enviados com template

## Rota: `GET /`

Sem parâmetros novos.

| Status | Content-Type | Corpo |
|---|---|---|
| 200 | `text/html` | `views/index.pug` |

**O que a página mostra para um email de template:** uma linha como as demais, com To/CC/BCC
de `Destination` e o assunto renderizado (ou o assunto de fallback). Sem link de download.

**Compatibilidade:** antes, qualquer mensagem de template fazia a rota devolver 500. Linhas
dos demais formatos não mudam.

## Rota: `GET /emails/:id`

| Status | Content-Type | Corpo |
|---|---|---|
| 200 | `text/html` | `views/email.pug` |

**O que a página mostra para um email de template:**

- Assunto e destinatários, como nos demais.
- `Template:` com o nome do template.
- `Template data:` com o `TemplateData` formatado (JSON indentado, ou o texto cru se não
  for JSON válido).
- O corpo renderizado (HTML, ou texto em `<pre>`); vazio no fallback.

## Rota: `GET /emails/latest`

Devolve o HTML renderizado do último email também quando ele é de template.

## Rota: `GET /emails/:id/download`

Para email de template: 400 `Can't download emails without RawData!` (comportamento já
existente para mensagens sem `RawData`).
