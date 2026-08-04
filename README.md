# Northstar Email Studio

A production-oriented, JSON-driven visual email builder built with Next.js 16, React 19, TypeScript, Tailwind CSS, dnd-kit, Zustand, React Hook Form, Zod, and TanStack Query.

The editor supports nested drag-and-drop layouts, schema-generated property forms, desktop/mobile email-client previews, undo/redo, draft autosave, template management, JSON portability, and table-based HTML export with Outlook VML fallbacks.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/builder](http://localhost:3000/builder).

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run test:e2e
npm run build
```

If a restricted execution environment prevents Turbopack from opening its internal CSS worker port, the equivalent verification build is:

```bash
npx next build --webpack
```

## Core capabilities

- 12 registered blocks: section, container, text, heading, button, image, divider, spacer, columns, hero, social links, and footer
- Recursive component tree with nesting, reorder, keyboard drag controls, duplicate, and delete
- React Hook Form `FormProvider` and `useFormContext` property system driven entirely by registry field definitions
- Per-block Zod validation with enforced image alternative text and safe URL protocols
- Zustand history with coalesced typing edits, redo, selection, preview, client simulation, and persisted draft state
- Browser-local repository behind an async service boundary, consumed through TanStack Query
- Gmail, Outlook, and Apple Mail preview chrome in desktop and mobile widths
- Clean HTML, JSON import/export, autosave, manual save/update, duplicate, and delete
- Responsive table markup, inline styles, bulletproof buttons, VML hero backgrounds, preheaders, dark-mode metadata, and accessible output
- Two editable starter templates

## Documentation

See [Architecture](docs/architecture.md) for the system diagram, data flow, state design, testing strategy, security model, performance decisions, email compatibility approach, and extensibility roadmap.

## Persistence

The included repository adapter stores up to 50 templates in browser `localStorage`, which makes the application fully usable without infrastructure. The UI depends on an async repository contract, so a database/API adapter can replace it without changing the editor, renderer, or forms.
