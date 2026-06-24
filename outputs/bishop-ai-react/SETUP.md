# Bishop AI React — Setup & Integration Guide

This folder (`outputs/bishop-ai-react/`) is a fully structured **Next.js 14 + TypeScript + Tailwind CSS + shadcn** project containing the **Radial Orbital Timeline** component, pre-wired with Bishop AI's GTM Project Lifecycle data.

---

## Project Structure

```
outputs/bishop-ai-react/
├── app/
│   ├── globals.css          ← Tailwind base + custom animations
│   ├── layout.tsx           ← Root layout (Poppins font, dark base)
│   └── page.tsx             ← Entry page rendering the timeline demo
├── components/
│   ├── ui/
│   │   ├── badge.tsx        ← shadcn Badge primitive
│   │   ├── button.tsx       ← shadcn Button primitive
│   │   ├── card.tsx         ← shadcn Card primitive
│   │   └── radial-orbital-timeline.tsx  ← ★ The core component
│   └── radial-orbital-timeline-demo.tsx ← Demo wrapper w/ Bishop AI data
├── lib/
│   └── utils.ts             ← cn() class merger utility
├── components.json          ← shadcn CLI configuration
├── next.config.ts           ← Next.js configuration
├── package.json             ← All dependencies declared
├── postcss.config.mjs       ← PostCSS (Tailwind pipeline)
├── tailwind.config.ts       ← Tailwind + Bishop AI brand tokens
└── tsconfig.json            ← TypeScript (strict mode, @/* alias)
```

---

## Option A — Use This Folder Directly (Fastest)

All files are pre-written. Just install dependencies and run:

```bash
# Step 1 — navigate into the folder
cd "C:\Users\richm\OneDrive\Desktop\.ziggy\outputs\bishop-ai-react"

# Step 2 — install all dependencies
npm install

# Step 3 — start the dev server
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Option B — Fresh Project via shadcn CLI

If you prefer to bootstrap a clean project first:

```bash
# 1. Create a new Next.js app with shadcn
npx shadcn@latest init

# Answer the prompts:
#   - Framework: Next.js
#   - TypeScript: Yes
#   - Tailwind CSS: Yes
#   - Style: Default
#   - Base color: Slate
#   - CSS variables: Yes
#   - Components alias: @/components
#   - Utils alias: @/lib/utils

# 2. Add the required shadcn primitives via CLI
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add card

# 3. Install additional npm dependencies
npm install lucide-react class-variance-authority @radix-ui/react-slot

# 4. Copy these files from outputs/bishop-ai-react/ into your new project:
#    - components/ui/radial-orbital-timeline.tsx
#    - components/radial-orbital-timeline-demo.tsx

# 5. Extend app/globals.css with the animation blocks from this project's globals.css

# 6. Run dev server
npm run dev
```

---

## Why `/components/ui` Matters

The `/components/ui` folder is the **shadcn component registry**. When you run `npx shadcn@latest add <component>`, the CLI always writes into this path. Keeping primitive UI components (Badge, Button, Card, etc.) here:

- Standardises the `@/components/ui/<name>` import alias across all files
- Allows future shadcn CLI additions to auto-resolve without breaking existing imports
- Separates low-level primitives from higher-level page components in `/components/`

---

## Where This Component Lives in the Site

The **Radial Orbital Timeline** is placed on the **Services page** inside the *"The Bishop AI Method"* section. It visually maps the five-stage project lifecycle:

| Node | Stage | Status |
|------|-------|--------|
| 1 | Operational Audit & Planning | Completed |
| 2 | GTM System Architecture | Completed |
| 3 | Middleware & Pipeline Build | In Progress |
| 4 | Sandbox Simulation & Tests | Pending |
| 5 | Production Launch & Training | Pending |

Visitors click any orbiting node to expand a detail card showing the stage description, energy level progress bar, and connected downstream stages.

---

## npm Dependencies Reference

| Package | Purpose |
|---------|---------|
| `lucide-react` | SVG icons for timeline node markers |
| `class-variance-authority` | Variant-based class generation for shadcn components |
| `@radix-ui/react-slot` | Polymorphic rendering for Button's `asChild` prop |
| `clsx` | Conditional class name joining |
| `tailwind-merge` | Resolves Tailwind class specificity conflicts in `cn()` |
