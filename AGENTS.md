# Project Instructions

## Repository And Deployment

- GitHub repository: `https://github.com/kaunghtetkyaw511/kaung-htet-kyaw-portfolio`
- GitHub Pages site: `https://kaunghtetkyaw511.github.io/kaung-htet-kyaw-portfolio/`
- The Pages workflow is `.github/workflows/deploy-pages.yml`.
- Every push to any branch triggers a GitHub Pages deployment.
- Use `main` for ordinary portfolio updates unless the user explicitly requests a separate branch or pull request.

## Required End-To-End Workflow

For every Codex task that changes files in this project:

1. Complete the requested implementation.
2. Run the relevant validation and always run `git diff --check`.
3. Review `git status` and the diff before staging.
4. Commit every change created for the current task with a concise commit message.
5. Push the current branch to `origin` before ending the conversation.
6. Confirm that the `Deploy to GitHub Pages` workflow was triggered by the push.
7. Wait for the workflow to complete successfully.
8. Verify that `https://kaunghtetkyaw511.github.io/kaung-htet-kyaw-portfolio/` returns HTTP 200.
9. Report the commit, workflow result, and live Pages URL in the final response.

Do not leave changes created for the current task uncommitted or unpushed. If
authentication, GitHub, or deployment fails, diagnose and retry before ending.
If the blocker cannot be resolved, clearly report it.

## Git Safety

- Preserve pre-existing or unrelated user changes. Do not stage or commit them
  unless the user explicitly asks.
- Never force-push or rewrite published history unless the user explicitly asks.
- Do not delete branches, tags, repositories, or deployments unless required by
  the task and explicitly approved.
- Check the authenticated GitHub account before creating repositories or making
  account-level changes. The intended account is `kaunghtetkyaw511`.

## Useful Commands

GitHub CLI is available at `~/.local/bin/gh`.

```sh
git diff --check
git status --short --branch
git push origin HEAD
~/.local/bin/gh run list \
  --repo kaunghtetkyaw511/kaung-htet-kyaw-portfolio \
  --workflow deploy-pages.yml \
  --limit 5
~/.local/bin/gh run watch RUN_ID \
  --repo kaunghtetkyaw511/kaung-htet-kyaw-portfolio \
  --exit-status
curl -fsS https://kaunghtetkyaw511.github.io/kaung-htet-kyaw-portfolio/ >/dev/null
```
