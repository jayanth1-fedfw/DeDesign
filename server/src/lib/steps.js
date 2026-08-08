function truncate(text) {
  return text.length > 40 ? `${text.slice(0, 37)}...` : text;
}

function fmtPos(zone) {
  const cx = zone.x + zone.width / 2;
  const cy = zone.y + zone.height / 2;
  const vert = cy < 33 ? 'top' : cy < 66 ? 'middle' : 'bottom';
  const horiz = cx < 33 ? 'left' : cx < 66 ? 'center' : 'right';
  if (vert === 'middle' && horiz === 'center') return 'the centered';
  return `the ${vert}-${horiz}`;
}

export function generateSteps({ canvasSize, palette, zones, layoutStyle }) {
  const steps = [];
  let order = 1;
  const add = (instruction) => steps.push({ order: order++, instruction });

  add(
    `Create a new canvas at ${canvasSize.width} x ${canvasSize.height}px (${canvasSize.aspect_ratio} aspect ratio).`
  );

  if (palette && palette.length) {
    const shown = palette.slice(0, 4).join(', ');
    const rest = palette.length > 4 ? `, plus ${palette.length - 4} more accent color(s)` : '';
    add(`Set up your color palette: ${shown}${rest}.`);
  }

  zones
    .filter((z) => z.label === 'image')
    .forEach((z) => {
      add(
        `Place a graphic/image block in ${fmtPos(z)} area, sized about ${z.width.toFixed(0)}% width x ${z.height.toFixed(0)}% height of the canvas.`
      );
    });

  const headline = zones.find((z) => z.label === 'headline');
  if (headline) {
    const label = headline.text ? ` ("${truncate(headline.text)}")` : '';
    add(`Add your headline text${label} in ${fmtPos(headline)} area, about ${headline.width.toFixed(0)}% of the canvas width.`);
  }

  zones
    .filter((z) => z.label === 'body')
    .forEach((z) => {
      add(`Add supporting body text in ${fmtPos(z)} area.`);
    });

  zones
    .filter((z) => z.label === 'cta')
    .forEach((z) => {
      add(`Add a button/CTA element in ${fmtPos(z)} area, about ${z.width.toFixed(0)}% width x ${z.height.toFixed(0)}% height.`);
    });

  zones
    .filter((z) => z.label === 'logo')
    .forEach((z) => {
      add(`Place a small logo/icon in ${fmtPos(z)} area.`);
    });

  zones
    .filter((z) => z.label === 'footer')
    .forEach((z) => {
      add(`Add footer content in ${fmtPos(z)} area.`);
    });

  add(`Arrange every element using a ${layoutStyle} layout, align and group them, then export your final design.`);

  return steps;
}
