"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "../../Components/MainRoute/LocationContext";
import { useAppRouter } from "../../hooks/useAppRouter";
import { API_BASE_URL } from "../../utils/api";
import { METRO_CITIES, slugifyCity } from "../../utils/cityApi";
import { isShownInNavbar, isShownOnHomeDisease } from "../../utils/productVisibility";

const FULL_BODY_CATEGORY_TITLE = "Full Body Health Checkup";

const FULL_BODY_NAV_CATEGORY = {
  _id: "full-body-health-checkup-category",
  name: FULL_BODY_CATEGORY_TITLE,
  status: true,
  showInNavbar: true,
};

const homeFooterSections = [
  { title: "Our Locations", type: "our-locations" },
  { title: "Full Body Health Checkup", type: "full-body-metro-cities" },
  { title: "Most Popular Health Tests", content: "" },
  { title: "Most Popular Radiology Tests", content: "" },
  { title: "Test By Risks", type: "test-by-risks" },
  { title: "Most Popular Health Category", type: "popular-health-categories" },
];

const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "active" || normalized === "1";
  }
  if (typeof value === "number") return value === 1;
  return false;
};

const getCategoryFooterHref = (category = {}) => {
  const label = category.name || category.title || "";
  if (label.toLowerCase() === FULL_BODY_CATEGORY_TITLE.toLowerCase()) {
    return "/full-body-health-checkup";
  }
  return `/lab-tests?category=${encodeURIComponent(label)}`;
};

const withNavbarCategories = (items, allItems = items) => {
  const hasFullBody = allItems.some(
    (cat) =>
      (cat.name || cat.title || "").toLowerCase() ===
      FULL_BODY_CATEGORY_TITLE.toLowerCase()
  );
  return hasFullBody ? items : [...items, FULL_BODY_NAV_CATEGORY];
};

const HomePageFooter = () => {
  const router = useAppRouter();
  const { setLocation } = useLocation();
  const [openFooterSection, setOpenFooterSection] = useState(0);
  const [footerRiskItems, setFooterRiskItems] = useState([]);
  const [footerCategoryItems, setFooterCategoryItems] = useState([]);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [catRes, disRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/diseasepost`),
        ]);

        const categoriesData = Array.isArray(catRes.data) ? catRes.data : [];
        setFooterCategoryItems(
          withNavbarCategories(
            categoriesData.filter(
              (cat) => isTruthy(cat.status) && isShownInNavbar(cat)
            ),
            categoriesData
          )
        );

        const diseasesData = disRes.data?.diseases || disRes.data || [];
        setFooterRiskItems(
          diseasesData.filter((disease) => disease.isActive !== false)
        );
      } catch (error) {
        console.error("Failed to fetch footer data:", error);
        setFooterCategoryItems([]);
        setFooterRiskItems([]);
      }
    };

    fetchFooterData();
  }, []);

  const handleFooterLocationSelect = (city) => {
    setLocation({
      city,
      formattedAddress: `${city}, India`,
      source: "footer",
    });
    router.push("/lab-tests");
  };

  return (
    <footer className="pdf-home-footer">
      <div className="pdf-home-footer-links">
        {homeFooterSections.map((section, index) => {
          const isOpen = openFooterSection === index;

          return (
            <div className="pdf-home-footer-row" key={section.title}>
              <button
                type="button"
                onClick={() => setOpenFooterSection(isOpen ? -1 : index)}
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                <span className="pdf-home-footer-toggle">{isOpen ? "-" : "+"}</span>
              </button>
              {isOpen && section.type === "our-locations" && (
                <div className="pdf-home-footer-tags">
                  {METRO_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="pdf-home-footer-tag"
                      onClick={() => handleFooterLocationSelect(city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
              {isOpen && section.type === "full-body-metro-cities" && (
                <div className="pdf-home-footer-tags">
                  {METRO_CITIES.map((city) => (
                    <Link
                      key={city}
                      className="pdf-home-footer-tag"
                      href={`/full-body-health-checkup/city/${slugifyCity(city)}`}
                    >
                      Full Body Checkup in {city}
                    </Link>
                  ))}
                </div>
              )}
              {isOpen && section.type === "test-by-risks" && (
                <div className="pdf-home-footer-tags">
                  {footerRiskItems.length === 0 ? (
                    <p className="pdf-home-footer-empty">No health risks available.</p>
                  ) : (
                    footerRiskItems.map((disease) => (
                      <Link
                        key={disease._id || disease.name}
                        className="pdf-home-footer-tag"
                        href={`/lab-tests?disease=${encodeURIComponent(disease.name || "")}`}
                      >
                        {disease.name}
                      </Link>
                    ))
                  )}
                </div>
              )}
              {isOpen && section.type === "popular-health-categories" && (
                <div className="pdf-home-footer-tags">
                  {footerCategoryItems.length === 0 ? (
                    <p className="pdf-home-footer-empty">No categories available.</p>
                  ) : (
                    footerCategoryItems.map((category) => (
                      <Link
                        key={category._id || category.name}
                        className="pdf-home-footer-tag"
                        href={getCategoryFooterHref(category)}
                      >
                        {category.name || category.title}
                      </Link>
                    ))
                  )}
                </div>
              )}
              {isOpen && section.content && <p>{section.content}</p>}
            </div>
          );
        })}
      </div>

      <div className="pdf-home-footer-main">
        <div className="pdf-home-footer-brand">
          <h2>WELLO</h2>
          <span>Healthcare</span>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text.
          </p>
        </div>

        <div style={{ width: "225px", height: "223px", opacity: 1 }}>
          <h3>Quick Links</h3>
          <a href="/about-us">About Us</a>
          <a href="/team">Our Teams</a>
          <a href="/lab-tests">Book your blood tests</a>
          <a href="/full-body-health-checkup">Full body health checkup</a>
          <a href="/schedule-scan">Health scans</a>
        </div>

        <div style={{ width: "176px", height: "260px", opacity: 1 }}>
          <h3>Info</h3>
          <a href="/blogs">Blogs</a>
          <a href="/gallery">Gallery</a>
          <a href="/career">Career</a>
          <a href="/contact-us">Reach Us</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>

        <div className="pdf-home-footer-reach">
          <h3>Reach Us</h3>
          <p>
            <FaMapMarkerAlt />{" "}
            <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</span>
          </p>
          <p>
            <FaPhoneAlt /> <span>0125767578574, 0124671754770</span>
          </p>
          <p>
            <FaEnvelope /> <span>info@otherdvc.com</span>
          </p>
          <h3>Follow on Us</h3>
          <div className="pdf-home-footer-socials">
            <span>◎</span>
            <span>f</span>
            <span>in</span>
            <span>X</span>
          </div>
        </div>
      </div>

      <div className="pdf-home-footer-copy">
        ©2026 All right reserved. Wello healthcare Limited
      </div>
    </footer>
  );
};

export default HomePageFooter;
