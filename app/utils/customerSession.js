const CART_STORAGE_KEY = "cartItems";
const BOOKING_DETAILS_STORAGE_KEY = "bookingDetails";
const LAB_BOOKING_STORAGE_KEY = "labBookingDetails";

export const getCustomerIdentity = (user) =>
  user?._id || user?.id || user?.email || user?.mobileNo || "";

export const clearCustomerCheckoutState = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(BOOKING_DETAILS_STORAGE_KEY);
  localStorage.removeItem(LAB_BOOKING_STORAGE_KEY);
};

export const dispatchCustomerAuthChanged = (detail = {}) => {
  window.dispatchEvent(new CustomEvent("customer-auth-changed", { detail }));
};
