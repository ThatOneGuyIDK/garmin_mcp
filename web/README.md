# Grindstone 100K — Training Plan UI

A single-page calendar for the 45-week build (Nov 16, 2026 – Sep 25, 2027): the sub-3:45 Charlottesville Marathon on April 3, 2027, then the Grindstone 100K on September 25, 2027.

- **Calendar** — month grid with every long run, back-to-back, and easy day. Click a workout for details and the week summary. Use **Marathon** and **Race week** to jump to each race.
- **Phases** — the ten blocks, weekly mileage, long-run progression, and vert.
- **Race day** — execution rules and pacing for both races, plus cutoff math and course facts.
- **Download .ics** — import the whole plan into Google Calendar, Apple Calendar, or Outlook.

## Local development

```bash
cd web
npm install
npm run dev
```

Open the printed localhost URL.

## Deploy to Vercel

The repo root has a `vercel.json` that builds from `web/`. Import the repo in Vercel and deploy — no dashboard settings needed. The config runs:

- install: `npm install --prefix web`
- build: `npm run build --prefix web`
- output: `web/dist`

Alternatively, set the Vercel **Root Directory** to `web` and use the Vite preset.

## Privacy / access control

The deployed site is public by default. Options, easiest first:

### Vercel Authentication (free, recommended)

In the Vercel project: **Settings → Deployment Protection → Vercel Authentication**, then choose the **All Deployments** scope. Visitors must sign in with a Vercel account that has access to the project. As of September 2026 this covers production domains on every plan, including Hobby, at no cost.

This is the simplest real lock: no code, no extra service, and the plan data and JS bundle are not served until the visitor authenticates.

### Password Protection (paid)

Vercel **Password Protection** is available on Pro for $20/month per protected project, or included on Enterprise. It is not available on Hobby. Configure it under **Settings → Deployment Protection**.

### Edge Middleware Basic Auth (free, custom password)

If you want a simple username/password prompt instead of a Vercel login, a small `middleware.ts` at the project root can gate every route with HTTP Basic Auth and credentials from Vercel environment variables. This is free on Hobby, but it changes the deployment slightly (the middleware must sit at the Vercel project root, so either deploy with **Root Directory** set to `web` or add a root `package.json` with `@vercel/edge`). Ask and I can wire it up.

### Cloudflare Access (free alternative)

Host the static `dist/` on Cloudflare Pages and put Cloudflare Zero Trust Access in front. Access supports email one-time codes and Google/GitHub login for a small list of people, free for up to 50 users. Good if you want to share with a few people who do not have Vercel accounts.

### Local only

```bash
cd web
npm run dev
```

Nothing is published; the plan is only reachable at `localhost`.

> The repo also ships `robots.txt` and an `X-Robots-Tag: noindex` header so search engines do not index the site. That is defense in depth, **not** access control.

Also make the GitHub repo private if you do not want the plan data in the source code to be public. That hides the source, not the deployed site.

## Editing the plan

All dates and workouts live in [`src/data/plan.ts`](src/data/plan.ts). Each week is one entry in `SPECS`:

```ts
{ phase: 'marathon', long: 20, sun: 8, tue: 9, thu: 4, tueType: 'mp', longType: 'mp', note: 'Last 6 mi at marathon pace.' }
```

`tueType` controls the Tuesday quality session (`easy`, `mp`, `tempo`, `hills`, `strides`, `sharp`) and `longType` controls the Saturday long-run description (`trail`, `easy`, `mp`, `hills`, `recovery`). A race week sets `race: true` plus `raceType: 'marathon'` or `'grindstone'`.

Week starts are generated from `PLAN_START` (Monday, Nov 16, 2026), so changing a spec re-flows the calendar automatically. Race details (date, start time, course, goal) are in the `MARATHON` and `RACE` constants.
