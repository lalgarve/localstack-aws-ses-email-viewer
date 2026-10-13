# CLAUDE.md

This project uses Spec-Driven Development. Before changing code, read
`memory/constitution.md` (conventions) and the relevant `specs/NNN-*/` folder.
New features start by copying `templates/` into a new `specs/NNN-feature-name/`.

- Commits: `<type>: <summary>` in English (types in the constitution). Run
  `git config core.hooksPath .githooks` once per clone.
- PRs target `main` of `lalgarve/localstack-aws-ses-email-viewer` (this fork), never the
  upstream `veertech` repository.
- Tests: `npm test` (Jest, ESM, 80% line coverage floor). LocalStack fixtures must be
  captured from a real LocalStack, not hand-written.
- Spec/process docs in Portuguese; code, commits, PRs, Issues and `README.md` in English.
