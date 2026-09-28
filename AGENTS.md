<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

- **Data modes** (`src/lib/data/index.ts`): Supabase when `NEXT_PUBLIC_SUPABASE_*` is set; otherwise clearly-fake DEMO fixtures (`src/lib/data/fixtures.ts`). Fixtures are refused on a Vercel production deployment.
- **Data integrity**: never render ₹0 for an unknown price, never invent vibes/entry rules/crowd numbers, and only show a booking CTA for `booking.verified`. `null` always means "not confirmed".
- **Design system**: tokens live in `src/app/globals.css` (`@theme`). The look is "festival print" — flat textile colours (sindoor, neel, haldi, mehendi) on khadi paper with ink outlines and printed offset shadows. Avoid gradients, glows and glassmorphism.
- **Checks**: `npm run lint`, `npm run typecheck`, `npm run build`.
