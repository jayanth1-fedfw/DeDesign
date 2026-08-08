function round2(n) {
  return Math.round(n * 100) / 100;
}

function overlaps(a, b) {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  const ox = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x));
  const oy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y));
  const overlapArea = ox * oy;
  const smaller = Math.min(a.width * a.height, b.width * b.height);
  return smaller > 0 && overlapArea / smaller > 0.4;
}

// Merges OCR text blocks and CV contour regions into labeled zones.
export function buildZones({ textBlocks, contourRegions }) {
  const zones = [];
  let idCounter = 0;

  const sortedByFontSize = [...textBlocks].sort((a, b) => b.fontHeightPx - a.fontHeightPx);
  const headline = sortedByFontSize[0];

  for (const block of textBlocks) {
    let label = 'body';
    if (block === headline) label = 'headline';
    else if (block.y > 85) label = 'footer';
    else if (block.text.length <= 20 && block.width < 30 && block.y > 55) label = 'cta';

    zones.push({
      id: `zone-${idCounter++}`,
      label,
      source: 'ocr',
      x: round2(block.x),
      y: round2(block.y),
      width: round2(block.width),
      height: round2(block.height),
      confidence: round2(block.confidence),
      text: block.text,
    });
  }

  for (const region of contourRegions) {
    if (zones.some((z) => overlaps(z, region))) continue;

    let label = 'image';
    if (region.area < 0.02 && region.y > 70) label = 'logo';
    else if (region.width < 35 && region.height < 15 && region.y > 45) label = 'cta';
    else if (region.y > 75 && region.height < 20) label = 'footer';

    zones.push({
      id: `zone-${idCounter++}`,
      label,
      source: 'contour',
      x: round2(region.x),
      y: round2(region.y),
      width: round2(region.width),
      height: round2(region.height),
      confidence: 0.6,
    });
  }

  return zones;
}
