import React from "react";
import { FaChevronDown } from "react-icons/fa";

const MostBookedCheckups = () => {
  const checkups = [
    {
      title: "Full Body Checkup",
      icon: "/images/Mask group (4).png",
      gradient: "linear-gradient(to top right, #25A0D9, #73D2FF)",
      rounded: "rounded-xl",
      shadow: "shadow-lg",
    },
    {
      title: "Sexual Health",
      icon: null, // will show arrow
      gradient: "linear-gradient(to bottom left, #42B035, #45EF31)",
      rounded: "rounded-md",
      shadow: "shadow-md",
    },
    {
      title: "Woman’s Health",
      icon: null, // will show arrow
      gradient: "linear-gradient(to top left, #42B035, #45EF31)",
      rounded: "rounded-md",
      shadow: "shadow-md",
    },
    {
      title: "Allergy Checkup",
      icon: "/images/Mask group (5).png",
      gradient: "linear-gradient(to bottom right, #25A0D9, #73D2FF)",
      rounded: "rounded-xl",
      shadow: "shadow-lg",
    },
  ];

  return (
    <div className=" flex items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row max-w-5xl gap-6 items-center justify-center p-6">
        {/* Left Text Section */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Most Booked Checkups</h2>
          <p className="text-gray-600 mb-4">
            India's fastest AI powered & temperature-controlled supply chain to
            collect and test your blood in freshest state.
          </p>
          <button className="bg-linear-gradient(to top left, #42B035, #45EF31) text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
            View All Checkup
          </button>
        </div>

        {/* Right Grid Section */}
        <div className="flex-1 grid grid-cols-2 gap-4 justify-center items-center">
          {checkups.map((item) => (
            <div
              key={item.title}
              className={`flex flex-col items-center justify-center p-4 text-white cursor-pointer hover:scale-105 transform transition ${item.rounded} ${item.shadow}`}
              style={{ background: item.gradient }}
            >
              <div className="w-16 h-16 mb-2 flex items-center justify-center">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FaChevronDown className="text-white text-3xl" />
                )}
              </div>
              <span className="font-semibold text-center">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MostBookedCheckups;
