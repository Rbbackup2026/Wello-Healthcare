"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation as useRouterLocation, useNavigate } from "../../../lib/routerCompat";
import {
  FaCalendarCheck,
  FaChevronRight,
  FaClipboardList,
  FaFileMedical,
  FaSearch,
} from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import TopBar from "../../Homecomponents/TopBar";
import Navbar from "../../Homecomponents/Navbar";
import HomePageFooter from "../../Homecomponents/HomePageFooter";
import { useLocation } from "../../../Components/MainRoute/LocationContext";
import { useCart } from "../../../Components/MainRoute/CartContext";
import {
  extractApiArray,
  fetchCityCollection,
  filterProductsByCity,
  mapApiProduct,
} from "../../../utils/cityApi";
import { API_BASE_URL, toApiUrl } from "../../../utils/api";
import {
  isProductActive,
  isRadiologyProduct,
  productMatchesCity,
} from "../../../utils/productVisibility";
import { toast } from "react-toastify";
import DisplayPageBanner from "../../Shared/DisplayPageBanner";
import { withProductDemographics } from "../../../utils/cartItemMeta";

const BOOKING_STEPS = [
  {
    icon: FaSearch,
    title: "Search & Add Your Scan",
    text: "Browse radiology scans and imaging tests available in your city.",
  },
  {
    icon: FaCalendarCheck,
    title: "Book Appointment",
    text: "Choose your preferred slot and imaging centre for the scan.",
  },
  {
    icon: FaFileMedical,
    title: "Get Reports Online",
    text: "Access your radiology reports securely from your account.",
  },
];

const getCategoryLabel = (product = {}) => {
  const category = product.category;
  if (!category) return "Radiology";
  if (typeof category === "string") return category;
  if (typeof category === "object") return category.name || "Radiology";
  return "Radiology";
};

const ScheduleScanPage = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { location, locationLabel } = useLocation();
  const { addToCart } = useCart();
  const cityName = locationLabel || location?.city || "Gurugram";

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const categoryFromUrl = params.get("category");
    setSelectedCategory(categoryFromUrl ? decodeURIComponent(categoryFromUrl) : "");
  }, [routerLocation.search]);

  useEffect(() => {
    let isMounted = true;

    const loadRadiologyScans = async () => {
      setLoading(true);
      setError("");

      try {
        const [productResponse, departmentResponse] = await Promise.all([
          fetchCityCollection("get_product", location.city),
          axios.get(`${API_BASE_URL}/get-departments`),
        ]);

        if (!isMounted) return;

        const departmentRecords =
          departmentResponse.data?.departments ||
          extractApiArray(departmentResponse.data) ||
          [];

        let cityMatchedProducts =
          filterProductsByCity(productResponse, location.city) || [];

        if (cityMatchedProducts.length === 0 && productResponse.length > 0) {
          cityMatchedProducts = productResponse;
        }

        const radiologyProducts = cityMatchedProducts
          .filter(
            (product) =>
              isProductActive(product) &&
              productMatchesCity(product, location.city) &&
              isRadiologyProduct(product, departmentRecords)
          )
          .map((product, index) => mapApiProduct(product, index, location.city));

        setProducts(radiologyProducts);
      } catch (fetchError) {
        console.error("Failed to fetch radiology scans:", fetchError);

        if (!isMounted) return;

        try {
          const [fallbackProductsRes, departmentResponse] = await Promise.all([
            fetch(toApiUrl("/get_product")),
            axios.get(`${API_BASE_URL}/get-departments`),
          ]);

          const fallbackPayload = await fallbackProductsRes.json();
          const departmentRecords =
            departmentResponse.data?.departments ||
            extractApiArray(departmentResponse.data) ||
            [];

          const fallbackProducts = extractApiArray(fallbackPayload)
            .filter(
              (product) =>
                isProductActive(product) &&
                productMatchesCity(product, location.city) &&
                isRadiologyProduct(product, departmentRecords)
            )
            .map((product, index) => mapApiProduct(product, index, location.city));

          setProducts(fallbackProducts);
          setError("");
        } catch (fallbackError) {
          console.error("Failed to fetch fallback radiology scans:", fallbackError);
          setProducts([]);
          setError("Radiology scans could not be loaded right now. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRadiologyScans();

    return () => {
      isMounted = false;
    };
  }, [location.city]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => getCategoryLabel(product)).filter(Boolean)),
    ];
    return uniqueCategories.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryLabel = getCategoryLabel(product);
      const matchesCategory =
        !selectedCategory ||
        categoryLabel.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleCategoryChange = (category) => {
    const nextCategory =
      selectedCategory.toLowerCase() === category.toLowerCase() ? "" : category;

    setSelectedCategory(nextCategory);

    if (nextCategory) {
      navigate(`/schedule-scan?category=${encodeURIComponent(nextCategory)}`, {
        replace: true,
      });
      return;
    }

    navigate("/schedule-scan", { replace: true });
  };

  const buildCartItem = (product) =>
    withProductDemographics(
      {
        id: product.id,
        _id: product.id,
        name: product.name,
        price: Number(product.raw?.schedulePrice || product.price || 0),
        category: getCategoryLabel(product),
        tests: product.tests,
        type: product.type || "Scan",
        city: location.city,
      },
      product.raw || product
    );

  const handleAddToCart = (product) => {
    addToCart(buildCartItem(product));
    toast.success(`${product.name} added to cart`, {
      position: "top-right",
      autoClose: 2000,
      theme: "colored",
    });
  };

  const openProductDetail = (product) => {
    navigate(
      `/schedule-scan/${encodeURIComponent((location?.city || "").toLowerCase())}/${encodeURIComponent(product.name)}`
    );
  };

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <main className="schedule-scan-page">
        <DisplayPageBanner
          display="radiology"
          city={location?.city}
          categoryName={selectedCategory}
          className="schedule-scan-page-banner"
        />

        <section className="schedule-scan-hero">
          <div className="schedule-scan-hero-inner">
            <nav className="schedule-scan-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <FaChevronRight aria-hidden="true" />
              <span>Radiology Scans</span>
            </nav>

            <h1>
              Radiology Scans &amp; Imaging Tests in{" "}
              <span>{cityName}</span>
            </h1>
            <p>
              Book MRI, CT Scan, Ultrasound, X-Ray and advanced imaging tests online.
              NABH accredited centres with reliable reports.
            </p>

            <div className="schedule-scan-search">
              <FaSearch aria-hidden="true" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search radiology scan or imaging test"
              />
            </div>
          </div>
        </section>

        <section className="schedule-scan-steps">
          <div className="schedule-scan-steps-inner">
            {BOOKING_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article className="schedule-scan-step-card" key={step.title}>
                  <span className="schedule-scan-step-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="schedule-scan-content">
          <div className="flex p-6 gap-6 lab-tests-layout schedule-scan-layout">
            <aside className="w-64 space-y-6 lab-tests-sidebar schedule-scan-sidebar">
              <div className="schedule-scan-panel">
                <h2>
                  <FaClipboardList aria-hidden="true" />
                  Filter By Category
                </h2>

                {selectedCategory ? (
                  <div className="schedule-scan-active-filter">
                    <span>{selectedCategory}</span>
                    <button type="button" onClick={() => handleCategoryChange(selectedCategory)}>
                      Clear
                    </button>
                  </div>
                ) : null}

                <div className="schedule-scan-filter-list">
                  {categories.length === 0 ? (
                    <p>No radiology categories found for {cityName}.</p>
                  ) : (
                    categories.map((category) => (
                      <label key={category} className="schedule-scan-filter-item">
                        <input
                          type="checkbox"
                          checked={
                            selectedCategory.toLowerCase() === category.toLowerCase()
                          }
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span>{category}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="schedule-scan-panel schedule-scan-info-panel">
                <h3>Our Imaging Services</h3>
                <p>
                  MRI, CT Scan, Ultrasound, X-Ray, Mammography and more advanced
                  imaging tests available at trusted partner centres.
                </p>
                <Link href="/download-report">Download Reports</Link>
              </div>
            </aside>

            <div className="flex-1 schedule-scan-main">
              <div className="schedule-scan-main-head">
                <h2>
                  {selectedCategory
                    ? `${selectedCategory} in ${cityName}`
                    : `Popular Radiology Tests & Packages`}
                </h2>
                <p>
                  {loading ? "Loading scans..." : `${filteredProducts.length} scans found`}
                </p>
              </div>

              {error ? <div className="schedule-scan-error">{error}</div> : null}

              <div className="pdf-product-grid schedule-scan-product-grid">
                {filteredProducts.map((scan) => {
                  const displayPrice = Number(
                    scan.raw?.schedulePrice || scan.price || 0
                  );
                  const displayMrp = Number(scan.oldPrice || scan.raw?.mrp || 0);
                  const reportingTime =
                    scan.raw?.reportingTime || scan.raw?.reportTime || "12 hours";
                  const testCount = scan.tests || scan.raw?.testCount || 1;
                  const discountLabel =
                    displayMrp > displayPrice
                      ? `${Math.round((1 - displayPrice / displayMrp) * 100)}% OFF`
                      : "50% OFF";

                  return (
                    <article
                      key={scan.id}
                      className="pdf-product-card schedule-scan-product-card"
                      onClick={() => openProductDetail(scan)}
                    >
                      <div className="pdf-product-head">
                        <h3>{scan.name}</h3>
                        <span>{scan.type || "Package"}</span>
                      </div>
                      <div className="pdf-price-row">
                        {displayMrp > displayPrice ? <del>₹{displayMrp}</del> : <del>₹7,000</del>}
                        <strong>₹{displayPrice}</strong>
                        <span>{discountLabel}</span>
                      </div>
                      <div
                        className="pdf-product-body"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="pdf-product-meta">
                          <div>
                            <p>
                              <img
                                src="/images/Parameter.png"
                                alt=""
                                className="pdf-product-feature-icon"
                                aria-hidden="true"
                              />
                              <strong>{testCount} Parameters</strong>
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
                            <small>{reportingTime}</small>
                          </div>
                        </div>
                        <div className="pdf-product-actions">
                          <button
                            type="button"
                            className="pdf-know-more"
                            onClick={() => openProductDetail(scan)}
                          >
                            + Know More
                          </button>
                          <button
                            type="button"
                            className="pdf-add-cart"
                            onClick={() => handleAddToCart(scan)}
                          >
                            Schedule Scan
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {!loading && filteredProducts.length === 0 ? (
                <div className="schedule-scan-empty">
                  <h3>No radiology scans found</h3>
                  <p>
                    Radiology scans for {cityName} are not available right now. Please
                    check again later or contact support.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <HomePageFooter />
    </>
  );
};

export default ScheduleScanPage;
