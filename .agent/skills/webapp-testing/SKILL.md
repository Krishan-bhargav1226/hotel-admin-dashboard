---
name: webapp-testing
description: Toolkit and procedures for interacting with and testing local web applications using Playwright or Antigravity browser tools. Verifies frontend functionality, inspects DOM, checks console logs, and validates UI behavior.
---

# Web Application Testing Skill

Use this skill when verifying web applications, testing interactive UI components, validating form submissions, or troubleshooting layout and browser console issues.

## Testing Strategy Workflow

1. **Verify Application Readiness**:
   - Confirm the dev server or local application is running (e.g., Vite on `http://localhost:5173/`).
   - If not running, start it using `run_command` (e.g., `npm run dev`).

2. **Reconnaissance & Accessibility Tree Inspection**:
   - Inspect page structure using Playwright MCP or browser subagent.
   - Prefer role-based and accessibility selectors (`getByRole`, `getByLabel`, `getByTestId`) over fragile CSS class selectors.

3. **Interactive Test Execution**:
   - **Navigation**: Navigate to target route and wait for network idle / DOM content loaded.
   - **User Input**: Fill forms, click buttons, select dropdowns, test keyboard navigation (Tab, Enter, Escape).
   - **Verification**: Check expected URL transitions, modal appearances, toast notifications, and updated table rows.
   - **Console Health**: Verify that no uncaught exceptions or React hydration errors appear in browser logs.

4. **Regression & Responsive Verification**:
   - Test key viewports: Desktop (1280x800), Tablet (768x1024), and Mobile (375x667).
   - Ensure touch targets and navigation work seamlessly across breakpoints.
