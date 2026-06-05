import React from "react";

const stats = [
  {
    number: "15",
    title: "NABL",
    subtitle: "ACCREDITED LABS",
    dark: false,
  },
  {
    number: "49+",
    title: "CITIES",
    subtitle: "OF OPERATION",
    dark: true,
  },
  {
    number: "46",
    title: "TEST",
    subtitle: "PROCESSING LABS",
    dark: false,
  },
  {
    number: "1126+",
    title: "COLLECTION",
    subtitle: "TOUCHPOINTS",
    dark: true,
  },
  {
    number: "2786",
    title: "TESTS",
    subtitle: "IN PORTFOLIO",
    dark: false,
  },
  {
    number: "11000+",
    title: "TESTS",
    subtitle: "CONDUCTED EVERYDAY",
    dark: true,
  },
];

const ExpandingFootprints = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Section Title */}
      <h2 className="text-xl font-bold text-blue-900 mb-10">
        Our Expanding Footprints
      </h2>

      {/* Stats Grid */}
      <div className="flex flex-wrap justify-center gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center text-center border-4 ${
              item.dark
                ? "bg-blue-900 text-white border-teal-400"
                : "bg-teal-50 text-blue-900 border-blue-900"
            }`}
          >
            <div className="text-2xl font-bold text-teal-500">
              {item.number}
            </div>
            <div
              className={`text-md font-semibold mt-1 ${
                item.dark ? "text-white" : "text-blue-900"
              }`}
            >
              {item.title}
            </div>
            <div
              className={`text-[10px] mt-1 tracking-wide uppercase ${
                item.dark ? "text-white" : "text-teal-600"
              }`}
            >
              {item.subtitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandingFootprints;
