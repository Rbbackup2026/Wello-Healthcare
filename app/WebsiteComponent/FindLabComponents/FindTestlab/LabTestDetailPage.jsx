"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "../../../lib/routerCompat";
import TopBar from "../../Homecomponents/TopBar";
import Navbar from "../../Homecomponents/Navbar";
import Footer from "../../Homecomponents/Footer";
import reportIcon from "../../../../public/images/reporticon.png";
import appointmentIcon from "../../../../public/images/appointmenticon.png";
import bookingHelpIcon from "../../../../public/images/bookingHelpIcon.png";
import { useCart } from "../../../Components/MainRoute/CartContext";
import { useLocation } from "../../../Components/MainRoute/LocationContext";
import {
  fetchCityCollection,
  filterProductsByCity,
  mapApiProduct,
} from "../../../utils/cityApi";
import { replaceCityText } from "../../../utils/locationText";
import { toast } from "react-toastify";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const TestDetailPage = () => {
  const { city, testName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { location } = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const routeCityName = decodeURIComponent(city || "");
  const activeCityName =
    location.city || location.formattedAddress || routeCityName || "Delhi";

  const normalizeFaqs = (faqs) => {
    if (Array.isArray(faqs)) {
      return faqs
        .filter((faq) => {
          if (!faq) return false;
          const question = faq.question || faq.q || faq.title || faq.label || "";
          const answer = faq.answer || faq.a || faq.value || faq.content || "";
          return (
            (question && String(question).trim().length > 0) ||
            (answer && String(answer).trim().length > 0)
          );
        })
        .map((faq) => ({
          question: faq.question || faq.q || faq.title || faq.label || "",
          answer: faq.answer || faq.a || faq.value || faq.content || "",
        }));
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

  const descriptionText = replaceCityText(
    product?.description ||
      product?.raw?.description ||
      product?.raw?.descrption ||
      product?.raw?.desc ||
      product?.raw?.details ||
      product?.raw?.test_description ||
      "",
    location.city,
    [product?.city, product?.raw?.city, city, product?.raw?.lab?.city]
  );

  const hasDescription =
    descriptionText &&
    String(descriptionText).replace(/<[^>]*>/g, "").trim().length > 0;

  const rawFaqs =
    product?.faqs ||
    product?.faq ||
    product?.raw?.faqs ||
    product?.raw?.faq ||
    product?.raw?.questions ||
    product?.raw?.qa ||
    [];

  const productFaqs = normalizeFaqs(rawFaqs);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const response = await fetchCityCollection("get_product", activeCityName);
        if (!isMounted) return;

        const cityMatchedProducts =
          filterProductsByCity(response, activeCityName) || [];
        const mapped = Array.isArray(cityMatchedProducts)
          ? cityMatchedProducts.map(mapApiProduct)
          : [];

        const found = mapped.find(
          (p) =>
            p.name.toLowerCase() === decodeURIComponent(testName).toLowerCase()
        );

        if (found) {
          setProduct(found);
        } else {
          setError(`This test is not available in ${activeCityName}.`);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        if (isMounted) setError("Could not load test details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [activeCityName, testName]);

  const buildCartItem = (product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    tests: product.tests,
    type: product.type,
    city: activeCityName,
  });

  const handleAddToCart = () => {
    addToCart(buildCartItem(product));
    toast.success(`${product.name} added to cart`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
  };

  const handleBookNow = () => {
    addToCart(buildCartItem(product));
    toast.success(`${product.name} added. Continue booking from cart.`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
    navigate("/cart_section");
  };

  const discount =
    product?.oldPrice > 0
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  const includedTests = product?.tests || product?.testCount || 1;
  const faqCityName =
    location.city || location.formattedAddress || activeCityName || "your city";

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <div className="wello-main-content lab-test-detail-page">
        <div className="lab-test-detail-container">
          {loading && (
            <div className="lab-test-detail-loading">
              Loading test details...
            </div>
          )}

          {error && (
            <div className="lab-test-detail-error">
              {error}
            </div>
          )}

          {!loading && product && (
            <>
              <div className="lab-test-detail-grid">
                <main>
                <div className="lab-test-detail-hero">
                  <div>
                    <h1 className="lab-test-detail-title">
                      {product.name}{" "}
                      <span>in {activeCityName}</span>
                    </h1>
                    <span className="lab-test-detail-count">
                      Includes {includedTests} Test
                      {Number(includedTests) > 1 ? "s" : ""}
                    </span>
                  </div>

                  {discount && (
                    <span className="lab-test-detail-discount">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <section className="lab-test-detail-card">
                  <details open className="lab-test-detail-accordion">
                    <summary className="lab-test-detail-section-heading">
                      Requisites
                      <ChevronDown className="lab-test-detail-chevron" />
                    </summary>

                    <div className="lab-test-requisites-grid">
                      <div className="lab-test-requisite-item">
                        <span className="lab-test-requisite-icon">
                          <img
                            src={reportIcon.src}
                            alt="Report"
                            className="lab-test-requisite-icon-img"
                          />
                        </span>
                        <div>
                          <p className="lab-test-requisite-title">
                            Get Online Reports
                          </p>
                          <p className="lab-test-requisite-text">
                            Get Access to your reports on WhatsApp/Dashboard
                          </p>
                        </div>
                      </div>

                      <div className="lab-test-requisite-item">
                        <span className="lab-test-requisite-icon">
                          <img
                            src={appointmentIcon.src}
                            alt="Appointment"
                            className="lab-test-requisite-icon-img"
                          />
                        </span>
                        <div>
                          <p className="lab-test-requisite-title">
                            Online Appointment
                          </p>
                          <p className="lab-test-requisite-text">
                            Book Appointment Online for on-time investigation
                          </p>
                        </div>
                      </div>
                    </div>
                  </details>
                </section>

                <details open className="lab-test-detail-description">
                  <summary className="lab-test-detail-description-heading">
                    Description
                    <ChevronDown className="lab-test-detail-chevron" />
                  </summary>
                  <div className="lab-test-detail-description-content">
                    {hasDescription ? (
                      <div
                        className="lab-test-detail-description-html"
                        dangerouslySetInnerHTML={{ __html: descriptionText }}
                      />
                    ) : (
                      <p>
                        Detailed information for this test will be available
                        soon.
                      </p>
                    )}
                  </div>
                </details>

                <details className="lab-test-detail-remark">
                  <summary className="lab-test-detail-remark-heading">
                    Test Remark
                    <ChevronRight className="lab-test-detail-remark-icon" />
                  </summary>
                  <div className="lab-test-detail-remark-content">
                    {product.type && (
                      <p>
                        Type: <span>{product.type}</span>
                      </p>
                    )}
                    {product.category && (
                      <p>
                        Category:{" "}
                        <span>{product.category}</span>
                      </p>
                    )}
                    {!product.type && !product.category && (
                      <p>No special remark available for this test.</p>
                    )}
                  </div>
                </details>
                </main>

                <aside className="lab-test-detail-sidebar">
                <div className="lab-test-price-card">
                  <div className="lab-test-price-row">
                    <p className="lab-test-price">
                      Rs. {product.price?.toLocaleString() || 0}
                    </p>
                    {product.oldPrice > 0 && (
                      <p className="lab-test-old-price">
                        Rs. {product.oldPrice?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="lab-test-add-cart"
                  >
                    ADD TO CART
                    <ChevronRight className="lab-test-button-icon" />
                  </button>

                  <p className="lab-test-price-note">
                    * inclusive of all the taxes, fees and subject to
                    availability
                  </p>
                </div>

                <div className="lab-test-help-card">
                  <div className="lab-test-help-head">
                    <div>
                      <h2>
                        Need help with booking your test?
                      </h2>
                      <p>
                        Our experts are here to help you
                      </p>
                    </div>
                    <img
                      src={bookingHelpIcon.src}
                      alt="Support"
                      className="lab-test-help-image"
                    />
                  </div>

                  <div className="lab-test-help-contact">
                    <a
                      href="https://wa.me/911246712321"
                      target="_blank"
                      rel="noreferrer"
                      className="lab-test-help-number"
                    >
                      <span className="lab-test-help-contact-icon">
                        <FaPhoneAlt />
                      </span>
                      +91-124-6712321
                    </a>
                    <p>
                      Whatsapp Chat with WELLO Expert
                    </p>
                    <a
                      href="tel:+918568988847"
                      className="lab-test-help-number"
                    >
                      <span className="lab-test-help-contact-icon">
                        <FaWhatsapp />
                      </span>
                      +91-8568988847
                    </a>
                  </div>
                </div>

                <div className="lab-test-detail-actions">
                  <button
                    onClick={() => navigate(-1)}
                    className="lab-test-back-button"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleBookNow}
                    className="lab-test-book-button"
                  >
                    Book Now
                  </button>
                </div>
                </aside>
              </div>

              {productFaqs.length > 0 && (
                <section className="lab-test-faq-section">
                  <div className="lab-test-faq-info">
                    <span className="lab-test-faq-pill">
                      Frequently Asked Questions
                    </span>
                    <h2>
                      Frequently Asked Questions for {product.name} in{" "}
                      {faqCityName}
                    </h2>
                    <p>
                      Find quick answers to common questions about our
                      healthcare services and bookings.
                    </p>
                  </div>

                  <div className="lab-test-faq-list">
                    {productFaqs.map((faq, index) => (
                      <details
                        key={`${faq.question}-${index}`}
                        className="lab-test-faq-item"
                        open={index === 0}
                      >
                        <summary className="lab-test-faq-question">
                          <span>{faq.question || "Question"}</span>
                          <ChevronDown className="lab-test-faq-icon" />
                        </summary>
                        <div className="lab-test-faq-answer">
                          {faq.answer || "Answer will be available soon."}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TestDetailPage;
