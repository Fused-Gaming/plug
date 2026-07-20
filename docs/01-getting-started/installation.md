# Installation

Step-by-step guide to install and set up the project.

## Prerequisites

Before installing, make sure you have:

- **Node.js 18+** — [Install from nodejs.org](https://nodejs.org)
  - Check: `node --version` (should be v18.0.0 or higher)
- **npm 8+** — Included with Node.js
  - Check: `npm --version`
- **Git** — [Install from git-scm.com](https://git-scm.com)
  - Check: `git --version`
- **A code editor** — VS Code, WebStorm, or any text editor

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Fused-Gaming/plug.git
cd plug
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`, including:
- React 18 (UI framework)
- Vite 5 (build tool)
- MapLibre GL (mapping library)

**Note:** This may take 1-2 minutes on first install.

### 3. Verify Installation

```bash
npm run build
```

Should complete with no errors. You'll see a `dist/` folder created (this is the static build).

## Verify the Installation Works

### Option A: Development Server (Recommended)

```bash
npm run dev
```

Open your browser to **http://localhost:5173** and verify:
- ✅ Map displays showing NYC area
- ✅ Red markers visible on map
- ✅ Location list appears in sidebar
- ✅ Clicking a marker shows location details

### Option B: Production Preview

```bash
npm run preview
```

Open your browser to **http://localhost:4173** and verify the production build works identically.

## Project Structure After Install

```
plug/
├── node_modules/          ← Installed packages (created by npm install)
├── src/                   ← Source code
│   ├── App.jsx           ← Main component
│   ├── main.jsx          ← React entry point
│   ├── components/       ← React components
│   ├── data/            ← Charging location data
│   └── styles/          ← CSS styling
├── dist/                 ← Production build (created by npm run build)
├── package.json          ← Dependencies and scripts
├── vite.config.js        ← Vite configuration
└── ...
```

## Troubleshooting

### npm install fails with permission error
```bash
# Try with sudo (not recommended)
sudo npm install

# Or reset npm cache
npm cache clean --force
npm install
```

### Port 5173 already in use
```bash
# Use a different port
npm run dev -- --port 3000
```

### Git clone fails
```bash
# Check internet connection
ping github.com

# If using SSH, try HTTPS
git clone https://github.com/Fused-Gaming/plug.git
```

### Module not found errors after clone
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- ✅ **New User?** → Read [Quick Start](quick-start.md)
- ✅ **Want to run locally?** → Read [Running Locally](running-locally.md)
- ✅ **Ready to contribute?** → Read [../CONTRIBUTING.md](../CONTRIBUTING.md)

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**
