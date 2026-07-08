---
name: Agent Task
about: Шаблон задачи для PM/implementer/reviewer flow
title: ""
labels: []
assignees: ""
---

## Type

`implementation` | `docs` | `refactor`

## Goal

Одно короткое продуктовое предложение:

- какую одну способность или кусок поведения мы добавляем
- без описания реализации

## Why

- зачем эта задача существует в рамках фичи
- какой риск или пробел она закрывает

## Doc

- основной source of truth:
- разделы / якоря:

## Depends on

- `none` или список issue / task title

## Branch / PR

- PM branch: `stage_<stage>_issue_<id>_test`
- implementer branch: `stage_<stage>_issue_<id>`
- PM draft PR: `stage_<stage>_issue_<id>_test -> preprod`
- implementer PR: `stage_<stage>_issue_<id> -> stage_<stage>_issue_<id>_test`
- acceptance tests live in: `stage_<stage>_issue_<id>_test`

## Scope

Что входит в задачу:

- …
- …

## Out of Scope

Что намеренно не входит:

- …
- …

## Acceptance Tests

Сюда PM кладёт только релевантные локаторы.

- `path/to/test-file.test.tsx::test_name`
- `path/to/test-file.test.tsx::test_name`

Если тест использует JSX / React-рендер, файл должен быть `*.test.tsx`, а не `*.test.ts`.

## Acceptance Criteria

Проверяемые внешние критерии, по одному на строку:

1. …
2. …
3. …

Критерии должны быть:

- наблюдаемыми снаружи
- не сводимыми к “рендерится / не падает”
- непроходимыми заглушкой

## Edge Cases

- …
- …

## Technical Notes

Только load-bearing подсказки для implementer:

- границы слоя
- важные инварианты
- конкретные пути / контракты
- ограничения по данным / миграциям / API

Не писать сюда реализацию целиком.

## Test Notes

- какие unit/integration тесты implementer почти наверняка должен добавить
- что reviewer обязан особенно проверить

## Size

- `XS` | `S` | `M` | `L`

## Reasoning

- `low` | `high`

Если `high`, задача обычно получает `mod:complex`.

## Clarifications

- `none` если всё ясно
- иначе список открытых вопросов

Если раздел не пуст, задача должна стартовать в `draft`, а не в `ready`.

## Definition of Done

- целевые acceptance tests зелёные
- релевантные тесты проекта зелёные
- scope не расползся
- нет несвязанных правок
