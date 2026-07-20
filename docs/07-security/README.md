# Security

Security considerations, best practices, and dependency audit.

## What's Here

- **[Security Policy](security-policy.md)** — Security considerations and best practices
- **[Dependencies](dependencies.md)** — Dependency audit and known vulnerabilities

## TL;DR

**Security Posture:** MVP focused on privacy-first design.

**Key Principles:**
- No accounts or authentication (no password databases)
- No user tracking or data collection
- No backend APIs (no data breach surface)
- Client-side only (user data never transmitted)
- Open-source (transparent, auditable)

**Known Issues:**
- 3 dependencies have known vulnerabilities (1 high, 2 moderate)
- Status: Low priority for MVP (not exposed to user data)
- Mitigation: Update ecosystem packages in Phase 5+

**Best Practices:**
- Keep dependencies updated (regular npm audit)
- Review dependency changes before install
- Use npm ci for reproducible installs
- Never commit .env files or secrets

## Document Navigation

1. Start with [Security Policy](security-policy.md) for general considerations
2. Check [Dependencies](dependencies.md) for known vulnerabilities
3. Review package.json for current versions

---

**[← Back to Index](../INDEX.md)**
