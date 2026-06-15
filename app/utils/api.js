const DEFAULT_API_BASE_URL = "http://localhost:3000/v1/api";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export const API_ORIGIN = API_BASE_URL.replace(/\/v1\/api$/, "");

export const toApiUrl = (path = "") =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const toAssetUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) {
    return path.replace("/v1/api/uploads/", "/uploads/");
  }

  if (path.startsWith("/v1/api/uploads/")) {
    return `${API_ORIGIN}${path.replace("/v1/api", "")}`;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};
