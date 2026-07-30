"use client";

import { useEffect, useState } from "react";
import { getCustomerDemographics } from "../../utils/productVisibility";

/** Live customer age/gender from localStorage — updates on login/profile change */
export default function useCustomerDemographics() {
  const [demographics, setDemographics] = useState({ age: null, gender: null });

  useEffect(() => {
    const sync = () => setDemographics(getCustomerDemographics());
    sync();
    window.addEventListener("customer-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("customer-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return demographics;
}
