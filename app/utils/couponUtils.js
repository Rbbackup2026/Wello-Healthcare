import { normalizeCityName } from "./cityApi";

const normalizeCity = (value = "") => normalizeCityName(value);

export const getCouponProductIds = (coupon = {}) =>
  (coupon.products || [])
    .map((product) => String(product?._id || product?.id || product))
    .filter(Boolean);

const normalizeCartItems = (cartItems = []) =>
  cartItems
    .map((item) => ({
      productId: String(item.productId || item.id || item._id || ""),
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 1,
    }))
    .filter((item) => item.productId);

export const getEligibleCartItems = (cartItems = [], coupon = {}) => {
  const normalizedItems = normalizeCartItems(cartItems);
  const productIds = getCouponProductIds(coupon);

  if (productIds.length === 0) {
    return normalizedItems;
  }

  return normalizedItems.filter((item) => productIds.includes(item.productId));
};

export const getEligibleCartSubtotal = (cartItems = [], coupon = {}) =>
  getEligibleCartItems(cartItems, coupon).reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

export const isCouponExpired = (coupon = {}) => {
  if (!coupon?.expiry) return false;

  const expiryDate = new Date(coupon.expiry);
  if (Number.isNaN(expiryDate.getTime())) {
    return true;
  }

  expiryDate.setHours(23, 59, 59, 999);
  return Date.now() > expiryDate.getTime();
};

export const filterNonExpiredCoupons = (coupons = []) =>
  coupons.filter((coupon) => coupon?.active && !isCouponExpired(coupon));

export const isCityEligibleForCoupon = (coupon = {}, city = "") => {
  const allowedCities = (coupon.cities || [])
    .map((entry) => normalizeCity(entry))
    .filter(Boolean);

  if (allowedCities.length === 0) {
    return true;
  }

  const requestedCity = normalizeCity(city);
  if (!requestedCity) {
    return false;
  }

  return allowedCities.includes(requestedCity);
};

export const hasEligibleProductsForCoupon = (cartItems = [], coupon = {}) => {
  const productIds = getCouponProductIds(coupon);
  if (productIds.length === 0) {
    return normalizeCartItems(cartItems).length > 0;
  }

  return getEligibleCartItems(cartItems, coupon).length > 0;
};

export const calculateCouponDiscount = (coupon = {}, eligibleSubtotal = 0) => {
  const cartTotal = Number(eligibleSubtotal) || 0;
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (cartTotal * Number(coupon.discountValue || 0)) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Number(coupon.discountValue || 0);
  }

  return Math.min(discount, cartTotal);
};

export const validateCouponForCart = (
  coupon,
  { city = "", cartItems = [] } = {}
) => {
  if (!coupon) {
    return { valid: false, message: "Invalid coupon" };
  }

  if (!coupon.active) {
    return { valid: false, message: "Coupon not active" };
  }

  if (isCouponExpired(coupon)) {
    return { valid: false, message: "Coupon expired" };
  }

  if (!isCityEligibleForCoupon(coupon, city)) {
    const allowedCities = (coupon.cities || []).join(", ");
    return {
      valid: false,
      message: allowedCities
        ? `This coupon is only valid in: ${allowedCities}`
        : "This coupon is not valid for your city",
    };
  }

  if (!hasEligibleProductsForCoupon(cartItems, coupon)) {
    return {
      valid: false,
      message: "This coupon is not valid for items in your cart",
    };
  }

  const eligibleSubtotal = getEligibleCartSubtotal(cartItems, coupon);

  if (eligibleSubtotal < Number(coupon.minAmount || 0)) {
    return {
      valid: false,
      message: `Minimum order amount should be Rs ${coupon.minAmount}`,
      eligibleSubtotal,
    };
  }

  const discount = calculateCouponDiscount(coupon, eligibleSubtotal);

  return {
    valid: true,
    message: "Coupon applied successfully",
    discount,
    eligibleSubtotal,
  };
};

export const filterCouponsForCart = (coupons = [], { city = "", cartItems = [] } = {}) =>
  coupons.filter((coupon) => {
    if (!coupon?.active || isCouponExpired(coupon)) {
      return false;
    }

    return validateCouponForCart(coupon, { city, cartItems }).valid;
  });

export const formatCouponRestrictions = (coupon = {}) => {
  const parts = [];

  if (Array.isArray(coupon.cities) && coupon.cities.length > 0) {
    parts.push(`Cities: ${coupon.cities.join(", ")}`);
  }

  if (Array.isArray(coupon.products) && coupon.products.length > 0) {
    const productNames = coupon.products
      .map((product) => product?.name || product)
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
    const suffix =
      coupon.products.length > 3 ? ` +${coupon.products.length - 3} more` : "";
    parts.push(`Products: ${productNames}${suffix}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "Valid on all cities and products";
};
