# Security Scanning & Monitoring

## Overview

This project implements comprehensive automated security scanning and monitoring to catch vulnerabilities early and maintain a secure codebase.

## Security Measures

### 1. CI/CD Pipeline Security (GitHub Actions)

The deployment workflow includes multiple security scanning stages:

#### npm Audit Scanning
- **Trigger**: Every push to main, every pull request
- **Level**: Checks for moderate+ vulnerabilities in production dependencies
- **Fails**: If critical vulnerabilities found
- **File**: `.github/workflows/deploy.yml`

```bash
npm audit --audit-level=moderate --omit=dev
```

#### Security-Focused Testing
- **Tests**: 21 tests covering XSS, injection attacks, input validation, data sanitization
- **Coverage**: Tests component security, error handling, and privacy
- **File**: `src/__tests__/security.test.js`

#### CSP Configuration Testing
- **Tests**: 15 tests verifying Content Security Policy directives
- **Coverage**: Script sources, external resources, frame restrictions
- **File**: `src/__tests__/csp.test.js`

#### CodeQL Security Analysis
- **Type**: SAST (Static Application Security Testing)
- **Scans**: JavaScript code for security vulnerabilities
- **Integrates**: With GitHub Security tab for visibility
- **Action**: `github/codeql-action`

### 2. GitHub Dependabot

Automated dependency vulnerability scanning and updates.

#### Configuration
- **File**: `.github/dependabot.yml`
- **Schedules**:
  - Weekly version updates (Mondays 9:00 AM)
  - Daily security updates (highest priority)
  - Weekly GitHub Actions updates (Mondays 10:00 AM)

#### Features
- Auto-creates pull requests for security updates
- Separate high-priority security PRs
- Automatic rebasing strategy
- Proper labeling and milestone tracking
- Reviews assigned to maintainers

### 3. GitHub Security Features

#### Dependabot Alerts
- Real-time vulnerability notifications
- Enabled in repository settings
- Tracked in GitHub Security Advisory dashboard

#### Secret Scanning
- Detects accidentally committed secrets
- Automatic blocking of exposed credentials
- Available via GitHub Settings → Security → Secret scanning

#### Security Policy
- File: `SECURITY.md`
- Defines security practices and vulnerability disclosure
- Guides responsible security reporting

## Workflow

### On Every Push to Main

1. **Security Scanning Job**
   - Runs npm audit (production deps only)
   - Fails if moderate+ vulnerabilities detected
   - Must pass before proceeding

2. **Testing Job**
   - Runs security-focused test suite (21 tests)
   - Runs CSP configuration tests (15 tests)
   - Must pass before build

3. **CodeQL Job**
   - Performs static analysis on JavaScript code
   - Identifies potential security issues
   - Results visible in GitHub Security tab

4. **Build Job** (after all security checks pass)
   - Builds the application
   - Verifies build output integrity
   - Runs only if security checks pass

5. **Deploy Job** (production only)
   - Deploys to GitHub Pages
   - Only runs on successful main branch pushes

### On Pull Requests

- All security scanning jobs run
- Must pass before PR can be merged
- Provides security feedback to reviewers

### Continuous Monitoring

- **Dependabot** runs daily scans
- Creates automatic PRs for security updates
- Notifies maintainers of vulnerabilities
- Can be configured to auto-merge minor updates

## Manual Security Checks

### Local Auditing

```bash
# Check production dependencies
npm audit --omit=dev

# Full audit including dev dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

### Running Tests Locally

```bash
# Run all tests
npm test

# Run security tests
npm test security.test.js

# Run CSP tests
npm test csp.test.js

# With coverage
npm test -- --coverage
```

## Security Dashboard

GitHub provides multiple security dashboards:

1. **Security Alerts** → Dependabot alerts for dependencies
2. **Code Scanning** → CodeQL analysis results
3. **Secret Scanning** → Exposed credentials detection
4. **Advisories** → Security advisories (if reported)

## Configuration Files

### `.github/workflows/deploy.yml`
Main CI/CD pipeline with security scanning

### `.github/dependabot.yml`
Dependabot configuration for automated updates

### `SECURITY.md`
Security policy and vulnerability disclosure process

### `src/config/csp.js`
Content Security Policy definitions

### `src/utils/errorSanitizer.js`
Error message sanitization to prevent sensitive data logging

### `src/__tests__/security.test.js`
Security-focused test suite

### `src/__tests__/csp.test.js`
CSP configuration tests

## Best Practices

1. **Review Dependabot PRs promptly** - Merge security updates quickly
2. **Fix security test failures** - Understand why tests fail before bypassing
3. **Keep dependencies updated** - Regular updates reduce attack surface
4. **Monitor GitHub Security tab** - Check for new alerts weekly
5. **Follow error handling guidelines** - Use sanitized error messages
6. **Test security features** - Run security tests before deploys

## Incident Response

If a vulnerability is discovered:

1. **Verify** the vulnerability in your codebase
2. **Assess** the severity and impact
3. **Create** a fix or update dependencies
4. **Test** the fix with security tests
5. **Deploy** the fix to production
6. **Document** the incident in a security advisory

## Future Enhancements

- [ ] OWASP ZAP scanning for dynamic security testing
- [ ] Snyk integration for advanced vulnerability management
- [ ] SBOM (Software Bill of Materials) generation
- [ ] Automated security report generation
- [ ] Performance impact analysis with security updates

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Features](https://github.com/features/security)
- [npm Audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [CodeQL Documentation](https://codeql.github.com/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Last Updated**: 2026-07-20
**Maintained By**: Security Team
**Next Review**: 2026-08-20
