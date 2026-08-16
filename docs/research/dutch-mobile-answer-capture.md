# Mobile answer capture on a static github.io site

**Question:** Can a static GitHub Pages site — *this* site, `atilileri.github.io` — capture exercise answers typed on a phone and make them available back on the desktop, so a session can resume where it left off? The repo is **public**, so no secret can ship to the client.

**Ticket:** [#80](https://github.com/atilileri/atilileri.github.io/issues/80), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

**Date:** 2026-08-16

---

## TL;DR verdict

**Qualified yes — but not the way the question implies.** The site cannot *itself* receive and store an answer: it is a pure static build with no server, so nothing on `atilileri.github.io` can accept a POST. What a static page *can* do is **hand the answer off to a system that already has the user's login** — and GitHub is exactly that system, on the phone, for free, with no token anywhere.

The winning move is a **prefilled issue link**: the exercise page builds a `https://github.com/atilileri/atilileri.github.io/issues/new?title=…&body=…` URL from what was typed, the user taps it, GitHub's own mobile session authenticates them, they hit **Submit**. Answers land in the repo's issue tracker. The desktop agent reads them later with `gh issue list`. **No credential exists anywhere in this path** — verified working, including through the logged-out redirect (§3.1).

Three things make this the right answer rather than a compromise:

1. **The loop only has to close eventually.** The ticket's own framing — bus now, computer later — means an inbox is a complete solution, not a degraded one. Nothing here needs to be live.
2. **This map already locked "everything is public"** ([#74](https://github.com/atilileri/atilileri.github.io/issues/74)). Public issues are not a leak; they are the stated design. Every option below that is awkward *because* it publishes answers is, for this project, free of that cost.
3. **The credible alternatives all fail on the same rock.** The one genuinely token-free browser auth flow — OAuth device flow — is **blocked by CORS at GitHub's own endpoints**, verified directly (§2). Everything else that writes to the repo from the phone requires either a secret in a public artifact (fatal) or a second server (real work, real ongoing cost).

**The one thing to be blunt about:** `localStorage` alone **does not solve this problem.** It persists answers in a phone browser and has no path to the desktop agent. It is worth building as a *draft buffer* underneath the handoff, never as the handoff itself. See §3.3.

---

## 1. What this site actually is

Established from the repo, not assumed:

- **Static only, no adapter.** `astro.config.mjs` declares `site: "https://atilileri.github.io"` with integrations `mdx()` and `sitemap()` and a Tailwind Vite plugin — **no `adapter`, no `output: "server"`** (`/home/neo/projects/atilileri.github.io/astro.config.mjs`). Astro requires an adapter for any on-demand rendering: *"To render any page on demand, you need to add an adapter"* ([Astro — On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)). So there is no server-side code path at all today, and GitHub Pages could not run one if there were.
- **No `base` needed.** This is a user site at the domain root, so the `base` config the Astro deploy guide requires for project sites does not apply ([Astro — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)).
- **Deploy trigger: push to `main`/`master`, plus manual `workflow_dispatch`.** Build is `withastro/action@v3` on Node 24, deploy is `actions/deploy-pages@v4` (`/home/neo/projects/atilileri.github.io/.github/workflows/deploy.yml`). This matches Astro's documented recommendation — the official action, deploying *"a static, prerendered Astro website"* ([Astro — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)).
- **The current workflow cannot write back.** Its permissions block is `contents: read`, `pages: write`, `id-token: write` (`deploy.yml`). It can publish the site; it cannot commit to the repo. Any ingestion workflow (§4) must be a **separate** workflow with its own `contents: write`.
- **Host constraints.** GitHub Pages is *"a static site hosting service that takes HTML, CSS, and JavaScript files straight from a repository"* ([GitHub — What is GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). Limits: 1 GB repo (recommended), 1 GB published site, **100 GB/month soft bandwidth**, **10 builds/hour soft limit**, 10-minute deploy timeout. GitHub states plainly that Pages sites *"shouldn't be used for sensitive transactions like sending passwords or credit card numbers"* ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).

That last line is not decoration. It is GitHub telling you the exact thing option §3.5 wants to do.

**The 10-builds-per-hour ceiling matters for any design that commits answers to the repo**, because every commit to `main` triggers a rebuild (`deploy.yml`, `on: push`). An answer-per-commit design on a busy study session would burn through the soft limit. Batching — one commit per session, not per exercise — is a requirement, not a nicety.

---

## 2. The one technical fact that decides everything

Everything else in this document follows from a single asymmetry in GitHub's CORS policy, which I verified by request rather than by recollection.

**`api.github.com` is fully open to the browser.** A preflight from this exact origin returns:

```
$ curl -i -X OPTIONS "https://api.github.com/repos/atilileri/atilileri.github.io/issues" \
    -H "Origin: https://atilileri.github.io" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization,content-type"

HTTP/2 204
access-control-allow-origin: *
access-control-allow-methods: GET, POST, PATCH, PUT, DELETE
access-control-allow-headers: Authorization, Content-Type, …
access-control-max-age: 86400
```

So a static page **can** POST an issue or a commit directly from the phone — *if it already holds a token.*

**The token-issuing endpoints are closed to the browser.** The same probes against the OAuth endpoints return **no `access-control-allow-origin` header at all**, and `OPTIONS` is not even routed:

```
$ curl -i -X OPTIONS "https://github.com/login/device/code"      -H "Origin: https://atilileri.github.io" …
HTTP/2 404      # HTML 404 page; no access-control-* headers

$ curl -i -X POST    "https://github.com/login/device/code"      -H "Origin: https://atilileri.github.io" …
HTTP/2 404      # {"error":"Not Found"} — endpoint live, no access-control-* headers

$ curl -i -X OPTIONS "https://github.com/login/oauth/access_token" -H "Origin: https://atilileri.github.io" …
HTTP/2 404      # HTML 404 page; no access-control-* headers
```

Absent `Access-Control-Allow-Origin`, a browser `fetch()` from `atilileri.github.io` to either endpoint is rejected before your code sees a response. This is long-standing and deliberate, not a transient bug ([community discussion #169674](https://github.com/orgs/community/discussions/169674), [isaacs/github#330](https://github.com/isaacs/github/issues/330), [andreybleme — OAuth GitHub web flow doesn't support CORS](https://andreybleme.com/2018-02-24/oauth-github-web-flow-cors-problem/)).

**Read this together and the shape of the whole problem appears:**

> The GitHub API is reachable from a static page. **Obtaining credentials for it is not.** Any browser-only design must therefore either be *given* a token out of band, or avoid tokens entirely by borrowing GitHub's own session.

That is the fork in the road. Options §3.1 and §3.2 take the second branch. Options §3.4 onward take the first, and each pays for it.

---

## 3. The options

### 3.1 Prefilled issue link — **recommended**

**How it works.** The exercise page keeps answers in memory (and in `localStorage` as a draft buffer). A "Send to repo" button builds `https://github.com/atilileri/atilileri.github.io/issues/new?title=…&body=…&labels=…` with the answers URL-encoded into `body`, and navigates to it. GitHub renders its own issue composer, prefilled. The user reviews and taps **Submit new issue**.

GitHub documents this explicitly: *"Query parameters are optional parts of a URL you can customize to share a specific web page view, such as search filter results or an issue template on GitHub"*, with supported keys including `title`, `body`, `labels`, `milestone`, `assignees`, `projects`, and `template` ([GitHub — Creating an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue); [About automation for issues and PRs with query parameters](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/about-automation-for-issues-and-pull-requests-with-query-parameters)). Query params can also fill **custom fields in issue form templates**, which is the more structured variant worth considering once the content form is locked.

**Verified behaviour.** A prefilled URL against this repo, unauthenticated:

```
$ curl -o /dev/null -w "%{http_code} %{redirect_url}" \
    "https://github.com/atilileri/atilileri.github.io/issues/new?title=test&body=hello"

302 https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Fatilileri%2Fatilileri.github.io%2Fissues%2Fnew%3Ftitle%3Dtest%26body%3Dhello
```

Note the `return_to`: **the prefill survives the login round-trip**. A logged-out phone logs in and lands on the composer with the answers still in it. A logged-in phone — the normal case — goes straight there.

**Verified size ceiling.** GitHub documents that *"If you create a URL that exceeds the server limit, the URL will return a `414 URI Too Long` error page"* but does not state the number, so I measured it against this repo:

| `body` length | Result |
|---|---|
| 6,000 chars | `302` (accepted) |
| 8,000 chars | connection reset (curl exit 56) |
| 10,000 chars | `414 URI Too Long` |

The usable ceiling sits between 6 KB and 8 KB of total URL — consistent with a standard ~8 KB request-line limit. **6 KB of prose is far more than one bus ride of exercise answers**, but it is a hard cap: a design must chunk or truncate, not assume.

**Security posture: the best available.** No token is created, stored, or transmitted. Authentication is GitHub's own mobile session. The static page never holds a credential, so there is nothing to leak into the public artifact. The permission model is exactly the user's own: *"You must have the proper permissions for any action to use the equivalent query parameter"* ([query parameters doc](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/about-automation-for-issues-and-pull-requests-with-query-parameters)).

**Failure modes, honestly:**
- **Requires a manual tap.** The user must press Submit on GitHub's page. Not automatic, and never can be — that tap *is* the authentication.
- **Silent truncation risk above ~6 KB.** Must be handled in code, or a long session produces a `414` and the user loses the tap.
- **`labels` and `assignees` are silently ignored without push access** — irrelevant here (the user owns the repo) but a trap if the site is ever used by a reader.
- **Answers are public forever.** Locked as acceptable by [#74](https://github.com/atilileri/atilileri.github.io/issues/74); would be disqualifying on any other project.
- **Leaves the site.** The user is bounced to github.com mid-session and must navigate back. `localStorage` (§3.3) underneath makes that survivable.

**Effort: low.** One button, one URL builder, no infrastructure, no accounts, no secrets, nothing to rotate.

### 3.2 GitHub mobile app, freehand — the zero-build baseline

The user opens the GitHub mobile app and types answers into a comment on a tracking issue. The desktop agent reads them with `gh issue view`.

**Effort: zero.** It works today, with nothing built.

**Security posture: identical to §3.1** — the app's own OAuth session, no credential in the artifact.

**Failure mode:** there is no exercise UI. The user must remember what the exercise was and type unstructured text, so the agent gets prose it has to parse rather than fielded answers. It also does not use the site at all, which makes it a fallback rather than a feature.

**Worth stating plainly:** this baseline already closes the phone→desktop loop completely. Everything below must beat *this* to justify its cost, and most of it does not.

### 3.3 Browser-local only (`localStorage` / IndexedDB) — **does not solve the problem**

**Verdict first, because the ticket asks for it directly: no.** Answers in `localStorage` live in one browser profile on one device. There is no mechanism by which a desktop agent reads them. Origin-scoped storage is not synced, not readable by `gh`, not present in the repo. **An option that stores answers in localStorage and cannot get them to the repo has not solved the problem.**

It needs a bridge, and every bridge is really one of the other options:
- **Copy a JSON blob** and paste it into the desktop chat. Works; ugly; requires the phone and desktop to share a clipboard or the user to email themselves.
- **A QR code** encoding the answers, scanned from the desktop. QR tops out around 2–3 KB of text and needs a scanner on the desktop side — more moving parts than §3.1 for less reliability.
- **A prefilled issue link** — which is §3.1, and is why §3.1 is the recommendation.

**Where it genuinely earns its place: as the draft buffer underneath §3.1.** Answers survive the tab closing, the bus ride ending, and the bounce to github.com and back. This matters concretely because of how Astro's client router behaves: with `ClientRouter`, *"The `<body>` is completely replaced with the new page's body"*, and bundled module scripts *"are only ever executed once"* after initial execution ([Astro — View transitions](https://docs.astro.build/en/guides/view-transitions/)). In-memory answer state is therefore **destroyed by ordinary in-site navigation** unless it is either written to `localStorage` or its element is marked `transition:persist`. If the Dutch pages ever adopt `ClientRouter`, an in-memory-only answer form silently loses data when the user taps to the next exercise. Persist to `localStorage` on every keystroke.

**Effort: trivial. Loop closure on its own: zero.**

### 3.4 A fine-grained PAT held on the phone

The user creates a fine-grained PAT scoped to this one repo with `issues: write` (or `contents: write`), pastes it once into the site on the phone, and the page stores it in `localStorage` and calls `api.github.com` directly — which §2 proves is CORS-permitted.

Fine-grained PATs are genuinely well-suited on paper: *"Each token is limited to access resources owned by a single user or organization"*, *"can be further limited to only access specific repositories"*, and is *"granted specific, fine-grained permissions"* with a custom expiry ([GitHub — Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)). Rate limits are ample: 5,000 requests/hour authenticated, against 60/hour unauthenticated ([GitHub — REST API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28)).

**Does it leak into the public artifact? No — but read the next sentence.** The token is typed by the user at runtime and lives in `localStorage`, so it is *not* committed and *not* in the build. This is the crucial distinction from §3.5. However, GitHub's own guidance is *"Treat your access tokens like passwords"*, and GitHub Pages *"shouldn't be used for sensitive transactions like sending passwords"* ([Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) — you would be doing exactly that, on a page whose JavaScript is public and whose `localStorage` is readable by any XSS on the origin.

**Failure modes:**
- **Any XSS on `atilileri.github.io` exfiltrates a repo-write token.** The site is public and will grow; this is a permanent standing risk added to a project that currently has none.
- **Token expiry silently breaks the phone** mid-bus-ride, with a re-paste as the only fix. Infinite lifetimes are possible but make the XSS risk permanent.
- **Copying a token onto a phone** is genuinely unpleasant, and phone keyboards plus clipboard managers spread it further.
- Secondary rate limits also apply to writes: *"no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour"* ([rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28)).

**Effort: medium. Loop closure: complete and fully automatic** — this is the only browser-only option that needs no tap. It buys automation at the price of a standing credential-exfiltration surface, to save one button press over §3.1. **Not worth it here.**

### 3.5 OAuth device flow in the browser — **blocked, verified**

This is the option that *should* have won, and the one most likely to be assumed workable, so it deserves a clear negative.

The device flow is designed precisely for clients that cannot hold a secret. GitHub's docs confirm `client_secret` is **not** required — the device-code request takes only `client_id` and `scope`, returns a `user_code` the user types at `https://github.com/login/device`, and the client polls `https://github.com/login/oauth/access_token` with `grant_type=urn:ietf:params:oauth:grant-type:device_code` ([GitHub — Authorizing OAuth apps, device flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)). A public `client_id` in a public repo is fine by design. It would give a real, revocable, per-user token with no secret anywhere.

**It cannot be done from a browser.** Both endpoints live on `github.com`, and §2 shows directly that neither returns any `Access-Control-Allow-Origin` header — `OPTIONS` is not even routed, returning GitHub's HTML 404. A `fetch()` from `atilileri.github.io` is blocked by the browser before your code runs. The standard remedy in every write-up is *"create a server-side proxy"* — which a static Pages site does not have, and which is exactly §3.6.

Also worth noting even if it worked: the flow must be enabled in app settings (*"you must first enable it in your app's settings"*), the user code expires in 900 s, and user verification is capped at *"50 submissions in an hour per application"*.

**Verdict: not available to this site. Do not spend time on it.** A GitHub App using the standard web flow is worse still — it needs a `client_secret` at the token exchange, which on a public repo means publishing it. **That is the one option that unambiguously leaks a credential into a public artifact, and it is disqualified outright.**

### 3.6 A serverless proxy holding the token (Cloudflare Workers)

The honest way to get the automation of §3.4 without a token on the phone: a tiny Worker holds a fine-grained PAT as a server-side secret, exposes a POST endpoint, and writes the answer to the repo — as an issue comment, a commit, or a `repository_dispatch` event (*"trigger a webhook event called `repository_dispatch` when you want activity that happens outside of GitHub to trigger a GitHub Actions workflow"*; `client_payload` is capped at **10 top-level properties and <64 KB** — [GitHub — Create a repository dispatch event](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-dispatch-event)).

Free-tier headroom is enormous for this use case: **100,000 requests/day**, 10 ms CPU per request, 100 Workers per account ([Cloudflare — Workers limits](https://developers.cloudflare.com/workers/platform/limits/)). With KV for buffering: 100,000 reads/day but only **1,000 writes/day**, 1 GB storage, 25 MiB max value ([Cloudflare — KV limits](https://developers.cloudflare.com/kv/platform/limits/)).

**Security posture: good in principle, and the token genuinely never reaches the client.** But the endpoint is public and unauthenticated unless you add auth — and adding auth returns you to "how does the phone prove who it is without a secret?", the original problem. A shared bearer string in the page's JS *is* a secret in a public artifact. A rate-limited, write-only, single-repo-scoped endpoint is the usual compromise; its failure mode is a stranger spamming your issue tracker.

**Failure modes:** a second deploy target and a second thing to keep alive; a PAT that expires and takes the phone down with it; and an outage surface entirely outside GitHub.

**Effort: high** — new account, new deploy pipeline, new secret rotation. Sibling research [#81](https://github.com/atilileri/atilileri.github.io/issues/81) found no MCP servers and no third-party API credentials on this machine, so **assume a from-scratch Cloudflare signup**, not an existing account.

**Loop closure: complete.** This is the right answer if the loop ever must close *without a tap*. It is over-built for "eventually".

### 3.7 Form services (Formspree, and kin)

Point an HTML `<form>` at Formspree; submissions arrive by email and in a dashboard. Free tier: **50 submissions per month**, unlimited forms and projects, up to two notification emails, **30 days of submission history** ([Formspree — Account limits](https://help.formspree.io/articles/account-management/account-limits.md)).

**The disqualifying flaw is not the quota — it is the destination.** Answers land in an inbox, not in the repo. The desktop agent cannot read them without a mail integration, so this **replaces one bridging problem with another** while adding a vendor. 50/month is also thin for daily practice, and 30-day retention quietly deletes study history that this project explicitly wants kept and published.

**Security posture:** no credential in the artifact (the form endpoint ID is public by design and is not a secret). Fine. Just pointless here.

### 3.8 Supabase with a public anon key

Supabase is the one hosted DB whose client key is *designed* for this: *"Safe to expose online: web page, mobile or desktop app, GitHub actions, CLIs, source code"*, with data *"guarded by Postgres via the built-in `anon` and `authenticated` roles"* and Row Level Security as the real protection ([Supabase — API keys](https://supabase.com/docs/guides/api/api-keys)). The `service_role` secret key *"bypass[es] Row Level Security"* and must never ship — but it does not need to.

So this is a legitimate no-secret-leak option, and the free tier is generous on paper: 500 MB database, 50,000 MAU, 5 GB egress, 2 active projects ([Supabase — Pricing](https://supabase.com/pricing)).

**One line kills it for this use case:** *"Free projects are paused after 1 week of inactivity."* The scenario is intermittent bus study. A pause is not an edge case here — it is the **expected** state after a quiet week, and the failure lands exactly when the user is on a bus with no way to un-pause. That is the worst possible place for this failure to appear.

Secondary cost: an insert-only RLS policy written correctly on day one, with a public anon key, is the difference between "public by design" and "anyone can wipe the table". Getting RLS wrong is the classic Supabase incident.

**Effort: medium-high. Loop closure: complete while awake, zero while paused.**

### 3.9 Google Forms into a published sheet

A Google Form is free, unlimited, mobile-excellent, and auth-solved by the user's Google session. Responses collect in a Sheet, and a Sheet can be published to the web — Google states you can *"Publish the entire spreadsheet or individual sheets"* and *"choose a publishing format"*, visible *"to everyone on the web"* depending on account settings ([Google — Publish a file to the web](https://support.google.com/docs/answer/183965)).

If a CSV endpoint can be published, the desktop agent could simply `curl` it — genuinely attractive, and cheap.

**Flagged as not fully verified.** Google's own help page above does **not** name CSV among the formats, and the CSV URL patterns in circulation (`/export?format=csv`, `/pub?output=csv`) come from third-party tutorials and community threads, not Google documentation. Several of those same threads report the published-CSV link **404ing or silently returning stale data** ([Google Docs community — publish-to-web CSV link not working](https://support.google.com/a/thread/367830711/google-sheets-publish-to-the-web-csv-link-not-working-redirects-to-404?hl=en); [published spreadsheet — HTML accessible but TSV/CSV download not working](https://support.google.com/docs/thread/367834351/published-spreadsheet-to-web-html-accessible-but-tsv-csv-download-not-working)). **Do not build on this without testing the exact URL first.**

Even if it works: the exercises would live in Google Forms rather than on the site, so the site stops being where practice happens — which cuts against the whole point of a repo-native practice.

---

## 4. The desktop side, in every case

Whatever the phone does, the desktop agent needs to *find* the answers. Two paths, both cheap:

- **Agent reads on demand.** `gh issue list --label dutch-answers` at session start. Zero infrastructure. Fits the existing skill workflow, since this repo already runs its issue tracker through `gh` (`AGENTS.md`, `docs/agents/issue-tracker.md`). **This is enough, and it is what I recommend.**
- **A workflow ingests automatically.** A *new* workflow — not `deploy.yml`, whose `contents: read` forbids writing — triggered `on: issues: [opened]` or `on: issue_comment: [created]`, running with `permissions: contents: write`, transcribing the answer into a file and committing it ([GitHub — Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows); [GitHub — Automatic token authentication](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication), which confirms `GITHUB_TOKEN` permissions are set with the `permissions` key and recommends least privilege). **No PAT is needed** — `GITHUB_TOKEN` is issued per run.

  Two traps if you go this way: each commit re-triggers `deploy.yml`, so watch the **10 builds/hour** soft limit; and if you ever reach for `on: schedule` instead, note that *"In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days"* — a real risk for a study project with quiet months.

---

## 5. Ranking

Effort against how completely each option closes the phone→desktop loop.

| # | Option | Effort | Closes the loop? | Credential in public artifact? |
|---|---|---|---|---|
| **1** | **Prefilled issue link (§3.1)** | **Low** | **Fully, one tap** | **None anywhere** |
| 2 | GitHub mobile app, freehand (§3.2) | None | Fully, but unstructured | None anywhere |
| 3 | `localStorage` as draft buffer (§3.3) | Trivial | **Not at all, alone** | None |
| 4 | PAT on the phone (§3.4) | Medium | Fully, no tap | No — but a repo-write token sits in `localStorage`, exposed to any XSS |
| 5 | Cloudflare Worker proxy (§3.6) | High | Fully, no tap | No — token is server-side; the open endpoint is the exposure |
| 6 | Supabase + anon key (§3.8) | Med-high | Fully, until the project pauses after 1 week idle | No — anon key is designed public; `service_role` must never ship |
| 7 | Google Forms → sheet (§3.9) | Low-med | Probably, read path unverified | None |
| 8 | Formspree (§3.7) | Low | **No** — lands in email, not the repo | None |
| 9 | OAuth device flow in-browser (§3.5) | — | **Impossible — CORS blocked, verified** | n/a |
| 10 | GitHub App web flow (§3.5) | — | **Disqualified** | **Yes — `client_secret` would be published** |

**Recommendation for map [#74](https://github.com/atilileri/atilileri.github.io/issues/74): lock option 1, with option 3 underneath it.** Answers persist to `localStorage` as you type (surviving tab death and the Astro `ClientRouter` body swap); a "Send to repo" button builds a prefilled issue URL, chunking above ~6 KB; the desktop agent picks them up with `gh issue list`. **No secret, no vendor, no account, no token rotation, nothing to keep alive** — and the loop closes on the next session, which is all the scenario requires.

Revisit only if the requirement changes from *eventually* to *live*. At that point §3.6 is the honest upgrade, and it should be a deliberate decision to take on a second deploy target — not a drift.

Note that this remains a **nice-to-have** on map [#74](https://github.com/atilileri/atilileri.github.io/issues/74) ("it must not block the core"). The recommendation is deliberately the option that can be deferred and then built in an afternoon.

---

## Sources

Repo files read directly:

- `/home/neo/projects/atilileri.github.io/astro.config.mjs` — static config, no adapter, `site` set, no `base`.
- `/home/neo/projects/atilileri.github.io/.github/workflows/deploy.yml` — `on: push [main, master]` + `workflow_dispatch`; `permissions: contents: read, pages: write, id-token: write`; `withastro/action@v3` + `actions/deploy-pages@v4`.
- `/home/neo/projects/atilileri.github.io/package.json` — Astro 6, no adapter dependency.
- `/home/neo/projects/atilileri.github.io/AGENTS.md` and `docs/agents/issue-tracker.md` — issues tracked via `gh`.

Primary documentation opened directly:

- [GitHub — What is GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) — static hosting definition.
- [GitHub — GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — 1 GB site, 100 GB/month soft bandwidth, 10 builds/hour soft limit, 10-min timeout, "shouldn't be used for sensitive transactions".
- [GitHub — Creating an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue) — query-parameter issue creation; `414 URI Too Long` above the server limit.
- [GitHub — About automation for issues and PRs with query parameters](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/about-automation-for-issues-and-pull-requests-with-query-parameters) — supported keys; issue-form field prefill; "You must have the proper permissions".
- [GitHub — Authorizing OAuth apps (device flow)](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow) — `client_secret` not required; endpoints; 900 s expiry; 50 verifications/hour/app; must be enabled in app settings.
- [GitHub — Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) — fine-grained scoping to one owner/repo, custom expiry, "Treat your access tokens like passwords".
- [GitHub — REST API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28) — 60/hr unauthenticated, 5,000/hr authenticated, 80/min and 500/hr content-creation secondary limits.
- [GitHub — Create a repository dispatch event](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-dispatch-event) — external trigger; ≤10 top-level payload properties, <64 KB.
- [GitHub — Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) — `issues`, `issue_comment` activity types; scheduled workflows disabled after 60 days of inactivity in public repos.
- [GitHub — Automatic token authentication](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication) — `GITHUB_TOKEN`, `permissions` key, least privilege.
- [Astro — On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — "To render any page on demand, you need to add an adapter."
- [Astro — Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) — official action; "a static, prerendered Astro website"; `base` needed for project sites.
- [Astro — View transitions](https://docs.astro.build/en/guides/view-transitions/) — body fully replaced on navigation; bundled scripts run once; `transition:persist`; `data-astro-rerun`.
- [Cloudflare — Workers limits](https://developers.cloudflare.com/workers/platform/limits/) — Free: 100,000 req/day, 10 ms CPU, 100 Workers.
- [Cloudflare — KV limits](https://developers.cloudflare.com/kv/platform/limits/) — Free: 100,000 reads/day, 1,000 writes/day, 1 GB storage, 25 MiB value, 512 B key.
- [Supabase — Pricing](https://supabase.com/pricing) — Free: 500 MB DB, 50,000 MAU, 5 GB egress, **paused after 1 week of inactivity**, 2 active projects.
- [Supabase — API keys](https://supabase.com/docs/guides/api/api-keys) — publishable key "Safe to expose online"; RLS as the guard; `service_role` bypasses RLS.
- [Formspree — Account limits](https://help.formspree.io/articles/account-management/account-limits.md) — Free: 50 submissions/month, unlimited forms/projects, 2 notification emails, 30 days of history.

Measured directly with `curl` on 2026-08-16 (commands and outputs quoted in §2 and §3.1):

- `OPTIONS https://api.github.com/repos/atilileri/atilileri.github.io/issues` with `Origin: https://atilileri.github.io` → `204`, `access-control-allow-origin: *`, `Authorization` in allowed headers.
- `OPTIONS`/`POST https://github.com/login/device/code` and `OPTIONS https://github.com/login/oauth/access_token` with the same `Origin` → `404`, **no `access-control-*` headers**.
- `GET https://github.com/atilileri/atilileri.github.io/issues/new?title=test&body=hello` unauthenticated → `302` to `/login?return_to=…` with query parameters preserved.
- Prefill length ceiling against this repo: 6,000-char body → `302`; 8,000 → connection reset; 10,000 → `414`.

Secondary sources (community/third-party — used only to corroborate the measured CORS behaviour, and flagged where relied upon):

- [GitHub community discussion #169674](https://github.com/orgs/community/discussions/169674) and [isaacs/github#330 — "OAuth web flow endpoints don't support CORS"](https://github.com/isaacs/github/issues/330).
- [andreybleme — OAuth GitHub web flow doesn't support CORS](https://andreybleme.com/2018-02-24/oauth-github-web-flow-cors-problem/).

Not verified against a first-party source — flagged in §3.9, do not build on it untested:

- Google Sheets published-CSV URL formats (`/export?format=csv`, `/pub?output=csv`). [Google's own publish-to-web page](https://support.google.com/docs/answer/183965) does not name CSV among the formats; the patterns come from third-party tutorials, and community threads report the link 404ing ([thread 1](https://support.google.com/a/thread/367830711/google-sheets-publish-to-the-web-csv-link-not-working-redirects-to-404?hl=en), [thread 2](https://support.google.com/docs/thread/367834351/published-spreadsheet-to-web-html-accessible-but-tsv-csv-download-not-working)).
