# Support Policy for ContribLens OSS

Thank you for using **ContribLens OSS**! We want your open-source journey to be smooth and productive.

---

## Getting Help

### 1. Documentation
Before asking for support or filing an issue, check the project documentation:
- [README.md](README.md) — Architecture, setup guide, and features.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines and development workflow.
- [SECURITY.md](SECURITY.md) — Security policies and disclosure rules.

### 2. Common Questions & Troubleshooting

- **"GitHub API rate limit exceeded"**:
  Provide an optional `GITHUB_TOKEN` in your `.env.local` to raise the GitHub REST API rate limit from 60 to 5,000 requests per hour.
- **"Gemini explanations unavailable"**:
  Verify `GEMINI_API_KEY` is configured in your `.env.local`. If missing or invalid, ContribLens automatically uses high-fidelity deterministic fallback explanations.
- **"Supabase tables not found"**:
  Run the SQL migration in `supabase/migrations/002_contriblens_tables.sql` in your Supabase SQL Editor.
- **"Check integration status"**:
  Run `npm run check:integrations` to verify connection states for Supabase, GitHub, OSV, and Gemini.

### 3. Issue Reporting
- **Bug reports**: Open a GitHub issue using the Bug Report template, including reproduction steps, OS, and Node version.
- **Feature requests**: Open a GitHub Discussion or feature request issue.
- **Security vulnerabilities**: Do NOT open public issues. Email `security@contriblens.org` directly per [SECURITY.md](SECURITY.md).
