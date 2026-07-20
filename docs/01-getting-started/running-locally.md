# Running Locally

Detailed guide for development server setup and available commands.

## Development Server

Start the development server with hot module reloading:

```bash
npm run dev
```

Output:
```
  Local:    http://localhost:5173/
```

Open http://localhost:5173 in your browser.

### Hot Module Reloading

Changes to source files automatically update in the browser without refresh:

```bash
# Try editing src/components/Map.jsx
# Save the file → browser updates instantly
```

This dramatically speeds up development.

## Available Commands

### Development

```bash
# Start development server (port 5173)
npm run dev

# Start on different port
npm run dev -- --port 3000
```

### Building

```bash
# Build for production (creates dist/ folder)
npm run build

# Preview the production build locally
npm run preview
```

### Testing on Mobile

**Option 1: Local Network**
```bash
npm run dev
# Then open http://YOUR_IP:5173 on your phone
# Find YOUR_IP with: ifconfig | grep inet
```

**Option 2: Chrome DevTools**
```bash
# Press F12 in browser
# Click device toggle (top left)
# Select iPhone or Android preset
```

## Project File Structure

```
src/
├── App.jsx                 # Main component (state, event handlers)
├── main.jsx               # React entry point
├── components/
│   ├── Map.jsx           # MapLibre GL integration
│   └── LocationList.jsx  # Location sidebar list
├── data/
│   └── locations.js      # Hardcoded 10 NYC locations
└── styles/
    └── main.css          # Responsive styling
```

### Key Files to Edit

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/App.jsx` | Main component state, event handlers | Changing app behavior |
| `src/components/Map.jsx` | Map display and marker handling | Modifying map interactions |
| `src/components/LocationList.jsx` | Location list sidebar | Changing list display |
| `src/data/locations.js` | Charging station data | Adding/removing locations |
| `src/styles/main.css` | All styling | Changing colors, layout, responsive breakpoints |

## Development Workflow

### Adding a New Location

Edit `src/data/locations.js`:
```javascript
{
  id: 11,
  name: "Your Station Name",
  address: "123 Main St, NYC",
  latitude: 40.7580,
  longitude: -73.9855,
  hours: "6am-11pm"
}
```

Browser updates automatically → Location appears on map and list.

### Changing Colors

Edit `src/styles/main.css`:
```css
:root {
  --color-primary: #FF6B6B;      /* Brand red */
  --color-secondary: #EE5A6F;    /* Darker variant */
}
```

Browser updates automatically → All instances change.

### Adjusting Responsive Breakpoints

Edit `src/styles/main.css`:
```css
/* Mobile: < 576px */
/* Tablet: 576px - 1023px */
/* Desktop: 1024px+ */
```

## Debugging

### Browser Console Errors

Press F12 → Console tab:
- Red errors indicate real issues
- Yellow warnings are informational
- Check source map to find problematic code

### React DevTools

Install [React DevTools extension](https://react-devtools-tutorial.vercel.app/):
- Inspect component tree
- Check prop values
- Watch state changes

### Network Requests

Press F12 → Network tab:
- Verify API calls (if using real data)
- Check response sizes
- Monitor for failed requests

## Production Build

### Building for Deployment

```bash
npm run build
```

Creates `dist/` folder with:
- Minified HTML, CSS, JavaScript
- Optimized assets
- Ready for GitHub Pages

### Verifying Build Works

```bash
npm run preview
```

Serves `dist/` locally at http://localhost:4173 to simulate production.

## Environment Variables

Create `.env.local` for local configuration (not committed to git):

```
VITE_MAPLIBRE_API_KEY=your_key_here
```

Reference in code:
```javascript
const apiKey = import.meta.env.VITE_MAPLIBRE_API_KEY;
```

## Useful Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Stop dev server |
| `F12` | Open browser DevTools |
| `Ctrl+Shift+I` | DevTools alternative |
| `F5` | Full page reload |
| `Ctrl+Shift+Delete` | Clear cache |

## Next Steps

- 🏗️ **Understand architecture?** → Read [../../03-architecture/README.md](../../03-architecture/README.md)
- 🎨 **Modify design?** → Read [../../04-design/README.md](../../04-design/README.md)
- 🚀 **Deploy changes?** → Read [../../03-architecture/deployment-pipeline.md](../../03-architecture/deployment-pipeline.md)
- 💡 **Contribute code?** → Read [../../CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**
