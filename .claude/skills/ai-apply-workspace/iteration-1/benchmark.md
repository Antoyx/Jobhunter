# ai-apply Skill — Benchmark Results (Iteration 1)

## Overall

| Configuration | Pass Rate | Passed / Total |
|---|---|---|
| **with_skill** | **100%** | 18 / 18 |
| without_skill | 5.6% | 1 / 18 |
| **Delta** | **+94.4pp** | +17 assertions |

## Per-Eval Breakdown

| Eval | with_skill | without_skill |
|---|---|---|
| eval-batch-apply | 6/6 (100%) | 1/6 (17%) |
| eval-specific-jobs | 6/6 (100%) | 0/6 (0%) |
| eval-run-batch | 6/6 (100%) | 0/6 (0%) |

## Analyst Notes

- **Only assertion passed without skill:** Identifying the `status = needs_apply` Supabase filter — this is derivable from context alone.
- **Biggest skill gaps closed:** Salary KB, QA KB, site-difficulty tracking, candidate-profile loading, run output structure.
- **All assertions are discriminating:** None trivially pass in both configurations (except the Supabase query one).
- **Skill provides end-to-end workflow:** Without skill, Claude stalls at planning and cannot execute; with skill, all workflow steps are clearly defined.
- **High variance risk:** Since this is a live automation skill, real-world results will vary by site. The skill's site-difficulty learning mechanism is designed to improve hit rate over time.
