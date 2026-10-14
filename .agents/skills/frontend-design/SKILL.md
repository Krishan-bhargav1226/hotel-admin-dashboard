---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, layout, modern color palettes, and avoiding generic AI-generated looks.
---

# Frontend Design Skill

This skill provides expert design direction to produce production-grade, premium user interfaces that do not look like generic templates or repetitive AI boilerplate.

## Core Design Principles

1. **Ground Designs in the Subject Matter**:
   - Understand the domain, audience, and functional requirements before styling.
   - Tailor colors, typography, and density to the domain (e.g., hotel admin dashboard vs developer CLI vs playful consumer app).
   - Use real domain data and vocabulary instead of generic placeholders.

2. **Distinctive Typography**:
   - Avoid browser defaults. Use curated Google Fonts (e.g., Plus Jakarta Sans, Outfit, Inter, DM Sans, Fira Code).
   - Establish a deliberate type scale: Clear hierarchy between H1, H2, subheadings, body, and micro-labels.
   - Keep line lengths under 80 characters for optimal readability.
   - Avoid AI clichés: do not arbitrarily accent a single random word with bold/italic or add superfluous label pills above every header.

3. **Curated Color & Contrast**:
   - Establish cohesive semantic color tokens: primary, secondary, neutral, surface, background, border, and status (success, warning, danger, info).
   - Use subtle surface elevation gradients, subtle borders (e.g., `border-slate-200/60` or `border-zinc-800/60`), and backdrop blur (`backdrop-blur-md`).
   - Maintain strict WCAG 2.1 AA contrast ratios for accessible text and interactive controls.

4. **Intentional Motion & Micro-interactions**:
   - Subtle hover and focus states: gentle transitions (`transition-all duration-200 ease-in-out`), subtle scale (`hover:scale-[1.01]`), tactile active button depressions.
   - Avoid chaotic, unchoreographed animations that delay user interaction.
   - Animate state changes (drawers sliding in, modals fading, accordion expansions) rather than static page elements.

5. **Component Hierarchy & Density**:
   - Group related controls into cards with clear visual boundaries.
   - Provide adequate whitespace; let elements breathe without wasting viewport real estate.
   - Build responsive layouts using mobile-first Flexbox and CSS Grid.
