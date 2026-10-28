# Audit progress

Branch: `chore/production-hardening`

## Phase 0 — Discovery and baseline

- [x] Projects target `net10.0`: Domain, Application, Infrastructure, Persistence, Shared, WebApi.
- [x] Central package management in `HotelBackend/Directory.Packages.props`.
- [x] `Directory.Build.props` enables nullable, implicit usings, and warnings as errors.
- [x] Nullable annotation warnings that already existed on EF entities (`CS8618`, `CS860*`, `CS8620`, `CS8625`) are listed in `NoWarn` so the build can fail on new warning types. Replacing every navigation with `null!` was not done.
- [x] Vulnerable direct packages moved forward: ASP.NET/EF 10.0.14, Swashbuckle 10.3.1, `System.Security.Cryptography.Pkcs` 10.0.14, Newtonsoft.Json 13.0.4, FluentValidation 11.11.0.
- [x] Secrets removed from tracked `appsettings.json`. Local values live in gitignored `appsettings.Development.json`.

## Phase 1 — Backend architecture and security

- [x] Unused Domain packages removed (MediatR, Google auth, Newtonsoft). Identity stays because `User` and `Role` extend it.
- [x] Architecture tests: Domain does not reference outer layers; Application does not reference Persistence, Infrastructure, or WebApi; controllers do not use `ApplicationDbContext`.
- [x] Global exception handler returns ProblemDetails.
- [x] Correlation id, security headers, response compression, request size limit.
- [x] CORS origins come from configuration. Development falls back to the Vite ports.
- [x] Fallback authorization requires an authenticated user. Anonymous routes stay explicit.
- [x] Auth endpoints use a stricter rate limit.
- [x] Admin password change requires the Admin or SuperAdmin role.
- [x] Login no longer accepts hardcoded passwords or prints one-time codes.
- [x] JWT signing key must be at least 32 bytes or the host refuses to start.
- [x] FluentValidation pipeline plus a login validator. Other commands still rely on existing checks.
- [ ] Not every command has a FluentValidation validator.

## Phase 2 — Database

- [x] No tables were dropped. Every hotel `DbSet` has an entity and is referenced by a feature.
- [x] No migration was generated. The local database was not edited.
- [ ] A row-count inventory against the live database was not captured in this run.
- [x] Development seed creates roles and one admin from configuration. It no longer inserts personal email accounts.

## Phase 3 — Service tests

- [x] `ValidationManager` phone, password, and enum rules are covered.
- [ ] Handlers that talk to EF are not unit-tested with mocks. They are covered only where the API tests reach them.

## Phase 4 — API tests

- [x] `/health/live`, `/health/ready`, unauthenticated room list (401), empty login (400), anonymous admin password change (401).
- [ ] Success, 403, 404, and 409 cases are not written for every controller.
- [x] `HotelBackend/WebApi/hotel.http` lists the main routes.

## Phase 5 — Frontend

- [x] Demo account module, IndexedDB database, and demo seed modules removed.
- [x] Login no longer falls back to a local account list.
- [x] API base URL is `VITE_API_BASE_URL`, with `.env.example`.
- [x] 401 responses clear the token and return to `/login`.
- [x] TypeScript strict mode was already on. `tsc --noEmit` is part of verification.
- [ ] Explicit `any` remains in RTK Query mappers. The ESLint rule is off so those files keep compiling while the casts are replaced.

## Phase 6 — UI

- [x] Playwright smoke test loads the login page at 375, 768, and 1440 and checks that the demo account list is gone.
- [ ] Every desk route was not clicked in a browser during this run.

## Phase 7 — Production packaging

- [x] API and frontend Dockerfiles, `docker-compose.yml`, GitHub Actions CI, `.editorconfig`, README.
- [ ] Docker was not installed on the machine that produced this branch, so the images were not built here.

## Phase 8 — Gate

- [x] `dotnet test HotelBackend/CleanSetupTemplate.slnx` passed: 7 application tests, 3 architecture tests, 5 API tests including `/health/ready`.
- [x] `npm run lint`, `tsc --noEmit -p tsconfig.app.json`, and `npm run build` exited 0.
- [x] Playwright login smoke passed at 1440, 768, and 375.
- [ ] A brand-new database created only from migrations was not rebuilt. The local database was not modified.
