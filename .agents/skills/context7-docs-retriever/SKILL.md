---
name: context7-docs-retriever
description: Procedures for dynamically fetching latest, version-specific library documentation, code examples, and API signatures using Context7 MCP or ctx7 CLI for React, Vite, Tailwind, ASP.NET Core, and third-party libraries.
---

# Context7 Documentation Retriever Skill

Use this skill whenever you need authoritative, up-to-date documentation or API syntax for libraries, SDKs, and frameworks without guessing or relying on deprecated methods.

## When to Use Context7

- Exploring modern library APIs (e.g., React 18/19 hooks, Vite 6 plugins, EF Core 8/9 features).
- Verifying exact method signatures, component props, and configuration options.
- Looking up best-practice boilerplate for UI components or backend middleware.

## Retrieval Steps

1. **Querying via Context7 MCP Server**:
   - If the `context7` MCP server is active, query documentation topics directly via its exposed tools.
   - Target specific package names (e.g., `@reduxjs/toolkit`, `tailwindcss`, `Microsoft.EntityFrameworkCore`).

2. **Command Line Retrieval via ctx7**:
   - Run lightweight CLI lookups:
     `npx -y ctx7 query "<library-name> <feature>"`
   - Extract code examples and cross-reference with the active dependencies in `package.json` or `.csproj`.

3. **Fallback Retrieval**:
   - If offline or rate-limited, query official docs via `search_web` and inspect them directly with `read_url_content`.
