// import React from "react";
// import { HiArrowSmRight } from "react-icons/hi";

// const Services = () => {
//   const services = [
//     {
//       img: "/images/icon4.png", 
//       title: "Book A Lab Test",
//       desc: "Home Sample Collection",
//     },
//     {
//       img: "/images/icon1.png",
//       title: "Book With Prescription",
//       desc: "Upload your prescription to book tests.",
//     },
//     {
//       img: "/images/icon2.png",
//       title: "Find A Lab Near You",
//       desc: "700+ Labs",
//     },
//     {
//       img: "/images/icon3.png",
//       title: "Download Reports",
//       desc: "Check E-Reports Status",
//     },
//   ];

//   return (
//     <div className="w-full  px-4 py-12 flex flex-col items-center">
//       {/* Cards */}
//       <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6 max-w-5xl w-full">
//         {services.map((service, index) => {
//           const isLightBg = index === 1 || index === 3;

//           return (
//             <div
//               key={index}
//               className={`${
//                 isLightBg ? 'bg-[#E6F6FE]' : 'bg-[#F1FFEF]'
//               } h-[220px] md:h-[160px] w-full backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg hover:shadow-3xl transition duration-300`}
//             >
//               <div className="flex flex-col justify-between h-full">
//                 <div>
//                   <img
//                     src={service.img}
//                     alt={service.title}
//                     className="w-10 h-10 object-contain"
//                   />
//                   <h3 className="text-base font-semibold text-black mt-3">
//                     {service.title}
//                   </h3>
//                   <p className="text-sm text-black mt-1">
//                     {service.desc}
//                   </p>
//                 </div>
//                 {/* <div className="flex justify-end mt-4">
//                   <button className="bg-black/10 hover:bg-black/20 p-1.5 rounded-md shadow transition">
//                     <HiArrowSmRight className="text-cyan-600 text-base" />
//                   </button>
//                 </div> */}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* View All Button */}
//       {/* <div className="flex justify-center mt-8">
//         <button className="bg-gradient-to-r from-cyan-600 to-blue-800 text-white px-6 py-2 rounded-md font-semibold hover:opacity-90 transition">
//           View All
//         </button>
//       </div> */}
//     </div>
//   );
// };

// export default Services;

import React from "react";
import { HiArrowSmRight } from "react-icons/hi";
import { motion } from "framer-motion";

const Services = () => {
  const services = [
    {
      img: "/images/icon4.png",
      title: "Book A Lab Test",
      desc: "Home Sample Collection",
    },
    {
      img: "/images/icon1.png",
      title: "Book With Prescription",
      desc: "Upload your prescription to book tests.",
    },
    {
      img: "/images/icon2.png",
      title: "Find A Lab Near You",
      desc: "700+ Labs",
    },
    {
      img: "/images/icon3.png",
      title: "Download Reports",
      desc: "Check E-Reports Status",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="w-full px-4 py-12 flex flex-col items-center">
      {/* Cards with motion container */}
      <motion.div
        className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6 max-w-5xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {services.map((service, index) => {
          const isLightBg = index === 1 || index === 3;

          return (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`${
                isLightBg ? "bg-[#E6F6FE]" : "bg-[#F1FFEF]"
              } h-[220px] md:h-[160px] w-full backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg hover:shadow-3xl transition duration-300`}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-10 h-10 object-contain"
                  />
                  <h3 className="text-base font-semibold text-black mt-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-black mt-1">{service.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Services;
