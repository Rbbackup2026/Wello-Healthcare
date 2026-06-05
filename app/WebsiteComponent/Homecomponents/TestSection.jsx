 "use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import { Link, useNavigate } from "../../lib/routerCompat";
import { toApiUrl } from "../../utils/api";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ✅ Test Detail Modal Component
const TestDetailModal = ({ test, onClose }) => {
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
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative"
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
        <h2 className="text-[#25A0D9] font-bold text-xl mb-4">{test.name}</h2>

        <hr className="mb-4" />

        {/* Details */}
        <div className="space-y-3 text-sm">
          {test.desc && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Description:</span>
              <span className="text-gray-800">{test.desc}</span>
            </div>
          )}

          <div className="flex gap-2">
            <span className="text-gray-500 w-32 shrink-0">Price:</span>
            <span className="text-[#25A0D9] font-bold text-base">
              ₹ {test.price?.toLocaleString()}
            </span>
          </div>

          {test.oldPrice > 0 && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">MRP:</span>
              <span className="line-through text-gray-400">
                ₹ {test.oldPrice?.toLocaleString()}
              </span>
            </div>
          )}

          {discount && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Discount:</span>
              <span className="bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded text-xs">
                {discount}% OFF
              </span>
            </div>
          )}

          {test.discount && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Offer:</span>
              <span className="text-green-600 font-medium">{test.discount}</span>
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
          <Link to={`/product/${test.id}`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-[#26C6DA] to-[#3DDFF3] text-white py-2 rounded-md text-sm font-semibold hover:opacity-90 transition">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────

const TestSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null); // ✅ New state

  const getPlainDescription = (value) =>
    String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const isTruthy = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const v = val.toLowerCase();
      return v === "true" || v === "yes" || v === "active" || v === "1";
    }
    if (typeof val === "number") return val === 1;
    return false;
  };

  useEffect(() => {
    const fetchHomeTests = async () => {
      try {
        setLoading(true);

        const [catRes, itemRes] = await Promise.all([
          axios.get(toApiUrl("/categories")),
          axios.get(toApiUrl("/get_product")),
        ]);

        const rawCategories = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data.data || [];

        const extractItems = (payload) => {
          if (Array.isArray(payload)) return payload;
          if (Array.isArray(payload?.data)) return payload.data;
          if (Array.isArray(payload?.data?.data)) return payload.data.data;
          if (Array.isArray(payload?.items)) return payload.items;
          return [];
        };

        const rawItems = extractItems(itemRes.data);

        console.log("Total Raw Categories:", rawCategories.length);
        console.log("Total Raw Items:", rawItems.length);

        const homeAllowedCats = rawCategories.filter((cat) => {
          const isShowHome = isTruthy(cat.showinhome);
          const isActive = isTruthy(cat.status);

          console.log(
            `Cat: ${cat.name} | showinhome: ${cat.showinhome} | status: ${cat.status} | allowed: ${isShowHome && isActive}`
          );

          return isShowHome && isActive;
        });

        console.log(
          "Categories allowed on Home:",
          homeAllowedCats.map((c) => c.name)
        );

        const groupedData = homeAllowedCats.map((cat) => {
          const categoryTests = rawItems.filter((item) => {
            const itemCat = item.category;
            if (!itemCat) return false;

            const isMatch = (val) => {
              if (typeof val === "string") {
                return (
                  val.toLowerCase() === cat.name?.toLowerCase() ||
                  val === String(cat._id)
                );
              }
              if (typeof val === "object" && val !== null) {
                const valId = val._id || val.id;
                return (
                  String(valId) === String(cat._id) ||
                  (val.name &&
                    val.name.toLowerCase() === cat.name?.toLowerCase())
                );
              }
              return false;
            };

            return Array.isArray(itemCat)
              ? itemCat.some(isMatch)
              : isMatch(itemCat);
          });

          return {
            title: cat.name,
            tests: categoryTests.map((t) => {
              const plainDescription = getPlainDescription(
                t.description || t.descrption || t.desc
              );

              return {
                name: t.name,
                desc: plainDescription
                  ? `${plainDescription.slice(0, 60)}${
                      plainDescription.length > 60 ? "..." : ""
                    }`
                  : "",
                price: t.price || 0,
                oldPrice: t.oldPrice || t.mrp || 0,
                discount: t.discount,
                id: t._id,
              };
            }),
          };
        });

        const visibleGroups = groupedData.filter(
          (group) => group.tests.length > 0
        );

        console.log(
          "Categories with actual tests:",
          visibleGroups.map((g) => g.title)
        );

        setCategories(visibleGroups);
      } catch (err) {
        console.error("Error loading home test section:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeTests();
  }, []);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading dynamic tests...
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-6 bg-[#E6F6FE]">
      <div className="max-w-5xl mx-auto">
        {categories.map((category, i) => (
          <div key={i} className="mb-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-1 sm:px-2">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                {category.title}
              </h2>
              <button
                onClick={() =>
                  navigate(
                    `/lab-tests?category=${encodeURIComponent(category.title)}`
                  )
                }
                className="bg-[#25A0D9] text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-semibold hover:bg-blue-700 transition"
              >
                View All
              </button>
            </div>

            {/* Slider */}
            <Slider {...settings} className="px-1 sm:px-2">
              {category.tests.map((test, index) => (
                <div key={index} className="p-2">
                  {/* ✅ onClick added on card, cursor pointer */}
                  <div
                    className="bg-white rounded-md shadow-md p-3 sm:p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full"
                    style={{ minHeight: "210px", cursor: "pointer" }}
                    onClick={() => setSelectedTest(test)}
                  >
                    <h3 className="text-[#25A0D9] font-bold text-sm sm:text-md mb-1">
                      {test.name}
                    </h3>

                    {test.desc && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">
                        • {test.desc}
                      </p>
                    )}

                    <div className="flex-grow"></div>

                    <div className="flex items-center gap-2 mb-2">
                      {test.oldPrice > 0 && (
                        <span className="text-gray-400 line-through text-xs sm:text-sm">
                          ₹ {test.oldPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[#25A0D9] font-bold text-base sm:text-lg">
                        ₹ {test.price.toLocaleString()}
                      </span>
                    </div>

                    {test.discount && (
                      <div className="mb-3 sm:mb-4 -ml-3 sm:-ml-5">
                        <span className="bg-blue-100 text-[#189ED3] text-[10px] sm:text-xs font-semibold px-2 py-1 inline-block">
                          {test.discount}
                        </span>
                      </div>
                    )}

                    {/* ✅ stopPropagation so buttons don't trigger modal */}
                    <div
                      className="flex justify-between items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link to={`/product/${test.id}`}>
                        <button className="bg-gradient-to-r from-[#26C6DA] to-[#3DDFF3] hover:opacity-90 text-white cursor-pointer text-xs sm:text-sm px-3 sm:px-5 py-1 rounded-md shadow-md font-semibold transition">
                          Book Now
                        </button>
                      </Link>
                      <Link to={`/product/${test.id}`}>
                        <span className="text-blue-600 text-xs sm:text-sm hover:underline font-medium cursor-pointer">
                          Know More
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        ))}

        {/* ✅ Modal */}
        <TestDetailModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />

        <style>{`
          .slick-prev:before,
          .slick-next:before {
            color: #42B035 !important;
            font-size: 20px;
          }
          @media (min-width: 640px) {
            .slick-prev:before,
            .slick-next:before {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TestSection;
