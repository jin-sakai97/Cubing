# 📝 Git Commit Message Standard (SDE3+ Level)

> **Purpose:** Generate production-grade, conventional commit messages that enable clean `git bisect`, clear code review, and professional repository history. Aligns with Conventional Commits v1.0.0 and senior engineering best practices.

---

## 🚀 How to Use
1. Copy the **`[INPUT]`** section below and fill it out
2. Paste into your AI assistant or use as a manual checklist
3. Copy the generated output directly into `git commit -m` or your PR template

---

## 📥 INPUT TEMPLATE
```markdown
[FILES_CHANGED]: e.g., src/solver/validator.ts, src/store.ts
[TYPE]: feat | fix | refactor | perf | test | chore | docs | style | ci | revert
[SCOPE]: e.g., cube-solver, ui/overlay, auth, build (omit if global)
[WHAT]: Brief description of the change (imperative mood)
[WHY]: Business impact, architectural rationale, or bug root cause
[CONTEXT]: Ticket ID, PR link, breaking change notes, perf metrics, or trade-offs
```

---

## 📤 OUTPUT FORMAT (Conventional Commits + SDE3 Standards)
```
<type>(<scope>): <imperative summary, ≤72 chars, no period>

<Optional body: 1-3 sentences explaining WHY, not WHAT.
Include business impact, architectural decisions, or trade-offs.
Wrap at 100 characters.>

<Optional footer:
- Closes #123 / Fixes PROJ-456
- BREAKING CHANGE: <description + migration note>
- Co-authored-by: <name> <email>
```

---

## ✅ RULES & STANDARDS

### 1. Type Selection
| Type | Use When |
|------|----------|
| `feat` | New user-facing feature or capability |
| `fix` | Bug fix (user-visible or critical logic) |
| `refactor` | Code restructuring without behavior change |
| `perf` | Measurable performance improvement |
| `test` | Adding/updating tests only |
| `chore` | Build, tooling, deps, no prod code change |
| `docs` | Documentation updates only |
| `style` | Formatting, whitespace, linting (no logic) |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverting a previous commit |

### 2. Subject Line
- ✅ Imperative mood: `"add validation"` NOT `"added"` or `"adds"`
- ✅ ≤ 72 characters (hard limit)
- ✅ No trailing period
- ✅ Lowercase after `type(scope): `
- ❌ Never: `"fix stuff"`, `"update code"`, `"wip"`, `"asdf"`

### 3. Body Guidelines
- Start on line 3 (blank line after subject)
- Explain **WHY**, not WHAT (code shows what)
- Include: business/user impact, architectural rationale, trade-offs
- Wrap at 100 characters
- Use bullet points for multiple points

### 4. Footer Guidelines
- `Closes #123` or `Fixes JIRA-456` for tracking
- `BREAKING CHANGE:` if API/contract changes (include migration)
- `Co-authored-by:` for pair programming

---

## 📋 EXAMPLES

### ✅ Good
```
feat(cube-solver): add kociemba validation for learn mode

Integrate rubiks-cube-solver to validate user-input cube states 
before entering tutorial. Prevents crashes from impossible 
configurations (twisted corners, swapped edges).

- Adds generateStateFromPainted() utility for 54-char state string
- Validates color counts (9 per face) before solver call
- Shows user-friendly error modal on invalid state

Closes #89
```

```
fix(learn-input): prevent color overflow beyond 9 stickers

Palette buttons now disable when color count reaches 9, 
preventing invalid cube states that crash the solver.

- Added count >= 9 check in palette button disabled prop
- Visual feedback: grayscale + opacity-30 when maxed
- Count display shows "0 LEFT" instead of "9/9" for clarity

Fixes #102
```

### ❌ Bad
```
fix: stuff
→ Too vague, no scope, no context
```

```
Added validation for cube input
→ Not imperative, no type/scope, no why
```

---

## 🔍 PRE-PUSH CHECKLIST
- [ ] Subject ≤ 72 chars, imperative, no period
- [ ] Format: `type(scope): summary`
- [ ] Body explains WHY, not WHAT
- [ ] Wrapped at 100 chars
- [ ] Ticket ID linked (`Closes #XYZ`)
- [ ] `BREAKING CHANGE:` flagged if applicable
- [ ] Atomic commit (one logical change)
- [ ] Would this help on-call debug at 3 AM?

---

## 💡 SDE3 PRO TIPS
1. **Write commits as documentation:** Future engineers will read these during incident reviews.
2. **Atomic commits:** One logical change per commit. Don't bundle unrelated fixes.
3. **Use `git commit --verbose`:** See your diff while writing the message for better context.
4. **Amend, don't fix forward:** `git commit --amend` for small tweaks before push; avoid "fix commit message" commits.
5. **Link to artifacts:** Add links to Figma, PRDs, benchmarks, or Loom videos in the body for complex changes.
6. **Think in diffs:** Your commit message should make sense when read alongside `git show <hash>`.
7. **Bisect-friendly:** If this commit breaks prod, could an engineer pinpoint the issue using only this message?

---

## 🚀 READY-TO-PASTE PROMPT (For AI/Codegen)
```
You are a Staff/Principal Engineer. Generate a production-grade Git commit message following Conventional Commits v1.0.0 and SDE3 standards.

INPUT:
[FILES_CHANGED]: {paste files}
[TYPE]: {feat|fix|refactor|perf|test|chore|docs|style|ci|revert}
[SCOPE]: {module/component name or omit}
[WHAT]: {imperative summary}
[WHY]: {business impact, architectural rationale, or root cause}
[CONTEXT]: {ticket ID, breaking change notes, perf metrics, trade-offs}

RULES:
- Subject: ≤72 chars, imperative mood, no period, lowercase after type(scope):
- Body: Explain WHY not WHAT, wrap at 100 chars, include impact/trade-offs
- Footer: Closes #ID, BREAKING CHANGE if applicable, Co-authored-by if needed
- No fluff, no "wip", no vague terms like "update" or "fix stuff"
- Output ONLY the commit message block, nothing else

OUTPUT FORMAT:
<type>(<scope>): <summary>

<body>

<footer>
```

---
> 💡 **Pro Tip:** Save this as `.github/COMMIT_STANDARD.md` or `docs/commit-guidelines.md` in your repo. Enforce via pre-commit hooks or PR templates for team consistency.