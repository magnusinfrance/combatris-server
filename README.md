# COMBATris Online — Server

Signaling + lobby server for COMBATris Online multiplayer.

## Quick Deploy (Free)

### Railway (easiest)
1. Push this folder to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select the repo — Railway auto-detects Node.js and runs `npm start`
4. Copy the generated URL (e.g. `https://combatris.up.railway.app`)
5. Paste it into COMBATris.html where it says `YOUR_SERVER_URL`

### Render
1. Push to GitHub
2. https://render.com → New Web Service → connect repo
3. Build command: `npm install`  |  Start command: `node server.js`
4. Free tier — spins down after inactivity (first connect is slow)

### Fly.io
```bash
npm install -g flyctl
flyctl launch
flyctl deploy
```

## Local Testing
```bash
npm install
node server.js
# Server at http://localhost:3000
# In COMBATris.html set SERVER_URL = 'http://localhost:3000'
```

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3000`  | HTTP port   |
