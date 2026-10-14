---
name: aspnet-core-clean-arch
description: Best practices and engineering workflows for modern ASP.NET Core (C# .NET 8/.NET 9). Covers Clean Architecture, Minimal APIs, CQRS, Entity Framework Core, Dependency Injection, async safety, and REST security.
---

# ASP.NET Core Clean Architecture Skill

Use this skill when designing, building, or refactoring backend services and APIs using C# and ASP.NET Core.

## Architectural Layers

1. **Domain Layer**:
   - Entities, Value Objects, Domain Events, Enums, and Repository Interfaces.
   - Zero external framework dependencies; pure C# business rules.

2. **Application Layer**:
   - Commands, Queries, DTOs, Mappings, and Validators (FluentValidation).
   - Use CQRS patterns (MediatR or lightweight handler pipeline).
   - Business use-cases, orchestration, and interface abstractions.

3. **Infrastructure Layer**:
   - Entity Framework Core `DbContext`, entity type configurations (`IEntityTypeConfiguration<T>`).
   - Database migrations, third-party API clients, caching, messaging, and email providers.
   - Migrations management: `dotnet ef migrations add`, `dotnet ef database update`.

4. **API / Presentation Layer**:
   - Minimal APIs (`app.MapGet()`, `app.MapPost()`) or Controllers with explicit routing.
   - Global exception handling middleware (`UseExceptionHandler` / ProblemDetails RFC 7807).
   - JWT authentication & authorization policies (`AddAuthentication`, `AddAuthorization`).
   - Swagger / OpenAPI specifications (`AddEndpointsApiExplorer`, `AddSwaggerGen`).

## Code Quality & Performance

- **Async Throughout**: Always use `async` / `await` with `CancellationToken` support in DB queries and HTTP calls.
- **AsNoTracking**: Always use `.AsNoTracking()` for read-only EF Core queries to eliminate tracking overhead.
- **Dependency Injection**: Register services with proper lifetimes (`Transient`, `Scoped`, `Singleton`). Avoid captive dependencies.
- **Validation**: Validate requests before execution using FluentValidation filters.
