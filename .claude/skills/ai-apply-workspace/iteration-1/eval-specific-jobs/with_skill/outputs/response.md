# AI Apply — Skill Evaluation Response

**Task:** Apply to 3 jobs with status `needs_apply`
**Date:** 2026-04-19
**Candidate:** Anto Leivategija

---

## 1. Complete Planned Workflow

### Pre-flight (runs once before any job)

1. **Check Playwright** — `node -e "require('playwright')"`. Install if missing.
2. **Load preferences** from `.claude/skills/ai-apply/preferences.json` — `batch_size: 5`, `max_time_per_job_seconds: 180`, `headless: false`
3. **Load site-difficulty.json** — currently `{ "domains": {} }` (no history)
4. **Load salary-kb.json / qa-kb.json** — start empty if files don't exist
5. **Load candidate-profile.json** — personal info, CV path, cover letter path
6. **Connect to Supabase** using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `/workspaces/Jobhunter/webapp/.env.local`
7. **Fetch 3 jobs:**
   ```js
   const { data: jobs } = await supabase
     .from('jobs').select('*').eq('status', 'needs_apply').limit(5)
   ```
8. **Create run folder:** `apply-runs/2026-04-19_HH-MM/` and write `apply.js`

### Per-Job Workflow (for each of the 3 jobs)

- **Site difficulty pre-screen** — extract domain, check `site-difficulty.json`. No history → proceed.
- **Open URL in Playwright** — `browser.newContext()` per job (no session bleed), `page.setDefaultTimeout(180000)`
- **Detect apply flow** — scan for Apply/Easy Apply buttons, identify ATS (Lever, Greenhouse, Workday, Ashby, etc.), look for guest apply path. If login wall only → fail immediately, never log in.
- **Fill form** using `candidate-profile.json`: name, email, phone, location, LinkedIn, work auth, CV upload, cover letter upload. Salary via salary-kb.json (or ask). Unknown questions via qa-kb.json (or ask).
- **Submit autonomously** — no confirmation prompt if all fields are filled. Take confirmation screenshot.
- **Handle obstacles** — CAPTCHA: retry once after 10s. Timeout: refresh once. Multi-step form: continue through all steps.
- **Record result** — update Supabase status and `site-difficulty.json`.

### Post-run
Write `apply-runs/2026-04-19_HH-MM/summary.md` and print terminal summary.

---

## 2. Salary Question — Exact Interaction

Salary field found on form. Key `"Acme Corp::Product Manager"` not in `salary-kb.json`.

Agent pauses and asks:

> **"What salary are you targeting for the Product Manager role at Acme Corp? (This will be saved so you won't be asked again for this company + role combination.)"**

User replies: `72000`

Saved to `salary-kb.json`:
```json
{
  "Acme Corp::Product Manager": 72000
}
```

Key rules: the key is always `"{company}::{title}"`. A salary for "Acme Corp::Product Manager" is NOT reused for "Acme Corp::Senior Product Manager" — a new question is asked. Within this batch and in all future runs, the same key reuses the saved value silently.

---

## 3. Unknown Form Question — QA Knowledge Base Handling

**Example:** Form asks `"What is your expected notice period?"`

1. Check `qa-kb.json` for an exact or 80%+ fuzzy match — not found.
2. Agent pauses and asks:

   > **"The form asks: 'What is your expected notice period?' — I don't have this answer saved. What should I enter? (If this applies to all jobs, I'll save it for future use.)"**

3. User replies: `"2 weeks"`

4. Assess reusability — "notice period" is a general, non-role-specific question → save to `qa-kb.json`:
   ```json
   {
     "Are you legally authorized to work in the EU?": "Yes — EU citizen",
     "What is your expected notice period?": "2 weeks"
   }
   ```

   If the question were role-specific (e.g. "How many years of Salesforce experience do you have for this PM role?"), the answer is applied but NOT saved.

---

## 4. site-difficulty.json Update After Failed Attempt

**Example:** `linkedin.com` failed with `login_required`.

**Before:**
```json
{ "domains": {} }
```

**After:**
```json
{
  "domains": {
    "linkedin.com": {
      "success_count": 0,
      "failure_count": 1,
      "failure_reasons": ["login_required"],
      "last_failure_reason": "login_required",
      "notes": "",
      "last_updated": "2026-04-19"
    }
  }
}
```

**Future skip trigger:** If `linkedin.com` reaches `success_count: 0` AND `failure_count >= 2` with hard-blocker reasons (`login_required`, `captcha`, or `no_guest_apply`), all future jobs on that domain are skipped immediately and marked `ai_apply_failed` with reason `"known blocker: login_required"`.

---

## 5. Failure Note Appended to Supabase jobs.notes

**Existing notes value:** `"Interesting role, salary range 60-80k mentioned in JD."`

**Supabase update:**
```js
await supabase.from('jobs').update({
  status: 'ai_apply_failed',
  notes: existingNotes + `\n[AI Apply failed 2026-04-19: login_required — LinkedIn requires account login, no guest apply option found]`
}).eq('id', job.id)
```

**Resulting notes field in Supabase:**
```
Interesting role, salary range 60-80k mentioned in JD.
[AI Apply failed 2026-04-19: login_required — LinkedIn requires account login, no guest apply option found]
```

---

## Terminal Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AI Apply — Run Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Applied:  2
  ❌ Failed:   1
  ⏭  Skipped:  0
  Total:       3 jobs

  Details: apply-runs/2026-04-19_14-30/summary.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
