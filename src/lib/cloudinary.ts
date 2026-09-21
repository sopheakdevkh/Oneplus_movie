export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "thumb" | "scale" | "fit" | "limit" | "pad";
  gravity?: "auto" | "face" | "center" | "north" | "south";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "png" | "jpg";
  blur?: number;
  aspectRatio?: string;
}

const DEFAULT_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqcopr9tn";

export function buildTransformations(options: CloudinaryTransformOptions = {}): string {
  const parts: string[] = [];

  const format = options.format ?? "auto";
  const quality = options.quality ?? "auto";
  parts.push(`f_${format}`);
  parts.push(`q_${quality}`);

  if (options.crop) {
    parts.push(`c_${options.crop}`);
  }

  if (options.gravity) {
    parts.push(`g_${options.gravity}`);
  }

  if (options.width) {
    parts.push(`w_${options.width}`);
  }

  if (options.height) {
    parts.push(`h_${options.height}`);
  }

  if (options.aspectRatio) {
    parts.push(`ar_${options.aspectRatio}`);
  }

  if (options.blur) {
    parts.push(`e_blur:${options.blur}`);
  }

  return parts.join(",");
}

export function getOptimizedCloudinaryUrl(
  imagePathOrUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!imagePathOrUrl) {
    return "";
  }

  const transformations = buildTransformations(options);

  if (imagePathOrUrl.includes("res.cloudinary.com")) {
    if (imagePathOrUrl.includes("/upload/")) {
      const [base, rest] = imagePathOrUrl.split("/upload/");
      return `${base}/upload/${transformations}/${rest.replace(/^v\d+\//, "")}`;
    }
    return imagePathOrUrl;
  }

  if (imagePathOrUrl.startsWith("http://") || imagePathOrUrl.startsWith("https://")) {
    return imagePathOrUrl;
  }

  const cleanId = imagePathOrUrl.startsWith("/") ? imagePathOrUrl.slice(1) : imagePathOrUrl;
  return `https://res.cloudinary.com/${DEFAULT_CLOUD_NAME}/image/upload/${transformations}/${cleanId}`;
}

export function getPosterCardUrl(url: string, width = 450, height = 675): string {
  return getOptimizedCloudinaryUrl(url, {
    width,
    height,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

export function getBannerBackdropUrl(url: string, width = 1920, height = 1080): string {
  return getOptimizedCloudinaryUrl(url, {
    width,
    height,
    crop: "fill",
    gravity: "center",
    quality: "auto",
    format: "auto",
  });
}

export function getBlurPlaceholder(url: string): string {
  return getOptimizedCloudinaryUrl(url, {
    width: 32,
    height: 48,
    crop: "fill",
    blur: 1000,
    quality: "auto:low",
    format: "jpg",
  });
}
