# Hotel operations platform

.NET 10 API and React desk for rooms, stays, reservations, and hotel settings.

## Layout

- `HotelBackend/Domain` entities and enums. Identity types stay here because users and roles extend ASP.NET Identity.
- `HotelBackend/Application` MediatR use cases, DTOs, FluentValidation, and mapping.
- `HotelBackend/Persistence` EF Core, repositories, and Identity storage.
- `HotelBackend/Infrastructure` external services such as email and chat.
- `HotelBackend/WebApi` HTTP controllers, health checks, and OpenAPI.
- `HotelBackend/docs` backend coding standards.
- `frontend` React, TypeScript, and Redux Toolkit Query.

## Prerequisites

- .NET SDK 10
- Node.js 22
- PostgreSQL 16, or Docker Compose

## Configure

Copy `HotelBackend/WebApi/appsettings.example.json` to `HotelBackend/WebApi/appsettings.Development.json` and set:

| Setting | Purpose |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Local Postgres connection |
| `JwtSettings:SecretKey` | At least 32 bytes. Also accepted as `JwtSettings__SecretKey` |
| `JwtSettings:Issuer` and `Audience` | Token issuer and audience |
| `SeedAdmin:Email` and `SeedAdmin:Password` | Created once in Development when the user does not exist |
| `Cors:Origins` | Browser origins allowed to call the API |
| `EmailSettings` | SMTP credentials, only if mail is used |
| `GeminiSettings:ApiKey` | Optional chat key |

Copy `frontend/.env.example` to `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:7444/api
```

Do not commit `appsettings.Development.json` or `.env`.

## Run

```bash
dotnet run --project HotelBackend/WebApi
cd frontend && npm ci && npm run dev
```

The API listens on `http://localhost:7444`. Swagger is available in Development at `/swagger`. Liveness is `/health/live` and readiness is `/health/ready`.

Migrations live in `HotelBackend/Persistence/Migrations`. The API uses the existing model. Apply them with:

```bash
dotnet ef database update --project HotelBackend/Persistence --startup-project HotelBackend/WebApi
```

## Test

```bash
dotnet test HotelBackend/HotelBackend.slnx
cd frontend && npm ci && npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run build
cd frontend && npm run test:e2e
```

Integration tests read `HotelBackend/WebApi/appsettings.Development.json` when it is present so they can reach the local database. They do not create or drop tables.

## Docker

```bash
docker compose up --build
```

The API is published on port 8080 and the frontend on port 5173. Change `SeedAdmin__Password` before sharing the stack.

## Requests

`HotelBackend/WebApi/hotel.http` lists the health checks and the main desk endpoints. Authenticated routes expect `Authorization: Bearer <token>` from `POST /api/user/login`.
