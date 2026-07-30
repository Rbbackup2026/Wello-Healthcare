"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CartNotificationPopup from "./CartNotificationPopup";
import { isAdminAppRoute } from "../../utils/routeScope";

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
  const pathname = usePathname();
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

  if (isAdminAppRoute(pathname)) {
    return null;
  }

  return <CartNotificationPopup currentUserId={customerId} />;
};

export default CartNotificationHost;
