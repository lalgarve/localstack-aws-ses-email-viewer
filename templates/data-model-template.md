# Formatos de dados: <nome da feature>

Este projeto não tem persistência própria: os dados vêm de `GET /_aws/ses` do LocalStack e
são transformados por `createEmail()` (`app.js`) no objeto que as views recebem. Este
arquivo é necessário quando a feature introduz ou altera um desses formatos, e é escrito
antes do código.

## Mensagem do LocalStack (entrada)

**Formato:** <ex.: email enviado com `SendTemplatedEmail`>
**Origem do exemplo:** capturado de LocalStack <versão>, enviado com <comando/SDK>
(ver "Testes: preferir real a fake" em `memory/constitution.md`)

```json
<resposta real de GET /_aws/ses, recortada na mensagem relevante>
```

| Campo | Tipo | Sempre presente? | Observação |
|---|---|---|---|
| <campo> | <tipo> | sim/não | <regra> |

**Como distinguir este formato dos demais:** <ex.: tem `Template`, não tem `RawData` nem
`Body`>

## Objeto "email" (saída de `createEmail()`)

| Campo | Tipo | Valor para este formato |
|---|---|---|
| `subject` | string | <de onde vem> |
| `to` / `cc` / `bcc` | string ou array | <de onde vem> |
| `html` | string | <de onde vem> |
| `attachments` | array | <de onde vem> |
| `isDownloadable` | boolean | <true/false e por quê> |

## Invariantes

<regras que valem para todo formato — ex.: nenhuma rota pode lançar exceção para um formato
de mensagem conhecido>
