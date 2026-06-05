"use client";

import React, { useEffect, useState } from "react";
import CartNotificationPopup from "./CartNotificationPopup";

const getCustomerId = () => {
  if (typeof window === "undefined") return null;

  try {
    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    return user?._id || user?.id || null;
  } catch (error) {
    console.error("Failed to read customer user for notifications", error);
    return null;
  }
};

const CartNotificationHost = () => {
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const syncCustomer = () => setCustomerId(getCustomerId());

    syncCustomer();
    window.addEventListener("customer-auth-changed", syncCustomer);
    window.addEventListener("storage", syncCustomer);

    return () => {
      window.removeEventListener("customer-auth-changed", syncCustomer);
      window.removeEventListener("storage", syncCustomer);
    };
  }, []);

  return <CartNotificationPopup currentUserId={customerId} />;
};

export default CartNotificationHost;
