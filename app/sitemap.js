import { SITE_URL } from "./utils/seo";
import { METRO_CITIES, slugifyCity } from "./utils/cityApi";

const staticRoutes = [
  "",
  "/lab-tests",
  "/full-body-health-checkup",
  "/blogs",
  "/schedule-scan",
  "/download-report",
  "/help-feedback",
];

export default function sitemap() {
  const lastModified = new Date();
  const metroFullBodyRoutes = METRO_CITIES.map(
    (city) => `/full-body-health-checkup/city/${slugifyCity(city)}`
  );

  return [...staticRoutes, ...metroFullBodyRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
