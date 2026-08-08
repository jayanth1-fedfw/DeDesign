import { Jimp } from 'jimp';

const MAX_DIM = 1200;

export async function decodeImage(buffer) {
  const image = await Jimp.read(buffer);
  const originalWidth = image.bitmap.width;
  const originalHeight = image.bitmap.height;

  if (originalWidth > MAX_DIM || originalHeight > MAX_DIM) {
    const scale = MAX_DIM / Math.max(originalWidth, originalHeight);
    image.resize({ w: Math.round(originalWidth * scale), h: Math.round(originalHeight * scale) });
  }

  return {
    image,
    originalWidth,
    originalHeight,
    width: image.bitmap.width,
    height: image.bitmap.height,
  };
}
