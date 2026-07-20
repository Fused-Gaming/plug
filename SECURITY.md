# Security Policy

**Charging Station Locator MVP** prioritizes user privacy and security by default. This document outlines our security architecture, data protection measures, and vulnerability disclosure process.

## 1. Security Architecture

### 1.1 Content Security Policy (CSP)

The application enforces a strict Content Security Policy to prevent XSS and code injection attacks:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https:;
  font-src 'self';
  connect-src 'self' https://maps.openstreetmap.org;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
```

**Rationale:**
- `default-src 'self'` restricts all resources to same-origin only
- `script-src 'self'` prevents inline scripts and external script injection
- `style-src 'self' 'unsafe-inline'` allows inline styles for design tokens (SCSS compiled)
- `img-src 'self' https:` allows secure image loading
- `connect-src 'self' https://maps.openstreetmap.org` restricts API calls to self + map tiles
- `frame-ancestors 'none'` prevents embedding in iframes
- `form-action 'none'` prevents form submissions (read-only map app)

### 1.2 HTTPS Enforcement

- **Production:** All traffic enforced to HTTPS via GitHub Pages (automatic)
- **Custom Domain:** plug.vln.gg certificate auto-renewed via Let's Encrypt
- **HSTS Header:** `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### 1.3 Transport Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

## 2. Data Protection

### 2.1 Geolocation (User Privacy)

- **Collection:** Only when user clicks "Find Nearby Chargers"
- **Storage:** Never stored (temporary in-memory only)
- **Transmission:** Never sent to servers (client-side calculation)
- **Calculation:** Distance computed locally using MapLibre GL

### 2.2 Charging Station Data

- **Source:** Public datasets (Oakland Open Data, PlugShare, OpenStreetMap)
- **Storage:** Static JSON embedded at build time
- **Distribution:** GitHub Pages CDN with no user tracking
- **Refresh:** Manual update cycle (~quarterly for MVP)

### 2.3 No Tracking, No Analytics

- **No Google Analytics** or third-party tracking
- **No cookies** (browser essentials only for HTTPS)
- **No telemetry** sent to external servers
- **No user fingerprinting** or session IDs

This is a **privacy-by-design, client-side-only application**.

## 3. Dependencies Security

### 3.1 Core Dependencies

**Production:**
- `maplibre-gl@4.0.0` — Open-source map rendering (MIT)
- `react@18.2.0` — UI framework (MIT)
- `react-dom@18.2.0` — React DOM adapter (MIT)

**Build/Dev:**
- `vite@5.0.8` — Fast build tool (MIT)
- `@vitejs/plugin-react@4.2.1` — React JSX support (MIT)
- `better-sqlite3@12.11.1` — Dev-only database setup (MIT)

### 3.2 Security Scanning

- GitHub Dependabot enabled for automated vulnerability scanning
- Socket.dev integration for supply chain security analysis
- npm audit on every PR
- Manual review of dependency updates

### 3.3 Handling Security Alerts

**High/Critical:** Immediate patch required, no merge until resolved  
**Medium:** Evaluate impact within 7 days  
**Low:** Resolved in next release cycle  

## 4. Code Security Practices

### 4.1 Input Validation

- Charging station names sanitized against XSS
- No HTML/script injection possible (text content only)
- Special characters escaped in all DOM operations
- No user input from URL query strings

### 4.2 Error Handling

- **Production:** No stack traces exposed to users
- **Development:** Full stack traces in `npm run dev` mode
- **Builds:** Sourcemaps disabled in production (`sourcemap: false`)

### 4.3 Map Tile Security

- MapLibre GL tiles served over HTTPS
- OSM tiles are public data (no authentication required)
- Rate limiting handled by OSM infrastructure

## 5. Infrastructure Security

### 5.1 GitHub Pages

- **Static-only hosting** (no server-side code)
- **No backend API** to compromise
- **No database credentials** exposed
- **Branch protection** on `main` (PR reviews required)

### 5.2 Build Artifacts

- **Minified JavaScript** prevents reverse engineering
- **No sourcemaps** shipped to production
- **Tree-shaking** removes unused code
- **Asset hashing** prevents cache poisoning

## 6. Vulnerability Disclosure

### 6.1 Reporting a Vulnerability

**Method:** [Create private security advisory](https://github.com/Fused-Gaming/plug/security/advisories)

**Scope:**
- XSS vulnerabilities in map UI
- CORS/CSRF bypasses
- CSP bypass techniques
- Data exposure in static assets
- Dependency vulnerabilities

**Out of Scope:**
- Infrastructure vulnerabilities (GitHub's responsibility)
- Theoretical attacks without proof-of-concept
- Third-party library vulnerabilities (report upstream)

### 6.2 Response Timeline

1. **Acknowledgment:** Within 24 hours
2. **Assessment:** 48 hours to confirm impact
3. **Fix:** 7 days for high-severity vulnerabilities
4. **Disclosure:** Coordinated release with security advisory

## 7. Privacy-First Design

### 7.1 Why This Architecture?

1. **No Backend = No Data Breaches** — User location never leaves device
2. **Client-Side Computation** — Distance calculation runs locally
3. **Static Content Distribution** — No dynamic API queries required
4. **Open Source Data** — All data from public OSINT sources

### 7.2 Future Considerations

**If Backend Added:**
- Zero-knowledge architecture for any features
- User geolocation stays local (browser-side geofencing)
- Optional opt-in analytics only
- GDPR compliance built-in (right to erasure)

## 8. Compliance

### 8.1 Standards

- **OWASP Top 10:** Core principles implemented
- **GDPR:** Full compliance (no personal data collected)
- **CCPA:** Full compliance (no personal data collected)

### 8.2 Development Guidelines

- ❌ Never commit credentials, API keys, or secrets
- ❌ Don't hardcode sensitive data
- ✅ Sanitize user input
- ✅ Use environment variables for configuration
- ✅ Keep dependencies up to date
- ✅ Follow framework security best practices

## 9. Incident Response

### 9.1 Security Incident Classification

**Critical:** User geolocation exposed, XSS in map UI, CSP bypass  
**High:** Data injection vulnerability  
**Medium:** Information disclosure, dependency vulnerability  
**Low:** Documentation or header issues  

### 9.2 Response Process

1. **Detection** — GitHub Dependabot or security report
2. **Triage** — Assess impact and severity
3. **Investigation** — Root cause analysis
4. **Remediation** — Develop and test fix
5. **Release** — Push fix with security advisory
6. **Retrospective** — Document lessons learned

## 10. Maintenance

### 10.1 Dependency Update Frequency

- **Critical Security Patches:** 24 hours
- **High Priority Updates:** 7 days
- **Regular Updates:** Monthly review cycle
- **Major Version Bumps:** Quarterly evaluation

### 10.2 Security Scanning

- **CI/CD:** npm audit runs on every PR
- **Nightly:** Dependabot vulnerability checks
- **Weekly:** Manual security advisory review
- **Quarterly:** Comprehensive security audit

---

**Last Updated:** 2026-07-20  
**Maintained By:** Agent A08 (Privacy & Security)  
**Next Review:** 2026-08-20
