"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

const EMPTY_BOOKING_DETAILS = {
  patientName: "",
  address: "",
  slotDate: "",
  slotTime: "",
  paymentMethod: "COD",
};

const readCartItems = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Failed to read cart items", error);
    return [];
  }
};

const readBookingDetails = () => {
  if (typeof window === "undefined") {
    return EMPTY_BOOKING_DETAILS;
  }

  try {
    const savedDetails = localStorage.getItem("bookingDetails");
    return savedDetails ? JSON.parse(savedDetails) : EMPTY_BOOKING_DETAILS;
  } catch (error) {
    console.error("Failed to read booking details", error);
    return EMPTY_BOOKING_DETAILS;
  }
};

const persistCartItems = (items) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cartItems", JSON.stringify(items));
};

const persistBookingDetails = (details) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("bookingDetails", JSON.stringify(details));
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(EMPTY_BOOKING_DETAILS);
  const [hasLoadedStoredCart, setHasLoadedStoredCart] = useState(false);

  useEffect(() => {
    const items = readCartItems();
    setCartItems(
      items.map((item) =>
        item.cartEntryId
          ? item
          : {
              ...item,
              cartEntryId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
              qty: item.qty || 1,
            }
      )
    );
    setBookingDetails(readBookingDetails());
    setHasLoadedStoredCart(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredCart) return;
    persistCartItems(cartItems);
  }, [cartItems, hasLoadedStoredCart]);

  useEffect(() => {
    if (!hasLoadedStoredCart) return;
    persistBookingDetails(bookingDetails);
  }, [bookingDetails, hasLoadedStoredCart]);

  useEffect(() => {
    const syncCustomerSession = () => {
      const items = readCartItems();
      setCartItems(
        items.map((item) =>
          item.cartEntryId
            ? item
            : {
                ...item,
                cartEntryId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                qty: item.qty || 1,
              }
        )
      );
      setBookingDetails(readBookingDetails());
    };

    window.addEventListener("customer-auth-changed", syncCustomerSession);
    window.addEventListener("storage", syncCustomerSession);

    return () => {
      window.removeEventListener("customer-auth-changed", syncCustomerSession);
      window.removeEventListener("storage", syncCustomerSession);
    };
  }, []);

  const createCartEntryId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const addToCart = (item) => {
    setCartItems((prev) => {
      const next = [...prev, { ...item, cartEntryId: createCartEntryId(), qty: 1 }];
      persistCartItems(next);
      return next;
    });
  };

  const increaseQty = (cartEntryId) => {
    setCartItems((prev) => {
      const next = prev.map((item) =>
        item.cartEntryId === cartEntryId ? { ...item, qty: item.qty + 1 } : item
      );
      persistCartItems(next);
      return next;
    });
  };

  const decreaseQty = (cartEntryId) => {
    setCartItems((prev) => {
      const next = prev
        .map((item) =>
          item.cartEntryId === cartEntryId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);
      persistCartItems(next);
      return next;
    });
  };

  const removeItem = (cartEntryId) => {
    setCartItems((prev) => {
      const next = prev.filter(
        (item) =>
          item.cartEntryId !== cartEntryId &&
          item.id !== cartEntryId &&
          item._id !== cartEntryId
      );
      persistCartItems(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartItems");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        bookingDetails,
        setBookingDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
