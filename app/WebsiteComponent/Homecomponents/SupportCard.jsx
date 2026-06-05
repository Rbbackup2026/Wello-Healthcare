import React from "react";

const SupportCard = () => {
  return (
    <div className="flex items-center justify-between bg-blue-50 p-6 rounded-md shadow-md max-w-5xl mx-auto">
      {/* Left: Image and text */}
      <div className="flex items-center space-x-4">
        <img
          src="/path/to/your/image.png" // Replace with actual image path
          alt="Support"
          className="w-20 h-20 object-cover rounded-full"
        />
        <div>
          <h2 className="text-lg font-semibold text-blue-900">
            UNABLE TO FIND THE RIGHT TEST ?
          </h2>
          <p className="text-teal-600 font-semibold text-sm mt-1">
            7:00 AM - 11:00 PM
          </p>
        </div>
      </div>

      {/* Right: Call back button */}
      <button className="bg-blue-900 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-800 transition">
        Request A Call Back
      </button>
    </div>
  );
};

export default SupportCard;
