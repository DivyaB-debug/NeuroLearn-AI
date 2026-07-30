# Migrate NeuroLearnAI off Lovable and deploy on Render

## Goal
Take the current TanStack Start app (NeuroLearnAI) off Lovable Cloud/Workers and turn it into an independent full-stack Node.js service that builds and deploys on Render.

## Current state
- Frontend: React 19 + TanStack Router/Start + Tailwind v4
- Build/runtime: `@lovable.dev/vite-tanstack-config` targeting Cloudflare Workers
- AI: Lovable AI Gateway (`LOVABLE_API_KEY`, `createLovableAiGatewayProvider`)
- Backend/data: Lovable Cloud / Supabase (`profiles`, `sign_letter_progress`, `sign_topic_progress`)
- Auth broker: `@lovable.dev/cloud-auth-js` (Google/Apple/Microsoft OAuth)
- Active sign-in: name-only localStorage guest mode

## Phase 1 — Extract and audit
1. Export the project source from Lovable (GitHub repo or ZIP).
2. Inventory every Lovable-specific dependency and env var:
   - `@lovable.dev/vite-tanstack-config`
   - `@lovable.dev/cloud-auth-js`
   - `@cloudflare/vite-plugin`
   - `wrangler.jsonc`
   - `src/integrations/lovable/`
   - `src/integrations/supabase/*` auto-generated files
   - `LOVABLE_API_KEY`, `SUPABASE_*` env vars
3. Confirm which Supabase tables/functions must be recreated on the new database.

## Phase 2 — Swap build/runtime adapter for Render
1. Remove `@lovable.dev/vite-tanstack-config`, `@cloudflare/vite-plugin`, and `wrangler.jsonc`.
2. Add the standard TanStack Start Node adapter (`@tanstack/react-start-node-adapter` / `vinxi` Node preset).
3. Rewrite `vite.config.ts` to use the standard TanStack Start + Vite React + Tailwind v4 + tsconfig-paths plugins.
4. Adjust `src/server.ts` SSR error wrapper so it runs under Node/Nitro instead of Cloudflare Workers.
5. Verify `npm run dev` and `npm run build` produce a Node server output.

## Phase 3 — Replace backend services

### AI provider
Replace Lovable AI Gateway with a direct AI SDK provider.
- Recommended: Google Gemini (`@ai-sdk/google`) because the app already uses `google/gemini-2.5-flash`.
- Alternative: OpenAI (`@ai-sdk/openai`) if you prefer.
- Update `src/lib/ai-gateway.ts` and `src/lib/learning.functions.ts` to call the new provider.
- Replace image generation in `src/routes/api/lesson-image.ts` with direct OpenAI/DALL-E, Gemini Imagen, or Stability AI.

### Database
Move from Supabase to Render PostgreSQL.
- Add Prisma (`prisma`, `@prisma/client`) or Drizzle (`drizzle-orm`, `pg`).
- Recreate schema: `profiles`, `sign_letter_progress`, `sign_topic_progress`.
- Replace `src/integrations/supabase/*` with the new ORM client.
- Rewrite `src/lib/learning.functions.ts` and sign-progress storage to query Postgres instead of Supabase.

### Auth
Current name-only localStorage auth is already Lovable-independent. Choose a path:
- **Simplest**: keep localStorage guest mode, no backend auth needed.
- **Real accounts**: add Lucia + Postgres sessions, or use Clerk/Auth.js for OAuth.

## Phase 4 — Environment variables and secrets
Remove Lovable/Supabase secrets and add Render env vars:
- `DATABASE_URL` — Render Postgres connection string
- `GOOGLE_GENERATIVE_AI_API_KEY` or `OPENAI_API_KEY`
- `SESSION_SECRET` — random 64-char signing key (if using session auth)
- `IMAGE_API_KEY` — key for the chosen image provider
- `NODE_ENV=production`

## Phase 5 — Render deploy config
1. Add `render.yaml` defining a Web Service:
   - Build command: `npm ci && npm run build`
   - Start command: `node .output/server/index.mjs` (or the actual Node output path)
   - Health check: `/`
2. Connect the Render PostgreSQL database and paste `DATABASE_URL`.
3. Push code to the linked Git repo; Render auto-deploys on commits.

## Dependencies to change
- **Remove**: `@lovable.dev/vite-tanstack-config`, `@lovable.dev/cloud-auth-js`, `@cloudflare/vite-plugin`, `wrangler` (if present), `@supabase/supabase-js` (if moving DB).
- **Add**: standard TanStack Start Node adapter, `@ai-sdk/google` or `@ai-sdk/openai`, ORM + DB driver, optional auth library, `dotenv` for local dev.

## Risks and decisions
- TanStack Start must use a Node adapter, not the Cloudflare preset.
- The custom `src/server.ts` wrapper may need small changes for Node/Nitro.
- AI image generation endpoint must be rewired to a non-Lovable provider.
- Static sign-language SVGs in `public/` transfer without changes.

## Deliverables
- Fully migrated codebase with zero Lovable-specific dependencies.
- Working local dev (`npm run dev`) and production build.
- `render.yaml` and deploy instructions.
- Updated README listing required env vars and how to obtain them.
