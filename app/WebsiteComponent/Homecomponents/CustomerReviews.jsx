import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const reviews = [
  {
    name: "Ayush Pandey",
    rating: 5,
    message: "Very good and timely service by max lab staff Avaneesh sharma",
  },
  {
    name: "Kiran Prakash",
    rating: 4,
    message: "This service are very good your employee Sanjeev choudhary are very slowly unpain full perk I was ver...",
  },
  {
    name: "Sumita Kumari",
    rating: 4.5,
    message: "Your phlebotomist Sanjeev Choudhary was a good person n super service this was a person very...",
  },
  {
    name: "Ravi Mehta",
    rating: 5,
    message: "Excellent service and polite staff. Highly recommended!",
  },
  {
    name: "Neha Sharma",
    rating: 5,
    message: "Great experience. Professional and quick.",
  },
  {
    name: "Amit Joshi",
    rating: 4,
    message: "Satisfied with the lab service. Quick and clean.",
  },
];

const RatingStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={i} className="text-yellow-500" />);
  }
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
  }
  while (stars.length < 5) {
    stars.push(<FaRegStar key={`empty-${stars.length}`} className="text-yellow-500" />);
  }

  return <div className="flex space-x-1">{stars}</div>;
};

const CustomerReviews = () => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -360 : 360,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Section Header */}
      <h2 className="text-xl font-semibold text-blue-900 mb-4">Customer reviews</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column (Rating Summary) */}
        <div className="w-full lg:w-1/3 border-r pr-4">
          <div className="text-2xl text-yellow-500 flex items-center">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
          </div>
          <p className="text-lg text-gray-800 font-semibold mt-1 mb-4">4.9 out of 5</p>

          <div className="space-y-2">
            {/* 5 star */}
            <div className="flex items-center">
              <span className="text-sm text-blue-700 w-12">5 star</span>
              <div className="w-full h-3 bg-gray-200 rounded mx-2">
                <div className="bg-orange-400 h-3 rounded" style={{ width: "90%" }} />
              </div>
              <span className="text-sm text-gray-600">90%</span>
            </div>

            {/* 4 star */}
            <div className="flex items-center">
              <span className="text-sm text-blue-700 w-12">4 star</span>
              <div className="w-full h-3 bg-gray-200 rounded mx-2">
                <div className="bg-orange-400 h-3 rounded" style={{ width: "10%" }} />
              </div>
              <span className="text-sm text-gray-600">10%</span>
            </div>

            {/* 3 star */}
            <div className="flex items-center">
              <span className="text-sm text-blue-700 w-12">3 star</span>
              <div className="w-full h-3 bg-gray-200 rounded mx-2">
                <div className="bg-orange-400 h-3 rounded" style={{ width: "0%" }} />
              </div>
              <span className="text-sm text-gray-600">0%</span>
            </div>
          </div>
        </div>

        {/* Right Column (Reviews) */}
        <div className="w-full lg:w-2/3 relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded p-2 shadow hover:bg-gray-100"
          >
            <FaChevronLeft />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scroll-smooth no-scrollbar gap-4 px-8"
          >
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="min-w-[280px] bg-white border shadow-sm rounded-xl p-4 flex flex-col items-start flex-shrink-0"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {/* Placeholder icon */}
                    👤
                  </div>
                  <div className="font-semibold text-blue-900">{review.name}</div>
                </div>
                <RatingStars rating={review.rating} />
                <p className="text-teal-700 mt-2 text-sm line-clamp-3">{review.message}</p>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded p-2 shadow hover:bg-gray-100"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default CustomerReviews;
