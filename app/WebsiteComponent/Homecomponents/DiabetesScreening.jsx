 "use client";

import React, { useRef } from 'react';
import { useNavigate } from "../../lib/routerCompat";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 👈 icons import
import '../Custome Css/NoScrollbar.css'; 

const tests = [
  { name: 'Adiponectin, Serum (M)', includes: 1, price: 3000 },
  { name: 'Adiponectin, Serum (M)', includes: 1, price: 3000 },
  { name: 'Adiponectin, Serum (M)', includes: 1, price: 3000 },
  { name: 'Adiponectin, Serum (M)', includes: 1, price: 3000 },
  { name: 'Glucose Tolerance Test - (GTT 6 specimen),Fl...', includes: 6, price: 900 },
  { name: 'Glucose,24Hrs Urine', includes: 3, price: 320 },
  { name: 'GTIR(Glucose Tolerance Insulin...', includes: 1, price: 5000 },
  { name: 'Insulin Fasting', includes: 1, price: 700 },
  { name: 'HbA1c (Glycosylated Hemoglobin)', includes: 1, price: 450 },
];

const DiabetesScreening = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Scroll Right
  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Scroll Left
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Diabetes Screening</h2>
        <button 
          onClick={() => navigate(`/lab-tests?disease=Diabetes`)}
          className="bg-gradient-to-r from-teal-500 to-blue-900 text-white px-4 py-2 rounded-md font-semibold"
        >
          View All
        </button>
      </div>

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
      >
        {tests.map((test, index) => (
          <div
            key={index}
            className="min-w-[250px] bg-white p-4 rounded-xl shadow border hover:shadow-md transition"
          >
            <h3 className="text-teal-600 font-semibold text-md mb-1">{test.name}</h3>
            <p className="text-sm text-gray-700 mb-2">Includes {test.includes} tests</p>
            <p className="text-lg font-bold text-blue-900 mb-2">₹ {test.price}</p>
            <div className="flex justify-between items-center mt-2">
              <a href="#" className="text-teal-600 text-sm font-semibold hover:underline">
                Know More
              </a>
              <button className="bg-blue-900 text-white px-4 py-1 rounded-md text-sm font-bold">
                ADD
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Left Scroll Button */}
      <button
        onClick={handleScrollLeft}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-900 text-white p-2 rounded-md border shadow-md hover:bg-blue-700"
      >
        <FaChevronLeft size={18} />
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={handleScrollRight}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-900 text-white p-2 rounded-md shadow-md hover:bg-blue-700"
      >
        <FaChevronRight size={18} />
      </button>
    </div>
  );
};

export default DiabetesScreening;
