import { extractApiArray, normalizeCityName } from "./cityApi";
import { API_BASE_URL } from "./api";

export const DISPLAY_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "premium", label: "Premium" },
  { value: "pathology", label: "Pathology" },
  { value: "radiology", label: "Radiology" },
];

export const getBannerCities = (banner = {}) => {
  if (Array.isArray(banner.cities) && banner.cities.length > 0) {
    return banner.cities.map((city) => String(city).trim()).filter(Boolean);
  }
  if (banner.city?.trim()) {
    return String(banner.city)
      .split(",")
      .map((city) => city.trim())
      .filter(Boolean);
  }
  return [];
};

export const getBannerCitiesLabel = (banner = {}) => {
  const cities = getBannerCities(banner);
  return cities.length > 0 ? cities.join(", ") : "All Cities";
};

export const bannerMatchesCity = (banner, city = "") => {
  const bannerCities = getBannerCities(banner).map(normalizeCityName);
  if (bannerCities.length === 0) return true;

  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return true;

  return bannerCities.some(
    (bannerCity) =>
      bannerCity === normalizedCity ||
      bannerCity.includes(normalizedCity) ||
      normalizedCity.includes(bannerCity)
  );
};

export const bannerHasDisplay = (banner, display) => {
  if (!banner || !display) return false;
  if (Array.isArray(banner.displays) && banner.displays.length > 0) {
    return banner.displays.includes(display);
  }
  return banner.display === display;
};

const normalizeCategoryLabel = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const categoryLabelsMatch = (left = "", right = "") => {
  const normalizedLeft = normalizeCategoryLabel(left);
  const normalizedRight = normalizeCategoryLabel(right);
  if (!normalizedLeft || !normalizedRight) return false;
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
};

export const isHomeEligibleBanner = (banner = {}) => {
  if (!bannerHasDisplay(banner, "home")) return false;

  if (
    bannerHasDisplay(banner, "pathology") &&
    banner.pathologyTarget &&
    banner.pathologyTarget !== "all"
  ) {
    return false;
  }

  if (
    bannerHasDisplay(banner, "radiology") &&
    banner.radiologyTarget &&
    banner.radiologyTarget !== "all"
  ) {
    return false;
  }

  return true;
};

export const bannerMatchesTargetContext = (
  banner,
  {
    targetField = "pathologyTarget",
    categoryIdField = "categoryId",
    categoryNameField = "categoryName",
    diseaseIdField = "diseaseId",
  } = {},
  { categoryId = "", categoryName = "", diseaseId = "" } = {}
) => {
  const target = banner?.[targetField] || "all";
  if (target === "all") return true;

  if (target === "category") {
    const bannerCategoryId = banner?.[categoryIdField] || "";
    const bannerCategoryName = banner?.[categoryNameField] || "";
    if (!bannerCategoryId || bannerCategoryId === "all") return true;
    if (!categoryId && !categoryName) return false;
    if (categoryId && bannerCategoryId === categoryId) return true;
    if (categoryName && categoryLabelsMatch(bannerCategoryName, categoryName)) {
      return true;
    }
    return false;
  }

  if (target === "disease") {
    const bannerDiseaseId = banner?.[diseaseIdField] || "";
    if (!bannerDiseaseId) return false;
    if (!diseaseId) return false;
    return bannerDiseaseId === diseaseId;
  }

  return true;
};

export const bannerMatchesPathologyContext = (banner, context = {}) =>
  bannerMatchesTargetContext(
    banner,
    {
      targetField: "pathologyTarget",
      categoryIdField: "categoryId",
      categoryNameField: "categoryName",
      diseaseIdField: "diseaseId",
    },
    context
  );

export const bannerMatchesRadiologyContext = (banner, context = {}) =>
  bannerMatchesTargetContext(
    banner,
    {
      targetField: "radiologyTarget",
      categoryIdField: "radiologyCategoryId",
      categoryNameField: "radiologyCategoryName",
      diseaseIdField: "radiologyDiseaseId",
    },
    context
  );

export const fetchActiveBannersByDisplay = async (display) => {
  const res = await fetch(
    `${API_BASE_URL}/banner/getall?display=${encodeURIComponent(display)}&status=Active`
  );
  const payload = await res.json();
  return extractApiArray(payload).sort(
    (a, b) => (a.sortId || 0) - (b.sortId || 0)
  );
};

export const getBannerDisplayLabel = (banner) => {
  if (Array.isArray(banner?.displays) && banner.displays.length > 0) {
    return banner.displays.join(", ");
  }
  return banner?.display || "—";
};

export const getPathologyTargetLabel = (banner) => {
  if (!bannerHasDisplay(banner, "pathology")) return "";
  return getTargetLabel(banner, {
    targetField: "pathologyTarget",
    categoryNameField: "categoryName",
    diseaseNameField: "diseaseName",
    prefix: "Pathology",
  });
};

export const getRadiologyTargetLabel = (banner) => {
  if (!bannerHasDisplay(banner, "radiology")) return "";
  return getTargetLabel(banner, {
    targetField: "radiologyTarget",
    categoryNameField: "radiologyCategoryName",
    diseaseNameField: "radiologyDiseaseName",
    prefix: "Radiology",
  });
};

const getTargetLabel = (
  banner,
  { targetField, categoryNameField, diseaseNameField, prefix }
) => {
  const target = banner?.[targetField] || "all";
  if (target === "all") return `${prefix}: All`;
  if (target === "category") {
    return banner?.[categoryNameField]
      ? `${prefix} Category: ${banner[categoryNameField]}`
      : `${prefix} Category: All`;
  }
  if (target === "disease") {
    return banner?.[diseaseNameField]
      ? `${prefix} Disease: ${banner[diseaseNameField]}`
      : `${prefix} Disease`;
  }
  return "";
};
