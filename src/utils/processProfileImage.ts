/**
 * Server-only profile image processing. Do not import from client entry points.
 *
 * Sharp trusts the decoded image, not the client MIME type. Only JPEG, PNG,
 * and WebP under 10 MB and 8192 px on a side are accepted. `rotate()` applies
 * EXIF orientation, then the image is fitted inside 2048 px and re-encoded as
 * JPEG so crop math and stored bytes stay bounded before they hit storage.
 */
import sharp from 'sharp';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 8192;
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function validateProfileImage(input: Buffer) {
  if (!input.length || input.length > MAX_IMAGE_BYTES) {
    throw new Error('Profile image must be between 1 byte and 10 MB');
  }
  const metadata = await sharp(input).metadata();
  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    throw new Error('Profile image must be JPEG, PNG, or WebP');
  }
  if (!metadata.width || !metadata.height) throw new Error('Invalid image dimensions');
  if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
    throw new Error('Profile image dimensions are too large');
  }
  return metadata;
}

export async function normalizeProfileImage(input: Buffer): Promise<{buffer: Buffer; width: number; height: number}> {
  await validateProfileImage(input);
  const {data, info} = await sharp(input)
    .rotate()
    .resize({width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true})
    .jpeg({quality: 90})
    .toBuffer({resolveWithObject: true});
  if (!info.width || !info.height) throw new Error('Invalid image dimensions');
  return {buffer: data, width: info.width, height: info.height};
}

export async function cropProfileImage(input: Buffer, crop: CropArea): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  const values = [crop.x, crop.y, crop.width, crop.height];
  if (!values.every(Number.isFinite) || crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0) {
    throw new Error('Invalid crop bounds');
  }
  const left = Math.round(crop.x);
  const top = Math.round(crop.y);
  const width = Math.round(crop.width);
  const height = Math.round(crop.height);
  if (!metadata.width || !metadata.height || left + width > metadata.width || top + height > metadata.height) {
    throw new Error('Crop bounds exceed the uploaded image');
  }
  return sharp(input).extract({left, top, width, height}).jpeg({quality: 90}).toBuffer();
}
