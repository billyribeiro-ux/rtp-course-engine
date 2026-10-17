# rtp-course-engine

- No CI. `pnpm run gate` is the only check, run by .githooks/pre-commit. Never commit with --no-verify.
- After cloning, run once: `git config core.hooksPath .githooks` and `pnpm exec playwright install chromium`.
- Versions are pinned exactly (mise.toml, package.json). Never upgrade anything unless the step says so.
- Do only the step you are given. Stop and report on any failure.

- CSS rules are enforced by Stylelint and scripts/check-style-layers.js. Never disable, override or ignore a rule to make the gate pass.
