import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { decodeImage } from './lib/imageDecode.js';
import { detectContourRegions } from './lib/contours.js';
import { detectTextBlocks } from './lib/ocr.js';
import { buildZones } from './lib/zones.js';
import { guessCanvasSize, guessLayoutStyle, estimateFontStyle } from './lib/layout.js';
import { generateSteps } from './lib/steps.js';
import { AnalysisResponseSchema } from './lib/schema.js';

const app = express();
app.use(cors());

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new Error('Unsupported file type. Use JPG, PNG, or WEBP.'));
      return;
    }
    cb(null, true);
  },
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded.' });
    return;
  }

  let palette = [];
  if (req.body.palette) {
    try {
      palette = JSON.parse(req.body.palette);
    } catch {
      palette = [];
    }
  }

  try {
    const { image, originalWidth, originalHeight } = await decodeImage(req.file.buffer);

    const [contourRegions, textBlocks] = await Promise.all([
      detectContourRegions(image),
      detectTextBlocks(req.file.buffer, originalWidth, originalHeight),
    ]);

    const zones = buildZones({ textBlocks, contourRegions });
    const canvasSize = guessCanvasSize(originalWidth, originalHeight);
    const layoutStyle = guessLayoutStyle(zones);
    const fontStyle = estimateFontStyle(image, zones);
    const steps = generateSteps({ canvasSize, palette, zones, layoutStyle });

    const payload = AnalysisResponseSchema.parse({
      canvas_size_guess: canvasSize,
      layout_style: layoutStyle,
      estimated_font_style: fontStyle,
      zones,
      steps,
    });

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed. Try a different image.' });
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || /Unsupported file type/.test(err.message || '')) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Server error.' });
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`DesignDecode server listening on http://localhost:${PORT}`);
});
