# DesignDecode — client

React + Vite + Tailwind frontend. Upload a design, get a rebuild guide.

Fully static — no backend. Colors are extracted client-side (`colorthief`), and the
recreation guide (canvas size, layout style, steps) is generated client-side in
`src/lib/mockAnalyze.js` from the image dimensions, extracted palette, and any zones
you tag manually.

## Dev

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc). No env vars needed.
