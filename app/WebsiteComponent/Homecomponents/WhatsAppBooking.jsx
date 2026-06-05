// WhatsAppBooking.jsx
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppBooking = () => {
  return (
    <div className="max-w-5xl mx-auto bg-blue-50 rounded-xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Text section */}
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold text-blue-900">
          NOW YOU CAN BOOK A TEST ON WHATSAPP
        </h2>
        <p className="text-gray-700 mt-1 text-sm md:text-base">
          Need Help With Home Collection Booking? Let’s Connect On Whatsapp
        </p>
        <div className="h-1 w-16 bg-blue-900 mt-2 rounded"></div>
      </div>

      {/* WhatsApp button */}
      <a 
        href="https://wa.me/1234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
      >
        <FaWhatsapp className="text-xl" />
        <span className="text-sm md:text-base">WhatsApp Click to Chat</span>
      </a>

    </div>
  );
};

export default WhatsAppBooking;
