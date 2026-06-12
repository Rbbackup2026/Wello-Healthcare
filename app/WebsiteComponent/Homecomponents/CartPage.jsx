"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCart } from "../../Components/MainRoute/CartContext";
import { useAppRouter } from "../../hooks/useAppRouter";
import Link from "next/link";
import axios from "axios";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import LoginModal from "./LoginFolder/LoginModal";
import { getCustomerIdentity } from "../../utils/customerSession";
import {
  DEFAULT_WALLET_SETTINGS,
  getLocalWalletBalance,
  processLocalWalletOrder,
} from "../../utils/walletStorage";
import { normalizeAddressList, readLocalAddresses } from "../../utils/savedAddressStorage";

const BASE_URL = "http://localhost:3000";

const BOOKING_STORAGE_KEY = "labBookingDetails";
const PACKAGE_PEOPLE_STORAGE_KEY = "cartPackagePeople";
const HOME_COLLECTION_STORAGE_KEY = "cartHomeCollectionSelected";
const ABANDONED_CARTS_STORAGE_KEY = "abandonedCartRecords";
const ABANDONED_CART_VISITOR_KEY = "abandonedCartVisitorId";

const CONFETTI_COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#f472b6", "#3b82f6", "#34d399", "#a78bfa"];

const getVisitorId = () => {
  if (typeof window === "undefined") return "";

  const existingId = localStorage.getItem(ABANDONED_CART_VISITOR_KEY);
  if (existingId) return existingId;

  const nextId = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(ABANDONED_CART_VISITOR_KEY, nextId);
  return nextId;
};

const readAbandonedCarts = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(ABANDONED_CARTS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read abandoned cart records", error);
    return [];
  }
};

const writeAbandonedCarts = (records) => {
  if (typeof window === "undefined") return;

  const nextValue = JSON.stringify(records);
  const previousValue = localStorage.getItem(ABANDONED_CARTS_STORAGE_KEY);

  if (previousValue === nextValue) {
    return;
  }

  localStorage.setItem(ABANDONED_CARTS_STORAGE_KEY, nextValue);
  window.dispatchEvent(new Event("abandoned-cart-updated"));
};

const readPackagePeople = () => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(PACKAGE_PEOPLE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to read package people", error);
    return {};
  }
};

const readHomeCollectionSelected = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(HOME_COLLECTION_STORAGE_KEY) !== "false";
};

const buildAbandonedCartKey = () => getVisitorId();

const isSameAbandonedLead = (record, nextRecord) => {
  if (!record || !nextRecord) return false;

  return Boolean(
    (record.sessionKey && nextRecord.sessionKey && record.sessionKey === nextRecord.sessionKey) ||
      (record.recordKey && nextRecord.recordKey && record.recordKey === nextRecord.recordKey) ||
      (record.userId && nextRecord.userId && record.userId === nextRecord.userId) ||
      (record.phone && nextRecord.phone && record.phone === nextRecord.phone) ||
      (record.email && nextRecord.email && record.email === nextRecord.email)
  );
};

const EMPTY_ORDER_DETAILS = {
  patientName: "",
  address: "",
  city: "",
  state: "",
  landmark: "",
  slotDate: "",
  slotTime: "",
  paymentMethod: "COD",
};

const formatCollectionAddress = (entry) => {
  if (!entry) return "No address selected";

  const housePart = entry.houseNo ? `House no.: ${entry.houseNo}` : "";
  const locationPart = [entry.address, entry.city, entry.state]
    .filter(Boolean)
    .join(" ");
  const pincodePart = entry.pincode ? `- ${entry.pincode}` : "";

  return [housePart, locationPart, pincodePart].filter(Boolean).join(", ") || entry.address;
};

const Confetti = () => (
  <div className="cart-confetti">
    {Array.from({ length: 22 }, (_, i) => (
      <div
        key={i}
        className="cart-confetti-piece"
        style={{
          "--confetti-left": `${8 + ((i * 37) % 84)}%`,
          "--confetti-size": `${6 + (i % 5) * 3}px`,
          "--confetti-color": CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          "--confetti-radius": i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%",
          "--confetti-delay": `${(i * 0.12).toFixed(2)}s`,
        }}
      />
    ))}
  </div>
);

const formatCouponOffer = (coupon) => {
  if (coupon.discountType === "percentage") {
    return `Get ${coupon.discountValue}% Off`;
  }
  return `Get Rs ${coupon.discountValue} Off`;
};

const formatCouponDescription = (coupon) => {
  const offer =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% Off`
      : `Rs ${coupon.discountValue} Off`;
  if (coupon.minAmount) {
    return `Get ${offer} on your booking above ₹${coupon.minAmount} or more`;
  }
  return `Get ${offer} on your booking`;
};

const formatCouponExpiry = (expiry) => {
  if (!expiry) return "No expiry date";
  return `Expires on ${new Date(expiry).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const CouponPopup = ({ coupon, savedAmount, onClose }) => {
  useEffect(() => {
    const timeoutId = setTimeout(onClose, 3800);
    return () => clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <div className="cart-coupon-popup" onClick={onClose}>
      <div className="cart-coupon-popup-card" onClick={(event) => event.stopPropagation()}>
        <Confetti />
        <div className="cart-coupon-popup-body">
          <div className="cart-coupon-popup-icon">🎉</div>
          <div className="cart-coupon-code">{coupon.code}</div>
          <h2 className="cart-coupon-popup-title">You Saved</h2>
          <p className="cart-coupon-gradient-text">Rs. {savedAmount}</p>
          <p className="cart-coupon-popup-message">
            Coupon applied successfully! 🙌
            <br />
            <span className="cart-coupon-popup-hint">Tap anywhere to continue</span>
          </p>
          <button type="button" onClick={onClose} className="cart-coupon-primary-btn">
            Awesome, Let&apos;s Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, decreaseQty, increaseQty, removeItem, clearCart } = useCart();
  const router = useAppRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const addressPickerRef = useRef(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCartDetails, setShowCartDetails] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [couponPopup, setCouponPopup] = useState(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletSettings, setWalletSettings] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletCoinsToUse, setWalletCoinsToUse] = useState(0);
  const [homeCollectionSelected, setHomeCollectionSelected] = useState(readHomeCollectionSelected);
  const lastCustomerIdentityRef = useRef(null);

  const fetchWalletForUser = async (userId) => {
    if (!userId) {
      setWalletBalance(0);
      setWalletSettings(DEFAULT_WALLET_SETTINGS);
      return;
    }

    let settings = { ...DEFAULT_WALLET_SETTINGS };
    let balance = getLocalWalletBalance(userId);

    try {
      const settingsRes = await axios.get(`${BASE_URL}/v1/api/wallet/settings`);
      if (settingsRes.data?.settings) {
        settings = { ...DEFAULT_WALLET_SETTINGS, ...settingsRes.data.settings };
      }
    } catch {
      // Use default wallet settings when API is unavailable.
    }

    try {
      const balanceRes = await axios.get(`${BASE_URL}/v1/api/wallet/balance/${userId}`);
      balance = Number(balanceRes.data?.balance ?? balance);
      if (balanceRes.data?.settings) {
        settings = { ...DEFAULT_WALLET_SETTINGS, ...balanceRes.data.settings };
      }
    } catch {
      balance = getLocalWalletBalance(userId);
    }

    setWalletSettings(settings);
    setWalletBalance(balance);
  };

  const [orderDetails, setOrderDetails] = useState(() => {
    if (typeof window === "undefined") {
      return EMPTY_ORDER_DETAILS;
    }

    try {
      const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
      return saved ? { ...EMPTY_ORDER_DETAILS, ...JSON.parse(saved) } : EMPTY_ORDER_DETAILS;
    } catch (error) {
      console.error("Failed to read booking details", error);
      return EMPTY_ORDER_DETAILS;
    }
  });

  useEffect(() => {
    const syncAuth = () => {
      const user = localStorage.getItem("customerUser");
      const parsedUser = user ? JSON.parse(user) : null;
      const currentIdentity = getCustomerIdentity(parsedUser);
      const previousIdentity = lastCustomerIdentityRef.current;

      if (user) {
        setIsLoggedIn(true);
        const userId = parsedUser._id || parsedUser.id;
        fetchWalletForUser(userId);
        axios
          .get(`${BASE_URL}/v1/api/all`)
          .then((res) => setAvailableCoupons((res.data.coupons || []).filter((coupon) => coupon.active)))
          .catch(() => setAvailableCoupons([]));

        if (previousIdentity !== currentIdentity) {
          axios
            .get(`${BASE_URL}/v1/api/get-saved-addresses/${userId}`)
            .then((res) => {
              const apiAddresses = normalizeAddressList(res.data.savedAddresses || []);
              setSavedAddresses(
                apiAddresses.length > 0 ? apiAddresses : readLocalAddresses(userId)
              );
            })
            .catch(() => setSavedAddresses(readLocalAddresses(userId)));
          const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
          setOrderDetails(saved ? { ...EMPTY_ORDER_DETAILS, ...JSON.parse(saved) } : EMPTY_ORDER_DETAILS);
        }
      } else {
        setIsLoggedIn(false);
        if (previousIdentity) {
          setSavedAddresses([]);
          setSelectedAddressId(null);
          setOrderDetails(EMPTY_ORDER_DETAILS);
          setWalletBalance(0);
          setWalletSettings(null);
          setUseWallet(false);
          setWalletCoinsToUse(0);
        }
      }

      lastCustomerIdentityRef.current = currentIdentity;
    };

    const refreshWalletFromStorage = () => {
      const rawUser = localStorage.getItem("customerUser");
      if (!rawUser) return;
      const parsedUser = JSON.parse(rawUser);
      fetchWalletForUser(parsedUser._id || parsedUser.id);
    };

    syncAuth();
    refreshWalletFromStorage();
    window.addEventListener("customer-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    window.addEventListener("wallet-balance-updated", refreshWalletFromStorage);
    return () => {
      window.removeEventListener("customer-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("wallet-balance-updated", refreshWalletFromStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(orderDetails));
  }, [orderDetails]);

  useEffect(() => {
    const syncHomeCollection = () => {
      setHomeCollectionSelected(readHomeCollectionSelected());
    };

    window.addEventListener("cart-home-collection-changed", syncHomeCollection);
    window.addEventListener("storage", syncHomeCollection);
    return () => {
      window.removeEventListener("cart-home-collection-changed", syncHomeCollection);
      window.removeEventListener("storage", syncHomeCollection);
    };
  }, []);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const homeCollectionCharge = homeCollectionSelected && cartItems.length > 0 ? 150 : 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.discountValue
    : 0;
  const payableBeforeWallet = Math.max(0, subtotal + homeCollectionCharge - discountAmount);
  const activeWalletSettings = walletSettings || DEFAULT_WALLET_SETTINGS;
  const coinValue = Number(activeWalletSettings.coinValue || 1);
  const maxRedeemPercent = Number(activeWalletSettings.maxRedeemPercent || 50);
  const minOrderToRedeem = Number(activeWalletSettings.minOrderToRedeem || 0);
  const canUseWallet =
    Boolean(activeWalletSettings.active) &&
    walletBalance > 0 &&
    payableBeforeWallet >= minOrderToRedeem;
  const maxWalletCoins = canUseWallet
    ? Math.max(
        0,
        Math.min(
          walletBalance,
          Math.floor((payableBeforeWallet * maxRedeemPercent) / 100 / coinValue),
          Math.floor(payableBeforeWallet / coinValue)
        )
      )
    : 0;
  const appliedWalletCoins = useWallet
    ? Math.max(0, Math.min(walletCoinsToUse || maxWalletCoins, maxWalletCoins))
    : 0;
  const walletDiscount = appliedWalletCoins * coinValue;
  const totalToPay = Math.max(0, payableBeforeWallet - walletDiscount);
  const minOrderToEarn = Number(activeWalletSettings.minOrderToEarn || 0);
  const coinsToEarn =
    activeWalletSettings.active && subtotal >= minOrderToEarn
      ? activeWalletSettings.earnType === "flat"
        ? Math.floor(Number(activeWalletSettings.earnValue || 0))
        : Math.floor((subtotal * Number(activeWalletSettings.earnValue || 0)) / 100)
      : 0;

  useEffect(() => {
    const rawUser = localStorage.getItem("customerUser");
    const customerUser = rawUser ? JSON.parse(rawUser) : null;
    const hasCheckoutProgress = Object.values(orderDetails).some(
      (value) => typeof value === "string" && value.trim()
    );
    const recordKey = buildAbandonedCartKey();
    const existingRecords = readAbandonedCarts();

    if (!hasCheckoutProgress && !customerUser) {
      return undefined;
    }

    const now = new Date().toISOString();
    const existingRecord = existingRecords.find((record) => record.recordKey === recordKey);
    const fullAddress = [orderDetails.address, orderDetails.landmark, orderDetails.city, orderDetails.state]
      .filter(Boolean)
      .join(", ");

    const nextRecord = {
      id: existingRecord?.id || `AC-${Date.now()}`,
      recordKey,
      sessionKey: recordKey,
      userId: customerUser?._id || customerUser?.id || "",
      customerName: orderDetails.patientName?.trim() || "",
      phone: customerUser?.mobileNo || customerUser?.phone || "",
      email: customerUser?.email || "",
      address: fullAddress || orderDetails.address || "",
      city: orderDetails.city || "",
      state: orderDetails.state || "",
      landmark: orderDetails.landmark || "",
      slotDate: orderDetails.slotDate || "",
      slotTime: orderDetails.slotTime || "",
      paymentMethod: orderDetails.paymentMethod || "COD",
      subtotal,
      discountAmount,
      walletCoinsUsed: appliedWalletCoins,
      walletDiscount,
      totalAmount: totalToPay,
      appliedCoupon: appliedCoupon?.code || "",
      source: "Web",
      items: cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        category: item.category || "",
      })),
      addedOn: existingRecord?.addedOn || now,
      updatedOn: now,
    };

    const nextRecords = [
      nextRecord,
      ...existingRecords.filter((record) => !isSameAbandonedLead(record, nextRecord)),
    ].slice(0, 100);

    const timeoutId = window.setTimeout(() => {
      writeAbandonedCarts(nextRecords);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [appliedCoupon, appliedWalletCoins, cartItems, discountAmount, orderDetails, totalToPay, walletDiscount]);

  useEffect(() => {
    if (!useWallet) {
      setWalletCoinsToUse(0);
      return;
    }
    setWalletCoinsToUse((previous) => {
      if (!previous || previous > maxWalletCoins) {
        return maxWalletCoins;
      }
      return previous;
    });
  }, [maxWalletCoins, useWallet]);

  const handleApplyCoupon = (code) => {
    const target = code || couponCode;
    const coupon = availableCoupons.find(
      (entry) => entry.code.toUpperCase() === target.toUpperCase().trim()
    );
    if (!coupon) return toast.error("Invalid coupon code.");
    if (subtotal < coupon.minAmount) return toast.warn(`Min. amount needed: Rs. ${coupon.minAmount}`);
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    const saved =
      coupon.discountType === "percentage"
        ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
        : coupon.discountValue;
    setCouponPopup({ coupon, savedAmount: saved });
    setCouponModalOpen(false);
  };

  const selectedCollectionAddress =
    savedAddresses.find((entry) => entry._id === selectedAddressId) || savedAddresses[0] || null;

  const applyCollectionAddress = (entry) => {
    if (!entry) return;
    setSelectedAddressId(entry._id);
    setOrderDetails((previous) => ({
      ...previous,
      address: [entry.houseNo, entry.address].filter(Boolean).join(", "),
      city: entry.city || "",
      state: entry.state || "",
      landmark: entry.area || entry.landmark || "",
    }));
    setShowAddressDropdown(false);
  };

  useEffect(() => {
    if (savedAddresses.length === 0) return;

    const hasSelection =
      selectedAddressId && savedAddresses.some((entry) => entry._id === selectedAddressId);
    if (hasSelection) return;

    const first = savedAddresses[0];
    setSelectedAddressId(first._id);
    setOrderDetails((previous) => ({
      ...previous,
      address: [first.houseNo, first.address].filter(Boolean).join(", "),
      city: first.city || "",
      state: first.state || "",
      landmark: first.area || first.landmark || "",
    }));
  }, [savedAddresses, selectedAddressId]);

  useEffect(() => {
    if (!showAddressDropdown) return undefined;

    const handleOutsideClick = (event) => {
      if (addressPickerRef.current && !addressPickerRef.current.contains(event.target)) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showAddressDropdown]);

  const handleCouponCodeChange = (value) => {
    setCouponCode(value);
    if (!appliedCoupon) return;
    const trimmed = value.trim();
    if (!trimmed || trimmed.toUpperCase() !== appliedCoupon.code.toUpperCase()) {
      setAppliedCoupon(null);
      setCouponPopup(null);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setOrderDetails((previous) => ({ ...previous, [name]: value }));
  };

  const promptLoginForBooking = () => {
    toast.error("Please login to schedule and book.", { position: "top-center" });
    setLoginOpen(true);
  };

  const validateDetails = () => {
    const packagePeople = readPackagePeople();
    const hasMissingPerson = cartItems.some((item) => {
      const itemKey = item.cartEntryId || item._id || item.id;
      const people = packagePeople[itemKey] || {};
      return (people.patients || []).length === 0 && (people.members || []).length === 0;
    });
    const { slotDate, slotTime } = orderDetails;

    if (hasMissingPerson) {
      toast.error("Please add patient details for every cart item first.", { position: "top-center" });
      return false;
    }
    if (!orderDetails.address?.trim()) {
      toast.error("Please select a sample collection address.", { position: "top-center" });
      return false;
    }
    if (!slotDate || !slotTime) {
      toast.error("Please select collection date and time.", { position: "top-center" });
      return false;
    }
    if (cartItems.length === 0) {
      toast.warn("Your cart is empty!");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateDetails()) return;
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(orderDetails));
    setStep(2);
  };

  const handleFinalOrder = async () => {
    setIsOrdering(true);
    try {
      const userStr = localStorage.getItem("customerUser");
      if (!userStr) {
        promptLoginForBooking();
        return;
      }
      const user = JSON.parse(userStr);
      const packagePeople = readPackagePeople();
      const allSavedPeople = cartItems.flatMap((item) => {
        const itemKey = item.cartEntryId || item._id || item.id;
        const people = packagePeople[itemKey] || {};
        return [...(people.patients || []), ...(people.members || [])];
      });
      const primaryPerson = allSavedPeople[0] || {};
      const personAddress = [
        primaryPerson.address,
        primaryPerson.area,
        primaryPerson.city,
        primaryPerson.state,
        primaryPerson.pincode,
      ]
        .filter(Boolean)
        .join(", ");
      const orderPayload = {
        userId: user._id || user.id,
        phone: user.mobileNo || user.phone || "",
        email: user.email || "",
        items: cartItems.map((item) => {
          const itemKey = item.cartEntryId || item._id || item.id;
          return {
            productId: item._id || item.id,
            cartEntryId: item.cartEntryId || "",
            name: item.name,
            price: item.price,
            quantity: item.qty,
            category: item.category || "",
            people: packagePeople[itemKey] || { patients: [], members: [] },
          };
        }),
        patientName:
          primaryPerson.name || [primaryPerson.firstName, primaryPerson.lastName].filter(Boolean).join(" "),
        prefix: primaryPerson.prefix || "",
        firstName: primaryPerson.firstName || "",
        lastName: primaryPerson.lastName || "",
        gender: primaryPerson.gender || "",
        mobileNumber: primaryPerson.mobileNumber || "",
        dateOfBirth: primaryPerson.dateOfBirth || "",
        relation: primaryPerson.relation || "",
        address: personAddress,
        state: primaryPerson.state || "",
        city: primaryPerson.city || "",
        area: primaryPerson.area || "",
        pincode: primaryPerson.pincode || "",
        landmark: primaryPerson.area || "",
        slotDate: orderDetails.slotDate,
        slotTime: orderDetails.slotTime,
        subtotal,
        amount: subtotal,
        status: "Pending",
        paymentMethod: orderDetails.paymentMethod,
        paymentStatus: "Unpaid",
        discount: discountAmount,
        walletCoinsUsed: appliedWalletCoins,
        walletDiscount,
        coinsToEarn,
        totalAmount: totalToPay,
        appliedCoupon: appliedCoupon?.code || "",
      };
      const res = await axios.post(`${BASE_URL}/v1/api/create-order`, orderPayload);
      const orderId = res.data?.order?._id;
      const userId = user._id || user.id;
      let earnedCoins = coinsToEarn;

      try {
        const walletRes = await axios.post(`${BASE_URL}/v1/api/wallet/process-order`, {
          userId,
          orderId,
          orderSubtotal: subtotal,
          walletCoinsUsed: appliedWalletCoins,
        });
        earnedCoins = Number(walletRes.data?.earnedCoins ?? coinsToEarn);
        if (walletRes.data?.walletBalance !== undefined) {
          setWalletBalance(Number(walletRes.data.walletBalance));
        }
      } catch {
        const localResult = processLocalWalletOrder({
          userId,
          orderId: orderId || `local-${Date.now()}`,
          orderSubtotal: subtotal,
          walletCoinsUsed: appliedWalletCoins,
          settings: walletSettings || DEFAULT_WALLET_SETTINGS,
        });
        earnedCoins = localResult.earnedCoins;
        setWalletBalance(localResult.walletBalance);
      }

      setUseWallet(false);
      setWalletCoinsToUse(0);
      localStorage.removeItem(BOOKING_STORAGE_KEY);
      const nextRecords = readAbandonedCarts().filter(
        (record) => record.recordKey !== buildAbandonedCartKey()
      );
      writeAbandonedCarts(nextRecords);
      localStorage.removeItem(PACKAGE_PEOPLE_STORAGE_KEY);
      clearCart();
      toast.success(
        earnedCoins > 0
          ? `Order placed! You earned ${earnedCoins} wallet coins for your next booking.`
          : "Order placed successfully!"
      );
      router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const timeSlots = ["07:00 AM - 09:00 AM", "09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM"];
  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      {couponPopup && (
        <CouponPopup
          coupon={couponPopup.coupon}
          savedAmount={couponPopup.savedAmount}
          onClose={() => setCouponPopup(null)}
        />
      )}

      {couponModalOpen && (
        <div className="cart-coupon-modal-overlay" onClick={() => setCouponModalOpen(false)}>
          <div className="cart-coupon-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setCouponModalOpen(false)}
              className="cart-coupon-modal-close"
              aria-label="Close coupons"
            >
              ×
            </button>

            <div className="cart-coupon-modal-header">
              <h2 className="cart-coupon-modal-title">Available Coupons</h2>
            </div>

            <div className="cart-coupon-modal-input-wrap">
              <div className="cart-coupon-modal-input-row">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => handleCouponCodeChange(event.target.value)}
                  placeholder="Enter coupon code"
                  className="cart-coupon-modal-input"
                />
                <button type="button" onClick={() => handleApplyCoupon()} className="cart-coupon-modal-check-btn">
                  Check
                </button>
              </div>
            </div>

            <div className="cart-coupon-modal-list">
              {availableCoupons.length === 0 ? (
                <p className="cart-coupon-modal-empty">No coupons available</p>
              ) : (
                <div className="cart-coupon-modal-items">
                  {availableCoupons.map((coupon) => {
                    const isApplied =
                      appliedCoupon?.code?.toUpperCase() === coupon.code?.toUpperCase();
                    return (
                      <article key={coupon._id || coupon.code} className="cart-coupon-ticket">
                        <div className="cart-coupon-ticket-stub">
                          <p className="cart-coupon-ticket-offer">{formatCouponOffer(coupon)}</p>
                          <div className="cart-coupon-ticket-code-box">
                            <span>{coupon.code}</span>
                          </div>
                        </div>
                        <div className="cart-coupon-ticket-body">
                          <p className="cart-coupon-ticket-frequency">
                            FREQUENCY: {coupon.frequency || 1}
                          </p>
                          <p className="cart-coupon-ticket-desc">{formatCouponDescription(coupon)}</p>
                          <div className="cart-coupon-ticket-footer">
                            <span className="cart-coupon-ticket-expiry">
                              {formatCouponExpiry(coupon.expiry)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(coupon.code)}
                              className={`cart-coupon-ticket-apply-btn${isApplied ? " is-applied" : ""}`}
                              disabled={isApplied}
                            >
                              {isApplied ? "Applied" : "Apply"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="cart-page-main">
        <div className="cart-page-container">
          {cartItems.length === 0 ? (
            <div className="cart-page-empty">
              <h2 className="cart-page-empty-title">Your cart is empty</h2>
              <p className="cart-page-empty-text">Add a test or package to continue booking.</p>
            </div>
          ) : (
            <div className="cart-page-grid">
              <section className="cart-page-section">
                <div className="cart-page-section-title">
                  <h1 className="cart-page-title">Add Tests in Your Cart</h1>
                </div>
                <div className={`cart-summary-box ${showCartDetails ? "is-open" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setShowCartDetails((value) => !value)}
                    className="cart-summary-toggle"
                  >
                    <span className="cart-step-badge">1</span>
                    <span className="cart-summary-heading">Cart Summary</span>
                  </button>
                  {showCartDetails && (
                    <div className="cart-summary-items">
                      <div className="cart-summary-items-list">
                        {cartItems.map((item) => (
                          <div key={item.cartEntryId} className="cart-summary-item">
                            <div className="cart-summary-item-info">
                              <h3 className="cart-summary-item-name">{item.name}</h3>
                              <p className="cart-summary-item-meta">Includes {item.testCount || 1} Tests</p>
                            </div>
                            <div className="cart-summary-item-actions">
                              <div className="cart-qty-control">
                                <button
                                  type="button"
                                  onClick={() => decreaseQty(item.cartEntryId)}
                                  className="cart-qty-btn"
                                >
                                  -
                                </button>
                                <span className="cart-qty-value">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => increaseQty(item.cartEntryId)}
                                  className="cart-qty-btn"
                                >
                                  +
                                </button>
                              </div>
                              <strong className="cart-summary-item-price">Rs. {item.price * item.qty}</strong>
                              <button
                                type="button"
                                onClick={() => removeItem(item.cartEntryId)}
                                className="cart-remove-btn"
                                aria-label="Remove item"
                              >
                                <AiFillDelete />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`cart-schedule-panel ${showSchedule ? "is-open" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setShowSchedule((value) => !value)}
                    className="cart-schedule-header"
                  >
                    <span className="cart-schedule-step">3</span>
                    <span className="cart-schedule-title">Add Sample Collection Address, Date & Time</span>
                  </button>

                  {showSchedule && (
                    <div className="cart-schedule-body">
                      <div className="cart-collection-address-row">
                        <div className="cart-collection-address-card is-selected">
                          {selectedCollectionAddress ? (
                            <>
                              <div className="cart-collection-address-top">
                                <span className="cart-collection-address-check" aria-hidden="true" />
                                <span className="cart-collection-address-tag">
                                  {selectedCollectionAddress.type || "HOME"}
                                </span>
                              </div>
                              <p className="cart-collection-address-text">
                                {formatCollectionAddress(selectedCollectionAddress)}
                              </p>
                            </>
                          ) : (
                            <p className="cart-collection-address-empty">
                              No saved address selected. Choose one from saved addresses.
                            </p>
                          )}
                        </div>

                        <div className="cart-collection-address-picker" ref={addressPickerRef}>
                          <button
                            type="button"
                            className="cart-collection-address-toggle"
                            onClick={() => {
                              if (!isLoggedIn) return promptLoginForBooking();
                              setShowAddressDropdown((value) => !value);
                            }}
                          >
                            <span>View Saved Address</span>
                            <span
                              className={`cart-collection-address-chevron${
                                showAddressDropdown ? " is-open" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          {showAddressDropdown && (
                            <div className="cart-collection-address-menu">
                              {savedAddresses.length === 0 ? (
                                <p className="cart-collection-address-menu-empty">
                                  No saved addresses yet.{" "}
                                  <Link href="/saved-addresses">Add address</Link>
                                </p>
                              ) : (
                                savedAddresses.map((entry) => (
                                  <button
                                    key={entry._id}
                                    type="button"
                                    className={`cart-collection-address-option${
                                      selectedAddressId === entry._id ? " is-selected" : ""
                                    }`}
                                    onClick={() => applyCollectionAddress(entry)}
                                  >
                                    <span className="cart-collection-address-option-tag">
                                      {entry.type || "HOME"}
                                    </span>
                                    <span className="cart-collection-address-option-text">
                                      {formatCollectionAddress(entry)}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="cart-slot-section">
                        <p className="cart-slot-label cart-slot-label-heading">
                          Choose Date & Time for Home Sample Collection *
                        </p>
                        <div className="cart-slot-row">
                          <input
                            type="date"
                            name="slotDate"
                            min={today}
                            value={orderDetails.slotDate}
                            onChange={handleInputChange}
                            className="cart-slot-input"
                          />
                          <div className="cart-slot-input-wrap">
                            <button
                              type="button"
                              onClick={() => setShowTimeSlots((value) => !value)}
                              className="cart-slot-input cart-slot-select"
                            >
                              <span className={orderDetails.slotTime ? "cart-slot-value" : "cart-slot-placeholder"}>
                                {orderDetails.slotTime || "Select Time"}
                              </span>
                              <span className="cart-slot-icon" aria-hidden="true" />
                            </button>
                            {showTimeSlots && (
                              <div className="cart-slot-menu">
                                {timeSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => {
                                      setOrderDetails((previous) => ({ ...previous, slotTime: slot }));
                                      setShowTimeSlots(false);
                                    }}
                                    className="cart-slot-option"
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="cart-slot-note">
                          The duration of an appointment can vary, and earlier bookings might extend beyond schedule.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoggedIn) return promptLoginForBooking();
                          handleProceedToPayment();
                        }}
                        className="cart-schedule-next"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                <div className={`cart-payment-box ${step === 2 ? "is-open" : ""}`}>
                  <button type="button" onClick={() => setStep(2)} className="cart-payment-toggle">
                    <span className="cart-step-badge">4</span>
                    Payment Option
                  </button>

                  {step === 2 && (
                    <div className="cart-payment-body">
                      <div className="cart-payment-options">
                        {[
                          ["COD", "Cash on Delivery", "Pay after sample collection"],
                          ["Online", "Online Payment", "UPI / Card / Net Banking"],
                        ].map(([key, title, desc]) => {
                          const selected = orderDetails.paymentMethod === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setOrderDetails((previous) => ({ ...previous, paymentMethod: key }))}
                              className={`cart-payment-option ${selected ? "is-selected" : ""}`}
                            >
                              <span className="cart-payment-option-title">{title}</span>
                              <span className="cart-payment-option-desc">{desc}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="cart-payment-actions">
                        <button type="button" onClick={() => setStep(1)} className="cart-payment-back-btn">
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isLoggedIn) return promptLoginForBooking();
                            handleFinalOrder();
                          }}
                          disabled={isOrdering}
                          className="cart-payment-submit-btn"
                        >
                          {isOrdering ? "Placing Order..." : "Place Order"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <aside className="cart-page-aside">
                <Link href="/lab-tests" className="cart-page-add-test-btn">
                  Add Test
                </Link>

                <div className="cart-checkout-panel cart-checkout-panel-padded">
                  <div className="cart-sidebar-coupon-section">
                    <h3 className="cart-sidebar-coupon-title">Apply Coupon</h3>
                    <div className="cart-sidebar-coupon-row">
                      <div className="cart-sidebar-coupon-field">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(event) => handleCouponCodeChange(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleApplyCoupon();
                          }}
                          placeholder="Enter Coupon Code"
                          className="cart-sidebar-coupon-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="cart-sidebar-apply-btn"
                        >
                          Add
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCouponModalOpen(true)}
                        className="cart-sidebar-available-link"
                      >
                        Available coupon
                      </button>
                    </div>
                  </div>

                  {isLoggedIn && (walletSettings || DEFAULT_WALLET_SETTINGS).active && (
                    <div className="cart-wallet-panel">
                      <div className="cart-wallet-header">
                        <div>
                          <p className="cart-wallet-title">Wello Wallet</p>
                          <p className="cart-wallet-balance">
                            {walletBalance} coins available
                          </p>
                          {coinsToEarn > 0 && (
                            <p className="cart-wallet-earn-text">
                              Earn {coinsToEarn} coins when you place this order
                            </p>
                          )}
                        </div>
                        {canUseWallet ? (
                          <button
                            type="button"
                            className={`cart-wallet-use-btn ${useWallet ? "is-active" : ""}`}
                            onClick={() => setUseWallet((previous) => !previous)}
                          >
                            {useWallet ? "Coins applied" : "Use coins"}
                          </button>
                        ) : (
                          <span className="cart-wallet-earn-pill">
                            {walletBalance === 0 ? "New wallet" : "No coins usable"}
                          </span>
                        )}
                      </div>
                      {useWallet && canUseWallet && (
                        <div className="cart-wallet-use-row">
                          <input
                            type="number"
                            min={0}
                            max={maxWalletCoins}
                            value={appliedWalletCoins}
                            onChange={(event) =>
                              setWalletCoinsToUse(
                                Math.max(
                                  0,
                                  Math.min(maxWalletCoins, Number(event.target.value || 0))
                                )
                              )
                            }
                            className="cart-wallet-input"
                          />
                          <button
                            type="button"
                            className="cart-wallet-max-btn"
                            onClick={() => setWalletCoinsToUse(maxWalletCoins)}
                          >
                            Use Max
                          </button>
                        </div>
                      )}
                      {!canUseWallet && walletBalance > 0 && (
                        <p className="cart-wallet-note">
                          {payableBeforeWallet < minOrderToRedeem
                            ? `Minimum order Rs ${minOrderToRedeem} required to use wallet coins`
                            : "Wallet coins cannot be applied on this order"}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="cart-sidebar-totals">
                    <div className="cart-sidebar-row">
                      <span className="cart-sidebar-label">Subtotal</span>
                      <strong className="cart-sidebar-value">Rs {subtotal}</strong>
                    </div>
                    {homeCollectionSelected && (
                      <div className="cart-sidebar-row">
                        <span className="cart-sidebar-label">Home Collection Charges</span>
                        <strong className="cart-sidebar-value">Rs {homeCollectionCharge}</strong>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="cart-sidebar-row">
                        <span className="cart-sidebar-label">Coupon Discount</span>
                        <strong className="cart-sidebar-discount">- Rs {discountAmount}</strong>
                      </div>
                    )}
                    {walletDiscount > 0 && (
                      <div className="cart-sidebar-row">
                        <span className="cart-sidebar-label">Wallet Coins</span>
                        <strong className="cart-sidebar-discount">- Rs {walletDiscount}</strong>
                      </div>
                    )}
                    {homeCollectionSelected && (
                      <p className="cart-sidebar-note">Add Test(s) worth 99 to get free Home Collection</p>
                    )}
                    <div className="cart-sidebar-total-row">
                      <span className="cart-sidebar-total-label">To Pay</span>
                      <strong className="cart-sidebar-value">Rs {totalToPay}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 1) {
                          if (!isLoggedIn) return promptLoginForBooking();
                          handleProceedToPayment();
                          return;
                        }
                        if (!isLoggedIn) return promptLoginForBooking();
                        handleFinalOrder();
                      }}
                      disabled={isOrdering}
                      className="cart-pay-now-btn"
                    >
                      {isOrdering ? "Placing Order..." : "Pay Now"}
                    </button>
                    <p className="cart-sidebar-disclaimer">
                      inclusive of all the taxes, fees and subject to availability
                    </p>
                  </div>
                </div>

                <div className="cart-promo-card">
                  <img
                    src="/images/homepage-doctor-crop.png"
                    alt=""
                    className="cart-promo-image"
                    aria-hidden="true"
                  />
                  <div className="cart-promo-content">
                    <h3 className="cart-promo-title">Full Body Checkup</h3>
                    <ul className="cart-promo-list">
                      <li>Blood Sugar</li>
                      <li>Cholesterol Panel</li>
                      <li>Liver Function</li>
                      <li>Kidney Function</li>
                      <li>Thyroid Profile</li>
                    </ul>
                    <Link href="/lab-tests" className="cart-promo-btn">
                      Book Now
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <Footer />
    </>
  );
};

export default CartPage;
