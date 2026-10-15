# Hotel Admin backend

This API follows the clean-architecture layout used by the supplied backend reference: `Domain`, `Application` (MediatR commands/queries and FluentValidation), `Persistence` (EF Core/SQL Server), `Infrastructure`, `Shared`, and `WebApi`.

The first integration keeps the dashboard's existing IndexedDB data contract (`readList`, `writeList`, images, backup/restore) and offers the same key/value buckets through `api/storage`. That lets the current screens migrate incrementally to resource-specific endpoints later.

## Run locally

1. If there is browser data to keep, download a backup from **Settings → Backup & Export** first. After enabling the API, restore that JSON backup to copy the existing dataset.
2. Install SQL Server LocalDB or set `ConnectionStrings__DefaultConnection` to a SQL Server database you own. Do not point this API at the RestaurantApp database; its schema and data are unrelated.
3. Start the API with `dotnet run --project backend/WebApi` (HTTP `http://localhost:5050`). EF Core applies the checked-in initial migration on startup.
4. Copy `frontend/.env.example` to `frontend/.env.local` or set `VITE_API_BASE_URL=http://localhost:5050`, then start the Vite app from `frontend/`. With the variable absent, the dashboard keeps using browser IndexedDB.

The settings shape includes the `Jwt` section from the RestaurantApp configuration, but its secret is intentionally blank. Authentication is not enabled because the current dashboard has no sign-in flow. Keep this development API on localhost until authentication and authorization are added before network deployment.

For a non-local database or JWT signing key, use `dotnet user-secrets` or environment variables such as `ConnectionStrings__DefaultConnection` and `Jwt__Key`; do not commit secrets to appsettings.

## API surface

- `GET /api/health`
- `GET /api/storage` reads all buckets as a JSON object.
- `GET|PUT|DELETE /api/storage/{key}` reads, writes, or deletes one JSON value.
- `POST /api/storage/import` replaces the full backup snapshot atomically.
- `DELETE /api/storage` clears all stored buckets.

Swagger UI is enabled in Development. CORS is limited to the local Vite/preview origins in `WebApi/appsettings.json`.

## Verify

```powershell
dotnet build backend/HotelAdmin.slnx
dotnet test backend/HotelAdmin.slnx
```
