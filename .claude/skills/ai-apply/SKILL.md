---
name: ai-apply
description: >
  Automatically applies to jobs stored in the Jobhunter Supabase database.
  Use this skill whenever the user says "apply to jobs", "run ai apply", "start applying",
  "apply for me", "batch apply", or invokes /ai-apply. The skill fetches jobs with
  status `needs_apply`, uses Playwright browser automation to fill and submit
  guest/one-click apply forms, asks the user for salary and unknown questions
  interactively (saving answers for future reuse), tracks which sites work and
  which don't, and updates job statuses in Supabase. Always invoke this skill
  for any job application automation request — even if the user phrases it
  casually like "go ahead and apply to those jobs".
---

# AI Apply Skill

You are running the Jobhunter AI Apply agent. Your job is to autonomously apply to job listings
on behalf of Anto Leivategija, using browser automation.

## Quick-start checklist

Before doing anything else, run through this in order:

1. **Check/install Playwright** (see Installation section)
2. **Load preferences** from `preferences.json`
3. **Load site difficulty knowledge** from `site-difficulty.json`
4. **Load Q&A knowledge bases** (`salary-kb.json`, `qa-kb.json`) if they exist
5. **Fetch jobs** with `status = needs_apply` from Supabase (up to `batch_size`)
6. **For each job:** attempt to apply (see Per-Job Workflow)
7. **Write run summary** to `apply-runs/YYYY-MM-DD_HH-MM/summary.md`
8. **Print terminal summary**

---

## File locations

All paths are relative to `/workspaces/Jobhunter/`:

| File | Purpose |
|------|---------|
| `.claude/skills/ai-apply/preferences.json` | Batch size, timeout, headless mode |
| `.claude/skills/ai-apply/site-difficulty.json` | Per-domain success/failure history |
| `.claude/skills/ai-apply/salary-kb.json` | Salary answers keyed by `company::title` |
| `.claude/skills/ai-apply/qa-kb.json` | General Q&A answers keyed by question text |
| `Anto Leivategija CV.pdf` | Candidate CV — attach and use for all details |
| `Anto Leivategija Cover Letter.pdf` | Cover letter — attach when the form allows |
| `apply-runs/` | Run output folder (gitignored) |

---

## Installation check

Before starting, verify Playwright is available:

```bash
node -e "require('playwright')" 2>/dev/null && echo "ok" || echo "missing"
```

If missing, install it (this only needs to happen once):

```bash
cd /workspaces/Jobhunter && npm install playwright && npx playwright install chromium
```

---

## Supabase connection

Load credentials from `/workspaces/Jobhunter/webapp/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the `@supabase/supabase-js` client. The table is `jobs`.

**Fetch jobs to apply:**
```js
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'needs_apply')
  .limit(batchSize)
```

**Mark applied:**
```js
await supabase.from('jobs').update({
  status: 'applied',
  applied_at: new Date().toISOString()
}).eq('id', job.id)
```

**Mark failed:**
```js
await supabase.from('jobs').update({
  status: 'ai_apply_failed',
  notes: existingNotes + `\n[AI Apply failed ${date}: ${reason}]`
}).eq('id', job.id)
```

---

## Site difficulty pre-screening

Before attempting a job, look up the domain in `site-difficulty.json`.

**Skip immediately** (mark `ai_apply_failed` with reason "known blocker: {reason}") if:
- The site has 0 successes AND 2+ failures with reasons like `login_required`, `captcha`, or `no_guest_apply`

**Proceed with caution** (try but expect difficulty) if:
- The site has mixed results or failure reasons like `timeout` or `form_error` — these are worth retrying

If the site has no history, attempt normally.

---

## Per-job workflow

Each job gets a maximum of **`max_time_per_job_seconds`** (default: 180s).

### Step 1: Open the job URL

Use Playwright with `headless: false` (unless preferences say otherwise).
Set a page timeout matching `max_time_per_job_seconds`.

### Step 2: Detect apply flow

Look for:
- "Apply" / "Apply Now" / "Easy Apply" / "Quick Apply" buttons
- Guest apply options (avoid anything requiring sign-in/login)
- LinkedIn Easy Apply, Greenhouse, Lever, Workday, Ashby, Recruitee, SmartRecruiters flows

If you see a login wall with no guest option visible, try scrolling or looking for "Continue as guest" / "Apply without account" before giving up.

### Step 3: Fill the form

Use these sources for form fields:

**Personal info** — load from `candidate-profile.json` (gitignored, never commit):
```
.claude/skills/ai-apply/candidate-profile.json
```
Fields: `name`, `firstName`, `lastName`, `email`, `phone`, `location`, `city`, `country`, `linkedin`, `workAuthorization`

**File uploads** — paths are in `candidate-profile.json` as `cvPath` and `coverLetterPath`.

**Salary fields:**
Check `salary-kb.json` for key `"{company}::{title}"` first.
If not found, ask the user interactively (use AskUserQuestion tool or prompt).
Save the answer to `salary-kb.json` under that key after asking.
Do NOT reuse a salary from a different role even at the same company.

**Unknown questions:**
Check `qa-kb.json` using the question text as the key (fuzzy match: if 80%+ similar, treat as same question).
If not found, ask the user.
Save to `qa-kb.json` only if the question is NOT role-specific (e.g. "years of experience for X role" should NOT be saved as reusable).
Role-specific answers: apply but do not save to the knowledge base.

### Step 4: Submit

If all required fields are filled, submit autonomously — do not ask for confirmation.
Take a screenshot of the confirmation/thank-you page on success.

If a required field is missing and cannot be answered from available sources, ask the user before giving up.

### Step 5: Handle obstacles

Try these before marking as failed:
- CAPTCHA: wait 10s and try again once; if still blocked, record as `captcha` failure
- Missing apply button: scroll the page, check iframes, try keyboard navigation
- Timeout on form load: refresh once
- Unexpected redirect: check if it's still a valid application flow
- Multi-step form: track page state and continue through steps

### Step 6: Record result

**On success:**
- Update Supabase: `status = applied`, `applied_at = now()`
- Save screenshot to `apply-runs/{run-folder}/{company}-{title}-success.png`
- Update `site-difficulty.json`: increment `success_count` for domain

**On failure:**
- Update Supabase: `status = ai_apply_failed`, append failure note to `notes`
- Save screenshot to `apply-runs/{run-folder}/{company}-{title}-failed.png`
- Update `site-difficulty.json`: increment `failure_count`, add reason to `failure_reasons[]`, update `last_failure_reason`

---

## site-difficulty.json schema

```json
{
  "domains": {
    "lever.co": {
      "success_count": 3,
      "failure_count": 1,
      "failure_reasons": ["timeout"],
      "last_failure_reason": "timeout",
      "notes": "Has guest apply. Fill name/email first, then upload CV.",
      "last_updated": "2026-04-19"
    }
  }
}
```

Initialize with `{ "domains": {} }` if the file doesn't exist.

---

## salary-kb.json schema

```json
{
  "Acme Corp::Product Manager": 85000,
  "TechCo::Senior Developer": 95000
}
```

---

## qa-kb.json schema

```json
{
  "Are you legally authorized to work in the EU?": "Yes — EU citizen",
  "How did you hear about this position?": "Job board",
  "Do you have a driver's license?": "Yes"
}
```

---

## Run output (apply-runs/)

Create folder: `apply-runs/YYYY-MM-DD_HH-MM/`

Write `summary.md` with this format:

```markdown
# AI Apply Run — 2026-04-19 14:30

**Batch size:** 5 | **Duration:** 8m 42s

## Results

| # | Company | Role | Result | Reason / Notes |
|---|---------|------|--------|----------------|
| 1 | Acme Corp | Product Manager | ✅ Applied | |
| 2 | TechCo | Developer | ❌ Failed | Login wall — no guest apply |
| 3 | StartupXY | Growth Lead | ✅ Applied | |

## Applied (2)
- Acme Corp — Product Manager
- StartupXY — Growth Lead

## Failed (1)
- TechCo — Developer: Login wall — no guest apply

## Skipped (0)
(none)
```

---

## Terminal summary

After the run, print a clear summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AI Apply — Run Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Applied:  2
  ❌ Failed:   1
  ⏭  Skipped:  0
  Total:       3 jobs | 8m 42s

  Details: apply-runs/2026-04-19_14-30/summary.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Writing the Playwright automation script

Write a Node.js script to `apply-runs/{run-folder}/apply.js` at the start of each run.
This script is generated fresh per run (it includes the job list from Supabase).
See `scripts/playwright-helpers.js` for reusable page interaction utilities.

Key patterns for the script:
- Use `browser.newContext()` per job to avoid cookie/session bleed between applications
- Always `await context.close()` in a finally block
- Use `page.setDefaultTimeout(max_time_per_job_seconds * 1000)`
- For file uploads: `await page.setInputFiles('input[type="file"]', filePath)`
- For iframes: `const frame = page.frameLocator('iframe[src*="greenhouse"]')`

---

## Important reminders

- **Never attempt login flows** — guest apply only. If login is the only option, fail immediately.
- **Never invent answers** — if you don't know and can't ask, fail gracefully rather than guessing.
- **Salary is role-specific** — always ask fresh for each unique company+title combination.
- **Reuse general answers** — things like work authorization, driver's license, notice period are consistent and should be reused from `qa-kb.json`.
- **The site-difficulty file is shared knowledge** — it helps every future run. Keep it accurate.
- **Screenshots are evidence** — take them regardless of success or failure; they're useful for the user to review.
