# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`iamziike` — a personal developer portfolio. A single-page site with a
hand-drawn, sketchbook aesthetic: warm paper background, pencil strokes,
wobbly borders, the occasional stick figure. Minimalist in content, expressive
in skin.

**Stack:** Vite 8 + React 19 (React Compiler enabled) + TypeScript +
Tailwind CSS 4 (via `@tailwindcss/vite`).
Package manager: **pnpm** (`pnpm-lock.yaml` is committed — do not introduce
`npm`/`yarn` lockfiles).

> The project is already scaffolded. **Do not re-scaffold, re-init, or rebuild
> it from scratch.** Build the portfolio incrementally on top of the existing
> Vite setup. The current `src/App.tsx` is starter boilerplate and is meant to
> be replaced with real portfolio sections.

## Design system — non-negotiable

All UI in this project **must** be built with the **`pencil-design-system`
skill**. Before creating or editing any component, page, or style, invoke that
skill and follow it exactly.

This means:

- **Colors:** only the pencil palette, exposed as Tailwind theme tokens in
  `src/styles/main.css` (`bg-paper`, `text-pencil-dark`, `border-accent-rust`,
  etc.). No raw hex values in components — always go through the tokens. The
  primary text/ink token (`pencil-dark`) is intentionally pure black; all
  readable copy uses `text-pencil-dark`, not the muted `text-pencil`.
- **Borders/cards/buttons:** apply the `#pencil-border` SVG filter via the
  `pencil-edge` utility. Use the irregular `rounded-sketch` / `rounded-loose`
  radii. No clean flat rectangles.
- **Texture:** paper-grain background on `body`; `shadow-[…var(--color-paper-shadow)]`
  for shadows (never `rgba(0,0,0,*)`).
- **Motion:** subtle hover rotations (0.2–0.5deg), draw-in underlines,
  `0.15–0.2s ease` transitions. Honour `prefers-reduced-motion`.
- **Stick figures** are encouraged for the hero and any empty states.

If a request would produce a clean/flat/corporate UI, that is wrong for this
project — push it back toward the sketchbook look.

### Styling — Tailwind CSS 4

Style components with **Tailwind utility classes in `className`** — not
per-component `.css` files. There are no component stylesheets in this project.

- The pencil design system lives in **`src/styles/main.css`**: `@import
  "tailwindcss"`, a `@theme` block defining every design token (colors, fonts,
  type scale, leading, sketch radii, the stick-figure animation), the
  `@font-face`, the `pencil-edge` `@utility`, and base `body`/texture/reduced-
  motion rules. This file is the **only** place raw values belong.
- To add a design value, add a token to `@theme` (e.g. a `--color-*` entry),
  then use the generated utility — don't hard-code it in a component.
- Custom CSS is acceptable **only** for what Tailwind genuinely cannot express:
  the `@font-face`, the SVG-filter `pencil-edge` utility, the paper-texture
  background, the custom pencil cursor (`public/pencil-cursor.svg`), and
  `@keyframes`. Everything else is utilities.
- Reach for `before:` / `after:` variants for sketch pseudo-elements; arbitrary
  values (`shadow-[…]`, `max-[720px]:`) are fine where no token fits.

### Typography

The font file lives in the repo at:

```text
src/assets/fonts/DirtyEnough-Regular.ttf
```

It is loaded via `@font-face` in `src/styles/main.css`, importing the local
file so Vite fingerprints and bundles it — do **not** hotlink an external URL
and do **not** rely on the copy bundled inside the skill.

**This project uses a single typeface.** Dirty Enough is used for *all* text —
headings, nav, buttons, body copy, captions, everything. Do not introduce a
second body font (no Lora, no Google Fonts). Both the `font-sketch` and
`font-body` Tailwind utilities resolve to the Dirty Enough stack, so either is
safe to use. Keep the type scale minimal — a few well-chosen sizes from the
`text-*` scale, not a new size per element.

### Minimalism

Content stays lean: hero, work/projects, about, contact — and nothing the page
does not need. Generous whitespace. One accent colour per component, maximum.
The personality comes from the *texture and linework*, not from clutter.

### Doodle layer

The site has a full-page drawing overlay (`src/components/drawing/`). Right-click
anywhere opens a sketch-styled tool menu beside the cursor; choosing a tool
(`pencil` — the default — `line`, `rectangle`, or `fill`) turns drawing on and the
whole viewport becomes a canvas. The drawing engine lives in
`src/hooks/useCanvasDrawing.ts`; the overlay stays `pointer-events: none` (never
blocks the page) unless a tool is active. Keep this layer's UI — the tool menu,
the badge — in the pencil design system like everything else.

## TypeScript rules — strict

- **`any` is banned.** Never use `any` as a type, an assertion, or an implicit
  fallback. If a type is genuinely unknown, use `unknown` and narrow it.
- **Everything is typed.** All props, hooks, function parameters and returns,
  event handlers, refs, and module boundaries carry explicit types. No implicit
  `any` from missing annotations.
- Type component props with a named `interface` or `type` alias — not inline
  object literals for anything non-trivial.
- Prefer `type` for unions/utility types, `interface` for object/props shapes.
- Use `import type { ... }` for type-only imports (`verbatimModuleSyntax` is on).
- No `@ts-ignore` / `@ts-expect-error` to silence real errors — fix the type.
- `tsconfig.app.json` enforces `noUnusedLocals` / `noUnusedParameters`; keep the
  code clean so `pnpm build` (`tsc -b`) passes.

## Project arrangement

Keep the structure feature-oriented and predictable. Use this layout:

```text
src/
  assets/
    fonts/              # DirtyEnough-Regular.ttf
    images/             # hero art, project thumbnails
  components/           # reusable pencil-style UI primitives
    ui/                 # Button, Card, Tag, Divider, StickFigure, ...
    drawing/            # full-page doodle layer (canvas + tool menu)
  sections/             # page sections: Hero, Work, About, Contact
  hooks/                # custom React hooks (e.g. useCanvasDrawing)
  data/                 # portfolio content (projects, links) as typed modules
  types/                # shared TypeScript types/interfaces
  styles/               # main.css — Tailwind import, @theme tokens, font-face
  App.tsx               # composes the sections
  main.tsx              # entry point
```

Arrangement rules:

- **One component per file.** File name matches the component
  (`PascalCase.tsx`). Components are styled with Tailwind utilities in
  `className` — no co-located `.css` files.
- **No barrel files** unless they earn their keep; prefer direct imports.
- Portfolio content (project list, social links, bio) lives as **typed data
  modules** in `src/data/` — keep copy out of JSX so it is easy to edit.
- All global styling and design tokens live in `src/styles/main.css`, imported
  once in `main.tsx`.
- Inject the pencil SVG `<filter>` defs once near the app root, not per
  component.
- Keep components presentational; push logic into `hooks/` and data into
  `data/`.

## Commands

```bash
pnpm install      # install dependencies
pnpm dev          # start the Vite dev server
pnpm build        # type-check (tsc -b) + production build
pnpm lint         # run ESLint
pnpm preview      # preview the production build
```

Before considering work done, `pnpm build` and `pnpm lint` must both pass.

## Working agreements

- Do not rebuild the project from scratch or change the build tooling.
- Always run UI work through the `pencil-design-system` skill.
- No `any`; everything typed.
- Keep it minimal — add sections and components only when the portfolio
  actually needs them.
