import React from "react";
import { FaPhoneAlt } from "react-icons/fa";

const CallNowBanner = () => {
  return (
<div className="bg-blue-50 max-w-5xl rounded-md shadow-sm flex items-center justify-between px-4 py-3 mt-10 w-full mx-auto">
      {/* Left Icon */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md">
          <FaPhoneAlt className="text-lg" />
        </div>

        {/* Text Content */}
        <div>
          <h2 className="text-blue-900 font-bold uppercase text-sm md:text-base">
            Unable To Find The Right Test ?
          </h2>
          <p className="text-gray-700 text-sm">
            Need Help With Home Collection Booking? Get A Call Back From Our
            Health Advisor
          </p>
          <p className="text-teal-600 font-semibold text-sm">7:00 AM - 11:00 PM</p>
        </div>
      </div>

      {/* Call Button */}
      <a
        href="tel:+919876543210"
        className="bg-blue-900 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-800 transition text-sm"
      >
        CALL NOW
      </a>
    </div>
  );
};

export default CallNowBanner;
