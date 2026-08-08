import { createWorker, PSM } from 'tesseract.js';

let workerPromise = null;
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng').then(async (worker) => {
      // Design graphics are sparse, large text blocks, not paragraphs of prose —
      // the default page-segmentation mode misses standalone headlines entirely.
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      return worker;
    });
  }
  return workerPromise;
}

// Runs OCR and returns text blocks with bounding boxes as % of canvas.
export async function detectTextBlocks(buffer, width, height) {
  const worker = await getWorker();
  const {
    data: { blocks },
  } = await worker.recognize(buffer, {}, { blocks: true });

  if (!blocks) return [];

  const textBlocks = [];
  for (const block of blocks) {
    const text = (block.text || '').trim();
    if (!text) continue;
    const { x0, y0, x1, y1 } = block.bbox;
    const blockWidth = x1 - x0;
    const blockHeight = y1 - y0;
    if (blockWidth < 10 || blockHeight < 8) continue;

    textBlocks.push({
      text,
      x: (x0 / width) * 100,
      y: (y0 / height) * 100,
      width: (blockWidth / width) * 100,
      height: (blockHeight / height) * 100,
      fontHeightPx: blockHeight,
      confidence: (block.confidence ?? 70) / 100,
    });
  }
  return textBlocks;
}

export async function terminateOcr() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
