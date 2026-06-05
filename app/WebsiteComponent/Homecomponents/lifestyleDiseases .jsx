"use client";

import React from "react";
import { useNavigate } from "../../lib/routerCompat";

const lifestyleDiseases = [
  {
    name: "Diabetes",
    image: "https://img.icons8.com/color/96/diabetes--v1.png",
  },
  {
    name: "Depression",
    image: "https://img.icons8.com/color/96/depression.png",
  },
  {
    name: "Fatigue",
    image: "https://img.icons8.com/color/96/tired.png",
  },
  {
    name: "Hypertension",
    image: "https://img.icons8.com/color/96/heart-with-pulse.png",
  },
  {
    name: "Obesity",
    image: "https://img.icons8.com/color/96/obesity.png",
  },
];

const LifestyleDiseases = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Lifestyle Disease
        </h2>
        <button 
          onClick={() => navigate("/lab-tests?category=Lifestyle")}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md shadow hover:opacity-90"
        >
          View All
        </button>
      </div>

      {/* Disease List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {lifestyleDiseases.map((disease, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center cursor-pointer group"
            onClick={() => navigate(`/lab-tests?disease=${encodeURIComponent(disease.name)}`)}
          >
            <div className="w-32 h-32 flex items-center justify-center bg-white rounded-full shadow-sm border group-hover:shadow-md group-hover:border-blue-400 transition-all duration-300">
              <img
                src={disease.image}
                alt={disease.name}
                className="w-16 h-16"
              />
            </div>
            <span className="mt-3 text-sm font-medium text-gray-700">
              {disease.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LifestyleDiseases;
