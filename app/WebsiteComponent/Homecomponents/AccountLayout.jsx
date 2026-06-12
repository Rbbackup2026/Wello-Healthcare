"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoginModal from "./LoginFolder/LoginModal";

const ACCOUNT_LINKS = [
  { id: "dashboard", label: "Dashboard", href: "/my-account" },
  { id: "profile", label: "My Profile", href: "/my-account" },
  { id: "bookings", label: "My Bookings", href: "/my-orders" },
  { id: "reports", label: "My Reports", href: "/download-report" },
  { id: "addresses", label: "Manage Addresses", href: "/saved-addresses" },
  { id: "help", label: "Help & Feedback", href: "/help-feedback" },
];

const getInitial = (user) => {
  const source = user?.name || user?.email || "U";
  return source.charAt(0).toUpperCase();
};

const AccountLayout = ({ activePage = "dashboard", children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      if (typeof window === "undefined") return;
      const storedUser = localStorage.getItem("customerUser");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setIsLoggedIn(!!localStorage.getItem("customerToken"));
    };

    syncAuth();
    window.addEventListener("customer-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("customer-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const phone = user?.mobileNo || user?.phone || "";

  const isLinkActive = (link) => {
    if (activePage) return link.id === activePage;
    return pathname === link.href;
  };

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <div className="account-shell">
        <div className="account-shell-inner">
          <aside className="account-sidebar">
            <div className="account-sidebar-profile">
              <div className="account-sidebar-avatar">{getInitial(user)}</div>
              <h2 className="account-sidebar-name">{displayName}</h2>
              {email && <p className="account-sidebar-meta">{email}</p>}
              {phone && <p className="account-sidebar-meta">{phone}</p>}
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="account-sidebar-edit-btn"
                disabled={!isLoggedIn}
              >
                Edit Info
              </button>
            </div>

            <nav className="account-sidebar-nav" aria-label="Account navigation">
              {ACCOUNT_LINKS.map((link) => {
                const active = isLinkActive(link);

                if (link.external) {
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      className={`account-sidebar-link${active ? " is-active" : ""}`}
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    className={`account-sidebar-link${active ? " is-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="account-content">{children}</section>
        </div>
      </div>

      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default AccountLayout;
