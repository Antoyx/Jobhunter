# Claude Code Response — Without Skill

**Prompt:** "Go ahead and apply to the jobs that are waiting in my tracker"

---

## What Claude Code Would Do (Without Skill)

Without a specialized skill, Claude Code would approach this request through general reasoning and exploration. Here is a realistic description of what would happen:

### 1. Explore the project structure

Claude would start by reading the project to understand how it is organized — reading `CLAUDE.md`, looking for database credentials in `webapp/.env.local`, and exploring `webapp/` to understand the data model.

### 2. Query Supabase for jobs

Claude would read the env file to get credentials, then write an ad-hoc Node.js script or use the Supabase REST API with curl to query for jobs with `status = needs_apply`.

### 3. Attempt browser automation — likely stall here

Without guidance, Claude would face several ambiguities: how to automate browsers, what ATS forms look like (Greenhouse, Lever, Workday), where to find the CV PDF, what to fill in salary fields, and how to handle login walls. It would likely write a partial Playwright script, run into npm install permission prompts, and either ask the user for clarification or produce a script that only handles the simplest cases.

### 4. No persistent knowledge

Without `site-difficulty.json`, `qa-kb.json`, or `salary-kb.json`, Claude would re-encounter the same blockers on every run and ask the same questions repeatedly.

### 5. No structured output

Without a defined run folder and `summary.md` format, results would only appear inline in the terminal — no persistent record, no screenshots, no structured log.

---

## Likely Outcome

**Best case:** Claude successfully applies to 1-2 simple Lever/Greenhouse jobs with obvious "Apply" buttons and minimal form fields, asking the user for salary each time.

**Most likely case:** Claude fetches the job list, opens one or two URLs, fills basic fields, then stalls on salary questions, unknown form fields, or a CAPTCHA, and asks the user for guidance.

**Worst case:** Claude spends time exploring the codebase, writes a Playwright script that errors due to missing dependencies or wrong selectors, and marks the run as incomplete without updating any job statuses.

---

## Key Gaps Without the Skill

| Gap | Impact |
|-----|--------|
| No site difficulty knowledge | Wastes time on known-blocked sites (login walls, CAPTCHAs) |
| No Q&A knowledge base | Asks user the same questions repeatedly across runs |
| No salary knowledge base | Either skips salary fields or asks every time |
| No defined run output format | No persistent record of results |
| No candidate profile file | Must re-derive personal info from CV or CLAUDE.md |
| No per-domain apply flow hints | Generic form-filling fails on non-standard ATS flows |
| No batch size / timeout config | May run indefinitely or apply to too many/few jobs |
| No status update logic | Job statuses may not be updated in Supabase correctly |

---

## Summary

Without the skill, Claude Code would make a reasonable attempt but would be unreliable, slow, and require significant user intervention. The skill provides the scaffolding — knowledge bases, workflow steps, file locations, failure handling — that makes autonomous batch apply actually work end-to-end.
