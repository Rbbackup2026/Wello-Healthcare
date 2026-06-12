"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaUser } from "react-icons/fa";
import { useNavigate } from "../../../lib/routerCompat";
import {
  clearCustomerCheckoutState,
  dispatchCustomerAuthChanged,
  getCustomerIdentity,
} from "../../../utils/customerSession";

const MENU_ITEMS = [
  { label: "My Account", action: "account", href: "/my-account" },
  { label: "My Bookings", action: "bookings", href: "/my-orders" },
  { label: "My Report", action: "report", href: "/download-report" },
  { label: "Manage Addresses", action: "addresses", href: "/saved-addresses" },
  { label: "Help & Feedback", action: "help", href: "/help-feedback" },
];

const LoginProfileDropDown = ({ onOpenLogin, variant = "topbar" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncStoredAuth = () => {
      if (typeof window === "undefined") return;

      const storedUser = localStorage.getItem("customerUser");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setIsLoggedIn(!!localStorage.getItem("customerToken"));
    };

    syncStoredAuth();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("customer-auth-changed", syncStoredAuth);
    window.addEventListener("storage", syncStoredAuth);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("customer-auth-changed", syncStoredAuth);
      window.removeEventListener("storage", syncStoredAuth);
    };
  }, []);

  const handleLogout = () => {
    const previousUser = JSON.parse(localStorage.getItem("customerUser") || "null");
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    localStorage.removeItem("customerLoginTime");
    clearCustomerCheckoutState();
    dispatchCustomerAuthChanged({
      previousIdentity: getCustomerIdentity(previousUser),
      currentIdentity: "",
      action: "logout",
    });
    setOpen(false);
    navigate("/");
  };

  const handleTriggerClick = () => {
    if (!isLoggedIn) {
      onOpenLogin();
      return;
    }

    setOpen((previous) => !previous);
  };

  const handleMenuClick = (item) => {
    if (item.href?.startsWith("tel:")) {
      window.location.href = item.href;
      setOpen(false);
      return;
    }

    if (item.href) {
      navigate(item.href);
      setOpen(false);
    }
  };

  const displayName =
    user?.name?.trim() ||
    user?.firstName?.trim() ||
    user?.email?.split("@")[0] ||
    "User";
  const welcomeLabel = isLoggedIn ? `Welcome ${displayName}` : "Login/Register";

  const triggerClassName =
    variant === "topbar"
      ? "wello-user-trigger wello-header-btn"
      : "wello-user-trigger wello-user-trigger--mobile";

  return (
    <div className="wello-user-menu" ref={dropdownRef}>
      <button type="button" onClick={handleTriggerClick} className={triggerClassName}>
        <FaUser className="wello-user-trigger-icon" />
        <span className="wello-user-trigger-label">{welcomeLabel}</span>
        {isLoggedIn && (
          <FaChevronDown className={`wello-user-trigger-chevron ${open ? "is-open" : ""}`} />
        )}
      </button>

      {open && isLoggedIn && (
        <div className="wello-user-dropdown" role="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.action}
              type="button"
              className="wello-user-dropdown-item"
              onClick={() => handleMenuClick(item)}
              role="menuitem"
            >
              {item.label}
            </button>
          ))}
          <div className="wello-user-dropdown-divider" />
          <button
            type="button"
            className="wello-user-dropdown-item wello-user-dropdown-item--signout"
            onClick={handleLogout}
            role="menuitem"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginProfileDropDown;
