import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const tests = [
  { id: 1, name: "Bone and Joint", image: "https://img.icons8.com/color/96/000000/bone.png" },
  { id: 2, name: "Prostate Test", image: "https://img.icons8.com/color/96/000000/prostate.png" },
  { id: 3, name: "Thyroid Test", image: "https://img.icons8.com/color/96/000000/thyroid.png" },
  { id: 4, name: "Liver Test", image: "https://img.icons8.com/color/96/000000/liver.png" },
  { id: 5, name: "Heart Test", image: "https://img.icons8.com/color/96/000000/heart.png" },
  { id: 6, name: "Lung Test", image: "https://img.icons8.com/color/96/000000/lungs.png" },
  { id: 7, name: "Kidney Test", image: "https://img.icons8.com/color/96/000000/kidney.png" },
  { id: 8, name: "Stomach Test", image: "https://img.icons8.com/color/96/000000/stomach.png" },
  { id: 9, name: "Eye Test", image: "https://img.icons8.com/color/96/000000/visible.png" },
  { id: 10, name: "Skin Test", image: "https://img.icons8.com/color/96/000000/skin.png" },
  { id: 11, name: "Brain Test", image: "https://img.icons8.com/color/96/000000/brain.png" },
  { id: 12, name: "Blood Test", image: "https://img.icons8.com/color/96/000000/test-tube.png" },
  { id: 13, name: "Nerve Test", image: "https://img.icons8.com/color/96/000000/neural.png" },
  { id: 14, name: "Ear Test", image: "https://img.icons8.com/color/96/000000/ear.png" },
  { id: 15, name: "Dental Test", image: "https://img.icons8.com/color/96/000000/tooth.png" },
];

const VitalOrgans = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const visibleCount = 6;
  const transitionRef = useRef(null);
  const sliderRef = useRef(null);

  // Create an extended array for seamless looping
  const extendedTests = [...tests, ...tests.slice(0, visibleCount)];

  const handlePrev = () => {
    if (currentIndex === 0) {
      // Jump to the end of the extended array without animation
      setIsTransitioning(false);
      setCurrentIndex(tests.length);
      
      // Re-enable transition after a brief delay
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(tests.length - 1);
      }, 50);
    } else {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex >= tests.length) {
      // Jump to the beginning without animation
      setIsTransitioning(false);
      setCurrentIndex(0);
      
      // Re-enable transition after a brief delay
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(1);
      }, 50);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-900">Vital Organs</h2>
        <button className="bg-gradient-to-r from-cyan-500 to-blue-700 text-white px-4 py-2 rounded-md font-medium hover:opacity-90">
          View All
        </button>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3 relative">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          className="z-10 p-2 rounded-md border bg-white shadow hover:bg-gray-100"
        >
          <FaChevronLeft />
        </button>

        {/* Items Wrapper */}
        <div className="overflow-hidden flex-1" ref={sliderRef}>
          <div
            className="flex"
            style={{
              transform: `translateX(-${(100 / visibleCount) * currentIndex}%)`,
              transition: isTransitioning ? 'transform 0.7s ease-in-out' : 'none'
            }}
          >
            {extendedTests.map((test, i) => (
              <div
                key={i}
                className="flex flex-col items-center cursor-pointer flex-none"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className="w-28 h-28 rounded-full  flex items-center justify-center bg-white shadow hover:shadow-lg transition">
                  <img src={test.image} alt={test.name} className="w-16 h-16" />
                </div>
                <p className="mt-2 text-sm font-bold text-blue-900 text-center">
                  {test.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="z-10 p-2 rounded-md border bg-white shadow hover:bg-gray-100"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default VitalOrgans;