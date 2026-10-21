# Hotel Admin Dashboard

React + TypeScript + Vite + MUI + Tailwind + Redux Toolkit (RTK Query) + Formik/Yup.

## Run

```bash
npm install
npm run dev
```

## Demo sign-in

All accounts use password `admin 123`:

- `superadmin` — chain office overview for both hotels
- `hotel1admin` / `hotel1desk` — Jaipur
- `hotel2admin` / `hotel2desk` — Goa

## Demo workflows

- **Dashboard** — hotel portfolio, animated revenue and occupancy views, room board, and operational alerts
- **Hotels** — add, edit, switch, or remove properties; add rooms from the portfolio
- **Front desk** — reservations, check-in, stays, check-out, guest records, and room service
- **Operations** — housekeeping, maintenance, staff shifts, expenses, and night audit
- **Settings** — rates, room types, hotel details, backup/restore, and demo data

The demo starts with two hotels: Jaipur and Goa. Seed data and edits are stored locally in IndexedDB, including uploaded ID photos. This is a static frontend demo: credentials are included in the app, so do not use it to protect real guest or hotel data. Backups can be downloaded and restored from **Settings → Backup & Export**. The app does not require a backend or a `.env` file.
