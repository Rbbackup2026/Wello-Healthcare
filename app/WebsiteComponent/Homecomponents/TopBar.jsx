"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaHeadset,
  FaMapMarkerAlt,
  FaSearch,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../Components/MainRoute/CartContext";
import { useLocation } from "../../Components/MainRoute/LocationContext";
import LocationDialog from "../AllDailogFroms/LocationDialog";
import LoginModal from "./LoginFolder/LoginModal";
import LoginProfileDropDown from "./LoginFolder/LoginProfileDropDown";
import { FaPhoneAlt } from "react-icons/fa";

const topbarStyles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#12bdb8",
    color: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  inner: {
    minHeight: 80,
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  logoLink: {
    width: 196,
    height: 92,
    flex: "0 0 196px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    background: "transparent",
    textDecoration: "none",
  },
  logo: {
    width: 166,
    maxWidth: 166,
    height: 64,
    objectFit: "contain",
    display: "block",
  },
  healthcare: {
    marginTop: -8,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  headerControl: {
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "0 12px",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 6,
    background: "transparent",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
    cursor: "pointer",
    textDecoration: "none",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
    minWidth: 260,
  },
  searchBox: {
    height: 44,
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 3px 10px rgba(15,23,42,0.22)",
    overflow: "hidden",
  },
  searchInput: {
    height: "100%",
    flex: 1,
    border: 0,
    outline: 0,
    padding: "0 16px",
    color: "#334155",
    fontSize: 14,
  },
  searchButton: {
    width: 50,
    height: "100%",
    border: 0,
    background: "transparent",
    color: "#12bdb8",
    cursor: "pointer",
  },
};

const TopBar = () => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { cartItems } = useCart();
  const { locationLabel } = useLocation();
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [productRes, blogRes] = await Promise.all([
          axios.get("http://localhost:3000/v1/api/get_product"),
          axios.get("http://localhost:3000/v1/api/blogget-active"),
        ]);
        const productItems = Array.isArray(productRes?.data)
          ? productRes.data
          : productRes?.data?.data || productRes?.data?.items || [];
        const blogItems = Array.isArray(blogRes?.data)
          ? blogRes.data
          : blogRes?.data?.data || [];

        setAllProducts(productItems);
        setAllBlogs(blogItems);
      } catch (err) {
        console.error("Failed to fetch website search data", err);
      }
    };
    fetchSearchData();
  }, []);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const query = inputValue.toLowerCase().trim();
    const productResults = allProducts
      .filter((product) => String(product?.name || "").toLowerCase().includes(query))
      .map((product) => ({
        id: product._id,
        label: product.name,
        type: "product",
      }));
    const blogResults = allBlogs
      .filter((blog) => {
        const title = blog?.title || blog?.name || blog?.blogTitle || "";
        const intro = blog?.intro || blog?.shortDescription || blog?.description || "";
        return query === "blog" || query === "blogs" || `${title} ${intro}`.toLowerCase().includes(query);
      })
      .map((blog) => ({
        id: blog._id || blog.id,
        label: blog.title || blog.name || blog.blogTitle || "Health Blog",
        type: "blog",
      }));
    const blogsPageResult =
      query === "blog" || query === "blogs"
        ? [{ id: "blogs-page", label: "Blogs", type: "blogsPage" }]
        : [];
    const filtered = [...blogsPageResult, ...productResults, ...blogResults].slice(0, 8);

    setSearchResults(filtered);
    setShowDropdown(true);
  }, [allBlogs, allProducts, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = useCallback(
    (item) => {
      const href =
        item.type === "blogsPage"
          ? "/blogs"
          : item.type === "blog"
          ? `/blog/${item.id}`
          : `/product/${item.id}`;

      router.push(href);
      setInputValue("");
      setShowDropdown(false);
    },
    [router]
  );

  const handleSearchSubmit = () => {
    if (searchResults.length > 0) {
      handleItemClick(searchResults[0]);
    }
  };

  return (
    <>
      <header className="wello-topbar" style={topbarStyles.header}>
        <div className="wello-topbar-inner" style={topbarStyles.inner}>
          <Link href="/" className="wello-logo-link" style={topbarStyles.logoLink}>
  <img
    src="/images/WELLOHealthcare.png"
    alt="Wello Healthcare"
    className="wello-logo"
    width="166"
    height="64"
    style={topbarStyles.logo}
    onError={(e) => { e.target.style.display = 'none'; }}
  />
  <span className="wello-logo-healthcare" style={topbarStyles.healthcare}>
  
  </span>
</Link>

          <button
            type="button"
            onClick={() => setLocationDialogOpen(true)}
            className="wello-header-btn"
            style={topbarStyles.headerControl}
          >
            <FaMapMarkerAlt />
            <span>{locationLabel || "Gurugram"}</span>
          </button>

          <div className="wello-search-wrap" ref={dropdownRef} style={topbarStyles.searchWrap}>
            <div className="wello-search-box" style={topbarStyles.searchBox}>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearchSubmit();
                }}
                placeholder="Search for a Test, Blogs"
                style={topbarStyles.searchInput}
              />
              <button
                type="button"
                onClick={handleSearchSubmit}
                style={topbarStyles.searchButton}
              >
                <FaSearch />
              </button>
            </div>

            {showDropdown && (
              <div className="wello-search-dropdown">
                {searchResults.length ? (
                  searchResults.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="wello-search-result"
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <div className="wello-search-result">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href="/cart_section"
            className="wello-header-link wello-cart-link"
            style={topbarStyles.headerControl}
          >
            <FaShoppingCart />
            Cart
            {cartItems.length > 0 && (
              <span className="wello-cart-count">
                {cartItems.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="wello-header-btn"
            style={topbarStyles.headerControl}
          >
            <FaUser />
            <span>Login/Register</span>
          </button>

          <a
            href="tel:7982100200"
            className="wello-header-link"
            style={topbarStyles.headerControl}
          >
            <FaPhoneAlt />
            Support
          </a>

          <div className="wello-mobile-profile">
            <LoginProfileDropDown onOpenLogin={() => setLoginOpen(true)} />
          </div>
        </div>
      </header>

      {locationDialogOpen && (
        <LocationDialog onClose={() => setLocationDialogOpen(false)} />
      )}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default TopBar;
