import { API_BASE_URL } from "./api";

const toTitleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const deslugifyLocation = (value = "") => toTitleCase(value.replace(/-/g, " "));

const CITY_ALIASES = {
  bangalore: "bengaluru",
  bengaluru: "bengaluru",
  bombay: "mumbai",
  mumbai: "mumbai",
  calcutta: "kolkata",
  kolkata: "kolkata",
  gurugram: "gurugram",
  gurugram: "gurugram",
  gurgaon: "gurugram",
  gurgugram: "gurugram",
  delhi: "delhi",
  "new delhi": "delhi",
  noida: "noida",
  pune: "pune",
  chennai: "chennai",
  hyderabad: "hyderabad",
};

export const normalizeCityName = (value = "") => {
  const normalizedValue = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");

  return CITY_ALIASES[normalizedValue] || normalizedValue;
};

const getProductCity = (product = {}) =>
  product?.city ||
  product?.location?.city ||
  product?.lab?.city ||
  product?.labDetails?.city ||
  "";

export const filterProductsByCity = (products = [], city = "") => {
  const normalizedRequestedCity = normalizeCityName(city);

  if (!normalizedRequestedCity) {
    return products;
  }

  return products.filter((product) => {
    const normalizedProductCity = normalizeCityName(getProductCity(product));

    if (!normalizedProductCity) {
      return false;
    }

    return (
      normalizedProductCity === normalizedRequestedCity ||
      normalizedProductCity.startsWith(`${normalizedRequestedCity} `) ||
      normalizedRequestedCity.startsWith(`${normalizedProductCity} `)
    );
  });
};

export const extractApiArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const fetchWithTimeout = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchCityCollection = async (endpoint, city) => {
  const resolvedCity = city?.trim() || "Delhi";
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/${endpoint}?city=${encodeURIComponent(resolvedCity)}`
  );

  if (!response.ok) {
    throw new Error(`${endpoint} request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return extractApiArray(payload);
};

export const mapApiProduct = (product, index) => ({
  id: product?._id || product?.id || `product-${index}`,
  name:
    product?.name ||
    product?.itemName ||
    product?.title ||
    product?.packageName ||
    "Unnamed Test",
  tests:
    product?.testCount ||
    product?.tests ||
    product?.noOfTests ||
    product?.includeTestCount ||
    null,
  price:
    Number(
      product?.price ??
        product?.salePrice ??
        product?.offerPrice ??
        product?.discountedPrice ??
        0
    ) || 0,
  oldPrice:
    Number(product?.mrp ?? product?.oldPrice ?? product?.originalPrice ?? 0) || null,
  category:
    product?.category?.name ||
    product?.categoryName ||
    product?.department ||
    product?.departmentName ||
    product?.type ||
    "General",
  type:
    product?.type ||
    (product?.testCount || product?.tests ? "package" : "test"),
  description:
    product?.description ||
    product?.descrption ||
    product?.desc ||
    product?.details ||
    product?.test_description ||
    product?.testDescription ||
    product?.overview ||
    "",
  faqs: product?.faqs || product?.faq || product?.questions || product?.qa || [],
  city: product?.city || product?.location?.city || product?.lab?.city || "",
  raw: product,
});

export const mapApiLab = (lab, index) => ({
  id: lab?._id || lab?.id || `lab-${index}`,
  name: lab?.labName || lab?.name || "Unnamed Lab",
  type: lab?.labType || lab?.type || "Lab",
  area: lab?.area || lab?.city || lab?.location || "Area not available",
  address: lab?.address || lab?.fullAddress || "Address not available",
  city: lab?.city || lab?.area || "",
  phoneNumber: lab?.phoneNumber || lab?.contactNumber || "",
  raw: lab,
});
