import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const MaxLabPackages = () => {
  // Dummy data for packages
  const packages = [
    {
      id: 1,
      title: "WellWise Exclusive Profile- Male",
      tests: "Includes 87 tests",
      originalPrice: "¥ 6699",
      discountedPrice: "¥ 3539",
      discount: "40% off"
    },
    {
      id: 2,
      title: "WellWise Exclusive Profile-Female",
      tests: "Includes 87 tests",
      originalPrice: "¥ 6699",
      discountedPrice: "¥ 3539",
      discount: "40% off"
    },
    {
      id: 3,
      title: "Wellwise Platinum - Male",
      tests: "Includes 97 tests",
      originalPrice: "¥ 7999",
      discountedPrice: "¥ 4799",
      discount: "40% off"
    },
    {
      id: 4,
      title: "Wellwise Platinum - Female",
      tests: "Includes 97 tests",
      originalPrice: "¥ 7999",
      discountedPrice: "¥ 4799",
      discount: "40% off"
    },
    {
      id: 5,
      title: "Basic Health Checkup",
      tests: "Includes 45 tests",
      originalPrice: "¥ 3999",
      discountedPrice: "¥ 2399",
      discount: "40% off"
    },
    {
      id: 6,
      title: "Diabetes Screening",
      tests: "Includes 32 tests",
      originalPrice: "¥ 2999",
      discountedPrice: "¥ 1799",
      discount: "40% off"
    },
    {
      id: 7,
      title: "Cardiac Care Package",
      tests: "Includes 54 tests",
      originalPrice: "¥ 5999",
      discountedPrice: "¥ 3599",
      discount: "40% off"
    },
    {
      id: 8,
      title: "Women's Wellness",
      tests: "Includes 72 tests",
      originalPrice: "¥ 6999",
      discountedPrice: "¥ 4199",
      discount: "40% off"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);

  // Update number of cards to show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 768) {
        setCardsToShow(2);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(3);
      } else {
        setCardsToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.ceil(packages.length / cardsToShow) - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === Math.ceil(packages.length / cardsToShow) - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, cardsToShow]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header with View All button on top right */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-blue-900">
          Max Lab Popular Packages
        </h2>
        <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all">
          View All
        </button>
      </div>
      
      {/* Slider Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-md border p-2 shadow-md hover:bg-gray-100 transition-colors"
        >
          <FaChevronLeft className="text-blue-900" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-md border p-2 shadow-md hover:bg-gray-100 transition-colors"
        >
          <FaChevronRight className="text-blue-900" />
        </button>
        
        {/* Packages Slider */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease -in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
              width: `${(packages.length / cardsToShow) * 100}%`
            }}
          >
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="px-2"
                style={{ width: `${100 / packages.length * cardsToShow}%` }}
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full">
                  {/* Discount Badge */}
                  <div className="bg-red-500 text-white text-sm font-semibold py-1 px-2 inline-block absolute m-2 rounded">
                    {pkg.discount}
                  </div>
                  
                  {/* Package Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{pkg.tests}</p>
                    
                    <div className="flex items-baseline mb-4">
                      <span className="text-2xl font-bold text-blue-900">{pkg.discountedPrice}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">{pkg.originalPrice}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <button className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors">
                        Know More
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                        BOOK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaxLabPackages;