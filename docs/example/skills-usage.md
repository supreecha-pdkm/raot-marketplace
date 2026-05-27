# Claude Code Skills — Must-Have Guide for RAOT Green

> Skills are installed at `.claude/skills/<name>.md` and triggered via `/skill-name` in Claude Code.

---

**Recommended order of use per feature:**

```
/superpowers (plan) → write code → /test-gen → /review → /commit → /pr → /security-audit (pre-release)
```

---

## 1. Git Commit — `/commit`

**Status:** ✅ Already installed at `.claude/skills/commit.md`
**Source:** [claudedirectory.org/skills/commit](https://www.claudedirectory.org/skills/commit)

### What it does

Reads `git diff --staged`, generates a Conventional Commit message following `<type>(<scope>): <description>` format, and creates the commit.

**Supported types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore`

### RAOT Green use case

You finish building the bid submission form in `features/auction/`. Instead of writing the commit yourself, you stage the files and run `/commit`. Claude produces:

```
feat(auction): add bid submission form with Zod validation
```

### Step-by-step

1. Make your code changes
2. Stage specific files — never `git add .`
   ```bash
   git add features/auction/components/bid-form.tsx
   git add features/auction/utils/validations/bid.ts
   ```
3. Type `/commit` in Claude Code
4. Claude reads the staged diff and proposes a commit message
5. Confirm → commit is created

---

## 2. Create Pull Request — `/pr`

**Status:** ⬜ Not installed — save as `.claude/skills/pr.md`
**Source:** [claudedirectory.org/skills/pr](https://www.claudedirectory.org/skills/pr)

### Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Must be on a feature branch, not `main`

### What it does

Reads all commits since branching from `main`, generates a PR title + structured description (summary, changes, testing instructions, checklist), then executes `gh pr create`.

### RAOT Green use case

You finish the seller dashboard feature branch. Running `/pr` auto-generates:

- **Title:** `feat(seller): add dashboard with auction listing and status tracking`
- **Summary:** Overview of what changed
- **Changes:** Bullet points per commit
- **Testing:** "Login as seller role → verify auction table loads via React Query → check CASL gates hide buyer-only actions"
- **Checklist:** Tests added, types pass, no breaking changes

### Step-by-step

1. Complete your feature on a branch (e.g. `feat/seller-dashboard`)
2. Commit all changes using `/commit`
3. Type `/pr` in Claude Code
4. Claude analyzes commits and drafts the PR body
5. Runs `gh pr create` — PR is live on GitHub

> **Tip:** Always run `/review` before `/pr`. Never open a PR on unreviewed code.

---

## 3. Code Review — `/review`

**Status:** ⬜ Not installed — save as `.claude/skills/review.md`
**Source:** [claudedirectory.org/skills/review](https://www.claudedirectory.org/skills/review)

### What it does

Analyzes code across three severity tiers and returns structured findings with `file:line` references:

| Tier                       | Examples                                                    |
| -------------------------- | ----------------------------------------------------------- |
| **Critical** (must fix)    | Security vulnerabilities, data loss risks, breaking changes |
| **Important** (should fix) | Logic errors, performance issues, missing error handling    |
| **Suggestions** (optional) | Naming, refactoring opportunities, style violations         |

### RAOT Green use case

Before merging the Axios token refresh interceptor at `lib/axios/index.ts`, you run `/review lib/axios/index.ts`. Claude catches:

- **Critical:** Token passed to refresh endpoint without re-encryption check
- **Important:** No retry limit — infinite loop possible on repeated 401 responses
- **Suggestion:** Extract refresh logic into a named function for testability

### Step-by-step

1. Finish writing a file or feature
2. Type `/review [path]` in Claude Code
   ```
   /review features/auth/api/login.ts
   /review lib/axios/index.ts
   /review features/auction/components/bid-form.tsx
   ```
3. Claude returns findings grouped by severity with exact line references
4. Fix all **Critical** and **Important** issues
5. Run `/review` again to confirm fixes
6. Proceed to `/commit` and `/pr`

> **Gate rule:** `/review` must pass before `/pr`. Never merge code that hasn't been reviewed.

---

## 4. Security Audit — `/security-audit`

**Status:** ⬜ Not installed — save as `.claude/skills/security-audit.md`
**Source:** [claudedirectory.org/skills/security-audit](https://www.claudedirectory.org/skills/security-audit)

### What it does

Runs a comprehensive security scan across five categories and returns severity-ranked findings with line numbers:

| Category              | What it checks                                          |
| --------------------- | ------------------------------------------------------- |
| **OWASP Top 10**      | Injection, XSS, broken access control, insecure design  |
| **Dependency CVEs**   | Known vulnerabilities in direct and transitive packages |
| **Secrets Detection** | Hardcoded API keys, tokens, credentials                 |
| **Auth Review**       | Session management, JWT config, access control patterns |
| **Input/Output**      | Validation gaps, encoding issues, unhandled user input  |

### RAOT Green use case

Before the first production deploy, run `/security-audit`. Claude scans:

- `auth.ts` + `proxy.ts` → checks JWT encryption, role claim exposure
- `lib/axios/index.ts` → verifies no tokens leak in error logs
- `features/auction/` → checks Zod validates all bid input at boundary
- `package.json` → flags `next-auth@5.0.0-beta.31` for known CVEs
- All files → detects any `.env` values accidentally hardcoded in source

**Example findings:**

- 🔴 Critical: `NEXTAUTH_SECRET` hardcoded in `auth.config.ts` line 12
- 🟠 High: Missing input sanitization on auction description field
- 🟡 Medium: `next-auth` beta version has open CVE — upgrade to latest beta

### Step-by-step

1. Before any release or deploy, type `/security-audit` in Claude Code
2. Claude scans the full codebase — no path argument needed
3. Review **Critical** findings first — block the deploy until resolved
4. Fix all Critical and High findings
5. Re-run `/security-audit` to confirm clean
6. Use the output as your pre-deploy sign-off checklist

> **Cadence:** Run before every release, and after adding any new auth, payment, or role-gating logic.

---

## 5. Test Generator — `/test-gen`

**Status:** ⬜ Not installed — save as `.claude/skills/test-gen.md`
**Source:** [claudedirectory.org/skills/test-gen](https://www.claudedirectory.org/skills/test-gen)

### What it does

Reads the target source file, auto-detects the test framework (Jest/Vitest), and generates a `.test.ts` file covering:

- **Unit tests:** Individual functions, input validation, boundary conditions
- **Integration tests:** Hook + service interactions, API response handling
- **Edge cases:** Null/undefined, empty arrays, malformed data, concurrent access

### RAOT Green use cases

**Use case 1 — Zod validation schema:**

```
/test-gen features/auth/utils/validations/login.ts
```

Generates tests for: empty username, password under 8 chars, valid credentials, SQL injection string in username field.

**Use case 2 — React Query hook:**

```
/test-gen features/auction/api/use-bid-list.ts
```

Generates tests for: loading state, error state, empty data array, paginated response, stale cache behavior after mutation.

**Use case 3 — CASL ability factory:**

```
/test-gen lib/casl/server.ts
```

Generates tests for: buyer role gets correct abilities, seller role gets correct abilities, unknown role returns empty ability set.

**Use case 4 — Auth service:**

```
/test-gen features/auth/services/session-tokens.ts
```

Generates tests for: valid session returns tokens, expired session returns null, server vs client context differences.

### Step-by-step

1. Finish writing a service, hook, schema, or utility
2. Type `/test-gen [path]` in Claude Code
   ```
   /test-gen features/auth/services/session-tokens.ts
   ```
3. Claude reads the file and identifies all exported functions/hooks
4. Generates a `[name].test.ts` file alongside the source
5. Run `pnpm test` to verify all generated tests pass
6. Fix any failing tests (usually mocking setup for Axios or Auth.js)
7. Include the test file in your commit before running `/pr`

> **TDD flow:** Generate tests first with `/test-gen` on the schema/types file, then implement the feature to make them pass.

---

## 6. Superpowers — `/superpowers`

**Status:** ⬜ Not installed
**Source:** [github.com/obra/superpowers](https://github.com/obra/superpowers)

### What it does

A bundle of SDLC sub-skills that enhance the full development lifecycle. Each sub-skill can be invoked independently:

| Sub-skill                          | Trigger                   | When to use in RAOT Green                                                                 |
| ---------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| **Writing Plans**                  | `/superpowers` → Plan     | Before any new feature — enforces CLAUDE.md rule "Show file plan before writing any code" |
| **Test Driven Development**        | `/superpowers` → TDD      | Write Zod schema tests before building the form component                                 |
| **Systematic Debugging**           | `/superpowers` → Debug    | Auth token refresh silently fails — structured root cause analysis before guessing        |
| **Verification Before Completion** | `/superpowers` → Verify   | Runs `pnpm build` + `npx tsc --noEmit` + `pnpm lint` before marking any task done         |
| **Parallel Agents**                | `/superpowers` → Parallel | Build buyer dashboard and seller dashboard simultaneously as independent tasks            |
| **Requesting Code Review**         | `/superpowers` → Review   | Verify work meets requirements before opening `/pr`                                       |

### RAOT Green use case — full feature flow

You need to build the seller auction creation feature:

1. `/superpowers` → **Writing Plans** — Claude maps out all files to create/modify, you approve before any code is written
2. Start with **TDD** — generate Zod schema tests for `AuctionCreateSchema` first
3. Implement the feature to make tests pass
4. `/superpowers` → **Verification Before Completion** — runs lint, type check, build
5. `/review` → fix any issues found
6. `/commit` → conventional commit message
7. `/pr` → open pull request

### Installation

```bash
# Clone the repo
git clone https://github.com/obra/superpowers.git

# Install globally (applies to all projects)
cp -r superpowers/.claude ~/.claude

# OR install to this project only
cp -r superpowers/.claude d:/project/raot-green/.claude
```

### Step-by-step (use)

1. Start a new feature: type `/superpowers` in Claude Code
2. Select "Writing Plans" — Claude produces a file plan for your approval
3. After implementing: select "Verification Before Completion" to run all checks
4. If a bug surfaces: select "Systematic Debugging" for structured root cause analysis
5. Before merge: select "Requesting Code Review" to verify requirements are met

---

## Quick Reference

| Task                  | Command            | When                                            |
| --------------------- | ------------------ | ----------------------------------------------- |
| Create a commit       | `/commit`          | After staging changes                           |
| Open a pull request   | `/pr`              | After all commits on a feature branch           |
| Review code quality   | `/review [path]`   | Before every PR                                 |
| Audit security        | `/security-audit`  | Before every release                            |
| Generate tests        | `/test-gen [path]` | After writing any service/hook/schema           |
| Plan + debug + verify | `/superpowers`     | Start of feature, during debugging, before done |
