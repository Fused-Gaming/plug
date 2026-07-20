# Quick Start (5 Minutes)

Get the Charging Station Locator running in 5 minutes.

## TL;DR

```bash
git clone https://github.com/Fused-Gaming/plug.git
cd plug
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser. Done! 🎉

---

## Step-by-Step (5 min)

### 1. Clone (1 min)
```bash
git clone https://github.com/Fused-Gaming/plug.git
cd plug
```

### 2. Install (2 min)
```bash
npm install
```

Wait for installation to complete.

### 3. Run (1 min)
```bash
npm run dev
```

You'll see:
```
  Local:    http://localhost:5173/
```

### 4. Open Browser (1 min)
Visit **http://localhost:5173** in your browser.

You should see:
- 🗺️ A map showing New York City
- 📍 Red markers for charging stations
- 📋 A sidebar list of locations
- 📱 A responsive design

## Try These Interactions

✅ **Click a red marker** → See location details in a popup

✅ **Click a location in the list** → Map zooms to that location

✅ **Open on mobile** → Design adapts to small screens
- Go to http://192.168.1.XXX:5173 on your phone (replace XXX with your computer's IP)
- Or use Chrome DevTools: F12 → Toggle device toolbar

✅ **Try geolocation** → If browser asks for location access, allow it
- List sorts by distance from your current location

## What You're Seeing

- **Map**: OpenStreetMap tiles (free, open-source)
- **Markers**: Red pins for the 10 seed charging stations (NYC pilot)
- **Data**: Hardcoded in `src/data/locations.js`
- **UI**: React components with responsive CSS

## Next Steps

- 📖 Want to understand the code? → Read [Running Locally](running-locally.md)
- 🏗️ Want to learn architecture? → Read [../../03-architecture/README.md](../../03-architecture/README.md)
- 💡 Want to contribute? → Read [../../CONTRIBUTING.md](../../CONTRIBUTING.md)
- 🚀 Want to deploy? → Read [../../03-architecture/deployment-pipeline.md](../../03-architecture/deployment-pipeline.md)

## Stuck?

- Port 5173 in use? → `npm run dev -- --port 3000`
- npm install failed? → `npm cache clean --force && npm install`
- Read [Installation](installation.md) troubleshooting section

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**
