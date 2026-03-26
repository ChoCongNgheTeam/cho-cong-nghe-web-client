/**
 * Cloudinary Image Transformation Helper
 *
 * BE only returns the original full-size URL.
 * FE uses this helper to transform on-the-fly via Cloudinary's URL API.
 *
 * Original:    https://res.cloudinary.com/da3eksemd/image/upload/v1768395672/products/front.webp
 * Transformed: https://res.cloudinary.com/da3eksemd/image/upload/w_64,h_64,c_fill,q_75/products/front.webp
 */

const CLOUDINARY_BASE_REGEX = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:[^/,]+\/)?(.+)$/;

export type CloudinaryCrop = "fill" | "fit" | "scale" | "crop" | "thumb" | "pad" | "limit";

export type CloudinaryFormat = "webp" | "jpg" | "png" | "avif" | "auto";

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: CloudinaryCrop;
  quality?: number | "auto";
  format?: CloudinaryFormat;
  /** Round corners, use 'max' for full circle */
  radius?: number | "max";
}

/**
 * Inject Cloudinary transformation params into an existing Cloudinary URL.
 * Non-Cloudinary URLs are returned as-is.
 *
 * @example
 * cloudinaryTransform(url, { width: 64, height: 64, crop: 'fill', quality: 75 })
 * // => ".../image/upload/w_64,h_64,c_fill,q_75/products/front.webp"
 */
export function cloudinaryTransform(url: string, options: CloudinaryTransformOptions): string {
  if (!url) return url;

  const match = url.match(CLOUDINARY_BASE_REGEX);
  if (!match) return url; // not a Cloudinary URL — return unchanged

  const [, base, publicIdWithExt] = match;

  const parts: string[] = [];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.quality !== undefined) parts.push(`q_${options.quality}`);
  if (options.format) parts.push(`f_${options.format}`);
  if (options.radius !== undefined) parts.push(`r_${options.radius}`);

  const transformation = parts.join(",");

  return transformation ? `${base}${transformation}/${publicIdWithExt}` : `${base}${publicIdWithExt}`;
}

// ---------------------------------------------------------------------------
// Preset helpers — use these instead of raw cloudinaryTransform
// ---------------------------------------------------------------------------

/**
 * Product thumbnail in card grid (small square)
 * e.g. 160×160, fill, webp, quality 80
 */
export function thumbnailUrl(url: string, size = 180): string {
  return cloudinaryTransform(url, {
    width: size,
    height: size,
    crop: "fill",
    quality: 80,
    format: "webp",
  });
}

/**
 * Product detail page hero image (larger, high quality)
 */
export function heroUrl(url: string, width = 800): string {
  return cloudinaryTransform(url, {
    width,
    crop: "limit",
    quality: "auto",
    format: "webp",
  });
}

/**
 * Cart / order summary — tiny square
 */
export function cartThumbUrl(url: string, size = 64): string {
  return cloudinaryTransform(url, {
    width: size,
    height: size,
    crop: "fill",
    quality: 85,
    format: "webp",
  });
}

/**
 * Avatar / profile picture — circular crop
 */
export function avatarUrl(url: string, size = 48): string {
  return cloudinaryTransform(url, {
    width: size,
    height: size,
    crop: "thumb",
    radius: "max",
    quality: 90,
    format: "webp",
  });
}

/**
 * OG / social share image — fixed 1200×630
 */
export function ogImageUrl(url: string): string {
  return cloudinaryTransform(url, {
    width: 1200,
    height: 630,
    crop: "fill",
    quality: 90,
    format: "jpg",
  });
}
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return cloudinaryTransform(src, {
    width,
    crop: "fit",
    quality: quality ?? 80,
    format: "webp",
  });
}
