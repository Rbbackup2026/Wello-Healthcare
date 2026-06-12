"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaHome,
} from "react-icons/fa";
import axios from "axios";
import Link from "next/link";
import { useLocation } from "../../Components/MainRoute/LocationContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/v1/api";
const FULL_BODY_CATEGORY = {
  _id: "full-body-health-checkup-category",
  name: "Full Body Health Checkup",
  status: true,
  showInNavbar: true,
};

const MEGA_SECTIONS = [
  {
    id: "popular",
    label: "Popular Health Checkup",
    type: "product",
    sectionHref: "/lab-tests",
  },
  {
    id: "categories",
    label: "Test By Categories",
    type: "category",
    sectionHref: "/lab-tests",
  },
  {
    id: "risk",
    label: "Test By Risk",
    type: "disease",
    sectionHref: "/lab-tests",
  },
  {
    id: "fullbody",
    label: "Full Body Checkup",
    href: "/full-body-health-checkup",
  },
];

const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "active";
  }
  if (typeof value === "number") return value === 1;
  return false;
};

const isShownInNavbar = (category) => {
  const value =
    category?.showinnavbar ?? category?.showInNavbar ?? category?.showNavbar;

  return value === undefined || value === null ? true : isTruthy(value);
};

const withFullBodyCategory = (items, allItems = items) => {
  const hasFullBody = allItems.some(
    (cat) => (cat.name || "").toLowerCase() === "full body health checkup"
  );

  return hasFullBody ? items : [...items, FULL_BODY_CATEGORY];
};

const getItemHref = (item, type) => {
  const label = item.name || item.title || "";
  const isFullBodyCategory =
    type === "category" &&
    (label || "").toLowerCase() === "full body health checkup";

  if (isFullBodyCategory) {
    return "/full-body-health-checkup";
  }

  if (type === "product") {
    return `/product/${item._id}`;
  }

  return `/lab-tests?${type}=${encodeURIComponent(label)}`;
};

const Navbar = () => {
  const { location } = useLocation();
  const [categories, setCategories] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [popularTests, setPopularTests] = useState([]);
  const [activeSection, setActiveSection] = useState("popular");
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const openMegaMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMegaOpen(true);
  };

  const scheduleCloseMegaMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setMegaOpen(false);
      closeTimerRef.current = null;
    }, 150);
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, disRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/diseasepost`),
          axios.get(`${API_BASE_URL}/get_product`),
        ]);
        const categoryData = Array.isArray(catRes.data) ? catRes.data : [];
        setCategories(
          withFullBodyCategory(
            categoryData.filter(
              (cat) => isTruthy(cat.status) && isShownInNavbar(cat)
            ),
            categoryData
          )
        );

        const disData = disRes.data?.diseases || disRes.data || [];
        setDiseases(disData.filter((disease) => disease.isActive !== false));

        const allProducts =
          prodRes.data?.data || prodRes.data?.items || prodRes.data || [];
        const productsArray = Array.isArray(allProducts)
          ? allProducts
          : allProducts.data || [];
        setPopularTests(
          productsArray.filter((product) => {
            const matchesPackage =
              product.showPopularPackage === "Yes" ||
              product.showFullBodyHealthCheckup === "Yes";
            const isActive =
              product.status === true ||
              product.status === "Active" ||
              product.isActive !== false;
            const matchesCity =
              !location?.city ||
              !product.city ||
              product.city.toLowerCase() === location.city.toLowerCase();

            return matchesPackage && isActive && matchesCity;
          })
        );
      } catch (err) {
        console.error("Failed to fetch data for navbar:", err);
      }
    };

    fetchData();
  }, [location?.city]);

  const sectionItems = useMemo(
    () => ({
      popular: popularTests,
      categories,
      risk: diseases,
    }),
    [popularTests, categories, diseases]
  );

  const activeSectionConfig = MEGA_SECTIONS.find((section) => section.id === activeSection);
  const activeItems = (sectionItems[activeSection] || []).slice(0, 18);

  return (
    <nav className={`wello-nav-shell${megaOpen ? " is-mega-open" : ""}`}>
      <div className="wello-nav-inner">
        <Link href="/" className="wello-nav-home">
          <FaHome />
        </Link>

        <div
          className="wello-nav-group"
          onMouseEnter={openMegaMenu}
          onMouseLeave={scheduleCloseMegaMenu}
          onFocus={openMegaMenu}
        >
          <Link href="/lab-tests" className="wello-nav-primary">
            Book Your Blood Test
            <FaChevronDown className={megaOpen ? "is-open" : ""} />
          </Link>

          <div className={`wello-mega-panel${megaOpen ? " is-open" : ""}`}>
            <div className="wello-mega-menu">
              <aside className="wello-mega-sidebar">
                {MEGA_SECTIONS.map((section) => {
                  const href = section.href || section.sectionHref;
                  const isActive = activeSection === section.id;

                  return (
                    <Link
                      key={section.id}
                      href={href || "#"}
                      className={`wello-mega-sidebar-item${isActive ? " is-active" : ""}`}
                      onMouseEnter={() => setActiveSection(section.id)}
                      onFocus={() => setActiveSection(section.id)}
                    >
                      <span>{section.label}</span>
                      <FaChevronRight />
                    </Link>
                  );
                })}
              </aside>

              <div className="wello-mega-content">
                {activeSection === "fullbody" ? (
                  <div className="wello-mega-columns">
                    <Link href="/full-body-health-checkup" className="wello-mega-link">
                      Full Body Checkup
                    </Link>
                  </div>
                ) : activeItems.length === 0 ? (
                  <p className="wello-mega-empty">No items available in this section.</p>
                ) : (
                  <div className="wello-mega-columns">
                    {activeItems.map((item) => {
                      const label = item.name || item.title || "Item";
                      return (
                        <Link
                          key={item._id || label}
                          href={getItemHref(item, activeSectionConfig?.type)}
                          className="wello-mega-link"
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link href="/full-body-health-checkup" className="wello-nav-item">
          Full Body Health Checkup
          <FaChevronRight />
        </Link>
        <Link href="/download-report" className="wello-nav-item">
          Schedule Scan
          <FaChevronRight />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
