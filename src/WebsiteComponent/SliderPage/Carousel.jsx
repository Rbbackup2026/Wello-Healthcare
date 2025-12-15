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



import React, { useState, useEffect } from "react";

const defaultImage = "/placeholder.png"; // fallback if needed

const Carousel = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  // Fetch active banners from backend
  useEffect(() => {
    fetch("https://razobytehealthcare-website-backend-code.onrender.com/v1/api/getbanner")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only active banners
          const activeBanners = data.filter((banner) => banner.isActive);
          setSlides(activeBanners);
        } else {
          setSlides([]);
        }
      })
      .catch((err) => console.error("Error fetching carousel data:", err));
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return <div>Loading...</div>;

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-xl">
      {/* Slides */}
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide._id} className="min-w-full h-[300px] relative">
            <img
              src={slide.image ? `https://razobytehealthcare-website-backend-code.onrender.com${slide.image}` : defaultImage}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
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
  );
};

export default Carousel;
