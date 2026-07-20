# Debugging Guide

Interesting bugs encountered and solutions applied.

## Bug #1: GitHub Actions Build Path Confusion

### The Problem
After pushing code to GitHub, the workflow ran successfully, but we weren't sure which folder GitHub Pages would deploy.

### Investigation
```bash
# Local test of build
npm run build
ls -la dist/

# Saw dist/ contained:
# - index.html
# - assets/main.*.js
# - assets/main.*.css
```

### The Issue
GitHub Actions workflow was unclear about the output directory. Vite puts built files in `dist/`, but the workflow needed to explicitly tell GitHub Pages to serve from there.

### Solution
Updated `.github/workflows/deploy.yml`:
```yaml
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v2
  with:
    artifact_name: github-pages
    artifact_path: dist/
```

Explicitly specified `artifact_path: dist/` so GitHub Pages knows where to find the static files.

### Key Learning
Build tools create output directories (Vite → dist/, Next → out/, etc.). Deployment workflows must know which directory to serve. Always verify your build output location.

---

## Bug #2: Package-lock.json Git Conflicts

### The Problem
After adding SyncPulse skills with npm install, `package-lock.json` changed. This file was in `.gitignore`, so team members couldn't reproduce dependency versions.

### The Issue
**Why ignore package-lock.json?**
- Common for polyrepo scenarios (Yarn, pnpm)
- Reduces noise in git history

**But this breaks reproducibility:**
- Different team members get different versions
- Works on my machine → doesn't work on yours
- CI uses random versions → production uses different versions

### Solution
Updated `.gitignore` to track `package-lock.json`:
```diff
# Dependencies
node_modules/
yarn.lock        ← still exclude (Yarn)
pnpm-lock.yaml   ← still exclude (pnpm)
- package-lock.json
+ package-lock.json ← now tracked (npm)
```

### Key Learning
Lock files should ALWAYS be committed for reproducibility. Exclude competing lock files (yarn.lock, pnpm-lock.yaml) when using npm. The trade-off: slightly noisier git history vs. guarantee that all team members and CI use identical versions.

---

## Bug #3: Initial GitHub Pages + React Skepticism

### The Problem
Team wasn't convinced React could run on static GitHub Pages without a backend.

### The Issue
React traditionally needs a server to serve HTML. GitHub Pages only serves static files. Seemed incompatible.

### Investigation
```bash
# Test the build pipeline
npm run build
cd dist/
ls -la
# Output:
# - index.html (pure HTML, no server needed)
# - assets/main.*.js (React bundled and minified)
# - assets/main.*.css (compiled CSS)
```

Realized: React pre-compiles to pure JavaScript. Browser downloads HTML, parses it, loads the JavaScript, and React initializes client-side.

### Solution
Created comprehensive documentation (PROJECT_PLAN.md) explaining:
1. React → Vite → static dist/
2. GitHub Pages serves static files
3. Browser downloads and runs React
4. Full interactivity client-side

Tested with:
```bash
npm run preview
# Visited http://localhost:4173
# Verified all features work identically to dev server
```

### Key Learning
Pre-built static files ≠ lack of interactivity. Modern build tools compile dynamic frameworks to static output. GitHub Pages can host full React SPAs—they just need pre-compilation.

---

## Bug #4: Geolocation Permission Flow Confusion

### The Problem
First user test: map displays but geolocation permission prompt doesn't appear cleanly.

### Investigation
```javascript
// Initial code
navigator.geolocation.getCurrentPosition(
  (position) => { /* success */ },
  (error) => { /* error */ }
)
```

Issue: If user denies permission, the error handler silently fails. No feedback to user about why distance sorting isn't working.

### Solution
Added proper error handling:
```javascript
const [geoError, setGeoError] = useState(null)

const requestLocation = () => {
  if (!navigator.geolocation) {
    setGeoError("Geolocation not supported")
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Success: use location
      setUserLocation(position.coords)
    },
    (error) => {
      // Error: inform user
      setGeoError(`Permission denied: ${error.message}`)
    }
  )
}
```

Display feedback to user:
```javascript
{geoError && <p className="error">{geoError}</p>}
```

### Key Learning
Browser APIs (geolocation, localStorage, etc.) often fail silently. Always add error handling and provide user feedback. Helps users understand why features aren't working.

---

## Bug #5: Map Marker Click Not Working on First Load

### The Problem
Occasionally, clicking markers didn't trigger the selection. Needed to click twice or refresh.

### Investigation
Race condition: Map initialization taking longer than marker setup.
```javascript
// Bad: markers added before map initialized
locations.forEach(location => {
  addMarker(location)  // Map might not be ready
})
```

### Solution
Used proper initialization sequence:
```javascript
useEffect(() => {
  if (!mapContainer.current) return
  
  // Initialize map first
  const map = new maplibregl.Map({
    container: mapContainer.current,
    style: 'https://tile.openstreetmap.org/style.json',
    center: [initialLng, initialLat],
    zoom: 12
  })
  
  // Wait for map to load
  map.on('load', () => {
    // Only THEN add markers
    locations.forEach(location => {
      addMarkerToMap(map, location)
    })
  })
  
  return () => map.remove()
}, [])
```

### Key Learning
External libraries (MapLibre, etc.) have initialization timelines. Always wait for 'load' or 'ready' events before interacting with them. Race conditions are hard to debug—use events as synchronization points.

---

## Bug #6: Responsive Layout Broken on iPad

### The Problem
On iPad landscape mode (1024px), layout was breaking—list overlapping map.

### Investigation
CSS media query was too simple:
```css
@media (min-width: 1024px) {
  /* Assumes desktop-only layout */
}
```

iPad landscape = 1024px width but device is still touch-friendly tablet, not desktop.

### Solution
Refined breakpoints:
```css
/* Tablet: any device less than 1024px */
@media (max-width: 1023px) {
  .layout {
    flex-direction: column;
    /* Stacked or overlay */
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) and (pointer: fine) {
  .layout {
    flex-direction: row;
    /* Side-by-side */
  }
}
```

Used `pointer: fine` to detect mouse (desktop) vs. coarse pointer (touch).

### Key Learning
Breakpoints aren't just screen width. Consider device capabilities (touch vs. mouse), orientation, and actual usage patterns. Test on real devices, not just DevTools emulation.

---

## Common Debugging Patterns Used

### Pattern 1: Console Logging
```javascript
console.log('Locations loaded:', locations)
console.log('User location:', userLocation)
console.log('Sorted by distance:', sortedLocations)
```

Remove before production.

### Pattern 2: Browser DevTools
```
F12 → Elements: inspect DOM structure
F12 → Console: run JavaScript commands
F12 → Network: check API/asset loading
F12 → Responsive Design Mode: test breakpoints
```

### Pattern 3: React DevTools
```
Browser plugin → inspect component tree
Watch prop changes
Monitor state updates
```

### Pattern 4: Git Bisect
When a bug appeared suddenly:
```bash
git bisect start
git bisect bad HEAD
git bisect good <commit where it worked>
# Binary search through commits to find root cause
```

### Pattern 5: Incremental Testing
- Build locally: `npm run dev`
- Test each feature in isolation
- Test on multiple breakpoints (F12 device toggle)
- Test on actual mobile device before pushing
- Verify in production (plug.vln.gg)

---

## Preventing Future Bugs

### Best Practices Established

1. **Always test the build**
   ```bash
   npm run build && npm run preview
   ```

2. **Test on actual devices**
   - Desktop browser
   - Tablet (landscape & portrait)
   - Mobile phone

3. **Use React DevTools**
   - Install browser extension
   - Verify prop flow and state updates

4. **Check browser console**
   - No red errors before committing
   - Address yellow warnings

5. **Document assumptions**
   - Explain WHY something works
   - Helps future debugging

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**
