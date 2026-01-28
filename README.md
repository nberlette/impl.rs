# [impl.rs]

<div align="center">

[![impl.rs futuristic banner design](./.github/assets/banner_1.webp)][impl.rs]

---

![vercel][badge-vercel] ![svelte-kit][badge-sv] ![tailwind v4][badge-tw] ![neon][badge-neon] [![MIT license][badge-mit]][mit]

</div>

## Introduction

First off, hello and welcome to the **impl.rs** repo! This project - still very
much in its infancy, mind you - is a self-sustaining online showcase for Rust
projects of all shapes and sizes. It auto-aggregates data from GitHub and
[crates.io] using cron jobs, and periodically computes a relative "ranking" for
each project using a number of advanced heuristics.

## Overview

### Technology

#### Primary Stack

| Package                      | Version  | Info                           |
| ---------------------------- | -------- | ------------------------------ |
| [`typescript`]               | `5.9.3`  | Static type checking           |
| [`@neondatabase/serverless`] | `1.0.2`  | Postgres backend database      |
| [`tailwindcss`]              | `4.1.18` | Utility-based style library    |
| [`svelte`]                   | `5.46.1` | Futuristic web markup language |
| [`@sveltejs/kit`]            | `2.49.4` | Official framework for svelte  |

[`typescript`]: https://npm.im/typescript@5.9.3
[`@neondatabase/serverless`]: https://npm.im/@neondatabase/serverless@1.0.2
[`tailwindcss`]: https://npm.im/tailwindcss@4.1.18
[`svelte`]: https://npm.im/svelte@5.46.1
[`@sveltejs/kit`]: https://npm.im/@sveltejs/kit@2.49.4

#### Frontend

impl.rs is built with SvelteKit and Svelte 5, styled with Tailwind CSS v4, and
bundled with Vite. The UI favors fast browsing, deep linking, and clean project
detail pages, with routes in `src/routes/` and shared components in `src/lib/`.

#### Backend

Server logic lives in SvelteKit endpoints that power sync jobs, admin tools, and
API actions. Data is stored in Neon serverless Postgres via
`@neondatabase/serverless`, with GitHub OAuth and the GitHub API handling user
sessions and repository metadata.

#### Data pipeline

The sync pipeline discovers repositories on GitHub, updates stats, and stores
metadata, then enriches Rust packages with crates.io data and dependency
information. Rankings are computed in `src/lib/server/rankings.ts`, weighing
recency, activity, popularity, and quality signals.

### Core features

impl.rs auto-aggregates listings for trending Rust projects and provides detail
pages with GitHub, crates.io, and docs.rs links. Users can sign in with GitHub
to star projects, while admins get dashboards for sync status and submissions.
Cron endpoints handle scheduled GitHub, crates.io, and ranking updates.

### Project structure

Routes and endpoints live in `src/routes/`, shared components and server
utilities are in `src/lib/`, route param matchers are in `src/params/`, and
static assets are served from `static/`.

---

## Getting started


#### Install dependencies

```bash
pnpm i
```

#### Configure environment

```dotenv
# postgres connection uri
DATABASE_URL=postgres://...
# github PAT used for scraping new projects
GITHUB_TOKEN=...
# github oauth app client id, for authentication
GITHUB_CLIENT_ID=...
# client secret obtained in github developer settings
GITHUB_CLIENT_SECRET=...
# secret used to secure cron api endpoints
CRON_SECRET=...
```

#### Start the dev server

```bash
pnpm dev
```

### Scripts

Use `npm run dev` for local development, `npm run build` to create a production
bundle, and `npm run preview` to serve it locally. For quality checks, run
`npm run check` (or `npm run check:watch` while developing), then use
`npm run format` and `npm run lint` to keep formatting consistent.

### Cron and Sync

Sync endpoints live in `src/routes/api/sync/` and are protected by `CRON_SECRET`
via the `Authorization` header or the `x-vercel-cron` header. Rankings are
computed through `src/routes/api/cron/rankings/`.

---

## Further Reading

### Contributing

Contributions are **very welcome**! _Seriously, I'll take all the help I can
get_.

That being said, I humbly ask you to take a moment to familiarize yourself with
the [contributing] guide, and [open an issue] before submitting a PR.

##### Why do I need to create an issue first?

Simple: it starts a discussion around the changes you'd like to make, allowing
myself, other maintainers, and community members to chime in and ensure the
changes you wish to submit are a fit for the goals and scope of the project.

###### Avoiding duplicate work

Furthermore, it helps prevent you from doing unnecessary extra work; for
example, if someone else is already working on the same thing, it's better to
find out beforehand, rather than after you've done a bunch of work and are
trying to merge.

> [!TIP]
>
> Making UI changes? Including a screenshot or recording in the PR description
> can help ensure your changes are easy to observe and promptly review.

---

<div align="center">

**[MIT] © [Nicholas Berlette]. All rights reserved.**

<small>

[impl.rs] - [github] - [issues] - [contributing]

</small></div>

[impl.rs]: https://impl.rs "impl.rs - Discover the best Rust projects"
[MIT]: https://nick.mit-license.org/2025 "MIT © Nicholas Berlette and contributors. All rights reserved."
[Nicholas Berlette]: https://github.com/nberlette "Follow @nberlette on GitHub for more cool projects and open source libraries!"
[github]: https://github.com/nberlette/impl.rs/#readme "Give the @nberlette/impl.rs repo a star on GitHub!"
[issues]: https://github.com/nberlette/impl.rs/issues "Found a bug? Let's squash it!"
[contributing]: https://github.com/nberlette/impl.rs/blob/main/.github/CONTRIBUTING.md "Contributing Guidelines for impl.rs"
[vercel]: https://vercel.com
[badge-vercel]: https://img.shields.io/badge/-vercel-black?logo=vercel&logoColor=white&style=for-the-badge
[badge-deploy-on-vercel]: https://img.shields.io/badge/-DEPLOY%20ON%20VERCEL-black?logo=vercel&logoColor=white&style=for-the-badge
[badge-sv]: https://img.shields.io/badge/sveltekit-ff3e00?logo=svelte&logoColor=white&style=for-the-badge
[badge-tw]: https://img.shields.io/badge/-tailwind-30bad0?logo=tailwindcss&logoColor=white&style=for-the-badge
[badge-mit]: https://img.shields.io/badge/-MIT-0a0a0a?style=for-the-badge
[mit]: https://nick.mit-license.org/2025 "MIT © Nicholas Berlette and contributors. All rights reserved."
[crates.io]: https://crates.io

[badge-neon]: https://img.shields.io/badge/-neon-black?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI1NiAyNTYiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHaDNoUzhjblEiIHgxPSIxMDAlIiB4Mj0iMTIuMDY5JSIgeTE9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzYyRjc1NSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhGRjk4NiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9IlNWR09WVldlZFFrIiB4MT0iMTAwJSIgeDI9IjQwLjYwMyUiIHkxPSIxMDAlIiB5Mj0iNzYuODk3JSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1vcGFjaXR5PSIuOSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFBMUExQSIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZmlsbD0iIzAwRTBEOSIgZD0iTTAgNDQuMTM5QzAgMTkuNzYyIDE5Ljc2MiAwIDQ0LjEzOSAwSDIxMS44NkMyMzYuMjM4IDAgMjU2IDE5Ljc2MiAyNTYgNDQuMTM5djE0Mi42NDljMCAyNS4yMTYtMzEuOTE1IDM2LjE2LTQ3LjM4OCAxNi4yNTZsLTQ4LjM5Mi02Mi4yNTF2NzUuNDg0YzAgMjEuOTM5LTE3Ljc4NCAzOS43MjMtMzkuNzIyIDM5LjcyM2gtNzYuMzZDMTkuNzYzIDI1NiAwIDIzNi4yMzggMCAyMTEuODYxem00NC4xMzktOC44MjVhOC44MTcgOC44MTcgMCAwIDAtOC44MjUgOC44MTh2MTY3LjczYzAgNC44NzggMy45NDYgOC44MzEgOC44MTggOC44MzFoNzcuNjg4YzIuNDQgMCAzLjA4Ny0xLjk3NyAzLjA4Ny00LjQxNnYtMTAxLjIyYzAtMjUuMjIyIDMxLjkxNC0zNi4xNjYgNDcuMzk1LTE2LjI1NWw0OC4zOTEgNjIuMjQzVjQ0LjE0YzAtNC44NzkuNDU1LTguODI1LTQuNDE2LTguODI1eiIvPjxwYXRoIGZpbGw9InVybCgjU1ZHaDNoUzhjblEpIiBkPSJNMCA0NC4xMzlDMCAxOS43NjIgMTkuNzYyIDAgNDQuMTM5IDBIMjExLjg2QzIzNi4yMzggMCAyNTYgMTkuNzYyIDI1NiA0NC4xMzl2MTQyLjY0OWMwIDI1LjIxNi0zMS45MTUgMzYuMTYtNDcuMzg4IDE2LjI1NmwtNDguMzkyLTYyLjI1MXY3NS40ODRjMCAyMS45MzktMTcuNzg0IDM5LjcyMy0zOS43MjIgMzkuNzIzaC03Ni4zNkMxOS43NjMgMjU2IDAgMjM2LjIzOCAwIDIxMS44NjF6bTQ0LjEzOS04LjgyNWE4LjgxNyA4LjgxNyAwIDAgMC04LjgyNSA4LjgxOHYxNjcuNzNjMCA0Ljg3OCAzLjk0NiA4LjgzMSA4LjgxOCA4LjgzMWg3Ny42ODhjMi40NCAwIDMuMDg3LTEuOTc3IDMuMDg3LTQuNDE2di0xMDEuMjJjMC0yNS4yMjIgMzEuOTE0LTM2LjE2NiA0Ny4zOTUtMTYuMjU1bDQ4LjM5MSA2Mi4yNDNWNDQuMTRjMC00Ljg3OS40NTUtOC44MjUtNC40MTYtOC44MjV6Ii8+PHBhdGggZmlsbD0idXJsKCNTVkdPVlZXZWRRaykiIGZpbGwtb3BhY2l0eT0iLjQiIGQ9Ik0wIDQ0LjEzOUMwIDE5Ljc2MiAxOS43NjIgMCA0NC4xMzkgMEgyMTEuODZDMjM2LjIzOCAwIDI1NiAxOS43NjIgMjU2IDQ0LjEzOXYxNDIuNjQ5YzAgMjUuMjE2LTMxLjkxNSAzNi4xNi00Ny4zODggMTYuMjU2bC00OC4zOTItNjIuMjUxdjc1LjQ4NGMwIDIxLjkzOS0xNy43ODQgMzkuNzIzLTM5LjcyMiAzOS43MjNoLTc2LjM2QzE5Ljc2MyAyNTYgMCAyMzYuMjM4IDAgMjExLjg2MXptNDQuMTM5LTguODI1YTguODE3IDguODE3IDAgMCAwLTguODI1IDguODE4djE2Ny43M2MwIDQuODc4IDMuOTQ2IDguODMxIDguODE4IDguODMxaDc3LjY4OGMyLjQ0IDAgMy4wODctMS45NzcgMy4wODctNC40MTZ2LTEwMS4yMmMwLTI1LjIyMiAzMS45MTQtMzYuMTY2IDQ3LjM5NS0xNi4yNTVsNDguMzkxIDYyLjI0M1Y0NC4xNGMwLTQuODc5LjQ1NS04LjgyNS00LjQxNi04LjgyNXoiLz48cGF0aCBmaWxsPSIjNjNGNjU1IiBkPSJNMjExLjg2MSAwQzIzNi4yMzggMCAyNTYgMTkuNzYyIDI1NiA0NC4xMzl2MTQyLjY0OWMwIDI1LjIxNi0zMS45MTUgMzYuMTYtNDcuMzg4IDE2LjI1NmwtNDguMzkyLTYyLjI1MXY3NS40ODRjMCAyMS45MzktMTcuNzg0IDM5LjcyMy0zOS43MjIgMzkuNzIzYTQuNDEgNC40MSAwIDAgMCA0LjQwOS00LjQwOVYxMTUuMDU4YzAtMjUuMjIzIDMxLjkxNC0zNi4xNjcgNDcuMzk1LTE2LjI1Nmw0OC4zOTEgNjIuMjQzVjguODI1YzAtNC44NzEtMy45NTMtOC44MjUtOC44MzItOC44MjUiLz48L3N2Zz4=
