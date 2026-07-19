# Deployment Guide

## GitHub Pages Deployment

This project is automatically deployed to GitHub Pages on every push to `main`.

### Live URL
- **Production:** https://plug.vln.gg
- **Fallback:** https://fused-gaming.github.io/plug

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Installs dependencies
2. Builds the project (`npm run build`)
3. Deploys the `dist/` folder to GitHub Pages

**Requirements:**
- Build output must be in `dist/` folder
- GitHub Pages must be enabled in repo settings
- Custom domain (plug.vln.gg) must be configured in DNS

### DNS Configuration (plug.vln.gg)

To point plug.vln.gg to GitHub Pages, configure your DNS provider with:

**CNAME Record:**
```
Name: plug
Type: CNAME
Value: fused-gaming.github.io
TTL: 3600
```

The `CNAME` file in the repository root tells GitHub Pages which domain to use.

### GitHub Pages Settings

1. Go to **Settings → Pages**
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/ (root)`
5. Custom domain: `plug.vln.gg`
6. Enforce HTTPS: ✓ (once DNS propagates)

### Local Testing

To test the build locally:
```bash
npm run build
npm run preview  # or equivalent for your framework
```

Then check that `dist/` contains all needed files.

### Troubleshooting

**Build fails:**
- Check `npm run build` output locally
- Ensure `dist/` folder is created
- Check `.github/workflows/deploy.yml` for errors

**Site not updating:**
- Verify push was to `main` branch
- Check Actions tab for workflow status
- Wait 5-10 minutes for deployment to complete

**Custom domain not working:**
- Verify DNS CNAME record is set
- Wait for DNS propagation (up to 48 hours)
- Check GitHub Pages settings show correct domain
- Ensure CNAME file exists in repository root

### Framework-Specific Notes

**Next.js:**
```json
{
  "scripts": {
    "build": "next build && next export -o dist",
    "preview": "npx http-server dist"
  }
}
```

**React (Vite):**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Static Site:**
```json
{
  "scripts": {
    "build": "mkdir -p dist && cp -r src/* dist/",
    "preview": "npx http-server dist"
  }
}
```

---

**Note:** The deployment pipeline is automated. Focus on ensuring `npm run build` works correctly locally, and GitHub Pages will handle the rest.
