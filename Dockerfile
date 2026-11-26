# syntax=docker/dockerfile:1
# Local CI gates: `npm run gate` (or `docker build --target gate .`).
# Replaces the PR-time Actions jobs (security scan, tests, build) so gates
# run on your machine instead of spending Actions minutes.
# `npm run build:docker` exports the static site to ./dist via the `site` stage.

FROM node:24.22.3-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Optional: --secret id=extra_ca,src=<pem> for TLS-intercepting proxies.
RUN --mount=type=secret,id=extra_ca,required=false \
    NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca npm ci --ignore-scripts --no-audit --no-fund

FROM deps AS gate
COPY . .
# Gate 1: production dependency audit (high and critical block the build).
RUN --mount=type=secret,id=extra_ca,required=false \
    NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca npm audit --omit=dev --audit-level=high
# Gate 2: security and CSP test suites (same suites the Actions workflow ran).
RUN npx jest src/__tests__/security.test.js src/__tests__/csp.test.js
# Gate 3: production build.
RUN npm run build && test -f dist/index.html

FROM scratch AS site
COPY --from=gate /app/dist /
