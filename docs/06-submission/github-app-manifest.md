# PLUG GitHub App — Manifest Setup

Registering a GitHub App cannot be done via the API — GitHub requires a human to
click through the creation screen in a browser. This doc has everything needed
to do that in about two minutes, using GitHub's
[App Manifest flow](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest)
so no fields need to be typed by hand.

This App exists for exactly one purpose (see
[issue #42](https://github.com/Fused-Gaming/plug/issues/42)): let the
stateless verification function create a labeled submission Issue on behalf
of a visitor who confirmed their email, without that visitor ever needing a
GitHub account. It must not be able to do anything else.

## 1. Submit the manifest

Open `docs/06-submission/github-app-manifest-submit.html` (in this same
folder) in a browser — it's a tiny local page that auto-submits the manifest
below to GitHub. Since this repo is owned by the `Fused-Gaming` org, it posts
to the org's app-creation endpoint so the App is scoped correctly from the
start:

```
https://github.com/organizations/Fused-Gaming/settings/apps/new
```

You'll need to be signed in as a user with permission to create GitHub Apps
for that org. GitHub will show a confirmation screen summarizing the
permissions below — review it, then click **Create GitHub App**.

## 2. What the manifest requests

| Permission | Access | Why |
|---|---|---|
| Metadata | Read | Required minimum for any GitHub App |
| Issues | Read and write | Create the labeled submission issue; nothing else |
| Contents | *(not requested)* | The App must never write to the repo directly |
| Pull requests | *(not requested)* | GitHub Actions opens the PR, not the App |
| Actions | *(not requested)* | The App must not trigger or modify workflows |
| Administration | *(not requested)* | The App must not touch repo settings |

No webhook events are requested — the App is only ever used to *create*
issues via an installation access token from the verification function; it
never needs to *receive* events itself. (`request_oauth_on_install` and
`setup_on_update` are both left off for the same reason: no user-facing OAuth
or setup flow.)

## 3. After creation: capture credentials

GitHub redirects you to a URL like:

```
http://localhost/plug-github-app-callback?code=abcdefghijklmnop
```

(The `localhost` redirect is expected and fine — you don't need a real
server there; just copy the `code` value out of the address bar.)

That code is single-use and expires quickly. Exchange it immediately for the
App's real credentials by running:

```bash
curl -s -X POST "https://api.github.com/app-manifests/PASTE_CODE_HERE/conversions" \
  -H "Accept: application/vnd.github+json" | tee plug-github-app-credentials.json
```

This returns (among other fields):

- `id` — the App ID
- `pem` — the App's private key (PEM format) — **treat this like a password**
- `webhook_secret` — unused (no webhooks requested) but generated anyway
- `client_id` / `client_secret` — unused by this design (no OAuth login flow)

**Do not commit `plug-github-app-credentials.json` to the repository.** Once
you have it:

1. **Install the App** on `Fused-Gaming/plug` only: on the App's settings
   page, click **Install App**, choose the `Fused-Gaming` org, and select
   "Only select repositories" → `plug`. Note the **installation ID** shown in
   the resulting URL (`.../settings/installations/<installation_id>`) — the
   verification function needs it alongside the App ID and private key to
   mint installation access tokens.
2. Hand the App ID, installation ID, and private key (`pem`) to whoever is
   wiring up the verification function's secrets (see #42's "Verification
   Function" section) — they go in as `GITHUB_APP_ID`,
   `GITHUB_APP_INSTALLATION_ID`, and `GITHUB_APP_PRIVATE_KEY` environment
   variables there, never in this repository.
3. Delete the local `plug-github-app-credentials.json` once it's been copied
   into the verification function's secret store.
