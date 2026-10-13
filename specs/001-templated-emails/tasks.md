# Tasks: emails enviados com template

| ID | Descrição | Depende de | Paralelizável | Issue |
|---|---|---|---|---|
| ~~T001~~ | Capturar fixtures reais do LocalStack 4.7 (`/_aws/ses` e `GetTemplate`) | — | | — |
| ~~T002~~ | `lib/ses-templates.js`: buscar, ler e renderizar template, com testes | T001 | [P] | — |
| ~~T003~~ | `createEmail()` e rotas: ramo de template com cache por requisição | T002 | | — |
| ~~T004~~ | `views/email.pug`: nome do template e `TemplateData` | T003 | | — |
| ~~T005~~ | Cenários da spec em `test/app.test.js` | T003, T004 | | — |
| ~~T006~~ | README: mencionar suporte a templates | T003 | [P] | — |
