# Ферма невидимых кроликов

Интерактивная одностраничная система: фермер не видит кроликов напрямую, только косвенные сигналы (следы, пропажа моркови, новые ямы, шуршание, датчики движения) по 7 локациям фермы. Приложение вычисляет уверенность присутствия и приоритет риска по каждой локации, диапазонную оценку общей численности кроликов с уверенностью, и выдаёт фермеру рекомендации по защите урожая. Все события пишутся в неизменяемый append-only лог (event sourcing) в памяти на время сессии — источники: рандом-симулятор на таймере, ручной ввод (клик по зоне на канвасе) и синтетический seed часовой истории при старте. Полная спека — [rabbit-farm-tz.md](./rabbit-farm-tz.md).

## Стек

React 19 + TypeScript + Vite · `useReducer` + Context (reducer только append, projection — чистый селектор) · Zod (runtime-валидация матрицы локация×сигнал) · CSS Modules · Vitest + React Testing Library + Playwright (smoke).

## Запуск

```bash
npm install
npm run dev        # dev-сервер
npm run build       # прод-сборка
npm run test        # vitest
npm run test:ui     # vitest UI
npm run lint        # oxlint
```

## Docker

```bash
docker build -t rabbit-farm .
docker run -p 8080:80 rabbit-farm
```
