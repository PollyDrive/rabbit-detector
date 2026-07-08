# rabbit-detector

Короткий ориентир для новой модели.

## Суть проекта

- Это небольшой SPA про «Ферму невидимых кроликов».
- Данные живут в памяти сессии.
- Источник истины по продукту: `docs/rabbit-farm-tz.md`.
- Источник истины по процессу: `gitflow/`.

## Роли

- `PM` режет фичу на issues, пишет acceptance tests (`*.test.tsx` для React-сценариев), создаёт `stage_*_issue_*_test` и сразу открывает draft PR `stage_*_issue_*_test -> preprod`.
- `implementer` берёт `ready` issues, делает `stage_*_issue_*`, пишет код и unit-тесты, открывает PR в `stage_*_issue_*_test`.
- `reviewer` проверяет PR `stage_*_issue_* -> stage_*_issue_*_test`, возвращает на доработку с лейблами (`bug`, `in-progress`) или мержит в `stage_*_issue_*_test`.
- `reviewer` пишет GH-комментарий с `verdict / reasoning / judge_score / model`, не stdout.
- `human` только принимает решения по `main` и делает `preprod -> main`.

## Gitflow

- `main` защищён, агенты туда не пушат.
- `preprod` — рабочая интеграционная ветка, она идёт от `main`.
- `stage_*_issue_*_test` живёт от `preprod`.
- `stage_*_issue_*` живёт от `stage_*_issue_*_test`.
- `stage_*_issue_*_test` называется коротко и по смыслу задачи; например `stage_1_issue_5_test`, `stage_2_issue_19_test`.
- Draft PR `stage_*_issue_*_test -> preprod` открывается сразу после создания PM-ветки.
- `stage_*_issue_*` — рабочая implementer-ветка под конкретную issue.
- Один implementer PR = одна issue.
- PM и Implementer работают в своих отдельных worktree.
- Issue создаётся сразу со статус-лейблом.
- `draft` — старт.
- PM ставит `ready` только после того, как созданы `stage_*_issue_*_test`, draft PR и acceptance tests (`*.test.tsx` там, где нужен JSX).
- `bug` после трёх возвратов подряд превращается в `human-needed`.
- Reviewer пишет вердикт GH-комментом:
  - `verdict: approved|bug|human-needed`
- `reasoning: ...`
- `judge_score: ...`
- `model: ...`

## Do / Don't

**Do:**
- **Reconcile:** всегда сверяться с GitHub до начала работы.
- **Draft PR:** открывать сразу для `stage_*_issue_*_test`-веток.
- **1 к 1:** одна issue = одна ветка = один PR.
- **Проверки:** запускать реальные `npm` скрипты перед сдачей.
- **Эскалация:** звать человека при противоречиях или блокерах.

**Don't:**
- 🚫 **НЕ пушить в `main`** (строго для человека).
- 🚫 **НЕ бандлить** несвязанные правки в одну задачу.
- 🚫 **НЕ выходить за роль** (implementer не трогает acceptance tests, reviewer не пишет код).
- 🚫 **НЕ терять артефакты** (тесты и доки должны коммититься в git).
- 🚫 **Спрашивать** Не додумывай, читай спеки при наличии противоречий.
