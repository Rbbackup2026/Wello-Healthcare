"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation as useRouterLocation, useNavigate } from "../../../lib/routerCompat";
import TopBar from "../../Homecomponents/TopBar";
import Navbar from "../../Homecomponents/Navbar";
import Footer from "../../Homecomponents/Footer";
import { useLocation } from "../../../Components/MainRoute/LocationContext";
import { useCart } from "../../../Components/MainRoute/CartContext";
import {
  fetchCityCollection,
  filterProductsByCity,
  extractApiArray,
  mapApiProduct,
} from "../../../utils/cityApi";
import { toApiUrl } from "../../../utils/api";
import { toast } from "react-toastify";
import { FaMicroscope, FaRegClock } from "react-icons/fa";

const FULL_BODY_CATEGORY_NAME = "Full Body Health Checkup";

const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "active" || normalized === "1";
  }
  if (typeof value === "number") return value === 1;
  return false;
};

const isFullBodyProduct = (product) =>
  isTruthy(product?.raw?.showFullBodyHealthCheckup) ||
  isTruthy(product?.raw?.showFullBody) ||
  (product?.category || "").toLowerCase() === FULL_BODY_CATEGORY_NAME.toLowerCase();

// ✅ Test Detail Modal
const TestDetailModal = ({ test, onClose, onAddToCart, onBookNow }) => {
  if (!test) return null;

  const discount =
    test.oldPrice > 0
      ? Math.round((1 - test.price / test.oldPrice) * 100)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-blue-900 font-bold text-xl mb-1">{test.name}</h2>
        {test.category && (
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded mb-4">
            {test.category}
          </span>
        )}

        <hr className="mb-4" />

        {/* Details */}
        <div className="space-y-3 text-sm">
          {test.tests && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Tests Included:</span>
              <span className="text-gray-800 font-medium">{test.tests} tests</span>
            </div>
          )}

          <div className="flex gap-2">
            <span className="text-gray-500 w-32 shrink-0">Price:</span>
            <span className="text-blue-900 font-bold text-base">
              Rs. {test.price?.toLocaleString()}
            </span>
          </div>

          {test.oldPrice > 0 && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">MRP:</span>
              <span className="line-through text-gray-400">
                Rs. {test.oldPrice?.toLocaleString()}
              </span>
            </div>
          )}

          {discount && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Discount:</span>
              <span className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded text-xs">
                {discount}% OFF
              </span>
            </div>
          )}

          {test.type && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Type:</span>
              <span className="text-gray-800">{test.type}</span>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => { onAddToCart(test); onClose(); }}
            className="flex-1 border border-blue-900 text-blue-900 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition"
          >
            Add to Cart
          </button>
          <button
            onClick={() => { onBookNow(test); onClose(); }}
            className="flex-1 bg-blue-900 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-800 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────

const LabTestsPage = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { location } = useLocation();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ New state for modal
  const [selectedProduct, setSelectedProduct] = useState(null);


  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const categoryFromUrl = params.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    } else {
      setSelectedCategory("");
    }
  }, [routerLocation.search]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        let response = await fetchCityCollection("get_product", location.city);
        if (!isMounted) return;

        let cityMatchedProducts = filterProductsByCity(response, location.city) || [];

        if (cityMatchedProducts.length === 0 && response.length > 0) {
          cityMatchedProducts = response;
        }

        setProducts(Array.isArray(cityMatchedProducts) ? cityMatchedProducts.map(mapApiProduct) : []);
      } catch (fetchError) {
        console.error("Failed to fetch city products:", fetchError);
        if (isMounted) {
          try {
            const fallbackResponse = await fetch(toApiUrl("/get_product"));
            const fallbackPayload = await fallbackResponse.json();
            const fallbackProducts = extractApiArray(fallbackPayload).map(mapApiProduct);
            setProducts(fallbackProducts);
            setError("");
          } catch (fallbackError) {
            console.error("Failed to fetch fallback products:", fallbackError);
            setError("Products could not be loaded right now. Please try again.");
            setProducts([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [location.city]);

  const categories = useMemo(
    () => {
      const allCats = products.map((product) => {
        if (typeof product.category === "string") return product.category;
        if (typeof product.category === "object" && product.category !== null) return product.category.name;
        return null;
      });
      const uniqueCategories = [...new Set(allCats.filter(Boolean))];
      const hasFullBodyCategory = uniqueCategories.some(
        (cat) => cat.toLowerCase() === FULL_BODY_CATEGORY_NAME.toLowerCase()
      );
      const hasFullBodyProducts = products.some(isFullBodyProduct);

      return hasFullBodyCategory || !hasFullBodyProducts
        ? uniqueCategories
        : [...uniqueCategories, FULL_BODY_CATEGORY_NAME];
    },
    [products]
  );

  const mustHaveTests = useMemo(
    () => products.slice(0, 10).map((product) => product.name),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = (() => {
        if (!selectedCategory) return true;
        if (
          selectedCategory.toLowerCase() === FULL_BODY_CATEGORY_NAME.toLowerCase() &&
          isFullBodyProduct(product)
        ) {
          return true;
        }
        const cat = product.category;
        if (!cat) return false;
        if (typeof cat === "string") return cat.toLowerCase() === selectedCategory.toLowerCase();
        if (Array.isArray(cat)) return cat.some((c) =>
          typeof c === "string"
            ? c.toLowerCase() === selectedCategory.toLowerCase()
            : c?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (typeof cat === "object") return cat.name?.toLowerCase() === selectedCategory.toLowerCase();
        return false;
      })();

      const matchesTest = !selectedTest || product.name === selectedTest;
      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof product.category === "string" &&
          product.category.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesTest && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory, selectedTest]);

  const buildCartItem = (product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    tests: product.tests,
    type: product.type,
    city: location.city,
  });

  const handleAddToCart = (product) => {
    addToCart(buildCartItem(product));
    toast.success(`${product.name} added to cart`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
  };

  const handleBookNow = (product) => {
    addToCart(buildCartItem(product));
    toast.success(`${product.name} added. Continue booking from cart.`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
    navigate("/cart_section");
  };

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <div className="flex p-6 gap-6 lab-tests-layout">
        {/* Sidebar */}
        <div className="w-64 space-y-6 lab-tests-sidebar">
          <div className="bg-white shadow rounded-md p-4">
            <h3 className="font-semibold mb-2">Categories</h3>

            {selectedCategory && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 px-2 py-1 rounded text-sm text-blue-700">
                <span>Filter: <strong>{selectedCategory}</strong></span>
                <button
                  onClick={() => { setSelectedCategory(""); navigate("/lab-tests"); }}
                  className="ml-2 text-red-500 hover:underline text-xs"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories found for {location.city}.</p>
              ) : (
                categories.map((cat, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(selectedCategory || "").toLowerCase() === (cat || "").toLowerCase()}
                      onChange={() => {
                        const currentCatLower = (selectedCategory || "").toLowerCase();
                        const targetCatLower = (cat || "").toLowerCase();
                        const newCat = currentCatLower === targetCatLower ? "" : cat;
                        setSelectedCategory(newCat);
                        if (newCat) {
                          navigate(`/lab-tests?category=${encodeURIComponent(newCat)}`, { replace: true });
                        } else {
                          navigate("/lab-tests", { replace: true });
                        }
                      }}
                    />
                    <span className="text-gray-700">{cat}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-md p-4">
            <h3 className="font-semibold mb-2">Must Have Test</h3>
            <input
              type="text"
              placeholder="Search Test"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-2"
            />
            <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
              {mustHaveTests.map((test, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTest === test}
                    onChange={() => setSelectedTest(selectedTest === test ? "" : test)}
                  />
                  <span className="text-gray-700">{test}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-900">
              {selectedCategory
                ? `${selectedCategory} Tests in ${location.city}`
                : `Tests in ${location.city}`}
            </h2>
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `${filteredProducts.length} items found`}
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="pdf-product-grid lab-tests-card-grid">
            {filteredProducts.map((lab) => (
              <div
  key={lab.id}
  className="pdf-product-card lab-test-list-card"
  onClick={() => navigate(`/lab-tests/${encodeURIComponent((location?.city || "").toLowerCase())}/${encodeURIComponent(lab.name)}`)}
>
                <div className="pdf-product-head">
                  <h3>{lab.name}</h3>
                  <span>{lab.type || "Package"}</span>
                </div>
                <div className="pdf-price-row">
                  {lab.oldPrice ? <del>Rs.{lab.oldPrice}</del> : null}
                  <strong>Rs.{lab.price}</strong>
                  <span>50% OFF</span>
                </div>
                {/* ✅ stopPropagation — buttons click se modal na khule */}
                <div
                  className="pdf-product-body lab-test-card-body"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <p><FaMicroscope /> <strong>{lab.tests || 1} Tests</strong></p>
                    <small>{lab.category || "Included"}</small>
                  </div>
                  <button
                    type="button"
                    className="lab-test-know-more"
                    onClick={() => navigate(`/lab-tests/${encodeURIComponent((location?.city || "").toLowerCase())}/${encodeURIComponent(lab.name)}`)}
                  >
                    + Know More
                  </button>
                  <div>
                    <p><FaRegClock /> <strong>Reports in</strong></p>
                    <small>12 hours</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(lab)}
                    className="pdf-add-cart"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && filteredProducts.length === 0 ? (
            <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No products found
              {selectedCategory ? (
                <> for category <strong>{selectedCategory}</strong></>
              ) : null}{" "}
              in <strong>{location.city}</strong>.
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ Modal */}
      <TestDetailModal
        test={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBookNow={handleBookNow}
      />

      <Footer />
    </>
  );
};

export default LabTestsPage;
