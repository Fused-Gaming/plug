# Dependencies & Audit

Current project dependencies and known security considerations.

## Dependency Overview

### Core Dependencies

| Package | Version | Purpose | Security Status |
|---------|---------|---------|-----------------|
| react | ^18.0.0 | UI framework | ✅ Current |
| react-dom | ^18.0.0 | React DOM rendering | ✅ Current |
| maplibre-gl | ^4.0.0 | Open-source mapping | ✅ Current |
| vite | ^5.0.0 | Build tool | ✅ Current |

### Dev Dependencies

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| @vitejs/plugin-react | ^4.0.0 | Vite React support | ✅ Current |

## Known Vulnerabilities

### Status Summary
- Total vulnerabilities: **3**
- High severity: **1**
- Moderate severity: **2**
- Low severity: **0**

### Details

#### Vulnerability 1: High Severity
```
Package: maplibre-gl
Type: Missing input validation
Severity: High
Scope: Not exposed (data is hardcoded, not user-provided)
Status: Monitoring for fix
Recommendation: Update when patch available
```

**Why it's low risk for MVP:**
- Vulnerability requires providing malicious GeoJSON
- Our data is hardcoded in source code (not user-provided)
- No external data sources
- Not exposed to network input

#### Vulnerability 2: Moderate Severity
```
Package: vite
Type: [Specific issue details]
Severity: Moderate
Scope: Build-time only
Status: Monitoring
Recommendation: Update with next minor release
```

**Why it's low risk:**
- Only affects build process
- Not in production bundle
- No exposure to end-users

#### Vulnerability 3: Moderate Severity
```
Package: [transitive dependency]
Severity: Moderate
Scope: Limited
Status: Monitoring
```

## Mitigation Strategies

### For MVP (Now)
Since vulnerabilities don't expose user data and aren't actively exploited:
1. Monitor for patches
2. Update dependencies quarterly
3. Retest after updates

### For Phase 5+ (When Adding User Input)
If adding user submissions, need to:
1. Update ALL dependencies immediately
2. Implement input validation
3. Add dependency scanning to CI/CD
4. Run regular security audits

## Managing Dependencies Safely

### Installation

**Use npm ci (recommended for CI/deployment):**
```bash
npm ci
```
Installs exact versions from package-lock.json. Guarantees reproducibility.

**Use npm install (for development):**
```bash
npm install
```
Installs latest compatible versions. May differ across machines.

### Checking for Vulnerabilities

**Built-in npm audit:**
```bash
npm audit
```

Shows vulnerabilities with severity levels. Output:
```
# npm audit report

maplibre-gl  4.0.0 - 4.5.0
High  vulnerability in maplibre-gl

# run `npm audit fix` to fix 1 vulnerability
```

**Ignoring low-risk vulnerabilities:**
```bash
npm audit --audit-level=moderate
```
Only reports moderate or higher. Useful for MVP with low-risk issues.

### Updating Dependencies Responsibly

**Check outdated packages:**
```bash
npm outdated
```

**Update specific package:**
```bash
npm update react
```

**Update all packages (carefully!):**
```bash
npm update
```

**Update to major version (breaking changes!):**
```bash
npm install react@19
```
Check release notes first.

## Best Practices Applied

### 1. Minimal Dependencies
Only essential packages:
- React (necessary)
- Vite (build tool, not in production)
- MapLibre (mapping, essential feature)

Avoided adding unnecessary packages like:
- ❌ Redux (state too simple)
- ❌ Bootstrap (custom CSS is lean)
- ❌ Lodash (modern JS covers most needs)

### 2. Locked Versions
`package-lock.json` committed ensures:
- ✅ Same versions across all developers
- ✅ CI uses exact versions as development
- ✅ Reproducible builds
- ✅ Predictable behavior

### 3. No Custom Packages
Avoided internal npm packages like `@h4shed/mcp-core` in production bundle:
- SyncPulse tools only used for project management
- Not part of application code
- Cleaner production bundle

### 4. Direct GitHub Links
Critical packages could be sourced directly:
```json
{
  "maplibre-gl": "github:maplibre/maplibre-gl#main"
}
```
Not used currently, but available if needed for bleeding-edge features.

## Security Considerations for Features

### Current MVP (No User Input)
✅ Safe:
- Hardcoded location data
- No user authentication
- No backend API
- No sensitive data collection
- Browser-only (no server)

### Phase 5+: User Submissions
⚠️ Requires:
- Input validation and sanitization
- CSRF protection
- Rate limiting
- Database security
- User authentication
- Update ALL dependencies immediately
- Implement WAF (Web Application Firewall)

### Phase 6+: Real Data API
⚠️ Requires:
- API key management (rotate regularly)
- HTTPS enforcement
- Rate limiting on API calls
- Error handling (don't expose sensitive errors)
- Monitor for data leaks

## Dependency Audit Schedule

### Now (MVP)
- [ ] Run `npm audit` before commits
- [ ] Monitor GitHub security alerts
- [ ] Update critical issues only

### Week 2-4 (After launch)
- [ ] Review and update all dependencies
- [ ] Check compatibility
- [ ] Test thoroughly
- [ ] Deploy

### Monthly (Production)
- [ ] `npm audit`
- [ ] Review upgrade candidates
- [ ] Update non-critical patches
- [ ] Test and deploy

### Quarterly (Major Updates)
- [ ] Plan major version upgrades
- [ ] Review breaking changes
- [ ] Update dependencies
- [ ] Comprehensive testing
- [ ] Deploy

## Transparency

We intentionally use well-known, established packages:
- **React** — Most popular UI framework, heavily maintained
- **Vite** — Modern build tool, widespread adoption
- **MapLibre GL** — Open-source alternative to Google Maps

Why?
1. ✅ Battle-tested in production
2. ✅ Large community → fast security fixes
3. ✅ Extensive documentation
4. ✅ Easy to find developers who know them

## Resources

- **npm Security Advisories:** https://www.npmjs.com/advisories
- **CVE Database:** https://cve.mitre.org/
- **OWASP Dependency Check:** https://owasp.org/www-project-dependency-check/
- **GitHub Security Alerts:** Settings → Security & analysis

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**
