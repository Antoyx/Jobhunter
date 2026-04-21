# AI Apply Skill — Simulated Batch Run

**Run date:** 2026-04-19 14:30
**Jobs in batch:** 5 (all `status = needs_apply`)
**site-difficulty.json at start:** `{ "domains": {} }` (empty)

---

## Pre-screening Step

`site-difficulty.json` is empty — no domain has any prior history. Per skill rule: *"If the site has no history, attempt normally."* No jobs are skipped. All 5 proceed to browser automation.

---

## Per-Job Walkthrough

### Job 1 — Acme Corp | Product Manager
**URL:** `https://jobs.lever.co/acmecorp/abc123` | **Domain:** `lever.co`

- Browser opens the Lever-hosted page. Guest "Apply" button found immediately — no login required.
- Form: name, email, phone, location, resume upload, LinkedIn URL, cover letter (optional).
- All personal fields filled from `candidate-profile.json`; CV and cover letter PDFs attached.
- Salary field appears. `"Acme Corp::Product Manager"` not in `salary-kb.json` (empty).
- **User prompted:** "What salary would you like to enter for Acme Corp — Product Manager?" → User: `65000` EUR. Saved to `salary-kb.json`.
- Form submitted. Confirmation page: "Thank you for applying!"
- Screenshot saved. Supabase: `status = applied`, `applied_at = 2026-04-19T14:32:11Z`.
- `lever.co` → `success_count: 1`

**Outcome: ✅ Applied**

---

### Job 2 — TechStartup | Growth Lead
**URL:** `https://linkedin.com/jobs/view/123` | **Domain:** `linkedin.com`

- Browser opens LinkedIn. Immediate login wall: "Sign in to apply with LinkedIn Easy Apply."
- Scrolled page, searched for "Continue as guest" / "Apply without account" — nothing found.
- Only apply path requires LinkedIn authentication.
- Skill rule: *"Never attempt login flows — fail immediately."*
- Screenshot saved. Supabase: `status = ai_apply_failed`, note appended: `[AI Apply failed 2026-04-19: login_required — LinkedIn Easy Apply requires authentication, no guest path found]`.
- `linkedin.com` → `failure_count: 1`, `failure_reasons: ["login_required"]`

**Outcome: ❌ Failed — login_required**

---

### Job 3 — RemoteCo | Head of Product
**URL:** `https://apply.workable.com/remoteco/j/456` | **Domain:** `apply.workable.com`

- Browser opens Workable-hosted form. Accessible without login.
- Form: name, email, phone, CV upload, cover letter upload, LinkedIn URL, "Are you legally authorized to work in Spain?"
- Personal info and files filled.
- "Are you legally authorized to work in Spain?" not in `qa-kb.json`.
- **User prompted** → User: `"Yes — EU citizen (Estonian national)"`. Saved to `qa-kb.json` (general/reusable).
- No salary field. Form submitted. Confirmation: "Your application has been submitted!"
- Screenshot saved. Supabase: `status = applied`, `applied_at = 2026-04-19T14:38:54Z`.
- `apply.workable.com` → `success_count: 1`

**Outcome: ✅ Applied**

---

### Job 4 — FinCorp | Senior PM
**URL:** `https://boards.greenhouse.io/fincorp/jobs/789` | **Domain:** `boards.greenhouse.io`

- Browser opens Greenhouse board. "Apply for this Job" button found — guest apply supported.
- Form: name, email, phone, resume, cover letter, LinkedIn, "How did you hear about this position?", "Do you require visa sponsorship?"
- Personal info and files filled.
- "How did you hear about this position?" not in `qa-kb.json`. **User prompted** → `"Job board"`. Saved.
- "Do you require visa sponsorship?" not in `qa-kb.json`. **User prompted** → `"No"`. Saved.
- Salary field. `"FinCorp::Senior PM"` not in `salary-kb.json`. **User prompted** → `70000` EUR. Saved.
- Form submitted. Confirmation: "Application submitted. We'll be in touch!"
- Screenshot saved. Supabase: `status = applied`, `applied_at = 2026-04-19T14:45:22Z`.
- `boards.greenhouse.io` → `success_count: 1`

**Outcome: ✅ Applied**

---

### Job 5 — CaptchaLand | PM
**URL:** `https://captchaland.com/jobs/apply` | **Domain:** `captchaland.com`

- Browser opens page. "Apply Now" clicked.
- Before any form fields render, a reCAPTCHA v2 checkbox challenge blocks the page.
- Waited 10 seconds, tried again — CAPTCHA still blocking.
- Per skill rules: after 2 attempts with no resolution, record as `captcha` failure.
- Screenshot saved. Supabase: `status = ai_apply_failed`, note appended: `[AI Apply failed 2026-04-19: captcha — reCAPTCHA v2 blocked form access after 2 attempts]`.
- `captchaland.com` → `failure_count: 1`, `failure_reasons: ["captcha"]`

**Outcome: ❌ Failed — captcha**

---

## summary.md (written to apply-runs/2026-04-19_14-30/summary.md)

```markdown
# AI Apply Run — 2026-04-19 14:30

**Batch size:** 5 | **Duration:** 16m 08s

## Results

| # | Company | Role | Result | Reason / Notes |
|---|---------|------|--------|----------------|
| 1 | Acme Corp | Product Manager | ✅ Applied | Lever guest apply — salary entered: €65,000 |
| 2 | TechStartup | Growth Lead | ❌ Failed | Login wall — LinkedIn Easy Apply requires authentication, no guest path |
| 3 | RemoteCo | Head of Product | ✅ Applied | Workable guest apply — work authorization Q&A saved |
| 4 | FinCorp | Senior PM | ✅ Applied | Greenhouse guest apply — salary entered: €70,000 |
| 5 | CaptchaLand | PM | ❌ Failed | reCAPTCHA v2 blocked form after 2 attempts |

## Applied (3)
- Acme Corp — Product Manager
- RemoteCo — Head of Product
- FinCorp — Senior PM

## Failed (2)
- TechStartup — Growth Lead: Login wall — no guest apply path (linkedin.com)
- CaptchaLand — PM: CAPTCHA blocked form access (captchaland.com)

## Skipped (0)
(none — site-difficulty.json was empty at run start)

## Knowledge base updates
**salary-kb.json:** 2 new entries saved (Acme Corp::Product Manager, FinCorp::Senior PM)
**qa-kb.json:** 3 new entries saved
```

---

## Terminal Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AI Apply — Run Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Applied:   3
  ❌ Failed:    2
  ⏭  Skipped:   0
  Total:        5 jobs | 16m 08s

  Applied:
    · Acme Corp — Product Manager (lever.co)
    · RemoteCo — Head of Product (apply.workable.com)
    · FinCorp — Senior PM (boards.greenhouse.io)

  Failed:
    · TechStartup — Growth Lead → login_required (linkedin.com)
    · CaptchaLand — PM → captcha (captchaland.com)

  Details: apply-runs/2026-04-19_14-30/summary.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## site-difficulty.json after the run

```json
{
  "domains": {
    "lever.co": {
      "success_count": 1,
      "failure_count": 0,
      "failure_reasons": [],
      "last_failure_reason": null,
      "notes": "Guest apply supported. Fill name/email first, then upload CV.",
      "last_updated": "2026-04-19"
    },
    "linkedin.com": {
      "success_count": 0,
      "failure_count": 1,
      "failure_reasons": ["login_required"],
      "last_failure_reason": "login_required",
      "notes": "LinkedIn Easy Apply requires authentication — no guest path available.",
      "last_updated": "2026-04-19"
    },
    "apply.workable.com": {
      "success_count": 1,
      "failure_count": 0,
      "failure_reasons": [],
      "last_failure_reason": null,
      "notes": "Guest apply supported via direct form. Work authorization questions may appear.",
      "last_updated": "2026-04-19"
    },
    "boards.greenhouse.io": {
      "success_count": 1,
      "failure_count": 0,
      "failure_reasons": [],
      "last_failure_reason": null,
      "notes": "Guest apply supported. Standard Greenhouse form — name, email, resume, cover letter.",
      "last_updated": "2026-04-19"
    },
    "captchaland.com": {
      "success_count": 0,
      "failure_count": 1,
      "failure_reasons": ["captcha"],
      "last_failure_reason": "captcha",
      "notes": "reCAPTCHA v2 appears before form fields are accessible.",
      "last_updated": "2026-04-19"
    }
  }
}
```
