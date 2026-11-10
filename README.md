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

The download unlock uses a signed, HttpOnly browser cookie for 24 hours. It does not fingerprint visitors by IP. Before the unlock flow can create task links, add these Railway variables in the service's **Variables** tab:

```text
VIPLINK_API_TOKEN=your-current-vplink-token
ACCESS_SECRET=generate-a-long-random-secret
PUBLIC_URL=https://hexcheatsskinmod.up.railway.app
```

Never commit `VIPLINK_API_TOKEN` to GitHub or put it in frontend JavaScript. The supplied token appeared in the original notes and should be regenerated in VPLINK before production use. The code keeps the token server-side and uses it only in `/api/unlock/start`.

## Notes

- `public/` is the complete client application and asset bundle.
- The studio persists the current selection in browser storage, without login.
- `Create Mod` and `Create All 4 Versions` are local browser exports.
