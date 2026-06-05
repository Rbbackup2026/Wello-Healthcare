"use client";

import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaHome,
} from "react-icons/fa";
import axios from "axios";
import Link from "next/link";
import { useLocation } from "../../Components/MainRoute/LocationContext";

// Use the consistent API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FULL_BODY_CATEGORY = {
  _id: "full-body-health-checkup-category",
  name: "Full Body Health Checkup",
  status: true,
  showInNavbar: true,
};

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
    category?.showinnavbar ??
    category?.showInNavbar ??
    category?.showNavbar;

  return value === undefined || value === null ? true : isTruthy(value);
};

const withFullBodyCategory = (items, allItems = items) => {
  const hasFullBody = allItems.some(
    (cat) => (cat.name || "").toLowerCase() === "full body health checkup"
  );

  return hasFullBody ? items : [...items, FULL_BODY_CATEGORY];
};

const Navbar = () => {
  const { location } = useLocation();
  const [categories, setCategories] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [popularTests, setPopularTests] = useState([]);

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
          productsArray.filter(
            (product) => {
              const matchesPackage = product.showPopularPackage === "Yes" ||
                product.showFullBodyHealthCheckup === "Yes";
              const isActive = product.status === true ||
                product.status === "Active" ||
                product.isActive !== false;
              
              // Filter by city - match if no city specified in product or matches current city
              const matchesCity = 
                !location?.city || 
                !product.city || 
                product.city.toLowerCase() === location.city.toLowerCase();
              
              return matchesPackage && isActive && matchesCity;
            }
          )
        );
      } catch (err) {
        console.error("Failed to fetch data for navbar:", err);
      }
    };

    fetchData();
  }, [location?.city]);

  const renderFlyoutLinks = (items, type) => (
    <div className="wello-flyout">
      {items.slice(0, 18).map((item) => {
        const label = item.name || item.title;
        const isFullBodyCategory =
          type === "category" &&
          (label || "").toLowerCase() === "full body health checkup";
        const href =
          isFullBodyCategory
            ? "/full-body-health-checkup"
            : type === "product"
            ? `/product/${item._id}`
            : `/lab-tests?${type}=${encodeURIComponent(label)}`;

        return (
          <Link
            key={item._id || label}
            href={href}
            className="wello-flyout-link"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="wello-nav-shell">
      <div className="wello-nav-inner">
        <Link href="/" className="wello-nav-home">
          <FaHome />
        </Link>

        <div className="wello-nav-group">
          <Link
            href="/lab-tests"
            className="wello-nav-primary"
          >
            Book Your Blood Test
            <FaChevronDown />
          </Link>
          <div className="wello-menu">
            <div className="wello-sub-group">
              <Link
                href="/health-categories"
                className="wello-menu-link"
              >
                Popular Health Checkup
                <FaChevronRight />
              </Link>
              {renderFlyoutLinks(popularTests, "product")}
            </div>
            <div className="wello-sub-group">
              <Link
                href="/lab-tests"
                className="wello-menu-link"
              >
                Test By Categories
                <FaChevronRight />
              </Link>
              {renderFlyoutLinks(categories, "category")}
            </div>
            <div className="wello-sub-group">
              <Link
                href="/lab-tests"
                className="wello-menu-link"
              >
                Test By Risk
                <FaChevronRight />
              </Link>
              {renderFlyoutLinks(diseases, "disease")}
            </div>
            <Link
              href="/full-body-health-checkup"
              className="wello-menu-link"
            >
              Full Body Checkup
            </Link>
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
