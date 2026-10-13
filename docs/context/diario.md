# Diário de desenvolvimento

Resumo diário do que foi feito, com os commits e Issues envolvidos. Ver "Diário de
desenvolvimento" em `memory/constitution.md` para o formato. Não é documentação de produto —
não deve ser publicada junto com o restante de `docs/`.

<!--
Adicione uma entrada nova por dia com commits relevantes, no formato:

## AAAA-MM-DD

**Resumo:** o que foi feito/decidido nesse dia, em 1-3 frases.

**Commits:**
- `<hash curto>` <tipo>: <resumo> (#<issue, se houver>)

**Issues:** #N aberta/fechada/em andamento
-->

## 2026-10-13

**Resumo:** Adoção de Spec-Driven Development, adaptando o `template-java` a um projeto
Node.js/Express sem banco e que é fork do upstream `veertech`. Piso de cobertura de 80%
ativado no Jest. Primeira feature prevista: suporte a emails enviados com templates do SES
(`specs/001-templated-emails/`).

Decisões em aberto registradas na adoção:

- Ativar Issues no fork (vêm desligadas) para usar o board como no template.
- Rodar testes de integração contra um LocalStack real em CI, em vez de só `nock`.
- Publicar a cobertura como comentário na PR.
- Atualizar Node 18 (fim de suporte) no CI e no `Dockerfile`.

**Commits:**
- (preencher com o hash após o merge) docs: adopt spec-driven development

**Issues:** —

### 2026-10-13 (feature 001)

**Resumo:** Spec, plan e implementação de `specs/001-templated-emails/`: emails enviados com
template passam a ser renderizados com os dados do envio, com fallback quando o template não
existe mais. Fixtures capturadas de um LocalStack 4.7 real.

**Commits:**
- (preencher após o merge) docs: specify templated email support
- (preencher após o merge) feat: render emails sent with SendTemplatedEmail

**Issues:** —
