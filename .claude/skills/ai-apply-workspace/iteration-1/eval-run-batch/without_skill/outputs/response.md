# Claude Code Response: Run AI Apply Batch (WITHOUT Skill)

## What Claude Code Would Do Without a Skill

Without a specialized skill, Claude Code would approach this by:

1. Exploring the codebase — finding any existing scripts in `/workspaces/Jobhunter/scripts/`
2. Attempting to query Supabase for `needs_apply` jobs
3. Writing an ad-hoc Playwright script to attempt applications

## Key Problems Without the Skill

**No dynamic job fetching** — without explicit guidance to use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Claude would need to guess or ask for the credentials source.

**No interactive handling** — unknown required fields (salary, work auth) would cause the script to crash or submit blank values.

**Fragile success detection** — would look for keywords like "Thank you" in page HTML; misses JS-rendered confirmations.

**No site knowledge** — would waste 3 minutes on LinkedIn before failing, instead of failing fast.

**No structured output** — no `summary.md`, no screenshots, no run folder.

**No status updates** — job statuses in Supabase may not be updated correctly after attempts.

## Expected Results Without Skill

| Job | Platform | Likely Outcome |
|-----|----------|----------------|
| Job 1 (Lever) | Lever | PARTIAL — might work if selectors match |
| Job 2 (LinkedIn) | LinkedIn | FAIL — login wall, 3 min wasted |
| Job 3 (Workable) | Workable | PARTIAL — work auth Q would block |
| Job 4 (Greenhouse) | Greenhouse | FAIL — custom required fields crash |
| Job 5 (CAPTCHA) | Custom | FAIL — no retry logic |

**Applied successfully: 0–1 at best**

## Bottom Line

Without the skill, Claude Code would make reasonable attempts but stall frequently on salary fields, unknown questions, login walls, and missing structure. The user would need to intervene multiple times and there would be no persistent learning across runs.
