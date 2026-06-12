"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoginModal from "./LoginFolder/LoginModal";

const DASHBOARD_CARDS = [
  {
    label: "My Bookings",
    href: "/my-orders",
    icon: "📅",
  },
  {
    label: "My Reports",
    href: "/download-report",
    icon: "📋",
  },
  {
    label: "Manage Addresses",
    href: "/saved-addresses",
    icon: "📍",
  },
  {
    label: "Book Lab Tests",
    href: "/lab-tests",
    icon: "🧪",
  },
  {
    label: "My Cart",
    href: "/cart_section",
    icon: "🛒",
  },
  {
    label: "Health Blogs",
    href: "/blogs",
    icon: "📰",
    badge: "New",
  },
  {
    label: "Help & Feedback",
    href: "/help-feedback",
    icon: "💬",
  },
];

const getInitial = (user) => {
  const source = user?.name || user?.email || "U";
  return source.charAt(0).toUpperCase();
};

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");

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

  const handleCallbackSubmit = (event) => {
    event.preventDefault();
    const digits = callbackPhone.replace(/\D/g, "");
    if (digits.length !== 10) return;
    window.location.href = "tel:+918448158188";
  };

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <div className="my-account-page">
        <main className="my-account-main">
          <div className="my-account-title-wrap">
            <h1 className="my-account-title">Your Wello Hub</h1>
          </div>

          {!isLoggedIn ? (
            <div className="my-account-login-prompt">
              <h2>Please log in to view your dashboard</h2>
              <p>Sign in to manage bookings, reports, and your profile.</p>
              <button type="button" onClick={() => setLoginOpen(true)} className="my-account-login-btn">
                Login / Register
              </button>
            </div>
          ) : (
            <>
              <div className="my-account-grid">
                <div className="my-account-profile-card">
                  <div className="my-account-avatar">{getInitial(user)}</div>
                  <h2 className="my-account-profile-name">{displayName}</h2>
                  {email && <p className="my-account-profile-meta">{email}</p>}
                  {phone && <p className="my-account-profile-meta">{phone}</p>}
                  <button
                    type="button"
                    onClick={() => setLoginOpen(true)}
                    className="my-account-edit-btn"
                  >
                    Edit Info
                  </button>
                </div>

                {DASHBOARD_CARDS.map((card) => {
                  const isExternal = card.href.startsWith("tel:");
                  const className = `my-account-card${card.banner ? " my-account-card--with-banner" : ""}`;

                  const content = (
                    <>
                      {card.banner && <span className="my-account-card-banner">{card.banner}</span>}
                      {card.badge && <span className="my-account-card-badge">{card.badge}</span>}
                      <span className="my-account-card-icon" aria-hidden="true">
                        {card.icon}
                      </span>
                      <span className="my-account-card-label">{card.label}</span>
                    </>
                  );

                  if (isExternal) {
                    return (
                      <a key={card.label} href={card.href} className={className}>
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link key={card.label} href={card.href} className={className}>
                      {content}
                    </Link>
                  );
                })}
              </div>

              <section className="my-account-callback">
                <h2 className="my-account-callback-title">Get a Callback from our Health Advisor</h2>
                <form className="my-account-callback-form" onSubmit={handleCallbackSubmit}>
                  <input
                    type="tel"
                    value={callbackPhone}
                    onChange={(event) => setCallbackPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter your 10 digit mobile no."
                    className="my-account-callback-input"
                  />
                  <button type="submit" className="my-account-callback-submit">
                    Get a Call Back
                  </button>
                </form>
              </section>
            </>
          )}
        </main>
      </div>

      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default MyAccount;
