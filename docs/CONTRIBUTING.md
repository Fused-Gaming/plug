# Contributing to Charging Station Locator

Thank you for your interest in contributing to the Charging Station Locator! This document outlines how to participate in development, data curation, and community building.

## Table of Contents

- [Types of Contributions](#types-of-contributions)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Coding Standards](#coding-standards)
- [Data Contribution](#data-contribution)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

## Types of Contributions

### 1. Code Contributions

Develop new features, fix bugs, or improve performance:

- **Features:** New map functionality, UI components, data integration
- **Bugs:** Report issues with map rendering, geolocation, or responsive design
- **Performance:** Optimize build size, load times, or map tile loading
- **Accessibility:** Improve WCAG 2.2 AA compliance and screen reader support

### 2. Data Contributions

Help expand charging station coverage in Oakland and beyond:

- **Add Locations:** Submit new charging stations from public data sources
- **Verify Data:** Confirm station details (hours, charger types, accessibility)
- **Update Info:** Report changes in operating hours, closures, or new connectors
- **Geographic Expansion:** Help us add new cities and regions

See [DATA_SOURCES.md](DATA_SOURCES.md) for data sourcing guidelines.

### 3. Documentation

Help us maintain clear, accurate project documentation:

- **User Guides:** Document features and how to use the map
- **Developer Guides:** Explain architecture and setup for new contributors
- **Case Studies:** Share stories of how the map helped vulnerable populations
- **Translations:** Help translate the interface and docs into other languages

### 4. Community Submissions (Phase C)

Help expand our charging station database with one-click verification:

- **Suggest Locations:** Submit new charging stations via GitHub Issue Form
- **Email Verification:** Click confirmation link to verify your submission
- **Privacy-First:** Email stored only with Resend, never in GitHub
- **Quick Publishing:** Verified locations appear on the map within 24 hours

See [Community Submissions](#community-submission-workflow-phase-c) below for detailed workflow.

### 5. Community Building

Support the project beyond code:

- **Feedback:** Share feature requests and usage experiences
- **Testing:** Report bugs and edge cases on different devices
- **Outreach:** Help connect with communities that need charging access
- **Advocacy:** Share the project with networks that could benefit

## Development Setup

### Prerequisites

- **Node.js 18+** — [Install here](https://nodejs.org/)
- **npm 8+** — Included with Node.js
- **Git** — [Install here](https://git-scm.com/)

### Local Development

```bash
# Clone the repository
git clone https://github.com/fused-gaming/plug.git
cd plug

# Create a feature branch (see Branch Strategy below)
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173` with hot module reloading.

### Testing Your Changes

**Desktop:**
```bash
npm run dev
# Navigate to http://localhost:5173
```

**Mobile/Tablet:**
```bash
# Find your local IP address
ipconfig getifaddr en0  # macOS
hostname -I            # Linux
ipconfig               # Windows

# Access from mobile device on same network
http://192.168.x.x:5173
```

**Production Build:**
```bash
npm run build      # Creates dist/ folder
npm run preview    # Simulates GitHub Pages deployment
# Navigate to http://localhost:4173
```

### Before Pushing

```bash
# Build to check for errors
npm run build

# Run linting/formatting (when available)
npm run lint       # If configured

# Check Git status
git status
git diff           # Review your changes
```

## Branch Strategy

> **Canonical guide:** see [Branching Strategy](05-development/BRANCHING_STRATEGY.md) for the full workflow — GitHub Flow with a protected `main`, short-lived `feat/`, `fix/`, `docs/`, `chore/` (and `claude/`) branches, and squash-merged PRs.

### Main Branches

- **`main`** — Production branch, automatically deployed to GitHub Pages
- **`integration-map-app`** — Integration branch for feature development
- **`agent/*`** — Individual agent feature branches (swarm coordination model)

### Creating a Feature Branch

For individual contributions:

```bash
# Update main first
git fetch origin
git checkout main
git pull origin main

# Create feature branch from main
git checkout -b feature/description-of-change
```

For swarm-coordinated work:

```bash
# Create agent branch from integration-map-app
git fetch origin
git checkout integration-map-app
git pull origin integration-map-app

git checkout -b agent/your-agent-number-description
```

### Branch Naming

Use clear, descriptive names:

- **Features:** `feature/user-submissions` or `feature/real-time-data`
- **Bugs:** `fix/geolocation-permission-error`
- **Docs:** `docs/contributing-guidelines`
- **Swarm Agents:** `agent/01-static-build` or `agent/08-privacy-security`
- **Data:** `data/add-oakland-locations` or `data/verify-bay-area`

## Coding Standards

### JavaScript/React

```javascript
// Use clear, descriptive variable names
const nearbyStations = filterByDistance(stations, userLocation);

// Prefer const over let
const mapContainer = document.getElementById('map');

// Use arrow functions
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  // Haversine formula...
};

// Add comments only for non-obvious logic
// Calculate bearing for direction indicator
const bearing = Math.atan2(Math.sin(dLng), Math.cos(lat1));
```

### CSS

```css
/* Mobile-first responsive design */
.map-container {
  width: 100%;
  height: 400px;
}

/* Tablet breakpoint: 640px+ */
@media (min-width: 640px) {
  .map-container {
    height: 600px;
  }
}

/* Desktop breakpoint: 1024px+ */
@media (min-width: 1024px) {
  .map-container {
    height: calc(100vh - 60px);
  }
}
```

### Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include `aria-label` for screen readers
- Ensure 4.5:1 contrast ratio for text (WCAG AA)
- Test keyboard navigation (Tab, Enter, Escape)

### Security

- **Never commit credentials** — Use environment variables
- **Sanitize user input** — If accepting data in future versions
- **Validate geolocation** — Check browser API responses
- **Use HTTPS only** — GitHub Pages enforces this

See [SECURITY.md](../SECURITY.md) for complete security guidelines.

### Performance

- Keep component re-renders minimal
- Use React.memo for expensive components
- Lazy-load map tiles
- Minify CSS and JavaScript (Vite handles this automatically)

## Data Contribution

### Adding Charging Stations

1. **Source verification** — Data must come from public sources:
   - Government open data portals
   - Community platforms (PlugShare, OpenStreetMap)
   - Published utility company lists
   - Public facility websites

2. **Required fields:**
   ```json
   {
     "id": 1,
     "name": "Downtown Convention Center",
     "lat": 37.8044,
     "lng": -122.2712,
     "address": "10 10th St, Oakland, CA 94607",
     "charger_type": "Level 2",
     "connectors": "Tesla, CCS, J1772",
     "power_kw": 7.2,
     "source": "Oakland Open Data",
     "verified_date": "2026-07-20"
   }
   ```

3. **Submit via:**
   - **Pull Request:** Add to `src/data/seed-data.json`
   - **GitHub Issue:** Provide data in JSON format
   - **Data Form:** (Coming in Wave 2)

4. **Review process:**
   - Data verified for accuracy
   - Source attributed correctly
   - Location coordinates checked on map
   - Merged to `integration-map-app` → `main`

### Geographic Expansion

To add a new city:

1. Create a new data file: `src/data/[city-name]-locations.json`
2. Source 10+ verified charging stations
3. Add to app configuration
4. Update documentation with city info
5. Submit pull request with justification

## Community Submission Workflow (Phase C)

Phase C enables community members to suggest charging locations via GitHub Issue Forms with email verification.

### User Flow

1. **Visit GitHub Issues** → Click "New Issue" → Choose "Suggest a Charging Location"
2. **Fill out Form:**
   - Place name (required, 3–80 chars)
   - Category (dropdown: Library, Community Center, Cafe, Charging Station, Other)
   - Street address (required, 5–120 chars)
   - Neighborhood/cross street (optional)
   - Coordinates (optional, must be in Oakland area)
   - Indoor/Outdoor (required)
   - Who can use it (required: Everyone or Customers Only)
   - Hours (optional, e.g., "Mon-Fri 10am-6pm")
   - Available charging types (checkboxes: Outlets, USB, WiFi, Accessible)
   - Additional notes (optional, 0–280 chars)

3. **Submit Issue** → System sends confirmation email to issue creator
4. **Click Confirmation Link** in email (7-day expiry)
5. **Location Published** to map within 24 hours

### Data Quality Standards

All submissions are validated and sanitized before publication:

#### Required Fields Validation

| Field | Rules | Valid Example | Invalid Example |
|-------|-------|---------------|-----------------|
| **Place Name** | 3–80 chars, no markup | "Oakland Main Library" | "Lib <b>Main</b>" |
| **Category** | From dropdown only | "Library" | "Free WiFi Place" |
| **Street Address** | 5–120 chars, specific | "123 Main St, Oakland" | "Downtown" |
| **Indoor/Outdoor** | Exactly "Indoor" or "Outdoor" | "Indoor" | "sometimes" |
| **Who Can Use** | "Open to everyone" or "Customers only" | "Open to everyone" | "Usually public" |

#### Text Sanitization

All text fields are automatically cleaned:

- **Strips:** Control characters, markup tags (`<>`, backticks), URLs
- **Converts:** Markdown links → plain text
- **Collapses:** Multiple spaces → single space
- **Trims:** Leading/trailing whitespace

Example:
```
Input:  "Best place EVER!!! <script>alert('hi')</script> Visit https://example.com"
Output: "Best place EVER Visit example.com"
```

#### Location Filtering

- **Coordinates** must fall within Oakland service area (37.7°–37.85°N, 122.1°–122.3°W)
- **Out-of-area submissions** are flagged for manual review
- **No duplicates:** Check the live map before submitting

### Email Confirmation Privacy

- **Email storage:** Only with Resend (encrypted "Audiences" service)
- **No GitHub storage:** Email never committed to repository
- **No marketing:** Only confirmation email sent
- **Your control:** Email us to unsubscribe anytime

See [Privacy Policy](../07-security/PRIVACY.md#12-community-submissions--email-confirmations-phase-c) for full details.

### Review Process

1. **Automated validation** — Form fields checked
2. **Sanitization** — Text cleaned of control chars/markup
3. **User confirmation** — Email link clicked
4. **Publication** — Location added to locations.json within 24 hours
5. **Listing** — Appears on live map at plug.vln.gg

### Duplicate Submissions

If the same location is submitted multiple times:
- Latest confirmation timestamp wins
- Earlier submissions are kept for audit trail
- Contact maintainers for removal requests

### Editing or Removing Submissions

- **Edit:** Modify your GitHub Issue anytime
- **Delete:** Delete the GitHub Issue (removes from future ingests)
- **Email:** Contact maintainers to remove email from Resend

## Pull Request Process

> PRs are squash-merged into `main` and the branch is deleted after merge — see [Branching Strategy](05-development/BRANCHING_STRATEGY.md). For how changes become versioned releases (changelog, tags, GitHub Releases), see [Release Process](05-development/RELEASE_PROCESS.md).

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch origin
   git rebase origin/main  # or origin/integration-map-app
   ```

2. **Test thoroughly:**
   ```bash
   npm run build  # Check for build errors
   npm run preview  # Test production build
   ```

3. **Review your own code:**
   ```bash
   git diff main...  # See your changes
   ```

### Creating a Pull Request

1. **Push to GitHub:**
   ```bash
   git push -u origin feature/your-feature
   ```

2. **Create PR on GitHub:**
   - Use a clear title: "Add real-time availability status"
   - Describe what changes and why
   - Reference related issues: "Closes #42"
   - Link to design/mockups if applicable

3. **PR Description Template:**
   ```markdown
   ## Summary
   Brief description of changes

   ## Changes
   - Feature 1
   - Feature 2
   - Bug fix 3

   ## Testing
   - [ ] Tested on desktop (1920px)
   - [ ] Tested on tablet (768px)
   - [ ] Tested on mobile (375px)
   - [ ] Verified accessibility

   ## Related Issues
   Closes #123
   ```

### Review Process

- **Code Review:** Team member reviews changes
- **CI/CD:** Automated tests and linting run
- **Feedback:** Comments on code or design
- **Approval:** PR merged once approved

### After Approval

- Your branch merges to `integration-map-app` or `main`
- GitHub Actions automatically builds and deploys
- Check https://plug.vln.gg to verify changes live

## Community Guidelines

### Be Respectful

- Treat all contributors with respect
- Acknowledge different perspectives
- Give and accept constructive feedback gracefully
- No harassment, discrimination, or hate speech

### Focus on Impact

- Prioritize features that help vulnerable populations
- Consider privacy-first design
- Test on low-end devices and networks
- Document decisions for future contributors

### Communicate Clearly

- Ask questions if something is unclear
- Share your reasoning in PRs and issues
- Document non-obvious code
- Respond to feedback thoughtfully

### Honor Our Values

- **Privacy First:** Never add tracking or data collection
- **Accessible:** Design for all abilities
- **Open Source:** Share knowledge and welcome new contributors
- **Community Driven:** Prioritize public data and community curation

## Reporting Issues

### Security Issues

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. **Report privately:** [Security Advisory](https://github.com/fused-Gaming/plug/security/advisories)
3. Provide details: description, steps to reproduce, potential impact

See [SECURITY.md](../SECURITY.md) for full disclosure policy.

### Bug Reports

Open an issue with:

- **Title:** "Map doesn't load on Firefox mobile"
- **Environment:** Browser, OS, device
- **Steps to reproduce:** Exact sequence to trigger bug
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Screenshots/video:** If applicable

### Feature Requests

Suggest improvements:

- **Title:** "Add filter by charger type"
- **Use case:** Why this would help users
- **Current workaround:** How users currently solve this
- **Alternative solutions:** Other approaches considered

## Recognition

We recognize and celebrate contributions:

- **Contributors:** Listed in CONTRIBUTORS.md
- **Commits:** Visible in Git history
- **Releases:** Acknowledged in release notes
- **Major features:** Featured in README and project updates

## Questions?

- **GitHub Discussions:** Ask questions in public
- **Issues:** Report bugs or request features
- **Email:** Contact maintainers with private concerns
- **Documentation:** Check docs/ first for answers

---

**Thank you for contributing to a more connected, equitable world!** 🌍📱

We believe technology should serve vulnerable populations—not exploit them. Every contribution moves us toward that goal.
