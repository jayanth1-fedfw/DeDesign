# DesignDecode — server

Express backend for DesignDecode. Analyzes an uploaded design image: OCR (Tesseract.js) +
contour detection (opencv-js) to find layout zones, plus canvas size, layout style, font-weight
heuristics, and a generated step-by-step rebuild checklist. No external AI API — everything
runs locally in the Node process.

## Dev

```bash
npm install
npm run dev
```

Runs on `http://localhost:5174`. `POST /api/analyze` (multipart: `image` file, `palette` JSON string) returns the analysis.

## Deploy

Needs a persistent Node host (not static hosting) — Render, Railway, Koyeb, Fly.io, etc.
`render.yaml` is included for Render's Blueprint deploy. Root dir is this folder; build
`npm install`, start `npm start`. Reads `PORT` from the environment.
