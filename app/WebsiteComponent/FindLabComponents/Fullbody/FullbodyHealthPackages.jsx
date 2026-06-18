"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch,
} from "react-icons/fa";
import { Link, useNavigate } from "../../../lib/routerCompat";
import TopBar from "../../Homecomponents/TopBar";
import Navbar from "../../Homecomponents/Navbar";
import Footer from "../../Homecomponents/Footer";
import { useCart } from "../../../Components/MainRoute/CartContext";
import { useLocation } from "../../../Components/MainRoute/LocationContext";
import { API_BASE_URL, API_ORIGIN } from "../../../utils/api";
import { toast } from "react-toastify";

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return ["true", "yes", "active", "1"].includes(normalized);
  }
  if (typeof value === "number") return value === 1;
  return false;
};

const getPackagePrice = (pkg) => Number(pkg.price || pkg.newPrice || 0);
const getPackageMrp = (pkg) => Number(pkg.mrp || pkg.oldPrice || 0);
const getPackageTestCount = (pkg) => pkg.testCount || pkg.tests || "Multiple";
const FULL_BODY_CATEGORY_NAME = "Full Body Health Checkup";

const getCategoryDescription = (category) =>
  category?.pagedescription ||
  category?.pageDescription ||
  category?.description ||
  "";

const buildCategoryImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  if (image.startsWith("/")) return `${API_ORIGIN}${image}`;
  return `${API_ORIGIN}/uploads/${image}`;
};

const getCategoryBannerUrl = (category) =>
  buildCategoryImageUrl(
    category?.bannerimg ||
      category?.bannerImg ||
      category?.bannerImage ||
      category?.bannerImageUrl ||
      category?.imageUrl
  );

const hasDescriptionContent = (description) =>
  String(description || "").replace(/<[^>]*>/g, "").trim().length > 0;

const descriptionSectionTitles = [
  "Seeing Inside Your Body Without Radiation",
  "What You Will Experience",
];

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const injectCityIntoDescription = (description, cityName) =>
  String(description || "")
    .replace(/\{\{\s*city\s*\}\}/gi, cityName)
    .replace(/\{\s*city\s*\}/gi, cityName)
    .replace(/\[\s*city\s*\]/gi, cityName)
    .replace(/\b(in|at|near)\s+city\b/gi, (_, prefix) => `${prefix} ${cityName}`);

const formatCategoryDescription = (description, cityName) => {
  let html = injectCityIntoDescription(description, cityName).trim();
  if (!html) return "";

  const guideTitle = `Your Guide to Scans in ${cityName}`;
  html = html.replace(
    new RegExp(escapeRegex(guideTitle), "i"),
    `<span class="fb-description-highlight">${guideTitle}</span>`
  );

  descriptionSectionTitles.forEach((title) => {
    const escapedTitle = escapeRegex(title);
    const headingPattern = new RegExp(
      `<h[1-6][^>]*>\\s*${escapedTitle}\\s*</h[1-6]>`,
      "i"
    );
    const strongPattern = new RegExp(
      `<(?:strong|b)[^>]*>\\s*${escapedTitle}\\s*</(?:strong|b)>`,
      "i"
    );
    const paragraphPattern = new RegExp(
      `<p[^>]*>\\s*${escapedTitle}\\s*</p>`,
      "i"
    );

    if (headingPattern.test(html) || strongPattern.test(html)) return;

    if (paragraphPattern.test(html)) {
      html = html.replace(paragraphPattern, `<h3>${title}</h3>`);
      return;
    }

    html = html.replace(
      new RegExp(escapedTitle, "i"),
      `</p><h3>${title}</h3><p>`
    );
  });

  if (!/^\s*</.test(html)) html = `<p>${html}`;
  if (!/>\s*$/.test(html)) html = `${html}</p>`;
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
};

const normalizeFaqs = (faqs) => {
  if (Array.isArray(faqs)) {
    return faqs
      .map((faq) => ({
        question: faq?.question || faq?.q || faq?.title || "",
        answer: faq?.answer || faq?.a || faq?.content || "",
      }))
      .filter((faq) => faq.question.trim() || faq.answer.trim());
  }

  if (typeof faqs === "string") {
    try {
      return normalizeFaqs(JSON.parse(faqs));
    } catch {
      return [];
    }
  }

  return [];
};

const FullbodyHealthPackages = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { location } = useLocation();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [packages, setPackages] = useState([]);
  const [categoryBannerUrl, setCategoryBannerUrl] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const cityName = location?.city || "Gurugram";

  useEffect(() => {
    const fetchFullBodyPackages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/get_product`);
        const allItems = extractItems(res.data);
        const filtered = allItems.filter((product) => {
          const matchesFullBody =
            isTruthy(product.showFullBodyHealthCheckup) ||
            isTruthy(product.showFullBody);
          const isActive =
            isTruthy(product.isActive) || isTruthy(product.status);
          const matchesCity =
            !location?.city ||
            !product.city ||
            product.city.toLowerCase() === location.city.toLowerCase();
          return matchesFullBody && isActive && matchesCity;
        });
        setPackages(filtered);
      } catch (err) {
        console.error("Error fetching full body packages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullBodyPackages();
  }, [location]);

  useEffect(() => {
    const fetchFullBodyCategory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        const categoryData = Array.isArray(res.data) ? res.data : [];
        const fullBodyCategory = categoryData.find(
          (category) =>
            (category.name || "").trim().toLowerCase() ===
            FULL_BODY_CATEGORY_NAME.toLowerCase()
        );
        setCategoryBannerUrl(getCategoryBannerUrl(fullBodyCategory));
        setCategoryDescription(
          formatCategoryDescription(
            getCategoryDescription(fullBodyCategory),
            cityName
          )
        );
        setCategoryFaqs(
          normalizeFaqs(fullBodyCategory?.faqs || fullBodyCategory?.faq)
        );
      } catch (err) {
        console.error("Error fetching full body category description:", err);
        setCategoryBannerUrl("");
        setCategoryDescription("");
        setCategoryFaqs([]);
      }
    };
    fetchFullBodyCategory();
  }, [cityName]);

  const buildCartItem = (pkg, idx) => ({
    id: `fullbody-${idx}-${pkg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: pkg.name,
    price: pkg.price || pkg.newPrice,
    oldPrice: pkg.mrp || pkg.oldPrice,
    tests: pkg.testCount || pkg.tests,
    category: "Full Body Health Checkup",
    type: "package",
    city: location?.city,
  });

  const handleAddToCart = (pkg, idx) => {
    addToCart(buildCartItem(pkg, idx));
    toast.success(`${pkg.name} added to cart`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
  };

  const handleBookNow = (pkg, idx) => {
    addToCart(buildCartItem(pkg, idx));
    toast.success(`${pkg.name} added. Continue booking from cart.`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
    navigate("/cart_section");
  };

  const filteredPackages = packages
    .filter((pkg) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return [pkg.name, pkg.category, pkg.itemType, pkg.description]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query));
    })
    .sort((left, right) => {
      const leftName = String(left.name || "").toLowerCase();
      const rightName = String(right.name || "").toLowerCase();
      const leftPrice = getPackagePrice(left);
      const rightPrice = getPackagePrice(right);

      switch (sortBy) {
        case "name-asc":
          return leftName.localeCompare(rightName);
        case "name-desc":
          return rightName.localeCompare(leftName);
        case "price-asc":
          return leftPrice - rightPrice;
        case "price-desc":
          return rightPrice - leftPrice;
        default:
          return 0;
      }
    });

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <div className="pdf-fullbody-section fb-page-section pb-12">
        <div className="pdf-section-inner fb-layout-wrapper">
          <main className="fb-main">
            {categoryBannerUrl && (
              <section className="fb-category-banner">
                <img
                  src={categoryBannerUrl}
                  alt={`${FULL_BODY_CATEGORY_NAME} banner`}
                  onError={() => setCategoryBannerUrl("")}
                />
              </section>
            )}

            {/* 1. Heading + Search + Sort */}
            <div className="fb-package-topbar">
              <h1>
                Full Body Health Checkup <span>in {cityName}</span>
              </h1>
              <div className="fb-package-controls">
                <div className="fb-package-sort">
                  <label htmlFor="fb-sort-by">Sort by</label>
                  <select
                    id="fb-sort-by"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sort packages"
                  >
                    <option value="default">Default</option>
                    <option value="name-asc">A-Z</option>
                    <option value="name-desc">Z-A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
                <div className="fb-package-search">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Find Your Test/Package/Scans"
                    aria-label="Search full body health packages"
                  />
                  <FaSearch aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* 2. Package Cards */}
            <div className="pdf-product-grid">
              {loading ? (
                <div className="fb-loading-state">Loading packages...</div>
              ) : filteredPackages.length === 0 ? (
                <div className="fb-loading-state">
                  No Full Body Health Checkups found.
                </div>
              ) : (
                filteredPackages.map((pkg, idx) => {
                  const price = getPackagePrice(pkg);
                  const mrp = getPackageMrp(pkg);

                  return (
                    <article key={pkg._id || idx} className="pdf-product-card">

                      {/* Teal Header */}
                      <div className="pdf-product-head">
                        <h3>{pkg.name}</h3>
                        <span>Package</span>
                      </div>

                      {/* Price Row */}
                      <div className="pdf-price-row">
                        {mrp > price && <del>₹{mrp.toLocaleString()}</del>}
                        <strong>₹{price.toLocaleString()}</strong>
                        {pkg.discount && (
                          <span className="pdf-discount-badge">
                            {pkg.discount}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="pdf-product-body">
                        <div className="pdf-product-meta">
                          <div>
                            <p>
                              <img
                                src="/images/Parameter.png"
                                alt=""
                                className="pdf-product-feature-icon"
                                aria-hidden="true"
                              />
                              <strong>{getPackageTestCount(pkg)} Parameters</strong>
                            </p>
                            <small>Included</small>
                          </div>

                          <div>
                            <p>
                              <img
                                src="/images/Report.png"
                                alt=""
                                className="pdf-product-feature-icon"
                                aria-hidden="true"
                              />
                              <strong>Reports in</strong>
                            </p>
                            <small>12 hours</small>
                          </div>
                        </div>

                        <div className="pdf-product-actions">
                          <Link className="pdf-know-more" to={`/product/${pkg._id}`}>
                            + Know More
                          </Link>

                          <button
                            className="pdf-add-cart"
                            onClick={() => handleAddToCart(pkg, idx)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>

                    </article>
                  );
                })
              )}
            </div>

            {/* 3. Category Description - cards ke BAAD */}
            {hasDescriptionContent(categoryDescription) && (
              <section className="fb-category-description">
                <div
                  className={`fb-category-description-content ${
                    descriptionExpanded ? "is-expanded" : "is-collapsed"
                  }`}
                  dangerouslySetInnerHTML={{ __html: categoryDescription }}
                />
                <button
                  type="button"
                  className="fb-description-read-more"
                  onClick={() => setDescriptionExpanded((current) => !current)}
                >
                  {descriptionExpanded ? "Read Less.." : "Read More.."}
                </button>
              </section>
            )}

            {categoryFaqs.length > 0 && (
              <section className="fb-category-faq">
                <div className="fb-category-faq-heading">
                  <span>Frequently Asked Questions</span>
                  <h2>
                    Frequently Asked Questions for Full Body Health Checkup in{" "}
                    {cityName}
                  </h2>
                  <p>
                    Find quick answers to common questions about our healthcare
                    services and bookings.
                  </p>
                </div>
                <div className="fb-category-faq-list">
                  {categoryFaqs.map((faq, index) => (
                    <details
                      key={`${faq.question}-${index}`}
                      className="fb-category-faq-item"
                      open={index === 0}
                    >
                      <summary>
                        <span>{faq.question || "Question"}</span>
                      </summary>
                      <p>{faq.answer || "Answer will be available soon."}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default FullbodyHealthPackages;
