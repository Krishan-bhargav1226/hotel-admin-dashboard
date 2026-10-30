# Hotel desk frontend

React, TypeScript, Vite, Tailwind, and Redux Toolkit Query for the hotel operations desk.

## Setup

```bash
cp .env.example .env
npm ci
npm run dev
```

`.env` should point at the API:

```bash
VITE_API_BASE_URL=http://localhost:7444/api
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Vite server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright end-to-end tests |

## Layout

- `src/pages` feature screens
- `src/components` shared UI
- `src/store` RTK Query slices
- `src/utils` routes, auth, helpers
- `e2e` Playwright specs
- `tests` focused UI checks

Sign in through the API (`POST /api/user/login`). Seed admin credentials come from `HotelBackend/WebApi/appsettings.Development.json`.
