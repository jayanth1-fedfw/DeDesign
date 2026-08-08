# DesignDecode — client

React + Vite + Tailwind frontend. Upload a design, get a rebuild guide.

## Dev

```bash
npm install
npm run dev
```

Dev server proxies `/api/*` to `http://localhost:5174` (see `vite.config.js`) — run `server/` alongside it locally.

## Deploy

Static build:

```bash
npm run build
```

Set `VITE_API_URL` to your deployed backend's URL before building (the dev proxy doesn't exist in production):

```bash
VITE_API_URL=https://your-backend.example.com npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc).
