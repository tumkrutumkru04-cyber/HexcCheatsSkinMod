# HEX CHEATS SKINMOD

A browser-first Free Fire outfit studio. Selections and generated ZIPs stay on the visitor's device; the server only delivers the static app.

## Run locally

```bash
npm start
```

Open `http://localhost:3000`. The `/health` endpoint returns a JSON health check for Railway.

## Deploy from GitHub to Railway

1. Create a GitHub repository and push the contents of this folder.
2. In Railway, choose **New Project → Deploy from GitHub repo**.
3. Select the repository. Railway detects `package.json` and runs `npm start`.
4. Generate a public domain in Railway and open the URL.

No API keys or shortener tokens belong in the repository or browser bundle. If an external link service is added later, keep its credential server-side as a Railway variable and document its use clearly to visitors. This build intentionally does not fingerprint visitors by IP or create hidden access gates.

## Notes

- `public/` is the complete client application and asset bundle.
- The studio persists the current selection in browser storage, without login.
- `Create Mod` and `Create All 4 Versions` are local browser exports.
