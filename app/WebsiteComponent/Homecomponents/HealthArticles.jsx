import React, { useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const articles = [
  {
    title:
      "What is Cholera Disease? It's Definition, Symptoms, Causes, Diagnosis & Treatment",
    description:
      "You’ve probably heard the name in textbooks, news reports, or maybe as some...",
    img: "/images/cholera.jpg",
  },
  {
    title: "Measles Disease: Definition, Causes, Symptoms, and Prevention",
    description:
      "Let’s be honest: when we hear the word “measles,” most of us t...",
    img: "/images/measles.jpg",
  },
  {
    title:
      "Ringworm (Dermatophytosis): Causes, Symptoms, Home Remedies, and the Best Treatments",
    description:
      "Fungi are microorganisms that are present almost everywhere, including in the ai...",
    img: "/images/ringworm.jpg",
  },
  {
    title: "Typhoid Fever: Symptoms, Causes, Prevention & Treatment",
    description:
      "Typhoid is a bacterial infection that spreads through contaminated food and water...",
    img: "/images/typhoid.jpg",
  },
  {
    title: "Malaria: Everything You Should Know",
    description:
      "Malaria is caused by a parasite transmitted through the bite of infected mosquitoes...",
    img: "/images/malaria.jpg",
  },
  {
    title: "Dengue Fever: Symptoms, Complications, and Treatment",
    description:
      "Dengue is a mosquito-borne illness causing high fever, rashes, and muscle pain...",
    img: "/images/dengue.jpg",
  },
];

const HealthArticles = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-900">Health Articles</h2>
        <button className="bg-gradient-to-r from-teal-400 to-blue-800 text-white px-5 py-2 rounded-md font-semibold hover:opacity-90">
          View All
        </button>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border p-2 rounded z-10 shadow-md hover:bg-gray-100"
        >
          <FaChevronLeft className="text-blue-900" />
        </button>

        {/* Article Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 px-10 scroll-smooth no-scrollbar"
        >
          {articles.map((article, index) => (
            <div
              key={index}
              className="min-w-[240px] bg-white border rounded-md shadow-sm overflow-hidden flex-shrink-0"
            >
              <img
                src={article.img}
                alt={article.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-md font-semibold text-blue-900 line-clamp-2 mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {article.description}
                </p>
                <div className="flex justify-between items-center">
                  <button className="bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium hover:opacity-90">
                    Read More
                  </button>
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <span>Share</span>
                    <FaTwitter className="hover:text-blue-500 cursor-pointer" />
                    <FaFacebookF className="hover:text-blue-600 cursor-pointer" />
                    <FaLinkedinIn className="hover:text-blue-700 cursor-pointer" />
                  </div>
                </div>
              </div>
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

export default HealthArticles;
