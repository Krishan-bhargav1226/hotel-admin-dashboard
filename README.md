# Hotel Admin Dashboard Demo

Frontend-only hotel operations dashboard built with React, TypeScript, Vite, Redux Toolkit, MUI, and Tailwind.

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

Or run the existing root scripts with `npm run dev` and `npm run build`.

## Demo access

All five demo accounts use the password `admin 123`:

| Role | Username |
| --- | --- |
| Super admin · chain office | `superadmin` |
| Hotel 1 admin · Jaipur | `hotel1admin` |
| Hotel 1 front desk · Jaipur | `hotel1desk` |
| Hotel 2 admin · Goa | `hotel2admin` |
| Hotel 2 front desk · Goa | `hotel2desk` |

Super admin opens the combined hotel overview, with portfolio charts and filters. Hotel accounts open their own hotel desk.

This is a static frontend demo: demo credentials are visible in the downloaded app, and data is stored only in this browser's IndexedDB. Do not use it to protect real hotel or guest data. Use **Settings → Backup & Export** to download or restore a local data backup.

## GitHub Pages

The `main` branch workflow builds `frontend` and publishes it to GitHub Pages. Set the repository's Pages source to **GitHub Actions** once in repository settings. The public site URL is `https://krishan-bhargav1226.github.io/hotel-admin-dashboard/`.
