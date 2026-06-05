import React, { useRef, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const healthCategories = [
  { name: "Cancer Test", img: "/images/cancer-icon.png" },
  { name: "Iron Test", img: "/images/iron-icon.png" },
  { name: "Hormone Test", img: "/images/hormone-icon.png" },
  { name: "Full Body", img: "/images/fullbody-icon.png" },
  { name: "Vitamin Test", img: "/images/vitamin-icon.png" },
  { name: "Heart Test", img: "/images/heart-icon.png" },
  { name: "Kidney Test", img: "/images/kidney-icon.png" },
  { name: "Liver Function", img: "/images/liver-icon.png" },
  { name: "Thyroid Test", img: "/images/thyroid-icon.png" },
  { name: "Diabetes Panel", img: "/images/diabetes-icon.png" },
  { name: "Bone Health", img: "/images/bone-icon.png" },
];

const HealthCategories2 = () => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Manual scroll buttons
  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && scrollRef.current) {
        scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });

        // Optional: reset scroll to start when reaching end
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }
      }
    }, 3000); // every 3s

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-900">
          Health Categories
        </h2>
        <button className="bg-gradient-to-r from-teal-400 to-blue-800 text-white px-5 py-2 rounded-md font-semibold hover:opacity-90">
          View All
        </button>
      </div>

      {/* Scrollable Section */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border p-2 rounded z-10 shadow-md hover:bg-gray-100"
        >
          <FaChevronLeft className="text-blue-900" />
        </button>

        {/* Scrollable Items */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-auto gap-8 px-10 scroll-smooth no-scrollbar"
        >
          {healthCategories.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center min-w-[140px] transition hover:scale-105"
            >
              <div className="w-28 h-28 rounded-full border flex items-center justify-center shadow-sm bg-white mb-3">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <p className="text-md text-blue-900 font-semibold">
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border p-2 rounded z-10 shadow-md hover:bg-gray-100"
        >
          <FaChevronRight className="text-blue-900" />
        </button>
      </div>
    </div>
  );
};

export default HealthCategories2;
