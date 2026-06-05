"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "../../../lib/routerCompat";
import {
  clearCustomerCheckoutState,
  dispatchCustomerAuthChanged,
  getCustomerIdentity,
} from "../../../utils/customerSession";

const ProfileDropdown = ({ onOpenLogin }) => {
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

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      onOpenLogin();
      return;
    }

    setOpen((prev) => !prev);
  };

  const uhid = user?._id ? `ML${String(user._id).slice(-8).toUpperCase()}` : "N/A";
  const displayName = user?.name
    ? `${user.name}, ${user.gender || ""}`.trim().replace(/,$/, "")
    : user?.email || "User";

  const menuItems = [
    {
      label: "Manage Profile",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      action: () => {
        onOpenLogin();
        setOpen(false);
      },
    },
    {
      label: "Saved Addresses",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      action: () => {
        navigate("/saved-addresses");
        setOpen(false);
      },
    },
    {
      label: "My Orders",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      action: () => {
        navigate("/my-orders");
        setOpen(false);
      },
    },
    {
      label: "Need Help",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      action: () => {
        navigate("/help");
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleProfileClick}
        className="flex flex-col items-center text-gray-700 transition-colors hover:text-teal-600"
      >
        <div className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          {isLoggedIn && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mt-1">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          )}
        </div>
        {isLoggedIn && user?.name && (
          <span className="mt-0.5 max-w-[65px] truncate text-[10px] font-bold uppercase">
            {user.name.split(" ")[0]}
          </span>
        )}
      </button>

      {open && isLoggedIn && (
        <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center gap-3 bg-teal-700 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium leading-tight text-white">{displayName.toUpperCase()}</p>
              <p className="mt-0.5 text-xs text-white/70">
                UHID: <span className="font-medium text-teal-300">{uhid}</span>
              </p>
            </div>
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span className="text-teal-600">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <hr className="my-1 border-gray-100" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
