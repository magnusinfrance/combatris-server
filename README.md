# COMBATris Online — Server

This server relays all game messages through Socket.IO.
No WebRTC is used.

## Quick Deploy

1. Push these files to a GitHub repo.
2. Deploy the repo on Railway, Render, or Fly.io.
3. Railway will run `npm start` automatically.
4. Use the public HTTPS URL in COMBATris Online.

## Local Test

```bash
npm install
node server.js
```

Then open the game and set the server URL to:

```text
http://localhost:3000
```

## Files

- `server.js`
- `package.json`
- `README.md`
