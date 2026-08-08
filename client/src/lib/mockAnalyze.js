// Generates a "Recreation Guide" analysis entirely in the browser —
// no backend required. Uses real data (dimensions, extracted palette,
// user-tagged zones) to produce genuinely useful, non-random output.

function guessAspectRatio(width, height) {
  const ratio = width / height;
  const known = [
    { label: '1:1 (square)', value: 1 },
    { label: '4:5 (portrait)', value: 4 / 5 },
    { label: '9:16 (story/reel)', value: 9 / 16 },
    { label: '16:9 (widescreen)', value: 16 / 9 },
    { label: '3:2 (standard photo)', value: 3 / 2 },
    { label: 'A4 (document)', value: 210 / 297 },
  ];
  let closest = known[0];
  let bestDiff = Infinity;
  for (const k of known) {
    const diff = Math.abs(k.value - ratio);
    if (diff < bestDiff) {
      bestDiff = diff;
      closest = k;
    }
  }
  return closest.label;
}

function guessLayoutStyle(zones) {
  if (!zones || zones.length === 0) return 'centered';
  const xs = zones.map((z) => z.x + z.width / 2);
  const spread = Math.max(...xs) - Math.min(...xs);
  if (spread > 50) return 'asymmetric';
  if (zones.length >= 4) return 'grid';
  return 'centered';
}

const LABEL_TEXT = {
  headline: 'headline',
  body: 'body text',
  image: 'image/graphic',
  cta: 'button/CTA',
  footer: 'footer',
  logo: 'logo/icon',
};

function fmtZonePosition(zone) {
  const cx = zone.x + zone.width / 2;
  const cy = zone.y + zone.height / 2;
  const vert = cy < 33 ? 'top' : cy < 66 ? 'middle' : 'bottom';
  const horiz = cx < 33 ? 'left' : cx < 66 ? 'center' : 'right';
  return vert === 'middle' && horiz === 'center' ? 'the center' : `the ${vert}-${horiz}`;
}

export function generateAnalysis({ dimensions, palette, zones }) {
  const width = dimensions?.width ?? 1080;
  const height = dimensions?.height ?? 1080;
  const aspect_ratio = guessAspectRatio(width, height);
  const layout_style = guessLayoutStyle(zones);
  const safePalette = palette && palette.length > 0 ? palette : ['#111111', '#FFFFFF', '#6D28D9'];

  const steps = [];
  let order = 1;

  steps.push({
    order: order++,
    instruction: `Create a new canvas at ${width} x ${height}px (${aspect_ratio}).`,
  });

  steps.push({
    order: order++,
    instruction: `Set up your color palette: ${safePalette.join(', ')}. Use ${safePalette[0]} as your dominant/background color.`,
  });

  steps.push({
    order: order++,
    instruction: `Choose a layout approach: ${layout_style === 'grid' ? 'divide the canvas into a grid and align elements to it' : layout_style === 'asymmetric' ? 'offset your elements off-center for visual tension' : 'keep your main elements centered for balance'}.`,
  });

  const sortedZones = [...(zones || [])].sort((a, b) => a.y - b.y);
  if (sortedZones.length > 0) {
    sortedZones.forEach((zone) => {
      const name = LABEL_TEXT[zone.label] || zone.label;
      steps.push({
        order: order++,
        instruction: `Place the ${name} in ${fmtZonePosition(zone)} of the canvas, roughly ${zone.width.toFixed(0)}% wide and ${zone.height.toFixed(0)}% tall.`,
      });
    });
  } else {
    steps.push({
      order: order++,
      instruction: 'Tag zones on your uploaded image (headline, image, CTA, footer) to get precise placement steps here.',
    });
  }

  steps.push({
    order: order++,
    instruction: 'Set your headline in a bold sans-serif font, and body copy in a lighter weight of the same or a complementary font for consistency.',
  });

  steps.push({
    order: order++,
    instruction: 'Add spacing/padding around each element (roughly 5-8% of canvas size) so nothing touches the edges.',
  });

  steps.push({
    order: order++,
    instruction: 'Export at 2x resolution for crisp display on high-DPI screens.',
  });

  return {
    canvas_size_guess: { width, height, aspect_ratio },
    layout_style,
    estimated_font_style: {
      headline: 'Bold sans-serif',
      body: 'Regular sans-serif',
    },
    zones: zones || [],
    steps,
  };
}