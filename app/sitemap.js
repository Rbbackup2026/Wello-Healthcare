import { SITE_URL } from "./utils/seo";

const staticRoutes = [
  "",
  "/lab-tests",
  "/full-body-health-checkup",
  "/blogs",
  "/download-report",
  "/help-feedback",
];

export default function sitemap() {
  const lastModified = new Date();

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
