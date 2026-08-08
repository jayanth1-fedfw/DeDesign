import { getPaletteSync } from 'colorthief';

export function extractPalette(imgEl, count = 6) {
  const palette = getPaletteSync(imgEl, { colorCount: count });
  return palette.map((c) => c.hex().toUpperCase());
}
