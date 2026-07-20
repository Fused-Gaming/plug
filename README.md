# Next Chapter Project Demo

A minimal viable demo for the Next Chapter Project bootcamp entry.

## Project Vision

**Charging Station Locator** — A privacy-first map to help vulnerable populations (people experiencing homelessness, students, travelers, gig workers) locate free, reliable device-charging options.

**This MVP:** Read-only map interface showing charging locations. Bootcamp submission focusing on core value proposition without user submissions or complex features.

## What's Included

- Interactive map showing device charging stations
- Location details (name, address, operating hours)
- Basic filtering and search
- Mobile-responsive design
- Automated GitHub Pages deployment to plug.vln.gg

## Live Demo

**🚀 [View the Live Demo](https://plug.vln.gg)**

**Deployment Details:**
- **Production URL:** https://plug.vln.gg
- **Fallback URL:** https://fused-gaming.github.io/plug
- **Status:** ✅ Live (Automatically deployed on every push to main)
- **Build:** Vite (pre-built React to static files)
- **Hosting:** GitHub Pages (plug.vln.gg custom domain)

## Getting Started

### Prerequisites
- Node.js 18+ (or your chosen runtime)
- [Other key requirements]

### Installation

```bash
git clone https://github.com/fused-gaming/plug.git
cd plug
npm install
```

### Running the Demo

```bash
npm run dev
```

The demo will be available at `http://localhost:3000`

## Core Feature: Read-Only Charging Map

- View charging stations on an interactive map
- See details: name, address, hours of operation
- Filter by availability (if location is known)
- Distance-based sorting
- Works on mobile and desktop

## Architecture

**Frontend:** React + Vite (fast build, lightweight)  
**Mapping:** MapLibre GL JS + OpenStreetMap (free, no API key needed)  
**Data:** Hardcoded seed locations (no backend required)  
**Deployment:** GitHub Pages (automatic on push to main)

## Testing

```bash
npm test
```

## Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions.

- **Live:** https://plug.vln.gg
- **Workflow:** `.github/workflows/deploy.yml`
- **Build output:** `dist/` folder

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment documentation and troubleshooting.

## Submission Details

- **Target:** Next Chapter Project Coding Bootcamp
- **Submission Date:** [Day 7 deadline]
- **Demo Duration:** 5-10 minutes

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[Project license]

## Contact

For questions about this submission, contact [your contact info]
