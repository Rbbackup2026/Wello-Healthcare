"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCart } from "../../Components/MainRoute/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import LoginModal from "./LoginFolder/LoginModal";
import { getCustomerIdentity } from "../../utils/customerSession";

const BASE_URL = "http://localhost:3000";

const BOOKING_STORAGE_KEY = "labBookingDetails";
const PACKAGE_PEOPLE_STORAGE_KEY = "cartPackagePeople";
const HOME_COLLECTION_STORAGE_KEY = "cartHomeCollectionSelected";
const ABANDONED_CARTS_STORAGE_KEY = "abandonedCartRecords";
const ABANDONED_CART_VISITOR_KEY = "abandonedCartVisitorId";

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

const normalizeSavedAddresses = (savedAddresses) =>
  (Array.isArray(savedAddresses) ? savedAddresses : [])
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          label: entry,
          address: entry,
          city: "",
          state: "",
          landmark: "",
        };
      }

      if (!entry || typeof entry !== "object") return null;

      const address =
        entry.address ||
        entry.fullAddress ||
        entry.location ||
        entry.streetAddress ||
        entry.line1 ||
        "";

      return {
        label:
          entry.type ||
          entry.title ||
          entry.name ||
          (address ? `${address}${entry.city ? `, ${entry.city}` : ""}` : "Saved Address"),
        address,
        city: entry.city || "",
        state: entry.state || "",
        landmark: entry.landmark || entry.area || "",
      };
    })
    .filter((entry) => entry?.address);

/* ── Confetti ── */
const Confetti = () => {
  const colors = ["#06b6d4","#10b981","#f59e0b","#8b5cf6","#f472b6","#3b82f6","#34d399","#a78bfa"];
  return (
    <div className="cart-confetti">
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} style={{
          left:`${8+(i*37)%84}%`,
          width:6+(i%5)*3, height:6+(i%5)*3,
          background:colors[i%colors.length],
          borderRadius:i%3===0?"50%":i%3===1?"2px":"0%",
          animationDelay:`${(i*0.12).toFixed(2)}s`,
        }} className="cart-confetti-piece" />
      ))}
    </div>
  );
};

/* ── Coupon Popup ── */
const CouponPopup = ({ coupon, savedAmount, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="cart-coupon-popup" onClick={onClose}>
      <div className="cart-coupon-popup-card"
        onClick={e=>e.stopPropagation()}>
        <Confetti/>
        <div className="relative px-8 py-10">
          <div className="cart-coupon-popup-icon text-6xl mb-3">🎉</div>
          <div className="inline-block px-4 py-1 rounded-full mb-3 text-xs font-bold tracking-widest uppercase"
            className="cart-coupon-code">
            {coupon.code}
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-1">You Saved</h2>
          <p className="text-5xl font-black mb-1"
            className="cart-coupon-gradient-text">
            Rs. {savedAmount}
          </p>
          <p className="text-emerald-700 text-sm mt-3 mb-6 font-medium">
            Coupon applied successfully! 🙌<br/>
            <span className="text-emerald-500 text-xs">Tap anywhere to continue</span>
          </p>
          <button
            onClick={onClose}
            className="cart-coupon-primary-btn w-full py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95"
          >
            Awesome, Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, decreaseQty, increaseQty, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [isOrdering, setIsOrdering]     = useState(false);
  const [loginOpen, setLoginOpen]       = useState(false);
  const [step, setStep]                 = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [couponCode, setCouponCode]     = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCartDetails, setShowCartDetails] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [couponPopup, setCouponPopup]   = useState(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [homeCollectionSelected, setHomeCollectionSelected] = useState(
    readHomeCollectionSelected
  );
  const lastCustomerIdentityRef = useRef(null);

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
        if (previousIdentity !== currentIdentity) {
          const userId = parsedUser._id || parsedUser.id;
          axios.get(`${BASE_URL}/v1/api/get-saved-addresses/${userId}`)
            .then(res => setSavedAddresses(normalizeSavedAddresses(res.data.savedAddresses || [])))
            .catch(() => setSavedAddresses([]));
          axios.get(`${BASE_URL}/v1/api/all`)
            .then(res => setAvailableCoupons((res.data.coupons || []).filter(c => c.active)))
            .catch(() => setAvailableCoupons([]));
          const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
          setOrderDetails(saved ? { ...EMPTY_ORDER_DETAILS, ...JSON.parse(saved) } : EMPTY_ORDER_DETAILS);
        }
      } else {
        setIsLoggedIn(false);
        if (previousIdentity) {
          setSavedAddresses([]);
          setOrderDetails(EMPTY_ORDER_DETAILS);
        }
      }

      lastCustomerIdentityRef.current = currentIdentity;
    };
    syncAuth();
    window.addEventListener("customer-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("customer-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
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

  const subtotal = cartItems.reduce((t, i) => t + i.price * i.qty, 0);
  const homeCollectionCharge =
    homeCollectionSelected && cartItems.length > 0 ? 150 : 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.discountValue
    : 0;
  const totalToPay = subtotal + homeCollectionCharge - discountAmount;

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
    const fullAddress = [
      orderDetails.address,
      orderDetails.landmark,
      orderDetails.city,
      orderDetails.state,
    ]
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
  }, [appliedCoupon, cartItems, discountAmount, orderDetails, totalToPay]);

  const handleApplyCoupon = (code) => {
    const target = code || couponCode;
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === target.toUpperCase().trim());
    if (!coupon) return toast.error("Invalid coupon code.");
    if (subtotal < coupon.minAmount) return toast.warn(`Min. amount needed: Rs. ${coupon.minAmount}`);
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    const saved = coupon.discountType === "percentage"
      ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
      : coupon.discountValue;
    setCouponPopup({ coupon, savedAmount: saved });
    setCouponModalOpen(false);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setOrderDetails(p => ({ ...p, [name]: value }));
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
      return (
        (people.patients || []).length === 0 &&
        (people.members || []).length === 0
      );
    });
    const { slotDate, slotTime } = orderDetails;

    if (hasMissingPerson) {
      toast.error("Please add patient details for every cart item first.", { position:"top-center" });
      return false;
    }
    if (!slotDate || !slotTime) {
      toast.error("Please select collection date and time.", { position:"top-center" });
      return false;
    }
    if (cartItems.length === 0) { toast.warn("Your cart is empty!"); return false; }
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
      if (!userStr) { promptLoginForBooking(); return; }
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
      ].filter(Boolean).join(", ");
      const orderPayload = {
        userId: user._id || user.id, phone: user.mobileNo || user.phone || "", email: user.email || "",
        items: cartItems.map(i => {
          const itemKey = i.cartEntryId || i._id || i.id;
          return {
            productId:i._id||i.id,
            cartEntryId:i.cartEntryId||"",
            name:i.name,
            price:i.price,
            quantity:i.qty,
            category:i.category||"",
            people: packagePeople[itemKey] || { patients: [], members: [] },
          };
        }),
        patientName: primaryPerson.name || [primaryPerson.firstName, primaryPerson.lastName].filter(Boolean).join(" "),
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
        slotDate:orderDetails.slotDate, slotTime:orderDetails.slotTime,
        subtotal, amount:subtotal, status:"Pending",
        paymentMethod:orderDetails.paymentMethod, paymentStatus:"Unpaid",
        discount:discountAmount, totalAmount:totalToPay, appliedCoupon:appliedCoupon?.code||"",
      };
      const res = await axios.post(`${BASE_URL}/v1/api/create-order`, orderPayload);
      localStorage.removeItem(BOOKING_STORAGE_KEY);
      const nextRecords = readAbandonedCarts().filter(
        (record) => record.recordKey !== buildAbandonedCartKey()
      );
      writeAbandonedCarts(nextRecords);
      localStorage.removeItem(PACKAGE_PEOPLE_STORAGE_KEY);
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${res.data.order._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const timeSlots = ["07:00 AM - 09:00 AM","09:00 AM - 11:00 AM","11:00 AM - 01:00 PM"];

  const checkoutPanelCls = "cart-checkout-panel";
  const packagePeopleForCheckout = readPackagePeople();
  const savedPeopleByCartItem = cartItems.map((item) => {
    const itemKey = item.cartEntryId || item._id || item.id;
    const people = packagePeopleForCheckout[itemKey] || {};
    return {
      item,
      people: [...(people.patients || []), ...(people.members || [])],
    };
  });

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      {couponPopup && (
        <CouponPopup coupon={couponPopup.coupon} savedAmount={couponPopup.savedAmount} onClose={() => setCouponPopup(null)} />
      )}

      {couponModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/60 px-4 pt-24"
          onClick={() => setCouponModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-sm bg-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-16 items-center justify-between border-b border-gray-200 px-6">
              <h2 className="text-lg font-medium uppercase text-[#0d155d]">Apply Coupons</h2>
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="text-4xl leading-none text-gray-300 hover:text-gray-500"
                aria-label="Close coupons"
              >
                ×
              </button>
            </div>

            <div className="border-b border-gray-200 px-6 py-7">
              <div className="flex h-12 overflow-hidden rounded-sm border border-gray-300 bg-white">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 px-4 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-5 text-xs font-extrabold uppercase text-[#155a9d]"
                >
                  Check
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto px-6 py-4">
              {availableCoupons.length === 0 ? (
                <p className="text-center text-base text-[#7478a6]">No other coupons available</p>
              ) : (
                <div className="space-y-3">
                  {availableCoupons.map((coupon) => (
                    <button
                      key={coupon._id || coupon.code}
                      type="button"
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="w-full rounded-md border border-[#d7eeee] bg-[#f9ffff] px-4 py-3 text-left hover:border-[#08aaa6]"
                    >
                      <span className="block text-sm font-extrabold uppercase text-[#008a86]">{coupon.code}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `Rs ${coupon.discountValue}`} off
                        {coupon.minAmount ? ` on minimum Rs ${coupon.minAmount}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white py-7">
        <div className="mx-auto w-[min(1080px,calc(100%-32px))]">
          <div className="mb-5 flex items-center justify-between border-b border-gray-300 pb-2">
            <h1 className="text-[22px] font-extrabold uppercase leading-none text-[#3a3a3a]">Add Tests In Your Cart</h1>
            <Link href="/lab-tests" className="rounded-md bg-[#008a86] px-5 py-2 text-xs font-extrabold uppercase text-white">
              Add Test
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-md border border-gray-200 bg-white p-14 text-center shadow-sm">
              <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
              <p className="mt-2 text-sm text-gray-500">Add a test or package to continue booking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section className="space-y-4">
                <div className={`cart-summary-box ${showCartDetails ? "is-open" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setShowCartDetails((value) => !value)}
                    className="cart-summary-toggle"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#12bbb6] text-xs font-bold text-white">1</span>
                    <span className="cart-summary-heading">Cart Summary</span>
                  </button>
                  {showCartDetails && (
                    <div className="border-t border-gray-100 px-4 py-3">
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.cartEntryId} className="flex items-center justify-between gap-4 rounded-md bg-[#f8ffff] px-3 py-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-extrabold text-[#0d155d]">{item.name}</h3>
                              <p className="text-xs text-gray-500">Includes {item.testCount || 1} Tests</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <div className="flex h-8 items-center overflow-hidden rounded border border-[#b9dede] text-[#008a86]">
                                <button type="button" onClick={() => decreaseQty(item.cartEntryId)} className="h-8 w-8 text-base font-bold">-</button>
                                <span className="w-7 text-center text-xs font-bold">{item.qty}</span>
                                <button type="button" onClick={() => increaseQty(item.cartEntryId)} className="h-8 w-8 text-base font-bold">+</button>
                              </div>
                              <strong className="w-20 text-right text-sm text-[#008a86]">Rs. {item.price * item.qty}</strong>
                              <button
                                type="button"
                                onClick={() => removeItem(item.cartEntryId)}
                                className="flex h-8 w-8 items-center justify-center rounded text-red-500 hover:bg-red-50"
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
                    <span className="cart-schedule-step">2</span>
                    <span className="cart-schedule-title">Choose Home Sample Collection Address, Date & Time</span>
                  </button>

                  {showSchedule && (
                    <div className="cart-schedule-body">
                      <div className="cart-patient-list">
                          {savedPeopleByCartItem.map(({ item, people }) => (
                            <div key={item.cartEntryId || item._id || item.id} className="cart-patient-card">
                              <div className="cart-patient-card-head">
                                {item.name}
                              </div>
                              <div className="cart-patient-card-body">
                                {people.length === 0 ? (
                                  <p className="cart-patient-empty">No patient added for this package.</p>
                                ) : (
                                  people.map((person, index) => {
                                    const fullName =
                                      person.name || [person.firstName, person.lastName].filter(Boolean).join(" ");
                                    const fullAddress = [
                                      person.address,
                                      person.area,
                                      person.city,
                                      person.state,
                                      person.pincode,
                                    ].filter(Boolean).join(", ");

                                    return (
                                      <div key={`${fullName}-${index}`} className="cart-patient-person">
                                        <span className="cart-patient-check" aria-hidden="true" />
                                        <div className="cart-patient-copy">
                                          <strong>{person.prefix} {fullName}</strong>
                                          {person.gender && <span>{person.gender}</span>}
                                          {person.relation && <span>{person.relation}</span>}
                                          {person.mobileNumber && <span>{person.mobileNumber}</span>}
                                          {person.dateOfBirth && <span>{person.dateOfBirth}</span>}
                                          {fullAddress && <p>{fullAddress}</p>}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="cart-slot-section">
                        <p className="cart-slot-label">Choose Date & Preferred Time Slot *</p>
                        <div className="cart-slot-row">
                          <input type="date" name="slotDate" min={today} value={orderDetails.slotDate} onChange={handleInputChange} className="cart-slot-input" />
                          <div className="relative">
                            <button type="button" onClick={() => setShowTimeSlots((value) => !value)} className="cart-slot-input cart-slot-select">
                              <span className={orderDetails.slotTime ? "text-gray-800" : "text-gray-400"}>{orderDetails.slotTime || "Select Time"}</span>
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
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#12bbb6] text-xs font-bold text-white">{step === 2 ? "3" : "3"}</span>
                    Payment Option
                  </button>

                  {step === 2 && (
                    <div className="border-t border-gray-100 px-5 py-5">
                      <div className="grid gap-3 sm:grid-cols-2">
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
                              className={`rounded-md border px-4 py-3 text-left ${selected ? "border-[#008a86] bg-[#efffff]" : "border-gray-200 bg-white"}`}
                            >
                              <span className="block text-sm font-bold text-gray-800">{title}</span>
                              <span className="text-xs text-gray-500">{desc}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button type="button" onClick={() => setStep(1)} className="rounded-md bg-gray-100 px-5 py-2 text-xs font-bold text-gray-600">
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isLoggedIn) return promptLoginForBooking();
                            handleFinalOrder();
                          }}
                          disabled={isOrdering}
                          className="rounded-md bg-gradient-to-b from-[#5cc7c3] to-[#128f8b] px-8 py-2 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {isOrdering ? "Placing Order..." : "Place Order"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-5">
                <div className={`${checkoutPanelCls} p-3`}>
                  <div className="mb-4 flex min-h-16 items-center gap-3 rounded-md bg-[#efffff] px-4 shadow">
                    <button
                      type="button"
                      onClick={() => setCouponModalOpen(true)}
                      className="h-7 min-w-0 flex-1 rounded bg-[#008a86] px-3 text-left text-[9px] font-bold uppercase text-white"
                    >
                      {appliedCoupon?.code || "Enter Coupon Code"}
                    </button>
                    <button type="button" onClick={() => setCouponModalOpen(true)} className="text-[10px] font-extrabold text-[#008a86]">
                      APPLY CODE
                    </button>
                  </div>

                  <div className="space-y-2 px-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal</span>
                      <strong className="text-[#00a9a5]">Rs {subtotal}</strong>
                    </div>
                    {homeCollectionSelected && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Home Collection Charges</span>
                        <strong className="text-[#00a9a5]">Rs {homeCollectionCharge}</strong>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Discount</span>
                        <strong className="text-red-500">- Rs {discountAmount}</strong>
                      </div>
                    )}
                    {homeCollectionSelected && (
                      <p className="text-[10px] text-gray-400">Add Test(s) worth 99 to get free Home Collection</p>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-bold text-[#008a86]">To Pay</span>
                      <strong className="text-[#00a9a5]">Rs {totalToPay}</strong>
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
                      className="mt-2 h-9 w-full rounded-md bg-gradient-to-b from-[#5cc7c3] to-[#128f8b] text-xs font-bold text-white disabled:opacity-60"
                    >
                      {isOrdering ? "Placing Order..." : "Pay Now"}
                    </button>
                    <p className="pt-1 text-[10px] text-gray-400">inclusive of all the taxes, fees and subject to availability</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-gray-200 to-white p-5 shadow">
                  <img src="/images/homepage-doctor-crop.png" alt="" className="absolute bottom-0 left-2 h-28 object-contain" aria-hidden="true" />
                  <div className="ml-28 min-h-28">
                    <h3 className="text-right text-xl font-extrabold uppercase leading-none text-[#08aaa6]">Full Body Checkup</h3>
                    <ul className="mt-2 text-[10px] leading-4 text-[#008a86]">
                      <li>Blood Sugar</li>
                      <li>Cholesterol Panel</li>
                      <li>Liver Function</li>
                      <li>Kidney Function</li>
                      <li>Thyroid Profile</li>
                    </ul>
                    <Link href="/lab-tests" className="mt-2 inline-flex rounded-full bg-[#08aaa6] px-4 py-1 text-[10px] font-bold text-white">
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

  const getAccent = item => {
    const cat = (item.category || "").toLowerCase();
    if (cat.includes("sugar")||cat.includes("diabetes"))
      return { pill:"bg-rose-100 text-rose-600 border border-rose-200", icon:"🩸", priceCls:"text-rose-500", cardBorder:"border-rose-100", headerBg:"bg-rose-50" };
    if (cat.includes("immun"))
      return { pill:"bg-emerald-100 text-emerald-700 border border-emerald-200", icon:"🛡️", priceCls:"text-emerald-600", cardBorder:"border-emerald-100", headerBg:"bg-emerald-50" };
    if (cat.includes("liver")||cat.includes("hepat"))
      return { pill:"bg-amber-100 text-amber-700 border border-amber-200", icon:"🧪", priceCls:"text-amber-600", cardBorder:"border-amber-100", headerBg:"bg-amber-50" };
    return { pill:"bg-cyan-100 text-cyan-700 border border-cyan-200", icon:"💉", priceCls:"text-cyan-600", cardBorder:"border-cyan-100", headerBg:"bg-cyan-50" };
  };

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all";

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      {couponPopup && (
        <CouponPopup coupon={couponPopup.coupon} savedAmount={couponPopup.savedAmount} onClose={() => setCouponPopup(null)} />
      )}

      {/* ── Page ── */}
      <div className="min-h-screen py-10" style={{background:"linear-gradient(160deg, #f0f9ff 0%, #ecfdf5 40%, #faf5ff 100%)"}}>

        <div className="max-w-4xl mx-auto px-4">

          {/* Step bar */}
          <div className="flex items-center mb-8">
            {["Cart & Booking","Payment Method"].map((label,i) => {
              const active=step===i+1, done=step>i+1;
              return (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300"
                      style={active ? {
                        background:"#ecfdf5", borderColor:"#10b981", color:"#065f46",
                        boxShadow:"0 0 0 4px rgba(16,185,129,0.15)",
                      } : done ? {
                        background:"#d1fae5", borderColor:"#34d399", color:"#065f46",
                      } : {
                        background:"#f9fafb", borderColor:"#e5e7eb", color:"#9ca3af",
                      }}>
                      {done ? "✓" : i+1}
                    </div>
                    <span className="font-semibold text-sm"
                      style={{color:active?"#065f46":done?"#059669":"#9ca3af"}}>
                      {label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div className="flex-1 mx-4 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full transition-all duration-700 rounded-full"
                        style={{width:step>1?"100%":"0%", background:"linear-gradient(to right, #10b981, #06b6d4)"}}/>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <>
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-gray-400">Your cart is empty</h3>
                </div>
              ) : (
                <>
                  {/* ── Cart Details Accordion ── */}
                  <div className="rounded-2xl overflow-hidden mb-4" style={{boxShadow:"0 4px 20px rgba(6,182,212,0.12)"}}>
                    <button
                      onClick={() => setShowCartDetails(p => !p)}
                      className="w-full flex items-center justify-between px-6 py-4 font-bold text-sm transition-all duration-300"
                      style={{
                        background: showCartDetails
                          ? "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)"
                          : "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                        color:"white",
                      }}>
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        Cart Details
                      </span>
                      <div className="flex items-center gap-2">
                        {showCartDetails
                          ? <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Click to close</span>
                          : <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Tap to view items</span>
                        }
                        <svg className={`w-5 h-5 transition-transform duration-300 ${showCartDetails ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ${showCartDetails ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="bg-white px-5 py-5 space-y-4 border border-t-0 border-gray-100 rounded-b-2xl">
                        {cartItems.map(item => {
                          const acc = getAccent(item);
                          return (
                            <div key={item.cartEntryId}
                              className={`bg-white rounded-2xl border ${acc.cardBorder} shadow-sm hover:-translate-y-0.5 transition-all duration-200`}
                              style={{boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                              <div className={`${acc.headerBg} rounded-t-2xl px-5 pt-4 pb-3 flex justify-between items-start`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                                    {acc.icon}
                                  </div>
                                  <div>
                                    <h3 className="text-base font-bold text-gray-800">{item.name}</h3>
                                    {item.category && (
                                      <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${acc.pill}`}>{item.category}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    removeItem(item.cartEntryId);
                                  }}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm border border-rose-100">
                                  <AiFillDelete size={15}/>
                                </button>
                              </div>
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className={`text-xl font-bold ${acc.priceCls}`}>Rs. {item.price}</span>
                                  <p className="text-xs text-gray-400 mt-0.5">⏱ Report within 24hrs</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        decreaseQty(item.cartEntryId);
                                      }}
                                      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold text-lg transition-colors">−</button>
                                    <span className="w-8 text-center font-bold text-sm text-gray-700">{item.qty}</span>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        increaseQty(item.cartEntryId);
                                      }}
                                      className="w-9 h-9 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 font-bold text-lg transition-colors">+</button>
                                  </div>
                                </div>
                                <span className="text-sm text-gray-400">
                                  Total: <span className="font-bold text-gray-600">Rs. {item.price * item.qty}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── Schedule Accordion ── */}
                  <div className="rounded-2xl overflow-hidden" style={{boxShadow:"0 4px 20px rgba(6,182,212,0.12)"}}>
                    {/* Toggle */}
                    <button
                      onClick={() => setShowSchedule(p => !p)}
                      className="w-full flex items-center justify-between px-6 py-4 font-bold text-sm transition-all duration-300"
                      style={{
                        background: showSchedule
                          ? "linear-gradient(135deg, #0891b2 0%, #0d9488 100%)"
                          : "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                        color:"white",
                      }}>
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Schedule Your Home Collection
                      </span>
                      <div className="flex items-center gap-2">
                        {showSchedule
                          ? <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Click to close</span>
                          : <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Next</span>
                        }
                        <svg className={`w-5 h-5 transition-transform duration-300 ${showSchedule ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </button>

                    {/* Expandable Panel */}
                    <div className={`overflow-hidden transition-all duration-500 ${showSchedule ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="bg-white px-6 pb-6 pt-5 space-y-7 border border-t-0 border-gray-100 rounded-b-2xl">

                        {/* §1 Booking Details */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Booking Details</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-cyan-200 to-transparent"/>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">👤 Patient Name</label>
                              <input type="text" name="patientName" value={orderDetails.patientName}
                                onChange={handleInputChange} placeholder="Full Name" className={inputCls}/>
                            </div>

                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide pt-2 border-l-4 border-cyan-500 pl-2">
                              📍 Enter Your Address
                            </h4>

                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">🏠 Address</label>
                              <div className="relative">
                                <textarea name="address" value={orderDetails.address} onChange={handleInputChange}
                                  onFocus={() => setShowAddressDropdown(true)}
                                  onBlur={() => setTimeout(() => setShowAddressDropdown(false), 200)}
                                  placeholder="House No, Street, Landmark" rows="2"
                                  className={`${inputCls} resize-none`}/>
                                {showAddressDropdown && savedAddresses.length > 0 && (
                                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    <p className="text-xs font-bold text-cyan-600 uppercase px-3 pt-2.5 pb-1 tracking-wide border-b border-gray-100">📍 Saved Addresses</p>
                                    {savedAddresses.map((addr,idx) => (
                                      <div key={idx}
                                        onMouseDown={() => {
                                          setOrderDetails((previous) => ({
                                            ...previous,
                                            address: addr.address || previous.address,
                                            city: addr.city || previous.city,
                                            state: addr.state || previous.state,
                                            landmark: addr.landmark || previous.landmark,
                                          }));
                                          setShowAddressDropdown(false);
                                        }}
                                        className="flex items-start gap-2 px-3 py-2 hover:bg-cyan-50 cursor-pointer text-sm text-gray-600 transition-colors">
                                        <span className="text-cyan-500 mt-0.5">◉</span>
                                        <div>
                                          <p className="font-semibold text-gray-700">{addr.label}</p>
                                          <p>{addr.address}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">🏢 Landmark</label>
                                <input type="text" name="landmark" value={orderDetails.landmark}
                                  onChange={handleInputChange} placeholder="E.g. Near Metro Station" className={inputCls}/>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">🏙 City</label>
                                <input type="text" name="city" value={orderDetails.city}
                                  onChange={handleInputChange} placeholder="Enter City" className={inputCls}/>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">🗺 State</label>
                                <input type="text" name="state" value={orderDetails.state}
                                  onChange={handleInputChange} placeholder="Enter State" className={inputCls}/>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">📅 Date</label>
                                <input type="date" name="slotDate" min={today} value={orderDetails.slotDate}
                                  onChange={handleInputChange} className={inputCls}/>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">🕐 Time Slot</label>
                                <button
                                  type="button"
                                  onClick={() => setShowTimeSlots(!showTimeSlots)}
                                  className={`${inputCls} flex items-center justify-between`}>
                                  <span className={orderDetails.slotTime ? "text-gray-800" : "text-gray-400"}>
                                    {orderDetails.slotTime || "Select Time Slot"}
                                  </span>
                                  <svg className={`w-4 h-4 transition-transform ${showTimeSlots ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {showTimeSlots && (
                                  <div className="flex flex-col gap-2 mt-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                    {timeSlots.map(slot => {
                                      const sel = orderDetails.slotTime === slot;
                                      return (
                                        <button key={slot} type="button"
                                          onClick={() => { setOrderDetails(p=>({...p,slotTime:slot})); setShowTimeSlots(false); }}
                                          className="py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all hover:bg-white"
                                          style={sel ? {
                                            background:"linear-gradient(135deg, #ecfdf5, #f0f9ff)",
                                            border:"1.5px solid #34d399",
                                            color:"#065f46",
                                          } : {
                                            border:"1px solid #e5e7eb",
                                            color:"#6b7280",
                                          }}>
                                          {sel ? "✓ " : ""}{slot}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"/>

                        {/* §2 Coupon */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Coupon & Offers</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-violet-200 to-transparent"/>
                          </div>

                          <div className="flex gap-2.5">
                            <input type="text" value={couponCode} onChange={e=>setCouponCode(e.target.value)}
                              placeholder="Enter coupon code" className={`${inputCls} flex-1`}/>
                            <button onClick={() => handleApplyCoupon()}
                              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap"
                              style={{background:"linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow:"0 4px 14px rgba(124,58,237,0.3)"}}>
                              Apply
                            </button>
                          </div>

                          {availableCoupons.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🏷 Available Offers</p>
                              <div className="flex flex-wrap gap-2">
                                {availableCoupons.map(c => (
                                  <button key={c._id} onClick={() => handleApplyCoupon(c.code)}
                                    className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                                    style={appliedCoupon?.code === c.code ? {
                                      background:"linear-gradient(135deg, #7c3aed, #6366f1)",
                                      color:"white", border:"none",
                                    } : {
                                      background:"#f5f3ff", border:"1px solid #ddd6fe", color:"#7c3aed",
                                    }}>
                                    {c.code} · {c.discountType==="percentage" ? `${c.discountValue}%` : `Rs. ${c.discountValue}`} OFF
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {appliedCoupon && (
                            <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 bg-emerald-50 border border-emerald-200">
                              <span className="text-emerald-500 font-bold text-lg">✓</span>
                              <p className="text-sm font-semibold text-emerald-700">
                                {appliedCoupon.code} applied! You saved Rs. {discountAmount}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"/>

                        {/* §3 Summary */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">3</div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Booking Summary</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"/>
                          </div>

                          {/* Items list */}
                          <div className="rounded-xl overflow-hidden border border-gray-100">
                            <div className="bg-gray-50 px-4 py-3 space-y-2.5">
                              {cartItems.map(item => {
                                const acc = getAccent(item);
                                return (
                                  <div key={item.cartEntryId} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                      <span>{acc.icon}</span>
                                      <span className="text-gray-600">{item.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${acc.pill}`}>×{item.qty}</span>
                                    </div>
                                    <span className="font-bold text-gray-700">Rs. {item.price * item.qty}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="bg-white px-4 py-3 space-y-2 border-t border-gray-100">
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span><span className="font-semibold text-gray-700">Rs. {subtotal}</span>
                              </div>
                              {homeCollectionSelected && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Home Collection</span>
                                  <span className="font-bold text-emerald-600">Rs. {homeCollectionCharge}</span>
                                </div>
                              )}
                              {discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Discount</span>
                                  <span className="font-semibold text-rose-500">– Rs. {discountAmount}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                                <span className="text-gray-800">Total to Pay</span>
                                <span style={{background:"linear-gradient(135deg, #0891b2, #059669)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
                                  Rs. {totalToPay}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Detail preview */}
                          {(orderDetails.patientName || orderDetails.slotDate) && (
                            <div className="mt-3 rounded-xl p-3.5 space-y-1 text-xs bg-cyan-50 border border-cyan-100">
                              {orderDetails.patientName && <p className="flex gap-2 text-cyan-800"><span>👤</span><span className="text-gray-400">Patient:</span>{orderDetails.patientName}</p>}
                              {orderDetails.address    && <p className="flex gap-2 text-cyan-800"><span>📍</span><span className="text-gray-400">Address:</span>{orderDetails.address}</p>}
                              {orderDetails.landmark   && <p className="flex gap-2 text-cyan-800"><span>🏢</span><span className="text-gray-400">Landmark:</span>{orderDetails.landmark}</p>}
                              {orderDetails.city       && <p className="flex gap-2 text-cyan-800"><span>🏙</span><span className="text-gray-400">City:</span>{orderDetails.city}</p>}
                              {orderDetails.state      && <p className="flex gap-2 text-cyan-800"><span>🗺</span><span className="text-gray-400">State:</span>{orderDetails.state}</p>}
                              {orderDetails.slotDate   && <p className="flex gap-2 text-cyan-800"><span>📅</span><span className="text-gray-400">Date:</span>{orderDetails.slotDate}</p>}
                              {orderDetails.slotTime   && <p className="flex gap-2 text-cyan-800"><span>🕐</span><span className="text-gray-400">Slot:</span>{orderDetails.slotTime}</p>}
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              return promptLoginForBooking();
                            }
                            handleProceedToPayment();
                          }}
                          className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-95 group flex items-center justify-center gap-2"
                          style={{
                            background:"linear-gradient(135deg, #0891b2 0%, #059669 100%)",
                            boxShadow:"0 8px 28px rgba(8,145,178,0.35)",
                          }}>
                          {!isLoggedIn
                            ? "🔐 Login to Continue"
                            : <><span>Proceed to Payment</span><span className="group-hover:translate-x-1 transition-transform inline-block">→</span></>
                          }
                        </button>

                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
              style={{boxShadow:"0 8px 40px rgba(6,182,212,0.1)"}}>
              {/* Header */}
              <div className="px-8 py-6"
                style={{background:"linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)", borderBottom:"1px solid #e5e7eb"}}>
                <h3 className="text-xl font-bold text-gray-800">Payment Method</h3>
                <p className="text-gray-400 text-xs mt-0.5">Encrypted & secure 🔒</p>
              </div>

              <div className="p-8">
                {/* Pay options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { key:"COD",    icon:"💵", title:"Cash on Delivery", desc:"Pay after sample collection",
                      selBg:"linear-gradient(135deg, #fffbeb, #fef9c3)", selBorder:"#f59e0b", selText:"#92400e" },
                    { key:"Online", icon:"💳", title:"Online Payment",   desc:"UPI / Card / Net Banking",
                      selBg:"linear-gradient(135deg, #f0f9ff, #ecfdf5)", selBorder:"#06b6d4", selText:"#164e63" },
                  ].map(opt => {
                    const sel = orderDetails.paymentMethod === opt.key;
                    return (
                      <div key={opt.key}
                        onClick={() => setOrderDetails(p=>({...p,paymentMethod:opt.key}))}
                        className="p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2"
                        style={sel ? {
                          background:opt.selBg,
                          borderColor:opt.selBorder,
                          boxShadow:`0 4px 16px rgba(0,0,0,0.06)`,
                        } : {
                          background:"#fafafa",
                          borderColor:"#e5e7eb",
                        }}>
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                            {opt.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm" style={{color:sel?opt.selText:"#374151"}}>{opt.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                            style={{borderColor:sel?opt.selBorder:"#d1d5db"}}>
                            {sel && <div className="w-2.5 h-2.5 rounded-full" style={{background:opt.selBorder}}/>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 mb-6">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Summary</p>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {cartItems.map(item => (
                      <div key={item.cartEntryId} className="flex justify-between text-sm">
                        <span className="text-gray-500">{item.name} × {item.qty}</span>
                        <span className="font-semibold text-gray-700">Rs. {item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gray-100"/>
                    {homeCollectionSelected && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Home Collection</span>
                        <span className="font-bold text-emerald-600">Rs. {homeCollectionCharge}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-semibold text-rose-500">– Rs. {discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                      <span className="text-gray-800">Total to Pay</span>
                      <span style={{background:"linear-gradient(135deg, #0891b2, #059669)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
                        Rs. {totalToPay}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-2xl font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm">
                    ← Back
                  </button>
                  <button
                    onClick={() => { if (!isLoggedIn) return promptLoginForBooking(); handleFinalOrder(); }}
                    disabled={isOrdering}
                    className="flex-[2] py-3 rounded-2xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    style={{background:"linear-gradient(135deg, #0891b2, #059669)", boxShadow:"0 6px 20px rgba(8,145,178,0.3)"}}>
                    {isOrdering
                      ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Placing Order...</>
                      : "Place Order ✓"
                    }
                  </button>
                </div>

                <p className="text-center text-xs text-gray-300 mt-4">🔐 256-bit SSL encrypted</p>
              </div>
            </div>
          )}

        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <Footer />
    </>
  );
};

export default CartPage;
