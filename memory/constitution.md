# Como desenvolvemos software

Este documento descreve o **fluxo de trabalho e as convenções** usados neste projeto — não
as decisões técnicas específicas de cada feature (essas ficam em `specs/*/plan.md`).

No vocabulário do Spec-Driven Development (SDD), este arquivo é a *constitution* do
projeto: o conjunto de princípios que toda `spec.md`/`plan.md` deve respeitar.

> Adaptado do template [`lalgarve/template-java`](https://github.com/lalgarve/template-java)
> (Java + Spring Boot). As convenções de processo (specs antes do código, commits
> semânticos, decisões registradas, diário) são as mesmas; o que muda é a parte técnica,
> porque este projeto é diferente:
>
> - **Node.js + Express 5 + Pug**, ES modules, testes com Jest + supertest + nock — não Java.
> - **Sem banco de dados**: a fonte de dados é a API de SES do LocalStack
>   (`GET /_aws/ses`), consumida via HTTP a cada requisição.
> - **É um fork** de [`veertech/localstack-aws-ses-email-viewer`](https://github.com/veertech/localstack-aws-ses-email-viewer),
>   com histórico e README próprios do upstream.
> - Configuração por **variáveis de ambiente**, não por perfis/arquivos de configuração.

## O projeto em uma frase

Interface web leve para listar, visualizar e baixar os emails que uma aplicação enviou pelo
SES do LocalStack durante desenvolvimento e testes. Rotas em `app.js`, views em `views/`,
encaminhamento SMTP opcional em `lib/smtp-forwarder.js`.

## Idioma

| O quê | Idioma |
|---|---|
| Código: identificadores, comentários, nomes de arquivo de código | Inglês |
| Mensagens de commit | Inglês |
| Issues e Pull Requests (título e descrição) | Inglês |
| Specs de comportamento (Gherkin, quando usado dentro de `spec.md`) | Inglês |
| `README.md` (raiz) | Inglês |
| Documentação de processo (`memory/`, `specs/**/*.md`, `templates/`, `docs/context/`) | Português |

Código em inglês porque é o padrão do ecossistema. Documentação de processo em português
porque é o idioma de quem escreve e lê as specs.

**Diferença em relação ao template:** o `README.md` da raiz continua em inglês. Ele veio do
upstream, é a porta de entrada pública do projeto e é o que uma eventual contribuição de
volta para o upstream precisaria — traduzi-lo quebraria essa compatibilidade.

## Commits semânticos

Formato da primeira linha:

```
<tipo>: <resumo curto, no imperativo>
```

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade ou comportamento observável |
| `fix` | Correção de bug |
| `refactor` | Mudança estrutural que não altera comportamento (renomear, mover, reorganizar) |
| `test` | Adição/alteração de testes ou especificações |
| `docs` | Mudança só de documentação |
| `chore` | Manutenção sem impacto em código de produção (dependências, config de build, CI) |
| `decision` | Registra uma decisão de arquitetura/design tomada, antes ou junto da implementação que ela habilita |

`decision` é a extensão específica deste fluxo: quando uma pergunta de arquitetura em aberto
(documentada previamente como pendente em `plan.md`) é resolvida, isso vira um commit
próprio, separado da implementação — mesmo que a decisão não mude nenhuma linha de código
sozinha. Isso deixa o histórico do git navegável como uma trilha de decisões.

Esses mesmos tipos são usados como **labels de Issue** (ver "Rastreamento de trabalho via
Issues").

O histórico anterior à adoção de SDD (commits do upstream, `Bump ...` do Dependabot) não
segue este formato e não é reescrito. Daqui em diante, o Dependabot usa o prefixo `chore`
(configurado em `.github/dependabot.yml`).

### Corpo da mensagem

Para uma mudança não trivial:

1. **Título**: `<tipo>: <resumo>`.
2. **Por quê** (parágrafo): o problema que motivou a mudança — não repetir o diff.
3. **O quê** (lista, opcional): mudanças concretas relevantes, quando o "por quê" sozinho não
   orienta quem revisa.
4. **Validação** (parágrafo, opcional): o que foi de fato rodado para confirmar que funciona.
5. **Referência cruzada** (linha final, opcional): decisão resolvida em `plan.md` ou
   `Closes #N`.

Exemplo:

```
feat: render emails sent with SendTemplatedEmail

Templated emails stored by LocalStack have no RawData and no Body, so
the list page crashed with a TypeError when one was present.

app.test.js covers a templated message in the list, detail and latest
routes (28/28 passing).

Resolves the template-rendering open decision in specs/001-templated-emails/plan.md.
Closes #3.
```

Commits pequenos e focados em uma mudança revisável de cada vez.

### Enforcement

Um hook `commit-msg` versionado em `.githooks/commit-msg` valida o `<tipo>: ` do título
(idioma não é validado). Ativar uma vez por clone/sessão:

```
git config core.hooksPath .githooks
```

## Branches e Pull Requests

- Um branch por linha de trabalho revisável — nome descritivo, não um identificador genérico.
- Nunca commitar direto em `main`; toda mudança entra por PR.
- **PRs apontam para `main` deste fork (`lalgarve/localstack-aws-ses-email-viewer`), não
  para o upstream.** Em forks, `gh pr create` e a UI do GitHub sugerem o upstream como base
  por padrão — conferir sempre (`gh pr create --repo lalgarve/localstack-aws-ses-email-viewer`).
  Levar uma mudança para o upstream é uma decisão explícita e separada, tomada caso a caso.
- Uma PR corresponde a um branch — não empilhar trabalhos sem relação na mesma PR.
- Título e descrição de PR em inglês, porque o GitHub usa o título da PR no merge commit.
- Quando o trabalho de uma PR já mesclada precisa continuar, reaproveitar o mesmo branch
  (recriado a partir de `main`) em vez de acumular branches novos a cada retomada.
- Antes de criar um branch, checar se já existe um branch/PR para a mesma feature
  (`specs/NNN-*`) e reaproveitá-lo.

## Rastreamento de trabalho via Issues

O board de Issues do GitHub espelha `specs/*/tasks.md`:

| Nível SDD | GitHub |
|---|---|
| Uma feature (`specs/NNN-nome-da-feature/`) | 1 Issue "guarda-chuva" (épico), corpo linkando `spec.md` e `plan.md` |
| Cada tarefa de `tasks.md` (T001, T002...) | Item da checklist da Issue-épico, ou Issue própria quando grande o suficiente para PR isolada |
| Tipo do commit (`feat`/`fix`/...) | Label da Issue — mesma taxonomia |
| Fase/marco, quando existir | Milestone |

Commits e PRs fecham a Issue com `Closes #N`. Título e corpo da Issue em inglês.

**Particularidade do fork:** forks do GitHub nascem com Issues desligadas. Elas precisam ser
ativadas em *Settings → General → Features → Issues* deste repositório. Enquanto não
estiverem, `tasks.md` é a única fonte de verdade e a coluna "Issue" fica em branco.

## Documentação viva por feature

- Antes de implementar uma feature não trivial, escrever `specs/NNN-nome-da-feature/spec.md`
  (o QUÊ e POR QUÊ, sem implementação) e `plan.md` (o COMO).
- Decisões em `plan.md` são marcadas como resolvidas no próprio texto, preservando
  raciocínio e alternativas consideradas.
- **Contratos** (`contracts/`) são escritos antes da implementação. Neste projeto, a
  interface pública são as **rotas HTTP do Express** (método, caminho, status, content-type,
  o que a página/resposta mostra) — ver `templates/contracts-template.md`.
- **Formatos de dados** (`data-model.md`): o projeto não tem persistência própria, mas
  depende do formato das mensagens que o LocalStack devolve em `/_aws/ses` e do objeto
  "email" que `createEmail()` monta para as views. Quando uma feature toca nesses formatos,
  eles são documentados antes do código — ver `templates/data-model-template.md`.
- Cenários de comportamento (Gherkin, quando usado) são escritos **antes** do código, dentro
  de `spec.md`, e viram testes Jest — funcionam como contrato de aceite.
- Cada feature nasce a partir de `templates/` — copiar o template, não escrever do zero.

## Onde a documentação mora

- **`memory/constitution.md`** (este arquivo) — princípios e convenções.
- **`specs/NNN-nome-da-feature/`** — especificação viva de cada feature.
- **`README.md`** — documentação de produto, em inglês (ver "Idioma").
- **`docs/`** — documentação adicional de produto/arquitetura, quando necessária.
- **`docs/context/diario.md`** — diário de desenvolvimento. Não é documentação de produto.

## Diário de desenvolvimento

`docs/context/diario.md` registra, por dia de trabalho, um resumo curto e a lista de commits
e Issues envolvidas. Formato:

```markdown
## AAAA-MM-DD

**Resumo:** o que foi feito/decidido nesse dia, em 1-3 frases.

**Commits:**
- `<hash curto>` <tipo>: <resumo> (#<issue, se houver>)

**Issues:** #N aberta/fechada/em andamento
```

Uma entrada nova ao final do arquivo a cada dia com commits relevantes.

## Diagramas Mermaid: validar a renderização de verdade

Antes de considerar um diagrama pronto, renderizá-lo contra um motor Mermaid real (ex.:
`npx @mermaid-js/mermaid-cli`, o mesmo motor do GitHub), não só validar a sintaxe de cabeça.

## Ambientes de execução

Nomear ambientes pela **característica real da infraestrutura**, não por rótulos genéricos
("dev", "qa", "test"). Este projeto não tem perfis de configuração — o comportamento muda só
pelas variáveis de ambiente documentadas no `README.md` (`LOCALSTACK_HOST`, `PORT`,
`EXTRA_COLUMNS`, `SMTP_FORWARD_*`). Os ambientes em que ele roda são:

| Nome | O que descreve |
|---|---|
| `isolado` | Sem LocalStack nem SMTP: a API do LocalStack é simulada com `nock`. É onde a suíte Jest roda hoje, local e em CI |
| `localstack` | LocalStack real (container), com emails enviados de verdade pelo SDK/CLI da AWS. Usado para validar manualmente uma feature e para capturar fixtures |
| `docker` | A imagem do `Dockerfile` rodando junto do LocalStack (e opcionalmente Mailpit) via `docker run`/compose — é como o projeto é usado de fato |

## Testes: preferir real a fake sempre que der

Sempre que uma dependência externa puder rodar de verdade em teste automatizado, preferir
isso a um mock. Um teste que passa contra uma simulação que não bate com o sistema real dá
falsa confiança.

Neste projeto a dependência é o LocalStack, simulado com `nock` nos testes atuais. Regras
enquanto for assim:

- **Fixtures de resposta do LocalStack são capturadas de um LocalStack real**, não escritas
  à mão a partir da documentação. Ao introduzir um formato novo de mensagem (ex.: email
  enviado com `SendTemplatedEmail`), primeiro enviar o email de verdade contra o LocalStack,
  salvar a resposta de `GET /_aws/ses` e usar esse JSON como fixture — registrando no
  `data-model.md` da feature a versão do LocalStack usada.
- O mesmo vale para SMTP: o encaminhador é testado com stub do `nodemailer`, e o stub
  registra o que enviaria, para o teste checar por asserção.
- Rodar a suíte de integração contra um LocalStack real em CI é uma decisão em aberto (ver
  `docs/context/diario.md`, 2026-10-13) — depende de o LocalStack continuar oferecendo
  imagem utilizável sem credencial no CI.

## Dados de teste: fábricas com dados válidos por padrão

Funções de fábrica de fixtures (ex.: `test/fixtures/`) devolvem uma mensagem do LocalStack
**válida** por padrão — o ponto de partida de qualquer cenário. Cenários que testam uma
variação inválida ou um formato diferente partem dessa mensagem válida e sobrescrevem só o
campo sob teste (`{ ...validRawMessage(), RawData: undefined }`). É o equivalente JavaScript
do *Object Mother + Test Data Builder* do template Java.

## CI e cobertura de testes

- A suíte roda em CI (`.github/workflows/pull_request.yml`) a cada PR.
- Cobertura de linha tem piso obrigatório de **80%**, configurado em `coverageThreshold` no
  `package.json`: `npm test` falha se cair abaixo. Na adoção do SDD a cobertura era ~93%
  de linha. Não excluir código real da contagem só porque é difícil de cobrir — `server.js`
  (bootstrap de 7 linhas) já fica fora porque os testes importam `app.js` diretamente.
- O check de CI deve ser obrigatório antes de mesclar (branch protection em `main`).
- A cobertura aparece no log do job de CI (relatório de texto do Jest). Publicá-la como
  comentário na PR, como o template Java faz com JaCoCo, é uma melhoria futura.
