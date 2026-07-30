"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaStar,
} from "react-icons/fa";
import Link from "next/link";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import HealthcareHero from "./HealthcareHero";
import HomePageFooter from "./HomePageFooter";
import { useLocation } from "../../Components/MainRoute/LocationContext";
import { API_BASE_URL, API_ORIGIN, toAssetUrl } from "../../utils/api";
import {
  extractApiArray,
  normalizeCityName,
} from "../../utils/cityApi";
import {
  isProductActive,
  isShownOnHome,
  isShownOnHomeDisease,
  productMatchesCity,
} from "../../utils/productVisibility";
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

const DEFAULT_BLOG_IMAGE = "/images/blog-blood-pressure.png";

const getBlogImageUrl = (image = "") => {
  if (!image || typeof image !== "string") return DEFAULT_BLOG_IMAGE;

  const normalizedImage = image.trim();
  if (!normalizedImage) return DEFAULT_BLOG_IMAGE;
  if (/^https?:\/\//i.test(normalizedImage)) return toAssetUrl(normalizedImage);
  if (normalizedImage.startsWith("/")) return toAssetUrl(normalizedImage);

  return `${API_ORIGIN}/uploads/${normalizedImage}`;
};

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
  const [homeBlogs, setHomeBlogs] = useState([]);
  const [loadingHomeBlogs, setLoadingHomeBlogs] = useState(true);
  const [homeTestimonials, setHomeTestimonials] = useState([]);
  const [homeFaqs, setHomeFaqs] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const categorySliderRef = useRef(null);
  const categoryOffsetRef = useRef(0);
  const categoryRafRef = useRef(null);
  const categoryLastTimeRef = useRef(0);
  const categoryHoverPausedRef = useRef(false);

  const CARD_W = 256;
  const CARD_GAP = 30;
  const CATEGORY_SCROLL_SPEED_PX_PER_SEC = 26;

  const getCategoryTrackWidth = () =>
    healthCategories.length * (CARD_W + CARD_GAP);

  const scrollCategories = (direction) => {
    const trackWidth = getCategoryTrackWidth();
    if (!trackWidth) return;

    const stride = CARD_W + CARD_GAP;
    categoryOffsetRef.current += direction === "left" ? -stride : stride;

    if (categoryOffsetRef.current < 0) {
      categoryOffsetRef.current += trackWidth;
    } else if (categoryOffsetRef.current >= trackWidth) {
      categoryOffsetRef.current -= trackWidth;
    }
  };

  useEffect(() => {
    categoryOffsetRef.current = 0;
    categoryLastTimeRef.current = 0;

    if (categorySliderRef.current) {
      categorySliderRef.current.style.transform = "translateX(0)";
    }
  }, [healthCategories]);

  useEffect(() => {
    if (loadingHealthCategories || healthCategories.length === 0) {
      return undefined;
    }

    const animate = (timestamp) => {
      if (!categoryLastTimeRef.current) {
        categoryLastTimeRef.current = timestamp;
      }

      const delta = timestamp - categoryLastTimeRef.current;
      categoryLastTimeRef.current = timestamp;
      const trackWidth = getCategoryTrackWidth();

      if (trackWidth > 0 && !categoryHoverPausedRef.current) {
        categoryOffsetRef.current += (CATEGORY_SCROLL_SPEED_PX_PER_SEC * delta) / 1000;

        if (categoryOffsetRef.current >= trackWidth) {
          categoryOffsetRef.current -= trackWidth;
        }
      }

      if (categorySliderRef.current) {
        categorySliderRef.current.style.transition = "none";
        categorySliderRef.current.style.transform = `translateX(-${categoryOffsetRef.current}px)`;
      }

      categoryRafRef.current = window.requestAnimationFrame(animate);
    };

    categoryRafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (categoryRafRef.current) {
        window.cancelAnimationFrame(categoryRafRef.current);
        categoryRafRef.current = null;
      }
      categoryLastTimeRef.current = 0;
    };
  }, [loadingHealthCategories, healthCategories]);

  useEffect(() => {
    const fetchHomeCategories = async () => {
      try {
        setLoadingHealthCategories(true);
        const res = await axios.get(`${API_BASE_URL}/categories`);
        const categoriesData = Array.isArray(res.data) ? res.data : [];
        const homeCats = categoriesData
          .filter((cat) => isTruthy(cat.status) && isShownOnHome(cat))
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

        const cityFiltered = productsArray.filter((product) => {
          return isProductActive(product) && productMatchesCity(product, location?.city || "");
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
          .filter((disease) => isShownOnHomeDisease(disease))
          .map(disease => ({
            title: disease.name,
            text: disease.description ? `${disease.description.substring(0, 100)}...` : '',
            icon: getImageUrl(disease),
            _id: disease._id,
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

  useEffect(() => {
    const fetchHomeBlogs = async () => {
      try {
        setLoadingHomeBlogs(true);
        const res = await axios.get(`${API_BASE_URL}/blogget-active`);
        const blogsData = extractApiArray(res.data);
        setHomeBlogs(blogsData.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch home blogs:", err);
        setHomeBlogs([]);
      } finally {
        setLoadingHomeBlogs(false);
      }
    };

    fetchHomeBlogs();
  }, []);

  useEffect(() => {
    const fetchCmsHome = async () => {
      try {
        const [faqRes, testRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/site-faqs`, { params: { home: true } }),
          axios.get(`${API_BASE_URL}/testimonials`, { params: { home: true } }),
        ]);
        setHomeFaqs(faqRes.data?.faqs || []);
        setHomeTestimonials(testRes.data?.testimonials || []);
      } catch (err) {
        console.error("Failed to fetch FAQ/testimonials:", err);
        setHomeFaqs([]);
        setHomeTestimonials([]);
      }
    };
    fetchCmsHome();
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
          className="pdf-slider-content pdf-category-slider-viewport"
          style={{ overflow: "hidden", width: "calc(4 * 256px + 3 * 30px)" }}
          onMouseEnter={() => {
            categoryHoverPausedRef.current = true;
          }}
          onMouseLeave={() => {
            categoryHoverPausedRef.current = false;
          }}
        >
          <div className="pdf-category-grid pdf-category-grid--continuous" ref={categorySliderRef}>
            {[...healthCategories, ...healthCategories].map((item, index) => (
              <a href={item.href} className="pdf-category-card" key={`${item.title}-${index}`}>
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
                      
                      <a href="/schedule-scan">VIEW ALL SCANS</a>
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
              {(homeTestimonials.length > 0
                ? homeTestimonials
                : [
                    {
                      _id: "fallback-1",
                      name: "Linda A.",
                      quote:
                        "After my knee surgery, the convenience of online consultations made my recovery smoother than I could have imagined.",
                      image: "/images/Rectangle8.png",
                    },
                    {
                      _id: "fallback-2",
                      name: "Henry B.",
                      quote:
                        "Managing chronic conditions like diabetes requires a lot of vigilance, and the medicine refill system has simplified my life.",
                      image: "/images/Rectangle8a.png",
                    },
                  ]
              ).map((item) => (
                <article key={item._id}>
                  <img
                    src={item.image || "/images/Rectangle8.png"}
                    alt={item.name}
                    width="70"
                    height="70"
                    loading="lazy"
                    decoding="async"
                  />
                  <p>
                    &quot;{item.quote}&quot;
                    <br />- {item.name}
                  </p>
                </article>
              ))}
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
              {(homeFaqs.length > 0
                ? homeFaqs
                : [
                    {
                      _id: "f1",
                      question: "What services do you offer?",
                      answer:
                        "We provide a wide range of healthcare services including full body checkups, diagnostic tests, doctor consultations, and preventive health packages all designed to keep you healthy and informed.",
                    },
                    {
                      _id: "f2",
                      question: "How can I book a test or appointment?",
                      answer: "",
                    },
                    {
                      _id: "f3",
                      question: "Are home sample collections available?",
                      answer: "",
                    },
                    {
                      _id: "f4",
                      question: "How soon will I receive my reports?",
                      answer: "",
                    },
                  ]
              ).map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <article
                    key={item._id}
                    className={isOpen ? "open" : undefined}
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <h3>{item.question}</h3>
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {isOpen && item.answer ? <p>{item.answer}</p> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-blogs-section">
          <div className="pdf-section-inner">
            <h2 className="pdf-center-title">Our <span className="pdf-highlight">Blogs</span></h2>
            {loadingHomeBlogs ? (
              <p className="text-center py-4">Loading blogs...</p>
            ) : homeBlogs.length === 0 ? (
              <div className="pdf-blogs-grid">
                {blogCards.map((title, index) => (
                  <article className="pdf-blog-card" key={`${title}-${index}`}>
                    <img
                      src={DEFAULT_BLOG_IMAGE}
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
            ) : (
              <div className="pdf-blogs-grid">
                {homeBlogs.map((blog) => (
                  <article className="pdf-blog-card" key={blog._id}>
                    <img
                      src={getBlogImageUrl(
                        blog.imageUrl ||
                          blog.image ||
                          blog.thumbnail ||
                          blog.bannerImage ||
                          blog.coverImage
                      )}
                      alt={blog.name || "Blog"}
                      width="385"
                      height="257"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_BLOG_IMAGE;
                      }}
                    />
                    <div>
                      <h3>{blog.name}</h3>
                      <a href={`/blog/${blog._id}`}>Read More</a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <HomePageFooter />
      </main>
    </>
  );
};

export default Home;
