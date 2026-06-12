const STORAGE_PREFIX = "welloSavedAddresses";

export const normalizeAddress = (entry, index = 0) => {
  if (typeof entry === "string") {
    return {
      _id: `addr-${index}`,
      type: "HOME",
      houseNo: "",
      address: entry,
      city: "",
      state: "",
      pincode: "",
    };
  }

  if (!entry || typeof entry !== "object") return null;

  return {
    _id: entry._id || entry.id || `addr-${index}`,
    type: (entry.type || entry.label || "HOME").toString().toUpperCase(),
    houseNo: entry.houseNo || entry.houseNumber || entry.flat || "",
    address:
      entry.address ||
      entry.fullAddress ||
      entry.location ||
      entry.streetAddress ||
      entry.line1 ||
      "",
    city: entry.city || "",
    state: entry.state || "",
    pincode: entry.pincode || entry.pinCode || entry.zip || "",
  };
};

export const normalizeAddressList = (items) =>
  (Array.isArray(items) ? items : [])
    .map((entry, index) => normalizeAddress(entry, index))
    .filter((entry) => entry && (entry.address || entry.houseNo || entry.pincode));

const getStorageKey = (userId) => `${STORAGE_PREFIX}:${userId}`;

export const readLocalAddresses = (userId) => {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    const parsed = stored ? JSON.parse(stored) : [];
    return normalizeAddressList(parsed);
  } catch {
    return [];
  }
};

export const writeLocalAddresses = (userId, addresses) => {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(addresses));
};
