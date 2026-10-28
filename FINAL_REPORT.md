# Final report

Branch: `chore/production-hardening`

## What changed

The API now fails closed. Requests need a JWT unless the action is marked anonymous. Login no longer accepts a fixed password list, and one-time codes are not written to the console. Admin password changes require the Admin or SuperAdmin role. ProblemDetails, correlation ids, security headers, compression, a 30 MB request cap, configured CORS, and `/health/live` plus `/health/ready` are in place.

Packages are centralized. ASP.NET and EF Core are on 10.0.14, Swashbuckle on 10.3.1, and `System.Security.Cryptography.Pkcs` on 10.0.14 so the previous NuGet audit findings are gone. Tracked `appsettings.json` no longer contains the database password, SMTP password, JWT secret, or chat API key.

The desk no longer signs in through a local account list or an IndexedDB demo database. The API base URL comes from `VITE_API_BASE_URL`.

`UpdateAsync` in the generic repository was copying the stored row onto itself. It now copies the incoming entity onto the tracked row.

## Tables

No table was dropped and no migration was added. Each hotel `DbSet` in `ApplicationDbContext.Hotel.cs` still has an entity and a feature. Identity, menus, tickets, documents, and locations remain because the existing controllers and repositories use them.

Needs human decision: whether any of those support-ticket or template tables are unused in the product you want to ship. They are referenced in code, so they were kept.

## Architecture

- Domain no longer references MediatR, Google authentication, or Newtonsoft. It still references ASP.NET Identity because `User` and `Role` inherit those types.
- Architecture tests pass for the project reference rules and for controllers not using `ApplicationDbContext`.
- Application still uses EF Core query types inside handlers. Moving those queries behind repository interfaces was not done in this pass.
- Nullable reference warnings that already existed on entities (`CS8618` and the related `CS860*` / `CS8620` codes) are in `NoWarn`. New warning types still fail the build.

## Business logic

- Login password bypass (`Hotel@123`, `admin 123`, `ChangeMe@123` accepted for any account) removed.
- One-time sign-in is driven by `Auth:OtpRoles` instead of two hardcoded email addresses.
- `GenericRepository.UpdateAsync` now applies the caller's values.
- `ValidationManager` phone, password length, and enum checks have unit tests (7 tests, all passed).

## API tests

`dotnet test HotelBackend/CleanSetupTemplate.slnx` passed:

| Area | Result |
| --- | --- |
| Application.Tests | 7 passed |
| Architecture.Tests | 3 passed |
| WebApi.Tests `/health/live` | 200 |
| WebApi.Tests `/health/ready` | 200 against the local development database |
| `GET /api/room` without a token | 401 |
| `POST /api/user/login` with an empty body | 400 |
| `PUT /api/user/change-password/admin` without a token | 401 |

That is not a test for every controller. `HotelBackend/WebApi/hotel.http` lists the health checks and the main desk routes.

## Frontend demo data

Removed:

- `frontend/src/utils/auth/mockUsers.ts`
- `frontend/src/utils/db/localDb.ts`
- `frontend/src/utils/helper/demoData.ts`
- `frontend/src/utils/helper/seedData.ts`

The login page, header, dashboard, stays list, and backup screen no longer offer a demo load. `idb-keyval` was removed.

`npm run lint`, `tsc --noEmit -p tsconfig.app.json`, and `npm run build` completed with exit code 0. Playwright `login page renders without demo accounts` passed on desktop (1440), tablet (768), and mobile (375).

RTK Query mappers still use `any`. `@typescript-eslint/no-explicit-any` is off until those mappers are rewritten. A search for `mockUsers`, `demoData`, `localDb`, `faker`, and `lorem` in `frontend/src` returns nothing.

## Security

- Secrets removed from the tracked settings file. They remain in git history on `main`. Rotate the SMTP password, JWT secret, database password, and chat API key, then decide whether to rewrite history.
- `appsettings.Development.json` is gitignored and holds the local values.
- CORS no longer reflects every origin.
- Swagger UI is Development-only.

## Remaining risks

- Not every command has a FluentValidation validator.
- Not every endpoint has a success, 403, 404, and 409 test.
- Docker is not installed on the machine used for this pass, so `docker compose up` was not executed.
- A brand-new database was not created from migrations during this pass. The existing local database was left unchanged.
- Personal login aliases still exist only in the gitignored development settings so the current local accounts keep working.

## Commands

```bash
dotnet test HotelBackend/CleanSetupTemplate.slnx
cd frontend && npm ci && npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run build
cd frontend && npm run test:e2e
```
