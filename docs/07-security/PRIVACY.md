# Privacy Policy

**Charging Station Locator MVP** is a privacy-first application. We collect **zero personal data** by design.

**Effective Date:** 2026-07-20  
**Last Updated:** 2026-07-20

---

## 1. Our Privacy Commitment

Your location data is yours and yours alone. We do not:

- Collect your location
- Store your location
- Share your location with anyone
- Track you across sessions
- Build a profile of your charging habits
- Sell your data
- Display ads based on your usage

This is a read-only map of public charging stations. Nothing about you is stored anywhere.

## 2. What Data We Collect

### 2.1 Client-Side Usage (Your Browser, Your Device)

When you use the Charging Station Locator:

| Data | Collected? | Stored? | Sent? |
|------|-----------|---------|-------|
| Your geolocation | Only when you click "Find Nearby" | Your device only (RAM) | No |
| Map viewport (zoom level) | No | No | No |
| Stations you view | No | No | No |
| Stations you click | No | No | No |
| Search queries | No | No | No |
| Device ID or fingerprint | No | No | No |
| Session ID or cookies | No (security essentials only) | Browser only | No |

**Your Geolocation: Detailed Privacy**

1. **Request:** Only triggered when **you actively click** "Find Nearby Chargers"
2. **Browser Prompt:** Your browser's Geolocation API shows a user consent dialog
3. **Storage:** Temporarily in RAM for calculating distances
4. **Duration:** Cleared when you close the browser tab
5. **Transmission:** Never sent to any server (calculated client-side)
6. **Deletion:** Automatically cleared if you deny access or close the app

### 2.2 Charging Station Data (Public OSINT)

The map displays public charging station data from:

- **Oakland Open Data Portal** — Government-published locations
- **PlugShare** — Community-contributed charging data
- **OpenStreetMap** — Crowd-sourced geospatial data

**Data Attributes:**
- Station name and address
- Charger type (Level 2, DC Fast)
- Connector types (CCS, J1772, Tesla, CHAdeMO)
- Power output (kW)
- Last verified date
- Data source attribution

**Not Included:**
- Operator details (no business data)
- Pricing (no cost data)
- Real-time availability (snapshot only)
- User reviews or ratings

## 3. What We Store

### 3.1 No Server-Side Storage

We operate entirely static infrastructure (GitHub Pages) with:

- **No backend database**
- **No API logs**
- **No session storage**
- **No user database**
- **No cookies for tracking**

The charging station data is embedded in the compiled JavaScript bundle at build time.

### 3.2 Local Browser Storage

Your browser may store:

- **Cache:** Map tiles and static assets (expires per browser settings)
- **Service Worker:** None (we don't use service workers)
- **LocalStorage:** None (we don't use localStorage)
- **SessionStorage:** None (we don't use sessionStorage)
- **IndexedDB:** None (we don't use IndexedDB)

### 3.3 Logs We Don't Keep

GitHub Pages does not provide us with:

- Which stations you viewed
- How long you spent on the map
- Geographic areas you explored
- Times of day you used the app
- What browser or device you used

(GitHub may keep standard web server logs for infrastructure purposes, but we have no access to user-specific data.)

## 4. Third-Party Data Sharing

### 4.1 No Third Parties Access Your Data

We do not share your information with:

- Google Analytics
- Facebook Pixels
- Mixpanel or other analytics platforms
- Advertising networks
- Data brokers
- Marketing platforms
- Any external service

### 4.2 Third-Party Services We Use

**MapLibre GL (Open-source map rendering)**
- Hosted locally (client-side)
- Open-source code, no telemetry
- Your browser makes direct requests to OpenStreetMap tile servers

**OpenStreetMap Tiles**
- Tiles are requested directly from OSM infrastructure
- OSM has its own [privacy policy](https://osmfoundation.org/en/about/privacy-policy/)
- We do not proxy or intermediary these requests

**GitHub Pages Hosting**
- Application served from GitHub's CDN (Fastly)
- GitHub may keep standard server logs
- GitHub's [privacy policy](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) applies

**No Other Services:** No external APIs, no third-party integrations.

## 5. Data Rights & GDPR Compliance

### 5.1 Your Rights (GDPR, CCPA, LGPD)

Since we collect zero personal data, these rights are automatically satisfied:

| Right | Your Status |
|-------|------------|
| Right to Access | ✅ N/A (no data stored) |
| Right to Correction | ✅ N/A (no personal data) |
| Right to Erasure | ✅ Automatic (no data stored) |
| Right to Data Portability | ✅ N/A (no personal data) |
| Right to Object | ✅ N/A (no profiling) |
| Right to Restrict Processing | ✅ N/A (no processing) |

### 5.2 GDPR Compliance

**Legal Basis:** We do not rely on consent for anything because we collect no personal data.

- **Article 5 (Data Minimization):** ✅ We collect zero personal data
- **Article 6 (Lawful Basis):** ✅ N/A (no processing)
- **Article 17 (Right to Erasure):** ✅ Automatic (no data stored)
- **Article 21 (Right to Object):** ✅ N/A (no profiling)

### 5.3 CCPA Compliance

**Resident of California?** You have broad privacy rights, but they don't apply here because:

- We don't collect personal information
- We don't sell personal information
- We don't use personal information for targeted advertising
- We don't build consumer profiles

The CCPA exempts data collected "solely for security" — that's all we do.

### 5.4 LGPD Compliance (Brazil)

**Article 5 (Purpose Limitation):** ✅ Zero personal data collection  
**Article 7 (Legitimate Interest):** ✅ N/A (no personal data)  
**Article 17 (Access Rights):** ✅ Automatic (no data to access)  

## 6. Children's Privacy (COPPA)

The Charging Station Locator complies with the Children's Online Privacy Protection Act (COPPA):

- ❌ We do not knowingly collect data from children under 13
- ❌ We do not create accounts or profiles
- ❌ We do not require registration
- ✅ We collect zero personal data (age irrelevant)

**For Parents:** The app is age-appropriate and does not target children, but adults and children alike can use it safely with zero privacy concerns.

## 7. Data Security

### 7.1 Application Security

- **HTTPS Encryption:** All traffic encrypted (TLS 1.2+)
- **Content Security Policy:** Strict CSP prevents XSS and injection attacks
- **No Injection Vectors:** Static map data, no user input processing
- **Dependency Auditing:** npm audit on every build
- **Source Code:** Open to public review on GitHub

### 7.2 Data Center Security

**GitHub Pages Infrastructure:**
- Data centers managed by GitHub/Microsoft
- ISO 27001 certified
- SOC 2 Type II compliance
- Regular penetration testing and vulnerability assessments

### 7.3 No Encryption Needed

Since we store no personal data server-side, encryption at rest is not applicable. Your geolocation never reaches our servers (client-side only).

## 8. Cookies & Tracking

### 8.1 No Tracking Cookies

We do not use:

- Google Analytics cookies
- Facebook tracking pixels
- Hotjar or other session recording
- Mixpanel or custom analytics
- Retargeting pixels
- First-party tracking cookies

### 8.2 Essential Cookies Only

Your browser may send cookies to secure the HTTPS connection:

- **SessionID** (if set by HTTPS protocol): Temporary, per-session only
- **No persistent tracking cookies**

You can verify by opening Browser DevTools → Application → Cookies. You'll see:

- No tracking domains
- No analytics cookies
- No third-party cookies

## 9. Retention & Deletion

### 9.1 How Long We Keep Data

| Data Type | Retention |
|-----------|-----------|
| Your geolocation | Cleared when session ends (browser closed) |
| Charging station data | Static, updated quarterly |
| Map viewport history | Not tracked |
| Map interaction logs | Not tracked |

### 9.2 How to Delete Your Data

Since we store nothing about you:

1. ✅ **Nothing to delete** — We have no data to delete
2. ✅ **Browser cleanup** — Clear browser cache anytime (your choice)
3. ✅ **Automatic clearance** — Close the browser tab, data is gone

### 9.3 Your Geolocation Privacy

Once you close the tab:

- Geolocation is deleted from RAM
- No local storage (no tracks left behind)
- No server has a copy (never transmitted)
- Your browser's location permissions can be reset anytime

**To reset location permissions:**
- **Chrome:** Settings → Privacy → Site settings → Location
- **Firefox:** Preferences → Privacy & Security → Permissions → Location
- **Safari:** Preferences → Websites → Location

## 10. Changes to This Policy

We will update this privacy policy if:

- We add new features that process data
- We add backend APIs or databases
- We integrate third-party analytics
- Regulations require changes

**Notification:** Major changes will be announced in GitHub releases. You can subscribe to releases via the repository.

## 11. International Data Transfers

**Not Applicable.** We collect zero personal data, so there are no international data transfers of user information.

**GitHub Pages Hosting** (storage location):
- Primary: United States (GitHub servers)
- CDN: Global (Fastly)
- Data hosted subject to GitHub's privacy policy

## 12. Community Submissions & Email Confirmations (Phase C)

### 12.1 How Community Submissions Work

Users can submit charging location suggestions via our GitHub Issue Form:

- **No email field in form** — Email is not collected publicly (avoids exposure in public GitHub issues)
- **Email collection is optional** — If you submit, we may send a confirmation email via Resend (see below)
- **Issue is public** — Your submission (name, address, hours) appears publicly on GitHub
- **Email is private** — Your email address is never stored in our GitHub repository

### 12.2 Resend Email Integration

When you suggest a location, we may send a confirmation email through **Resend** (a privacy-first email service):

**What Resend Does:**
- Sends confirmation emails from `queen.vln.gg`
- Stores your email address only in Resend's encrypted "Audiences" service (not in our GitHub repo)
- Provides a one-click confirmation link

**What Resend Doesn't Do:**
- Never shares your email with us (we don't store it)
- Never uses your email for marketing
- Never shares your email with third parties
- See [Resend's Privacy Policy](https://resend.com/privacy) for their full commitment

**What We Don't Do:**
- Never store your email in our database
- Never use your email for anything except confirmation
- Never access Resend's stored emails directly

### 12.3 Confirmation Tokens & Expiry

Confirmation emails include a one-time verification link:

- **Token Format:** 40+ character random string, expires after 7 days
- **Single-Use:** Each token can only be used once; after confirmation, it's invalidated
- **Unconfirmed Cleanup:** If you don't confirm within 7 days, the token is automatically deleted
- **No Re-verification Needed:** Confirmed submissions are published immediately

### 12.4 Data Retention

| Data | Storage | Retention |
|------|---------|-----------|
| Confirmation email | Resend Audiences only | Until you request deletion |
| Confirmation token | Our database | 7 days (auto-deleted if not confirmed) |
| Your submission text | GitHub Issues (public) | Indefinitely (you can delete or edit) |
| Email confirmation status | Our database | Until you request deletion |

### 12.5 Your Rights Regarding Submissions

- **Edit/Delete:** You can edit or delete your GitHub Issue submission anytime
- **Unsubscribe:** Email us to remove your email from Resend Audiences
- **No Targeting:** We never use your email for advertising or marketing
- **Transparency:** All submission data is public on GitHub (except email)

### 12.6 GDPR & CCPA Compliance for Email

**GDPR (Europe):**
- We have a lawful basis (your explicit consent to confirm) for storing your email with Resend
- You can request deletion anytime (contact us below)
- Resend is GDPR-compliant (see their privacy policy)

**CCPA (California):**
- Email is not "personal information" requiring CCPA compliance in our systems (it's stored only with Resend)
- You have the right to request deletion

**Contact for Deletion:**
- Email: privacy@fused-gaming.com (when domain secured)
- GitHub: [Private security advisory](https://github.com/Fused-Gaming/plug/security/advisories)
- Include: "Remove my email from Resend Audiences"

---

## 18. Contact & Questions

### 13.1 Privacy Questions

For privacy questions about the Charging Station Locator:

1. **Open an issue:** [GitHub Discussions](https://github.com/Fused-Gaming/plug/discussions)
2. **Email:** security@fused-gaming.com (when domain secured)
3. **Security advisory:** [Private security advisory](https://github.com/Fused-Gaming/plug/security/advisories)

### 13.2 Privacy Requests

Since we store no personal data:

- **Access request:** You have nothing to access (data not stored)
- **Deletion request:** Nothing to delete (data not stored)
- **Correction request:** Nothing to correct (data not collected)

If you'd like to verify our privacy practices, the source code is open-source and auditable.

## 18. Opt-Out Procedures

### 13.1 Disable Geolocation

1. Open Charging Station Locator
2. Do NOT click "Find Nearby Chargers"
3. Use the search bar instead (no geolocation needed)
4. Browser → Settings → Reset location permissions

### 13.2 Disable Tracking (Already Disabled)

We have no analytics to disable. The app ships with zero tracking.

### 13.3 Browser Privacy Mode

Open the app in:

- **Chrome Incognito Mode**
- **Firefox Private Browsing**
- **Safari Private Window**

For even stronger privacy (cookies and cache automatically deleted on close).

## 18. Do Not Track (DNT)

While we honor the "Do Not Track" (DNT) header from browsers, we do not track users regardless of DNT status.

- Your browser's DNT setting makes no difference (we don't track anyway)
- No analytics to disable
- No personalization happening

## 18. California Privacy Rights (CPRA)

**California Consumer Privacy Act (CCPA) & California Privacy Rights Act (CPRA):**

Under CPRA, California residents have the right to:

| Right | Status |
|-------|--------|
| Disclosure of data collection | ✅ Transparent (zero data collected) |
| Deletion of personal info | ✅ N/A (no personal data stored) |
| Opt-out of sale | ✅ N/A (no data sold) |
| Opt-out of profiling | ✅ N/A (no profiling) |
| Non-discrimination | ✅ N/A (equal treatment) |

We do not sell personal information and do not require opt-out mechanisms because we collect nothing.

## 18. Transparency Report

**We have nothing to report because we collect nothing.**

Hypothetical transparency report (if it existed):

| Category | Data Received |
|----------|---------------|
| User geolocation requests | 0 |
| User accounts created | 0 |
| Sessions tracked | 0 |
| Advertising pixels fired | 0 |
| Third-party data shares | 0 |
| Government requests | 0 |
| Data breaches | 0 |

## 18. Special Requests from Governments

**If law enforcement requests user data:**

We have zero user data to share. We cannot provide:

- User identities
- Geolocation data
- Session logs
- IP addresses of specific users
- Device identifiers
- Browsing history

We will be transparent that no such data exists.

---

## Appendix A: How This App Works (Privacy Perspective)

1. **User opens app** → Static HTML/CSS/JS downloaded from GitHub Pages
2. **User searches** → Search happens in the browser (no server call)
3. **User clicks "Find Nearby"** → Browser asks for geolocation permission
4. **User grants permission** → Browser provides geolocation in JavaScript
5. **Distance calculated** → JavaScript math (Haversine formula) runs locally
6. **Results displayed** → User sees nearest charging stations
7. **User closes tab** → Geolocation deleted from memory

**Server involvement:** Zero. Everything happens in the browser.

---

## Appendix B: Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              User's Browser                         │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ Charging Station Locator App                │   │
│  │                                              │   │
│  │ • Static Map UI                             │   │
│  │ • Embedded station data                     │   │
│  │ • Distance calculation (Haversine)          │   │
│  │ • Geolocation handling (request/response)   │   │
│  │                                              │   │
│  │ All processing local (no external calls)    │   │
│  └──────────────────────────────────────────────┘   │
│                      │                              │
│                      ├─→ Browser Geolocation API    │
│                      │   (user permission only)     │
│                      │                              │
│                      ├─→ OpenStreetMap CDN          │
│                      │   (public map tiles only)    │
│                      │                              │
│                      └─→ No server requests         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Fused Gaming Servers                        │
│                                                     │
│  • GitHub Pages (static hosting)                    │
│  • No backend API                                   │
│  • No user tracking                                 │
│  • No data collection                               │
│                                                     │
│  Your data NEVER reaches here                       │
└─────────────────────────────────────────────────────┘
```

---

**Questions about privacy?** We're committed to being transparent. If something is unclear, [open a GitHub discussion](https://github.com/Fused-Gaming/plug/discussions).

**This policy is binding.** We will never introduce tracking, analytics, or data collection without explicit updates to this document and clear user notification.
