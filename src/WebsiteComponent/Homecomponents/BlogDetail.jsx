// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import TopBar from "./TopBar";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import useBlogCategories from "./../../Components/Hooks/useBlogCategories";

// const BlogDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [blog, setBlog] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState("");

//   const { categories, loading: categoriesLoading } = useBlogCategories();

//   const BASE_URL = "http://localhost:3000/";

//   const getFullImage = (img) => {
//     if (!img) return "";
//     return img.startsWith("http") ? img : BASE_URL + img;
//   };

//   const fetchBlogDetail = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}v1/api/getblogid/${id}`);
//       const data = res.data;

//       setBlog({
//         ...data,
//         tags: typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags || [],
//       });

//       if (data.category) setSelected(data.category);
//     } catch (err) {
//       console.error("Error fetching blog:", err);
//       setBlog(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBlogDetail();
//   }, [id]);

//   if (loading)
//     return <div className="text-left py-16 text-gray-500 text-xl px-4">Loading Blog...</div>;
//   if (!blog)
//     return <div className="text-left py-16 text-red-500 text-xl px-4">Blog Not Found</div>;

//   return (
//     <>
//       <TopBar />
//       <Navbar />

//       <div>
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 mt-12">

//           {/* LEFT SECTION */}
//           <div className="md:w-2/3 space-y-6">
//             <div className="relative w-full h-[400px]">
//               <img
//                 src={getFullImage(blog.image)}
//                 alt={blog.title}
//                 className="w-full h-full object-cover rounded-2xl"
//               />
//               <div className="absolute inset-0 flex items-center justify-center px-4">
//                 <h1 className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg">
//                   {blog.title}
//                 </h1>
//               </div>
//             </div>

//             <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mt-4">
//               {blog.author && <span>✍️ {blog.author}</span>}
//               {blog.category && (
//                 <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
//                   {blog.category}
//                 </span>
//               )}
//               {blog.sortOrder && <span>Sort Order: {blog.sortOrder}</span>}
//             </div>

//             {blog.thumbnail && (
//               <img
//                 src={getFullImage(blog.thumbnail)}
//                 alt="Thumbnail"
//                 className="w-full rounded-2xl shadow-lg object-cover"
//               />
//             )}

//             {blog.shortDescription && (
//               <p className="text-gray-700 text-lg leading-relaxed">
//                 {blog.shortDescription}
//               </p>
//             )}

//             {blog.description && (
//               <div
//                 className="prose lg:prose-xl max-w-none"
//                 dangerouslySetInnerHTML={{ __html: blog.description }}
//               ></div>
//             )}

//             {blog.tags && blog.tags.length > 0 && (
//               <div className="mt-6 flex flex-wrap gap-2">
//                 {blog.tags.map((tag) => (
//                   <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
//                     #{tag}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* RIGHT SECTION */}
//           <div className="md:w-1/3 space-y-6">

//             {/* SIDE FORM */}
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <h2 className="text-lg font-semibold mb-4">Get a call back from our Health Advisor</h2>
//               <input type="text" placeholder="Mobile Number*" className="w-full mb-3 p-2 border rounded" />
//               <input type="text" placeholder="Your Name" className="w-full mb-3 p-2 border rounded" />
//               <div className="flex items-center mb-4">
//                 <input type="checkbox" id="terms" className="mr-2"/>
//                 <label htmlFor="terms" className="text-sm text-gray-500">
//                   You hereby affirm & authorize Healthigns to process your data.
//                 </label>
//               </div>
//               <button className="w-full bg-[#1d7fbb] text-white py-2 rounded-lg hover:bg-[#166e99] transition-colors">
//                 Get A Call Back Now
//               </button>
//             </div>

//             {/* CHECKUPS */}
//             <div className="bg-white p-4 rounded-xl shadow">
//               <h3 className="font-semibold mb-2">Most Booked Full Body Check-ups</h3>
//               <ul className="list-disc list-inside text-gray-700">
//                 <li>Full Body Checkup</li>
//                 <li>Regular Health Checkup</li>
//                 <li>Advanced Health Screening</li>
//               </ul>
//             </div>

//             {/* CATEGORY DROPDOWN */}
//             <div className="w-full relative">
//   <select
//     value={selected}
//     onChange={(e) => {
//       const value = e.target.value;
//       setSelected(value);
//       navigate(`/blog/${value}`);
//     }}
//     className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
//   >
//     <option value="" disabled>
//       Blog Category
//     </option>

//     {categoriesLoading ? (
//       <option disabled>Loading...</option>
//     ) : (
//       categories.map((cat) => (
//         <option key={cat._id} value={cat._id}>
//           {cat.name} ({cat.blogCount})
//         </option>
//       ))
//     )}
//   </select>
// </div>

//           </div>
//         </div>
//       </div>

//       <Footer />
      

//     </>
//   );
// };

// export default BlogDetail;



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useBlogCategories from "./../../Components/Hooks/useBlogCategories";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  const { categories, loading: categoriesLoading } = useBlogCategories();

  const BASE_URL = "https://razobytehealthcare-website-backend-code.onrender.com/";

  const getFullImage = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : BASE_URL + img;
  };

  const fetchBlogDetail = async () => {
    try {
      const res = await axios.get(`${BASE_URL}v1/api/getblogid/${id}`);
      const data = res.data;

      setBlog({
        ...data,
        tags: typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags || [],
      });

      if (data.category) setSelected(data.category);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  if (loading)
    return <div className="text-left py-16 text-gray-500 text-xl px-4">Loading Blog...</div>;
  if (!blog)
    return <div className="text-left py-16 text-red-500 text-xl px-4">Blog Not Found</div>;

  return (
    <>
      <TopBar />
      <Navbar />

      <div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 mt-12">

          {/* LEFT SECTION */}
          <div className="md:w-2/3 space-y-6">
            <div className="relative w-full h-[400px]">
              <img
                src={getFullImage(blog.image)}
                alt={blog.title}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <h1 className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg">
                  {blog.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mt-4">
              {blog.author && <span>✍️ {blog.author}</span>}
              {blog.category && (
                <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
                  {blog.category}
                </span>
              )}
              {blog.sortOrder && <span>Sort Order: {blog.sortOrder}</span>}
            </div>

            {blog.thumbnail && (
              <img
                src={getFullImage(blog.thumbnail)}
                alt="Thumbnail"
                className="w-full rounded-2xl shadow-lg object-cover"
              />
            )}

            {blog.shortDescription && (
              <p className="text-gray-700 text-lg leading-relaxed">
                {blog.shortDescription}
              </p>
            )}

            {blog.description && (
              <div
                className="prose lg:prose-xl max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              ></div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="md:w-1/3 space-y-6">

            {/* SIDE FORM */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Get a call back from our Health Advisor</h2>
              <input type="text" placeholder="Mobile Number*" className="w-full mb-3 p-2 border rounded" />
              <input type="text" placeholder="Your Name" className="w-full mb-3 p-2 border rounded" />
              <div className="flex items-center mb-4">
                <input type="checkbox" id="terms" className="mr-2"/>
                <label htmlFor="terms" className="text-sm text-gray-500">
                  You hereby affirm & authorize Healthigns to process your data.
                </label>
              </div>
              <button className="w-full bg-[#1d7fbb] text-white py-2 rounded-lg hover:bg-[#166e99] transition-colors">
                Get A Call Back Now
              </button>
            </div>

            {/* CHECKUPS */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="font-semibold mb-2">Most Booked Full Body Check-ups</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Full Body Checkup</li>
                <li>Regular Health Checkup</li>
                <li>Advanced Health Screening</li>
              </ul>
            </div>

            {/* CATEGORY DROPDOWN (UPDATED FULLY) */}
            <div className="w-full relative">
              <select
                value={selected}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelected(value);
                  navigate(`/blog-category/${value}`);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
              >
                <option value="" disabled>
                  Blog Category
                </option>

                {categoriesLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name} ({cat.blogCount})
                    </option>
                  ))
                )}
              </select>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BlogDetail;
