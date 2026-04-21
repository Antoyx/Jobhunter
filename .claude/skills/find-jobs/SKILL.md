---
name: find-jobs
description: >
  Searches for relevant job listings online and adds them to the Jobhunter Supabase
  database with status `prospect`. Verifies each listing is live before inserting.
  Estimates salary when not listed and tags it as estimated. Deduplicates against
  existing DB entries. Use this skill whenever the user says "find jobs", "search for
  jobs", "hunt for jobs", "add jobs to pipeline", "find me jobs", "look for jobs",
  "source jobs", or invokes /find-jobs — even phrased casually like "can you find some
  PM roles in Barcelona?" or "go add some jobs to the pipeline". Always invoke this
  skill for any job discovery or sourcing request.
---

# Find Jobs Skill

You are running the Jobhunter Find Jobs agent. Your job is to search for relevant job
listings, verify they are live, and insert them into the Supabase `jobs` table as
`prospect` records.

## Quick-start checklist

1. **Load preferences** from `preferences.json`
2. **Load site difficulty data** from ai-apply's `site-difficulty.json`
3. **Search** for jobs using WebSearch across multiple queries in parallel
4. **Filter and score** results for relevance, location, salary, and site preference
5. **Verify** each URL is live (HTTP 200, no "expired" page)
6. **Deduplicate** against existing Supabase job URLs
7. **Determine salary** (use listed salary or estimate + tag)
8. **Insert** verified jobs into Supabase with `status: 'prospect'`
9. **Print summary**

---

## File locations

All paths relative to `/workspaces/Jobhunter/`:

| File | Purpose |
|------|---------|
| `.claude/skills/find-jobs/preferences.json` | Search preferences (titles, locations, etc.) |
| `.claude/skills/ai-apply/site-difficulty.json` | Per-domain apply success/failure history (READ ONLY) |
| `webapp/.env.local` | Supabase credentials |
| `cv.md` | Candidate profile for relevance matching |

---

## Step 1: Load preferences

Read `.claude/skills/find-jobs/preferences.json`. All search parameters come from this file:

- `max_results` — cap on how many jobs to insert per run
- `locations` — target locations (e.g. Barcelona, Remote, Hybrid)
- `job_types` — employment types (full-time, part-time, contract)
- `titles` — target role titles
- `salary_min` — minimum salary filter (null = no filter)
- `salary_currency` — default currency for estimates
- `site_preference` — `"any"`, `"ai_friendly"`, or `"manual_only"`
- `keywords` — extra search keywords to include
- `exclude_keywords` — terms that disqualify a listing

---

## Step 2: Load site difficulty data

Read `.claude/skills/ai-apply/site-difficulty.json`. Build:

- `ai_friendly_domains`: domains where `success_count > 0`
- `blocked_domains`: domains where `success_count == 0` AND 2+ failures with reasons `captcha`, `login_required`, or `no_guest_apply`

These are used for scoring if `site_preference != "any"`. Do NOT write to this file — it is owned by the ai-apply skill.

---

## Step 3: Search for jobs

**Mandatory rotation — read this before writing a single query.**

You MUST cover ALL titles and ALL locations from `preferences.json`, not just the most obvious ones. Use this algorithm:

1. Take every title from `preferences.titles`.
2. Take every location from `preferences.locations` (treat "Remote" and "Hybrid" as separate location terms).
3. Build a query for **each unique (title, location) pair** — that means if there are 9 titles × 7 locations = 63 pairs. You won't run 63 queries, but you must **not default to the same 2–3 pairs every run**.
4. **Distribute queries evenly**: split pairs into batches and rotate which ones you use each run. Prioritise pairs that are under-represented in prior results (i.e. non-PM, non-Barcelona titles/locations should appear in every run).
5. Run **12–16 parallel WebSearch calls** per run — more than the minimum to compensate for dead links and duplication.

**Required coverage per run:**
- At least 3 different titles (not all "Product Manager")
- At least 3 different locations (not all "Barcelona")
- At least 2 queries targeting non-city locations ("Remote", "Hybrid")
- At least 2 queries using non-PM titles (e.g. "Delivery Manager", "Scrum Master", "Program Manager")

**Query patterns to use:**
- `"<title>" <location> job 2026`
- `"<title>" <location> hybrid OR remote job opening`
- `"<title>" <location> site:welcometothejungle.com OR site:linkedin.com/jobs`
- `"<title>" remote Europe site:himalayas.app OR site:weworkremotely.com`
- `"<title>" <location> apply 2026 site:jobs.ashbyhq.com OR site:apply.workable.com`

Also fetch job board search pages directly (substitute title and location):
- `https://himalayas.app/jobs?q=<title>&l=remote`
- `https://www.welcometothejungle.com/en/jobs?query=<title>&where=<location>`
- `https://builtin.com/jobs/eu/spain/<location>/product/search/<title-slug>`

For each result, collect: `company`, `title`, `url`, `location`, `description snippet`, `salary` (if visible), `domain/platform`.

---

## Step 4: Filter and score results

For each candidate job, apply these checks in order:

1. **Title relevance** — title must loosely match a target in `preferences.titles`. Be generous:
   - "Head of Product" → matches "Product Manager"
   - "Agile Coach" → matches "Scrum Master"
   - "Technical PM" → matches "Technical Project Manager"
   - Reject anything clearly unrelated (e.g. "Sales Engineer", "Data Analyst")

2. **Location match** — must match one of `preferences.locations`, or be explicitly remote/hybrid. Reject if location is office-only in a non-matching city.

3. **Salary floor** — if `salary_min` is set and the listing shows a salary below it, skip.

4. **Exclude keywords** — skip if any `exclude_keywords` term appears in the title or description snippet.

5. **Site preference scoring** — adjust rank (don't hard-remove) based on `site_preference`:
   - `"ai_friendly"`: bump up listings from `ai_friendly_domains`, bump down `blocked_domains`
   - `"manual_only"`: bump up `blocked_domains`, bump down `ai_friendly_domains`
   - `"any"`: no site-based adjustment

Sort by: relevance score → location match quality → site preference score.
Trim to `max_results` best candidates before verification.

---

## Step 5: Verify each URL is live

For each job in the trimmed list, fetch the URL using WebFetch. Confirm it's a valid, live listing:

**Skip silently if:**
- HTTP 404 or 403
- Redirects to the job board's homepage (not a specific job)
- Page contains phrases like "this job is no longer available", "position has been filled", "expired", "job not found"

**If live:** extract the full job description text from the page (all body copy — responsibilities, requirements, about the company, etc.). Store this as the job's `description` for DB insertion.

Keep a count of dead URLs for the summary.

---

## Step 6: Deduplicate against Supabase

Connect to Supabase using credentials from `webapp/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use `@supabase/supabase-js`. Query existing URLs:

```js
const { data: existing } = await supabase
  .from('jobs')
  .select('url')
```

Build a Set of existing URLs. Skip silently any job whose URL is already in the DB.

---

## Step 7: Determine salary

For each verified, non-duplicate job:

**If salary is listed on the page:** parse `salary_min` and `salary_max` from the text. Detect currency from context (€, $, £, etc.).

**If salary is NOT listed:** estimate based on:
- Role title and apparent seniority level
- Location (Barcelona vs Remote vs other EU)
- Industry and company size/stage (startup vs enterprise)
- Current market rates (use your knowledge of 2025/2026 EU tech market)

Then append `[estimated salary]` to the job's `notes` field.

**Always** populate `salary_min`, `salary_max`, and `salary_currency`. Never insert a job with null salary fields. Default currency to `preferences.salary_currency` (EUR) unless the job clearly pays in another currency.

**Rough benchmarks for EUR estimates (Barcelona/Remote, 2026):**
- Junior PM / Scrum Master: 45,000–60,000
- Mid PM / Delivery Manager: 60,000–80,000
- Senior PM / Program Manager: 80,000–110,000
- Head of Product / Director: 100,000–140,000

---

## Step 8: Insert into Supabase

For each verified, deduplicated job:

```js
await supabase.from('jobs').insert({
  company,             // string
  title,               // string
  url,                 // string (full URL)
  location,            // string (e.g. "Barcelona, Spain" or "Remote")
  salary_min,          // integer
  salary_max,          // integer
  salary_currency,     // string (e.g. "EUR", "USD")
  status: 'prospect',
  platform,            // domain of the job board (e.g. "linkedin.com")
  description,         // full job description text (extracted from the verified listing page)
  source: 'find-jobs skill',
  notes                // "[estimated salary]" if estimated, else null
})
```

If an insert fails, log the error and continue — don't abort the whole run.

---

## Step 9: Print summary

After all inserts, print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Find Jobs — Run Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔍 Found:      34 candidates
  ✅ Verified:   22 live listings
  ⏭  Skipped:    12 (8 dead URLs, 4 duplicates)
  💾 Added:      22 jobs as 'prospect'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then list each added job:
```
  • Spotify — Product Manager — Remote — €70,000–90,000
  • Glovo — Delivery Manager — Barcelona — €65,000–80,000 [estimated]
```

---

## Candidate profile (for relevance matching)

**Anto Leivategija** — Product/Delivery Manager
- Background: Klarna (Delivery Manager), ABB (Application Manager), AutoVex (Product Manager)
- Skills: Product roadmaps, cross-functional teams, agile, ecommerce, PLM, UX
- Location: Helsinki → seeking Barcelona or Remote
- Target roles: Product Manager, Delivery Manager, Program Manager, Project Manager, Scrum Master, Technical Project Manager
- Languages: English (excellent), Finnish (native), Spanish (intermediate), Estonian (native)

Refer to `cv.md` in the project root for the full profile when assessing relevance.

---

## Important rules

- **Never insert without URL verification** — always confirm HTTP 200 first
- **Never skip salary** — always populate `salary_min`/`salary_max`, even if estimated
- **Always tag estimated salary** — append `[estimated salary]` to `notes`
- **Deduplicate silently** — no warnings, just skip
- **Respect `max_results`** — cap total inserts per run
- **Do not write to `site-difficulty.json`** — that file belongs to ai-apply
- **Use `source: 'find-jobs skill'`** on all inserts
