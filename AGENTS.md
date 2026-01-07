# Repository Guidelines

## Project Structure & Module Organization

- `src/routes/` contains SvelteKit routes and endpoints. UI routes live in
  `+page.svelte` files, server-only handlers use `+page.server.ts`, and API
  endpoints use `+server.ts`.
- Route groups and params follow SvelteKit conventions, e.g. `(authed)/` for
  grouped layouts and `[slug]/` for dynamic segments.
- `src/lib/` holds shared UI components and utilities. `src/params/` stores
  route param matchers.
- `src/app.html` and `src/app.css` define the app shell and global styles.
- `static/` is for static assets served as-is (images, icons, robots.txt).

## Build, Test, and Development Commands

- `npm run dev` starts the Vite/SvelteKit dev server for local development.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm run check` runs `svelte-check` after syncing SvelteKit types.
- `npm run check:watch` runs checks in watch mode while developing.
- `npm run format` formats the repo with Prettier; `npm run lint` verifies
  formatting.

## Coding Style & Naming Conventions

- Formatting is enforced by Prettier with Svelte and Tailwind plugins. Prefer
  running `npm run format` over manual formatting.
- Follow SvelteKit file naming: `+page.svelte`, `+layout.svelte`,
  `+page.server.ts`, `+server.ts`.
- Keep route segment folders lowercase and use bracketed params like `[slug]`
  for dynamic routes.

## Testing Guidelines

- No dedicated test runner is configured. Use `npm run check` and `npm run lint`
  as baseline quality checks.
- For functional validation, run `npm run dev` and exercise the relevant routes
  or endpoints.

## Commit & Pull Request Guidelines

- Commit messages follow Conventional Commits (e.g., `fix:`, `chore:`) with
  short, imperative summaries.
- PRs should include a clear description, the reason for the change, and any
  relevant screenshots for UI updates.
- Link issues when applicable and note which commands you ran (e.g.,
  `npm run check`, `npm run lint`).

## Configuration & Secrets

- Store local environment values in `.env` and avoid committing secrets.
- Deployment settings live in `vercel.json`; update it only when deployment
  behavior changes.
