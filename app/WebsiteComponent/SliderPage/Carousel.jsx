// import React, { useState, useEffect } from "react";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// const Carousel = () => {
//   const slides = [
//     { id: 1, img: "https://picsum.photos/id/1015/1000/400", title: "Slide 1", desc: "This is the first slide description" },
//     { id: 2, img: "https://picsum.photos/id/1018/1000/400", title: "Slide 2", desc: "This is the second slide description" },
//     { id: 3, img: "https://picsum.photos/id/1019/1000/400", title: "Slide 3", desc: "This is the third slide description" },
//   ];

//   const [current, setCurrent] = useState(0);

//   // Auto Slide every 3s
//   useEffect(() => {
//     const interval = setInterval(() => {
//       nextSlide();
//     }, 3000);
//     return () => clearInterval(interval);
//   });

//   const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
//   const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

//   return (
//     <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-xl">
//       {/* Slides */}
//       <div
//         className="flex transition-transform ease-out duration-500"
//         style={{ transform: `translateX(-${current * 100}%)` }}
//       >
//         {slides.map((slide) => (
//           <div key={slide.id} className="min-w-full h-[300px] relative">
//             <img
//               src={slide.img}
//               alt={slide.title}
//               className="w-full h-full"
//             />
//             <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
//               <h2 className="text-2xl font-bold">{slide.title}</h2>
//               <p className="mt-2">{slide.desc}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Indicators */}
//       <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
//         {slides.map((_, i) => (
//           <div
//             key={i}
//             className={`w-3 h-3 rounded-full cursor-pointer ${i === current ? "bg-white" : "bg-gray-400"}`}
//             onClick={() => setCurrent(i)}
//           ></div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Carousel;
 "use client";

import React, { useState, useEffect } from "react";
import { FaFlask, FaCube, FaSearch } from "react-icons/fa";
import { useNavigate } from "../../lib/routerCompat";
import {
  getBannerImageByViewport,
  MOBILE_BANNER_BREAKPOINT,
} from "../../utils/bannerImageUtils";

const Carousel = ({ showQuickActions = false }) => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BANNER_BREAKPOINT : false
  );

  // Fetch active banners from backend
  useEffect(() => {
    setLoading(true);
    setLoadError("");

    fetch("http://localhost:3000/v1/api/getbanner")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const activeBanners = data.filter((banner) => banner.isActive);
          setSlides(activeBanners);
          if (activeBanners.length === 0) {
            setLoadError("No active banners found.");
          }
        } else {
          setSlides([]);
          setLoadError("Banner data format is invalid.");
        }
      })
      .catch((err) => {
        console.error("Error fetching carousel data:", err);
        setSlides([]);
        setLoadError("Banner images could not be loaded.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BANNER_BREAKPOINT);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, [slides]);

  if (loading) {
    return (
      <div className="mx-auto flex h-[350px] w-full max-w-5xl items-center justify-center rounded-xl bg-slate-100 text-slate-600 md:h-[420px]">
        Loading banners...
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="mx-auto flex h-[350px] w-full max-w-5xl items-center justify-center rounded-xl bg-slate-100 text-center text-slate-600 md:h-[420px]">
        {loadError || "No banner image available right now."}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-xl">
      {/* Slides */}
        <div
          className="flex transition-transform ease-out duration-500"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide._id} className="min-w-full relative">
              <div className="bg-slate-100 md:bg-transparent">
                <img
                  src={getBannerImageByViewport(slide, isMobile)}
                  alt={slide.title}
                  className={`w-full transition-all duration-500 ${
                    isMobile
                      ? "h-[350px] rounded-2xl object-contain object-center px-3 py-2 shadow-sm"
                      : "h-[420px] rounded-none object-cover"
                  }`}
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
                {/* <h2 className="text-2xl font-bold">{slide.title}</h2>
                <p className="mt-2">{slide.desc}</p> */}
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                i === current ? "bg-white" : "bg-gray-400"
              }`}
              onClick={() => setCurrent(i)}
            ></div>
          ))}
        </div>
      </div>

      {showQuickActions ? (
        <div className="-mt-16 hidden md:flex justify-center px-6 relative z-10">
          <div className="flex items-center gap-4 rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-sm">
            <div className="flex h-[64px] min-w-[410px] items-center justify-between rounded-2xl border border-[#ffb84d] bg-white px-6 shadow-sm">
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search for tests"
                className="w-full border-0 bg-transparent text-[18px] text-slate-700 outline-none placeholder:text-slate-400"
              />
              <FaSearch className="ml-4 text-[28px] text-slate-400" />
            </div>
              <button
                type="button"
                onClick={() => navigate("/lab-tests")}
              className="flex h-[64px] min-w-[190px] cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ffbe4f] to-[#ff9f1a] px-6 text-lg font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5"
            >
              <FaFlask size={18} />
              <span>Lab Tests</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/full-body-health-checkup")}
              className="flex h-[64px] min-w-[190px] cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#34d399] to-[#10b981] px-6 text-lg font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5"
            >
              <FaCube size={18} />
              <span>Checkups</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Carousel;
