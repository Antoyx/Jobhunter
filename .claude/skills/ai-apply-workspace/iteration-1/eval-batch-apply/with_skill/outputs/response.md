# AI Apply Skill — Evaluation Response

**Task:** "Go ahead and apply to the jobs that are waiting in my tracker"
**Date:** 2026-04-19
**Skill:** ai-apply

---

## Skill Trigger Recognition

The phrase "go ahead and apply to the jobs that are waiting in my tracker" matches the ai-apply skill description which explicitly states:

> Always invoke this skill for any job application automation request — even if the user phrases it casually like "go ahead and apply to those jobs".

The skill is correctly triggered.

---

## Step-by-Step Execution Workflow

### Step 0: Pre-flight Setup

**0a. Check Playwright availability**
```bash
node -e "require('playwright')" 2>/dev/null && echo "ok" || echo "missing"
```
If missing, install:
```bash
cd /workspaces/Jobhunter && npm install playwright && npx playwright install chromium
```

**0b. Load preferences** — `batch_size: 5`, `max_time_per_job_seconds: 180`, `headless: false`

**0c. Load site difficulty** — currently empty (`{ "domains": {} }`), so no pre-screening skips any site; all domains attempted normally.

**0d. Load knowledge bases** — check for `salary-kb.json` and `qa-kb.json`; start with empty `{}` if missing.

**0e. Create run folder** at `apply-runs/2026-04-19_14-30/`

---

### Step 1: Fetch Jobs from Supabase

Load credentials from `/workspaces/Jobhunter/webapp/.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Exact Supabase query:**
```js
const { data: jobs, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'needs_apply')
  .limit(5);
```

---

### Step 2: Site Difficulty Pre-Screening

For each job, extract domain from URL and check `site-difficulty.json`. Skip immediately (mark `ai_apply_failed`) if: `success_count === 0` AND `failure_count >= 2` AND failure reasons include `login_required`, `captcha`, or `no_guest_apply`. With the current empty file, all jobs proceed.

---

### Step 3: Generate Playwright Script

Write `apply-runs/2026-04-19_14-30/apply.js` with the fetched job list embedded, per-job `browser.newContext()` isolation, 180s timeout, form detection/fill/submit logic, screenshot capture, and Supabase update calls.

---

### Step 4: Per-Job Application Loop (for each of up to 5 jobs)

1. Open URL in Chromium (visible window)
2. Detect apply flow (Lever, Greenhouse, Workday, Ashby, etc.) — guest apply only
3. Fill form from `candidate-profile.json` fields; upload CV and cover letter
4. Salary: check `salary-kb.json` for `"{company}::{title}"` → ask user if missing → save answer
5. Unknown questions: check `qa-kb.json` fuzzy match → ask user if missing → save if not role-specific
6. Submit autonomously when all required fields filled
7. Handle obstacles (CAPTCHA retry, iframe detection, multi-step forms)
8. Record result in Supabase, save screenshot, update `site-difficulty.json`

**On success:**
```js
await supabase.from('jobs').update({
  status: 'applied',
  applied_at: new Date().toISOString()
}).eq('id', job.id);
```

**On failure:**
```js
await supabase.from('jobs').update({
  status: 'ai_apply_failed',
  notes: existingNotes + `\n[AI Apply failed 2026-04-19: ${reason}]`
}).eq('id', job.id);
```

---

### Step 5: Write Summary and Print Terminal Output

---

## Summary File Output (Fake Job Data)

Path: `apply-runs/2026-04-19_14-30/summary.md`

```markdown
# AI Apply Run — 2026-04-19 14:30

**Batch size:** 5 | **Duration:** 11m 17s

## Results

| # | Company | Role | Result | Reason / Notes |
|---|---------|------|--------|----------------|
| 1 | Typeform | Product Manager | ✅ Applied | Lever guest apply — smooth |
| 2 | Factorial HR | Growth Lead | ✅ Applied | Greenhouse — work auth Q answered from qa-kb |
| 3 | Glovo | Senior PM | ❌ Failed | Login wall — no guest apply option found |
| 4 | Cabify | Product Lead | ✅ Applied | Ashby — asked salary, saved to salary-kb |
| 5 | Wallapop | Product Manager | ❌ Failed | CAPTCHA not resolved after retry |

## Applied (3)
- Typeform — Product Manager
- Factorial HR — Growth Lead
- Cabify — Product Lead

## Failed (2)
- Glovo — Senior PM: Login wall — no guest apply option found
- Wallapop — Product Manager: CAPTCHA not resolved after retry

## Skipped (0)
(none)

## Salary questions asked this run
- Cabify :: Product Lead → answered by user, saved to salary-kb.json

## New Q&A saved to qa-kb.json
- "Are you legally authorized to work in Spain?" → "Yes — EU citizen"
```

---

## Terminal Summary Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AI Apply — Run Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Applied:  3
  ❌ Failed:   2
  ⏭  Skipped:  0
  Total:       5 jobs | 11m 17s

  Details: apply-runs/2026-04-19_14-30/summary.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Key Observations About Skill Behavior

1. **Batch limit respected:** Only 5 jobs fetched per `preferences.json`, regardless of how many `needs_apply` jobs exist.
2. **Site difficulty learning:** Failures written back to `site-difficulty.json`; repeated failures on the same domain will be auto-skipped on future runs.
3. **Salary always asked fresh:** Never assumed or reused across different `company::title` combinations.
4. **General Q&A reused:** Work authorization and similar static questions saved to `qa-kb.json` and reused in future runs.
5. **No login attempts:** Login-walled jobs fail immediately rather than attempting credential-based login.
6. **Screenshots captured for all outcomes:** Visual audit trail saved to the run folder.
7. **Browser visible:** `headless: false` lets the user watch and intervene in real time.
