import React, { useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const womenCareData = [
  { name: "Hormone Test", img: "/images/hormone.png" },
  { name: "Infertility Test", img: "/images/infertility.png" },
  { name: "Female Cancer", img: "/images/cancer.png" },
  { name: "Anemia Test", img: "/images/anemia.png" },
  { name: "Pregnancy Test", img: "/images/pregnancy.png" },
  { name: "Women Health", img: "/images/health.png" },
  { name: "Pregnancy Test", img: "/images/pregnancy.png" },
  { name: "Women Health", img: "/images/health.png" },
  { name: "Pregnancy Test", img: "/images/pregnancy.png" },
  { name: "Women Health", img: "/images/health.png" },
];

const WomenCare = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  // Auto Scroll Effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

        if (isAtEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 160, behavior: "smooth" }); // move one card at a time
        }
      }
    }, 3000); // every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-900">Women Care</h2>
        <button className="bg-gradient-to-r from-teal-500 to-blue-900 text-white px-5 py-2 rounded-md font-semibold hover:opacity-90">
          View All
        </button>
      </div>

      {/* Scrollable Area */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:bg-gray-100 p-2 rounded-md border z-10"
        >
          <FaChevronLeft className="text-blue-900" />
        </button>

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 px-8 scroll-smooth no-scrollbar"
        >
          {womenCareData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center min-w-[140px] transition hover:scale-105"
            >
              <div className="w-28 h-28 rounded-full bg-white border shadow-md flex items-center justify-center mb-3">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-sm text-blue-900 font-semibold w-28 text-ellipsis whitespace-nowrap overflow-hidden">
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:bg-gray-100 p-2 rounded-md border z-10"
        >
          <FaChevronRight className="text-blue-900" />
        </button>
      </div>
    </div>
  );
};

export default WomenCare;
