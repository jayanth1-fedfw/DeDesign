function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(w, h) {
  const d = gcd(w, h) || 1;
  const rw = w / d;
  const rh = h / d;
  if (rw <= 50 && rh <= 50) return `${rw}:${rh}`;
  return `${(w / h).toFixed(2)}:1`;
}

export function guessCanvasSize(originalWidth, originalHeight) {
  return {
    width: originalWidth,
    height: originalHeight,
    aspect_ratio: simplifyRatio(originalWidth, originalHeight),
  };
}

export function guessLayoutStyle(zones) {
  if (zones.length === 0) return 'centered';

  const fullBleed = zones.some((z) => z.width > 90 && z.height > 90);
  if (fullBleed) return 'full-bleed';

  const imageZones = zones.filter((z) => z.label === 'image');
  if (imageZones.length >= 3) {
    const avgWidth = imageZones.reduce((sum, z) => sum + z.width, 0) / imageZones.length;
    const uniform = imageZones.every((z) => Math.abs(z.width - avgWidth) < avgWidth * 0.35);
    if (uniform) return 'grid';
  }

  const centers = zones.map((z) => z.x + z.width / 2);
  const avgOffsetFromCenter = centers.reduce((sum, c) => sum + Math.abs(c - 50), 0) / centers.length;
  if (avgOffsetFromCenter < 12) return 'centered';

  return 'asymmetric';
}

// Approximates weight (bold/medium/light) by sampling how much "ink" fills each
// text zone's bounding box — there's no real font-matching happening here.
function estimateWeight(image, zonePercent) {
  const { data, width, height } = image.bitmap;
  const x0 = Math.max(0, Math.round((zonePercent.x / 100) * width));
  const y0 = Math.max(0, Math.round((zonePercent.y / 100) * height));
  const x1 = Math.min(width, Math.round(((zonePercent.x + zonePercent.width) / 100) * width));
  const y1 = Math.min(height, Math.round(((zonePercent.y + zonePercent.height) / 100) * height));

  let dark = 0;
  let total = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 128) dark++;
      total++;
    }
  }
  const density = total > 0 ? dark / total : 0;
  if (density > 0.3) return 'bold';
  if (density > 0.2) return 'medium-weight';
  return 'light';
}

export function estimateFontStyle(image, zones) {
  const headline = zones.find((z) => z.label === 'headline');
  const body = zones.find((z) => z.label === 'body');

  return {
    headline: headline ? `${estimateWeight(image, headline)} sans-serif` : 'bold sans-serif',
    body: body ? `${estimateWeight(image, body)} sans-serif` : 'regular sans-serif',
  };
}
