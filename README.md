# Hotel Admin Dashboard

Project frontend aur backend me split hai:

- `frontend/` — React, TypeScript, Vite dashboard
- `backend/` — ASP.NET Core clean-architecture API aur tests

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend default me browser IndexedDB use karta hai. API connect karne ke liye `frontend/.env.local` banao:

```env
VITE_API_BASE_URL=http://localhost:5050
```

## Backend

Backend setup, SQL Server connection aur API details ke liye [`backend/README.md`](backend/README.md) dekho.

Repo root se API aur checks chala sakte ho:

```powershell
dotnet run --project backend/WebApi
dotnet build backend/HotelAdmin.slnx
dotnet test backend/HotelAdmin.slnx
```

## Project files

Git metadata aur shared `.gitignore` repository root par hain. Frontend dependencies/config aur local
Vite environment files `frontend/` ke andar hain; backend configuration `backend/` ke andar hai.
