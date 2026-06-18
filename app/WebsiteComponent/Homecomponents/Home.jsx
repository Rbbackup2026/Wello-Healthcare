"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import HealthcareHero from "./HealthcareHero";
import { useLocation } from "../../Components/MainRoute/LocationContext";
import { API_BASE_URL, toAssetUrl } from "../../utils/api";
import { extractApiArray, normalizeCityName } from "../../utils/cityApi";
import axios from "axios"; // Import axios

const teal = "#12bdb8";

const FULL_BODY_CATEGORY_TITLE = "Full Body Health Checkup";

const packageCards = [
  { title: "Well One Health Package", price: "5,000" },
  { title: "Well Two Health Package", price: "4,000" },
  { title: "Well Three Health Package", price: "3,500" },
];

const scanCards = [
  "MRI Scans",
  "CT Scans",
  "Mammography",
];

const blogCards = [
  "The Truth Behind Food Labels",
  "Lorem Ipsum is simply dummy text",
  "Lorem Ipsum is simply dummy text",
];

const homeFooterSections = [
  {
    title: "Full Body Health Checkup",
    content:
      "Full Body Checkup in Ahmedabad / Full Body Checkup in Bengaluru / Full Body Checkup in Chandigarh / Full Body Checkup in Chennai / Full Body Checkup in Delhi / Full Body Checkup in Faridabad / Full Body Checkup in Ghaziabad / Full Body Checkup in Greater Noida / Full Body Checkup in Gurgaon / Full Body Checkup in Hyderabad / Full Body Checkup in Indore / Full Body Checkup in Jaipur / Full Body Checkup in Kanpur / Full Body Checkup in Kolkata / Full Body Checkup in Lucknow / Full Body Checkup in Ludhiana / Full Body Checkup in Mumbai / Full Body Checkup in Noida / Full Body Checkup in Patna / Full Body Checkup in Pune",
  },
  { title: "Most Popular Health Tests", content: "" },
  { title: "Most Popular Radiology Tests", content: "" },
  { title: "TEST BY RISKS", content: "" },
  { title: "TEST BY HABITS", content: "" },
];

const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.toLowerCase();
    return v === "true" || v === "yes" || v === "active" || v === "1";
  }
  if (typeof value === "number") return value === 1;
  return false;
};

const normalizeCategoryName = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s*tests?$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getCategoryNameFromValue = (value, categoriesData = []) => {
  if (!value) return "";

  if (typeof value === "string") {
    const category = categoriesData.find(
      (cat) => String(cat._id || cat.id) === value
    );

    return category?.name || category?.title || value;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.categoryName ||
      getCategoryNameFromValue(value._id || value.id, categoriesData)
    );
  }

  return "";
};

const getProductCategoryValues = (product = {}) => [
  product.category,
  product.categories,
  product.categoryId,
  product.category_id,
  product.categoryName,
].filter(Boolean);

const withFullBodyHealthCategory = (items, allItems = items) => {
  const hasFullBody = allItems.some(
    (cat) => (cat.title || cat.name || "").toLowerCase() === FULL_BODY_CATEGORY_TITLE.toLowerCase()
  );

  if (hasFullBody) return items;

  return [
    ...items,
    {
      title: FULL_BODY_CATEGORY_TITLE,
      imgUrl: "/images/fullbody-icon.png",
      href: "/full-body-health-checkup",
    },
  ];
};

const tabs = ["Full Body Checkup", "Fever", "Vitamins", "Diabetes", "Heart", "Kidney", "Thyroid", "Allergy"];

const ProductCard = memo(({ id, title, price }) => (
  <article className="pdf-product-card">
    <div className="pdf-product-head">
      <h3>{title}</h3>
      <span>Package</span>
    </div>
    <div className="pdf-price-row">
      <del>₹7,000</del>
      <strong>₹{price}</strong>
      <span>50% OFF</span>
    </div>
    <div className="pdf-product-body">
      <div className="pdf-product-meta">
        <div>
          <p>
            <img src="/images/Parameter.png" alt="" className="pdf-product-feature-icon" aria-hidden="true" />
            <strong>62 Parameters</strong>
          </p>
          <small>Included</small>
        </div>
        <div>
          <p>
            <img src="/images/Report.png" alt="" className="pdf-product-feature-icon" aria-hidden="true" />
            <strong>Reports in</strong>
          </p>
          <small>12 hours</small>
        </div>
      </div>
      <div className="pdf-product-actions">
        <a className="pdf-know-more" href={id ? `/product/${id}` : "/lab-tests"}>+ Know More</a>
        <a className="pdf-add-cart" href={id ? `/product/${id}` : "/lab-tests"}>Add to Cart</a>
      </div>
    </div>
  </article>
));

ProductCard.displayName = "ProductCard";

const SliderShell = memo(({ children, className = "", contentRef, onPrev, onNext }) => {
  const internalRef = useRef(null);
  const scrollRef = contentRef || internalRef;
  const scrollByPage = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={`pdf-slider-shell ${className}`}>
      <button
        className="pdf-round-arrow"
        type="button"
        aria-label="Previous"
        onClick={onPrev || (() => scrollByPage("left"))}
      >
        <FaChevronLeft />
      </button>
      <div className="pdf-slider-content" ref={scrollRef}>
        {children}
      </div>
      <button
        className="pdf-round-arrow"
        type="button"
        aria-label="Next"
        onClick={onNext || (() => scrollByPage("right"))}
      >
        <FaChevronRight />
      </button>
    </div>
  );
});

SliderShell.displayName = "SliderShell";

const ProductSection = memo(({ title, showBg = false, products = packageCards }) => {
  const productSliderRef = useRef(null);
  const titleParts = title.match(/^(.*?)(\sin\s.+)$/);
  const restTitle = titleParts ? titleParts[1] : title;
  const highlightedTitle = titleParts ? titleParts[2].trim() : "";
  const testsTitleParts = !highlightedTitle ? restTitle.match(/^(.*\s)(Tests)$/) : null;

  const scrollProductCards = (direction) => {
    if (!productSliderRef.current) return;
    const viewportWidth = productSliderRef.current.clientWidth;
    productSliderRef.current.scrollBy({
      left: direction === "left" ? -viewportWidth : viewportWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className={`pdf-section pdf-product-section ${showBg ? "pdf-fullbody-section" : ""}`}>
      <div className="pdf-section-inner">
        <h2 className="pdf-left-title">
          {testsTitleParts ? testsTitleParts[1] : restTitle}
          {testsTitleParts && <span className="pdf-highlight">{testsTitleParts[2]}</span>}
          {highlightedTitle && " "}
          {highlightedTitle && <span className="pdf-highlight">{highlightedTitle}</span>}
        </h2>
      {title.includes("Full Body") && (
        <div className="pdf-tabs">
          {tabs.map((tab, index) => (
            <a key={tab} className={index === 0 ? "active" : ""} href="/lab-tests">
              {tab}
            </a>
          ))}
        </div>
      )}
      <SliderShell
        contentRef={productSliderRef}
        onPrev={() => scrollProductCards("left")}
        onNext={() => scrollProductCards("right")}
      >
        <div className="pdf-product-grid">
          {products.length === 0 ? (
            <p className="text-center py-4 text-gray-500 col-span-full">No packages available.</p>
          ) : (
            products.map((item) => (
              <ProductCard 
                key={item._id || `${title}-${item.title}`} 
                id={item._id}
                title={item.name || item.title} 
                price={item.price} 
              />
            ))
          )}
        </div>
      </SliderShell>
    </div>
  </section>
);
});

ProductSection.displayName = "ProductSection";

const Home = () => {
  const { location, locationLabel } = useLocation();
  const cityName = locationLabel || "Gurugram";

  const [healthCategories, setHealthCategories] = useState([]);
  const [loadingHealthCategories, setLoadingHealthCategories] = useState(true);
  const [dynamicRiskCards, setDynamicRiskCards] = useState([]);
  const [fullBodyPackages, setFullBodyPackages] = useState([]);
  const [loadingFullBodyPackages, setLoadingFullBodyPackages] = useState(true);
  const [womenHealthPackages, setWomenHealthPackages] = useState([]);
  const [menHealthPackages, setMenHealthPackages] = useState([]);
  const [loadingWomenPackages, setLoadingWomenPackages] = useState(true);
  const [loadingMenPackages, setLoadingMenPackages] = useState(true);
  const [loadingRiskCards, setLoadingRiskCards] = useState(true);
  const [openFooterSection, setOpenFooterSection] = useState(0);

  const categorySliderRef = useRef(null);
  const catCurrentRef = useRef(0);

const CARD_W = 256;
const CARD_GAP = 30;
const VISIBLE = 4;

const scrollCategories = (direction) => {
  if (!categorySliderRef.current) return;
  const total = categorySliderRef.current.querySelectorAll(".pdf-category-card").length;
  const max = total - VISIBLE;
  const next = direction === "left"
    ? Math.max(0, catCurrentRef.current - 1)
    : Math.min(max, catCurrentRef.current + 1);
  catCurrentRef.current = next;
  categorySliderRef.current.style.transform =
    `translateX(-${next * (CARD_W + CARD_GAP)}px)`;
  categorySliderRef.current.style.transition =
    "transform 0.35s cubic-bezier(.4,0,.2,1)";
};

  useEffect(() => {
    const fetchHomeCategories = async () => {
      try {
        setLoadingHealthCategories(true);
        const res = await axios.get(`${API_BASE_URL}/categories`);
        const categoriesData = Array.isArray(res.data) ? res.data : [];
        const homeCats = categoriesData
          .filter((cat) => isTruthy(cat.status) && isTruthy(cat.showinhome))
          .map((cat) => ({
            title: cat.name || "Category",
            imgUrl: cat.iconimg 
              ? toAssetUrl(cat.iconimg) 
              : `https://via.placeholder.com/100/12bdb8/ffffff?text=${encodeURIComponent(cat.name || "Category")}`,
            href: `/lab-tests?category=${encodeURIComponent(cat.name || "")}`,
          }));
        setHealthCategories(withFullBodyHealthCategory(homeCats, categoriesData));
      } catch (err) {
        console.error("Failed to fetch home categories:", err);
        setHealthCategories([]);
      } finally {
        setLoadingHealthCategories(false);
      }
    };

    fetchHomeCategories();
  }, []);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoadingFullBodyPackages(true);
        setLoadingWomenPackages(true);
        setLoadingMenPackages(true);

        // Fetch both products and categories to resolve IDs to names
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/get_product`),
          axios.get(`${API_BASE_URL}/categories`)
        ]);

        const productsArray = extractApiArray(prodRes.data);
        const categoriesData = extractApiArray(catRes.data);
        const selectedCity = normalizeCityName(location?.city || "");

        const cityFiltered = productsArray.filter(p => {
          const isActive = isTruthy(p.status) || isTruthy(p.isActive);
          const productCity = normalizeCityName(
            p.city || p.location?.city || p.lab?.city || p.labDetails?.city || ""
          );
          const matchesCity =
            !selectedCity ||
            !productCity ||
            productCity === selectedCity ||
            productCity.startsWith(`${selectedCity} `) ||
            selectedCity.startsWith(`${productCity} `);

          return isActive && matchesCity;
        });

        // Helper to check category match (handles IDs, names, objects, arrays, and fallback fields)
        const hasCategory = (product, catName) => {
          const target = normalizeCategoryName(catName);
          const isMatch = (c) => {
            const name = getCategoryNameFromValue(c, categoriesData);
            if (!name) return false;
            return normalizeCategoryName(name) === target;
          };

          return getProductCategoryValues(product).some((value) =>
            Array.isArray(value) ? value.some(isMatch) : isMatch(value)
          );
        };

        setFullBodyPackages(cityFiltered.filter(p => isTruthy(p.showFullBodyHealthCheckup) || isTruthy(p.showFullBody)).slice(0, 9));
        setWomenHealthPackages(cityFiltered.filter(p => hasCategory(p, "Women Health Tests")).slice(0, 9));
        setMenHealthPackages(cityFiltered.filter(p => hasCategory(p, "Men Health Tests")).slice(0, 9));

      } catch (err) {
        console.error("Failed to fetch products for home page:", err);
        setFullBodyPackages([]);
        setWomenHealthPackages([]);
        setMenHealthPackages([]);
      } finally {
        setLoadingFullBodyPackages(false);
        setLoadingWomenPackages(false);
        setLoadingMenPackages(false);
      }
    };
    fetchHomeProducts();
  }, [location]);

  // Helper to get image URL, similar to Diseases.jsx
  const getImageUrl = (item) => {
    if (item?.imageUrl) return item.imageUrl;
    if (item?.iconimg) return toAssetUrl(`/uploads/diseases/${item.iconimg}`);
    return "/images/fullbody-icon.png"; // A generic placeholder if no image
  };

  useEffect(() => {
    const fetchDiseasesForHome = async () => {
      try {
        setLoadingRiskCards(true);
        const res = await axios.get(`${API_BASE_URL}/diseasepost`);
        const diseasesData = res.data?.diseases || res.data || [];

        const filteredAndMappedDiseases = diseasesData
          .filter(disease => disease.showHome === true && disease.isActive !== false)
          .map(disease => ({
            title: disease.name,
            text: disease.description ? `${disease.description.substring(0, 100)}...` : '', // Shorten description
            icon: getImageUrl(disease), // Use the helper function for image
            _id: disease._id, // Keep original ID for linking if needed
          }));
        setDynamicRiskCards(filteredAndMappedDiseases);
      } catch (err) {
        console.error("Failed to fetch diseases for home page:", err);
        setDynamicRiskCards([]); // Fallback to empty array on error
      } finally {
        setLoadingRiskCards(false);
      }
    };

    fetchDiseasesForHome();
  }, []);

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <main className="pdf-home-page">
        <HealthcareHero />

        {loadingFullBodyPackages ? (
          <p className="text-center py-4">Loading Full Body Health Checkups...</p>
        ) : (
          <ProductSection title={`Full Body Health Checkup in ${cityName}`} showBg={true} products={fullBodyPackages} />
        )}

        <section className="pdf-section">
          <div className="pdf-section-inner">
            <h2 className="pdf-center-title">Health Risk</h2>
            {loadingRiskCards ? (
              <p className="text-center py-4">Loading Health Risks...</p>
            ) : dynamicRiskCards.length === 0 ? (
              <p className="text-center py-4">No Health Risks to display.</p>
            ) : (
              <SliderShell>
                <div className="pdf-risk-grid">
                  {dynamicRiskCards.map((item) => {
                    // Icon is now always a string (URL) from getImageUrl
                    const IconSrc = item.icon;
                    return (
                      <article className="pdf-risk-card" key={item._id}>
                        <img
                          src={IconSrc}
                          alt={item.title}
                          className="pdf-risk-img-icon"
                          width="100"
                          height="100"
                          loading="lazy"
                          decoding="async"
                          style={{ width: '100px', height: '100px', display: 'block', margin: '0 auto' }}
                        />
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                        <a href={`/lab-tests?disease=${encodeURIComponent(item.title)}`}>View More</a>
                      </article>
                    );
                  })}
                </div>
              </SliderShell>
            )}
          </div>
        </section>

        {loadingWomenPackages ? (
          <p className="text-center py-4">Loading Women Health Tests...</p>
        ) : (
          <ProductSection title="Women Health Tests" products={womenHealthPackages} />
        )}

        {loadingMenPackages ? (
          <p className="text-center py-4">Loading Men Health Tests...</p>
        ) : (
          <ProductSection title="Men Health Tests" products={menHealthPackages} />
        )}

        <section className="pdf-section pdf-category-band">
  <div className="pdf-section-inner">
<h2 className="pdf-center-title">
  <span style={{ color: "#000000" }}>Health </span>
  <span style={{ color: "#07BEB8" }}>Category</span>
</h2>    {loadingHealthCategories ? (
      <p className="text-center py-4">Loading categories...</p>
    ) : healthCategories.length === 0 ? (
      <p className="text-center py-4">No categories available on home.</p>
    ) : (
      <SliderShell
        contentRef={null}
        onPrev={() => scrollCategories("left")}
        onNext={() => scrollCategories("right")}
      >
        <div
          className="pdf-slider-content"
          style={{ overflow: "hidden", width: "calc(4 * 256px + 3 * 30px)" }}
        >
          <div className="pdf-category-grid" ref={categorySliderRef}>
            {healthCategories.map((item) => (
              <a href={item.href} className="pdf-category-card" key={item.title}>
                <div className="pdf-category-icon-wrapper">
                  <img
                    className="pdf-category-icon"
                    src={item.imgUrl}
                    alt={item.title}
                    width="60"
                    height="60"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/100/12bdb8/ffffff?text=${encodeURIComponent(item.title)}`;
                    }}
                  />
                </div>
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </SliderShell>
    )}
  </div>
</section>

        <section className="pdf-section pdf-scan-section">
          <div className="pdf-section-inner">
            <h2 className="pdf-center-title">Radiology Scans & <span className="pdf-highlight">Imaging Tests</span></h2>
            <SliderShell>
              <div className="pdf-scan-grid">
                {scanCards.map((title) => (
                  <article className="pdf-scan-card" key={title}>
                    <img
                      src="/images/Homebanner.png"
                      alt={title}
                      width="360"
                      height="175"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <h3>{title}</h3>
                      
                      <a href="/download-report">VIEW ALL SCANS</a>
                    </div>
                  </article>
                ))}
              </div>
            </SliderShell>
          </div>
        </section>

        <section className="pdf-section pdf-process-section">
          <div className="pdf-section-inner">
            <h2 className="pdf-platform-title">Health Checkup <span>Journey</span></h2>
            <div className="pdf-process-grid">
              <div className="pdf-steps">
                {[
                  ["/images/Layer1.png", "Book with Ease", "Choose your test, time slot and book instantly."],
                  ["/images/Layer 2.png", "Hassle-Free Home Collection", "Safe & timely sample collection by trained phlebotomist"],
                  ["/images/Layer3.png", "Secure Sample Transfer to Labs", "Temperature-controlled & safe sample transportation to lab."],
                  ["/images/Layer4.png", "Quick & Easy Report Access", "Get your reports within 6 hours via WhatsApp, SMS and Email."],
                ].map(([iconSrc, title, text]) => (
                  <div className="pdf-step" key={title}>
                    <span>
                      <img
                        className="pdf-step-icon"
                        src={iconSrc}
                        alt=""
                        width="30"
                        height="30"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pdf-process-doctor">
                <img
                  src="/images/Doctor.png"
                  alt="Healthcare specialist"
                  width="420"
                  height="420"
                  loading="lazy"
                  decoding="async"
                />
                <div><FaStar /> Best Certified Team of Specialists</div>
              </div>
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-testimonial-section">
          <div className="pdf-section-inner">
            <h2 className="pdf-testimonial-title">
              <span>Patient Testimonials:</span>
              Hear from Those We’ve Cared For
            </h2>
            <div className="pdf-testimonial-grid">
              <article>
                <img
                  src="/images/Rectangle8.png"
                  alt="Linda A."
                  width="70"
                  height="70"
                  loading="lazy"
                  decoding="async"
                />
                <p>"After my knee surgery, the convenience of online consultations made my recovery smoother than I could have imagined."<br />- Linda A.</p>
              </article>
              <article>
                <img
                  src="/images/Rectangle8a.png"
                  alt="Henry B."
                  width="70"
                  height="70"
                  loading="lazy"
                  decoding="async"
                />
                <p>"Managing chronic conditions like diabetes requires a lot of vigilance, and the medicine refill system has simplified my life."<br />- Henry B.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-faq-section">
          <div className="pdf-section-inner pdf-faq-grid">
            <div>
              <span className="pdf-faq-pill">Frequently Asked Questions</span>
              <h2>Frequently Asked Questions</h2>
              <p>Find quick answers to common questions about our healthcare services and bookings.</p>
            </div>
            <div className="pdf-faq-list">
              <article className="open">
                <div><h3>What services do you offer?</h3><FaChevronUp /></div>
                <p>We provide a wide range of healthcare services including full body checkups, diagnostic tests, doctor consultations, and preventive health packages all designed to keep you healthy and informed.</p>
              </article>
              {[
                "How can I book a test or appointment?",
                "Are home sample collections available?",
                "How soon will I receive my reports?",
              ].map((item) => (
                <article key={item}>
                  <div><h3>{item}</h3><FaChevronDown /></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-blogs-section">
          <div className="pdf-section-inner">
            <h2 className="pdf-center-title">Our <span className="pdf-highlight">Blogs</span></h2>
            <div className="pdf-blogs-grid">
              {blogCards.map((title, index) => (
                <article className="pdf-blog-card" key={`${title}-${index}`}>
                  <img
                    src="/images/blog-blood-pressure.png"
                    alt={title}
                    width="385"
                    height="257"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3>{title}</h3>
                    <a href="/blogs">Read More</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

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
                  {isOpen && section.content && (
                    <p>{section.content}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pdf-home-footer-main">
            <div className="pdf-home-footer-brand">
              <h2>WELLO</h2>
              <span>Healthcare</span>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.
              </p>
            </div>

            <div style={{ width: '225px', height: '223px', opacity: 1 }}>
              <h3>Quick Links</h3>
              <a href="/about-us">About Us</a>
              <a href="/team">Our Teams</a>
              <a href="/lab-tests">Book your blood tests</a>
              <a href="/full-body-health-checkup">Full body health checkup</a>
              <a href="/download-report">Health scans</a>
            </div>

            <div style={{ width: '176px', height: '260px', opacity: 1 }}>
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
              <p><FaMapMarkerAlt /> <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</span></p>
              <p><FaPhoneAlt /> <span>0125767578574, 0124671754770</span></p>
              <p><FaEnvelope /> <span>info@otherdvc.com</span></p>
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
      </main>
    </>
  );
};

export default Home;
