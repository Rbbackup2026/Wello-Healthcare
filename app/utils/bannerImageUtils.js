import { API_ORIGIN } from "./api";

export const MOBILE_BANNER_BREAKPOINT = 768;

export const buildBannerImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string" || !imagePath.trim()) {
    return null; // placeholder.png hatao — null return karo
  }

  const normalizedPath = imagePath.trim();

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const sanitizedPath = normalizedPath.replace(/^\.?\//, "");
  return `${API_ORIGIN}/${sanitizedPath}`;
};

export const getBannerImageByViewport = (banner, isMobile) => {
  if (!banner) return null;

  // ✅ Naye field names: webImage aur appImage
  const preferredImage = isMobile
    ? banner.appImage || banner.webImage
    : banner.webImage || banner.appImage;

  return buildBannerImageUrl(preferredImage);
};
