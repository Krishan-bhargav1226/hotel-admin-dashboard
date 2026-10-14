---
name: react-ts-vite-expert
description: Best practices and engineering workflows for React 18/19, TypeScript strict mode, Vite tooling, and Tailwind CSS. Covers state management, hooks architecture, component modularity, performance optimization, and build configs.
---

# React + TypeScript + Vite Expert Skill

Use this skill when developing, refactoring, or optimizing React applications with TypeScript, Tailwind CSS, and Vite.

## Architecture Guidelines

1. **Strict TypeScript & Clean Types**:
   - Explicit props interfaces with clear documentation (`interface ButtonProps { ... }`).
   - Strong discriminated unions for component states (`status: 'idle' | 'loading' | 'success' | 'error'`).
   - Avoid `any`. Use generics (`<T>`) and utility types (`Partial`, `Pick`, `Omit`, `Record`).

2. **React Hooks & State Architecture**:
   - Keep state as local as possible. Lift state up only when siblings share dependency.
   - Separate business logic into custom hooks (`useHotelBookings`, `useAuth`, `useFilter`).
   - Use `useCallback` and `useMemo` deliberately when passing callbacks to memoized children or computing heavy transformations.
   - For global state, use Redux Toolkit slices or lightweight Context with custom consumer hooks.

3. **Vite & Tooling Configuration**:
   - Configure path aliases in `vite.config.ts` and `tsconfig.app.json` (`@/components`, `@/features`, `@/hooks`).
   - Manage environment variables via `import.meta.env.VITE_*` and define `vite-env.d.ts`.
   - Implement route-based code-splitting with `React.lazy()` and `Suspense` for fast initial bundle loads.

4. **Tailwind CSS Patterns**:
   - Use utility composition with `clsx` or `tailwind-merge` for conditional class application.
   - Keep class lists organized (layout -> spacing -> sizing -> typography -> colors -> effects -> responsive).
   - Leverage theme extensions in `tailwind.config.js` for custom color palettes, shadows, and radii.

5. **Error Boundaries & Resilience**:
   - Wrap feature modules and router outlets with React Error Boundaries.
   - Display informative, recoverable fallback UIs with retry actions.
