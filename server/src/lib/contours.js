import cvReadyPromise from '@techstark/opencv-js';

let cvInstance = null;
async function getCv() {
  if (!cvInstance) cvInstance = await cvReadyPromise;
  return cvInstance;
}

function rectsOverlap(a, b) {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  const overlapX = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y));
  const overlapArea = overlapX * overlapY;
  const minArea = Math.min(a.width * a.height, b.width * b.height);
  return minArea > 0 && overlapArea / minArea > 0.6;
}

function mergeOverlapping(regions) {
  const result = [];
  for (const r of regions) {
    const dupIndex = result.findIndex((existing) => rectsOverlap(existing, r));
    if (dupIndex === -1) {
      result.push(r);
    } else if (r.area > result[dupIndex].area) {
      result[dupIndex] = r;
    }
  }
  return result;
}

// Detects rectangular graphic blocks (images, buttons, cards) via edge + contour detection.
// Returns regions as % of canvas, largest-area first.
export async function detectContourRegions(image) {
  const cv = await getCv();
  const { width, height, data } = image.bitmap;

  const src = new cv.Mat(height, width, cv.CV_8UC4);
  src.data.set(data);

  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  const blurred = new cv.Mat();
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

  const edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const dilated = new cv.Mat();
  cv.dilate(edges, dilated, kernel);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

  const imageArea = width * height;
  const regions = [];

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const rect = cv.boundingRect(cnt);
    const area = rect.width * rect.height;
    const areaRatio = area / imageArea;

    if (areaRatio > 0.012 && areaRatio < 0.85 && rect.width > 20 && rect.height > 15) {
      regions.push({
        x: (rect.x / width) * 100,
        y: (rect.y / height) * 100,
        width: (rect.width / width) * 100,
        height: (rect.height / height) * 100,
        area: areaRatio,
      });
    }
    cnt.delete();
  }

  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  dilated.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();

  const merged = mergeOverlapping(regions);
  merged.sort((a, b) => b.area - a.area);
  return merged.slice(0, 8);
}
