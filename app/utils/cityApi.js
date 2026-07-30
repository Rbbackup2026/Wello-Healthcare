import { API_BASE_URL } from "./api";

export const METRO_CITIES = [
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Gurugram",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
  "Noida",
  "Pune",
];

const toTitleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const deslugifyLocation = (value = "") => toTitleCase(value.replace(/-/g, " "));

export const slugifyCity = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

const getProductCity = (product = {}) => {
  if (Array.isArray(product?.cityPricing) && product.cityPricing.length > 0) {
    return product.cityPricing.map((entry) => entry.city).join(", ");
  }

  return (
    product?.city ||
    product?.location?.city ||
    product?.lab?.city ||
    product?.labDetails?.city ||
    ""
  );
};

export const getProductCityPricing = (product = {}) => {
  if (Array.isArray(product?.cityPricing) && product.cityPricing.length > 0) {
    return product.cityPricing;
  }

  const city = getProductCity(product);
  if (!city) {
    return [];
  }

  return city.split(",").map((entry) => entry.trim()).filter(Boolean).map((entryCity) => ({
    city: entryCity,
    price: Number(product?.price) || 0,
    mrp: Number(product?.mrp) || 0,
    schedulePrice: Number(product?.schedulePrice) || 0,
  }));
};

export const resolveProductPricingForCity = (product = {}, city = "") => {
  const entries = getProductCityPricing(product);
  const normalizedRequestedCity = normalizeCityName(city);

  const matchedEntry = entries.find(
    (entry) => normalizeCityName(entry.city) === normalizedRequestedCity
  );
  const selectedEntry = matchedEntry || entries[0];

  const endOfDay = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const resolveFromEntry = (entry = {}, fallbackProduct = {}) => {
    const mrp = Number(entry.mrp ?? fallbackProduct?.mrp) || 0;
    const offer = Number(entry.price ?? fallbackProduct?.price) || 0;
    const validUntil =
      entry.priceValidUntil || fallbackProduct?.priceValidUntil || null;
    const until = endOfDay(validUntil);
    const offerActive =
      offer > 0 && (!until || Date.now() <= until.getTime());

    if (offerActive) {
      return {
        city: entry.city || getProductCity(fallbackProduct),
        price: offer,
        mrp: mrp > 0 ? mrp : offer,
        schedulePrice: Number(entry.schedulePrice ?? fallbackProduct?.schedulePrice) || 0,
        priceValidUntil: validUntil || null,
        offerActive: true,
      };
    }

    const displayPrice = mrp > 0 ? mrp : offer;
    return {
      city: entry.city || getProductCity(fallbackProduct),
      price: displayPrice,
      mrp: mrp > 0 ? mrp : displayPrice,
      schedulePrice: Number(entry.schedulePrice ?? fallbackProduct?.schedulePrice) || 0,
      priceValidUntil: validUntil || null,
      offerActive: false,
    };
  };

  if (!selectedEntry) {
    return resolveFromEntry({}, product);
  }

  return resolveFromEntry(selectedEntry, product);
};

export const filterProductsByCity = (products = [], city = "") => {
  const normalizedRequestedCity = normalizeCityName(city);

  if (!normalizedRequestedCity) {
    return products;
  }

  return products.filter((product) => {
    const cityEntries = getProductCityPricing(product);

    if (cityEntries.length > 0) {
      return cityEntries.some((entry) => {
        const normalizedProductCity = normalizeCityName(entry.city);
        return (
          normalizedProductCity === normalizedRequestedCity ||
          normalizedProductCity.startsWith(`${normalizedRequestedCity} `) ||
          normalizedRequestedCity.startsWith(`${normalizedProductCity} `)
        );
      });
    }

    const normalizedProductCity = normalizeCityName(getProductCity(product));

    if (!normalizedProductCity) {
      return true;
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

export const mapApiProduct = (product, index, selectedCity = "") => {
  const pricing = resolveProductPricingForCity(product, selectedCity);

  return {
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
  price: pricing.price,
  oldPrice:
    pricing.offerActive && pricing.mrp > pricing.price
      ? pricing.mrp
      : null,
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
  city: pricing.city,
  schedulePrice: pricing.schedulePrice,
  fromAge: Number(product?.fromAge) || 0,
  toAge: Number(product?.toAge) || 0,
  gender: product?.gender || "Both",
  raw: product,
};
};

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
