# Claude Code Response — Without Skill (Baseline)

## Simulated Claude Code Response

> **User:** "I added 3 new jobs to my tracker with status needs_apply. Can you apply to them for me?"

---

Sure, I can look into that. Let me first fetch the jobs from your Supabase database that have `needs_apply` status.

To do this I'll need access to your Supabase credentials. Do you have a `.env` file or environment variables set with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or anon key)?

Once I have those, I can query the jobs table:

```sql
SELECT id, company, title, url, platform, notes
FROM jobs
WHERE status = 'needs_apply'
ORDER BY created_at DESC
LIMIT 10;
```

After retrieving the jobs, applying to them is a different challenge — job applications typically require:

1. Navigating to the job URL in a browser
2. Filling out an application form (name, email, CV upload, cover letter, custom questions)
3. Submitting the form

I don't have built-in browser automation capabilities natively, but I could:

- Write a Playwright or Puppeteer script that you can run locally to automate the browser steps
- Prepare application materials (cover letter, CV text) tailored to each role
- Walk you through each application manually by pulling up the URL and job details

However, actually submitting forms autonomously — especially with CV uploads, login flows, CAPTCHA, and custom questions — is beyond what I can do reliably without specialized tooling.

**What would you like me to do?**
- Fetch and show you the 3 jobs from the database so you can review them
- Draft tailored cover letters for each job
- Write a Playwright automation script you can run yourself
- Something else?

---

## Evaluator Notes

### What Claude Code did well (without skill)
- Correctly identified the need for Supabase credentials before querying
- Accurately described what applying to jobs requires (browser, forms, CV upload)
- Offered multiple realistic fallback options
- Did not pretend to be able to apply autonomously

### What Claude Code could NOT do (without skill)
- Could not autonomously fetch jobs from Supabase (no MCP or env context)
- Could not launch a browser or navigate to job URLs
- Could not fill and submit application forms
- Could not update job statuses back to `applied` after submission
- Could not handle interactive questions (salary expectations, custom form fields)
- Had no awareness of saved answers or previous application patterns

### Gap Analysis vs. Skill Behavior

| Capability | Without Skill | With Skill |
|---|---|---|
| Fetch `needs_apply` jobs from DB | No (asks for credentials) | Yes (uses env vars automatically) |
| Navigate to job URL | No | Yes (Playwright) |
| Fill application form | No | Yes (guest/one-click forms) |
| Ask user for salary/unknown fields | Partial (asks generically) | Yes (interactive, saves answers) |
| Update status to `applied` | No | Yes (Supabase upsert) |
| Handle unsupported sites gracefully | No | Yes (marks `ai_apply_failed`) |
| Track which platforms work | No | Yes (site-difficulty.json) |

### Overall Assessment
Without the skill, Claude Code stalls at the planning/clarification stage. It correctly identifies the problem scope but cannot execute end-to-end. The user would need to run scripts manually or provide significant additional setup. The skill closes this gap by providing Supabase access, browser automation, interactive Q&A, and status tracking — turning a manual multi-step workflow into a single command.
