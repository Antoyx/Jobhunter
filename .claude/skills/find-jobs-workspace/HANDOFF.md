# Find-Jobs Skill — Agent Handoff

## Status
Skill created. Evals attempted but ALL runs hit the API rate limit ("You've hit your limit · resets 6am UTC"). No eval output files exist yet. Permissions were fixed mid-session. You need to re-run the evals from scratch.

---

## What Was Completed

### Skill files written (ready, no changes needed)
- `.claude/skills/find-jobs/SKILL.md` — full skill instructions
- `.claude/skills/find-jobs/preferences.json` — search preferences (titles, locations, salary, site_preference, etc.)
- `.claude/skills/find-jobs/evals/evals.json` — 3 test cases

### Permissions fixed
`.claude/settings.json` now includes:
```json
"WebFetch",
"Bash(node *)",
"Bash(npm *)",
"Bash(curl *)"
```
These were missing in the first session and caused all evals to abort. They are now in place.

### Eval workspace structure created
All directories exist under `.claude/skills/find-jobs-workspace/iteration-1/`:
- `eval-barcelona-pm/{with_skill,without_skill}/outputs/`
- `eval-remote-delivery-manager/{with_skill,without_skill}/outputs/`
- `eval-ai-friendly-sites/{with_skill,without_skill}/outputs/`

Each directory has an `eval_metadata.json` with assertions already written.

---

## What You Need To Do

### Step 1: Re-run all 6 evals in parallel

Launch these 6 agents simultaneously (3 with-skill + 3 without-skill):

#### Eval 1 — Barcelona PM
**With skill:**
```
Execute this task using the skill at `/workspaces/Jobhunter/.claude/skills/find-jobs/SKILL.md`.
Task: "find me some product manager jobs in Barcelona and add them to the pipeline"
Working directory: /workspaces/Jobhunter
Save response to: .claude/skills/find-jobs-workspace/iteration-1/eval-barcelona-pm/with_skill/outputs/response.md
Save jobs JSON to: .claude/skills/find-jobs-workspace/iteration-1/eval-barcelona-pm/with_skill/outputs/jobs_attempted.json
JSON format: [{company, title, url, location, salary_min, salary_max, salary_currency, notes, inserted (bool), skip_reason}]
```

**Without skill (baseline):**
```
Task: "find me some product manager jobs in Barcelona and add them to the pipeline"
No skill — do your best naturally. Use WebSearch, verify URLs with WebFetch, insert into Supabase jobs table (status='prospect').
Creds in webapp/.env.local. Use @supabase/supabase-js.
Save response to: .claude/skills/find-jobs-workspace/iteration-1/eval-barcelona-pm/without_skill/outputs/response.md
Save jobs JSON to: .claude/skills/find-jobs-workspace/iteration-1/eval-barcelona-pm/without_skill/outputs/jobs_attempted.json
```

#### Eval 2 — Remote Delivery/Program Manager
**With skill:**
```
Task: "search for remote delivery manager or program manager roles and add them — I want to see what's out there"
Save to: .claude/skills/find-jobs-workspace/iteration-1/eval-remote-delivery-manager/with_skill/outputs/
```

**Without skill:**
```
Same task, no skill.
Save to: .claude/skills/find-jobs-workspace/iteration-1/eval-remote-delivery-manager/without_skill/outputs/
```

#### Eval 3 — AI-Friendly Sites
**With skill:**
```
Task: "go find jobs but only add ones from sites where the AI apply has worked before — I want to batch apply right after"
Note: all domains in site-difficulty.json currently have success_count=0. Skill should handle gracefully — insert from untracked domains, explain the situation.
Save to: .claude/skills/find-jobs-workspace/iteration-1/eval-ai-friendly-sites/with_skill/outputs/
```

**Without skill:**
```
Same task, no skill.
Save to: .claude/skills/find-jobs-workspace/iteration-1/eval-ai-friendly-sites/without_skill/outputs/
```

---

### Step 2: Save timing data

When each agent completes, save its `total_tokens` and `duration_ms` from the task notification to a `timing.json` in the run directory:
```json
{"total_tokens": 12345, "duration_ms": 45000, "total_duration_seconds": 45.0}
```

---

### Step 3: Grade and aggregate

Once all 6 runs complete, spawn a grader agent to evaluate assertions against output files. Read:
- `.claude/skills/skill-creator/agents/grader.md` for grading instructions
- Each `eval_metadata.json` for the assertion list

Save `grading.json` in each run directory with format:
```json
{"expectations": [{"text": "assertion description", "passed": true, "evidence": "..."}]}
```

Then aggregate:
```bash
cd /workspaces/Jobhunter/.claude/skills/skill-creator
python -m scripts.aggregate_benchmark \
  /workspaces/Jobhunter/.claude/skills/find-jobs-workspace/iteration-1 \
  --skill-name find-jobs
```

---

### Step 4: Generate the eval viewer

```bash
python /workspaces/Jobhunter/.claude/skills/skill-creator/eval-viewer/generate_review.py \
  /workspaces/Jobhunter/.claude/skills/find-jobs-workspace/iteration-1 \
  --skill-name "find-jobs" \
  --benchmark /workspaces/Jobhunter/.claude/skills/find-jobs-workspace/iteration-1/benchmark.json \
  --static /tmp/find-jobs-eval-review.html
```

Tell the user: "Open /tmp/find-jobs-eval-review.html to review the eval results. Leave feedback in the Outputs tab and click Submit All Reviews when done."

---

### Step 5: Known issue to address in iteration 2

The skill's **"ai_friendly" site preference mode** has an edge case: all currently tracked domains have `success_count = 0`, so no "AI-friendly" domains exist yet. The skill should be updated to handle this — e.g.:

> If no AI-friendly domains are known yet, fall back to untracked domains (SmartRecruiters, Ashby, Workable, WeWorkRemotely) which haven't failed either. Note in the run summary that no confirmed-working domains exist yet and jobs were sourced from untracked platforms.

Add this to the SKILL.md in the site preference section after seeing eval results.

---

## Key File Locations

| File | Purpose |
|------|---------|
| `.claude/skills/find-jobs/SKILL.md` | The skill (ready) |
| `.claude/skills/find-jobs/preferences.json` | User-editable search preferences |
| `.claude/skills/find-jobs/evals/evals.json` | 3 eval test cases |
| `.claude/skills/find-jobs-workspace/iteration-1/` | Workspace for this iteration |
| `.claude/skills/ai-apply/site-difficulty.json` | Domain difficulty data (READ ONLY for find-jobs) |
| `webapp/.env.local` | Supabase credentials |
| `.claude/settings.json` | Permissions (already updated) |
| `.claude/skills/skill-creator/` | Skill creator tooling (scripts, grader, viewer) |
