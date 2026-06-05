import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { API_ORIGIN, toApiUrl, toAssetUrl } from "../../utils/api";

const DEFAULT_BLOG_IMAGE = "/images/blog-thyroid.png";

const getBlogImageUrl = (image = "") => {
  if (!image || typeof image !== "string") return DEFAULT_BLOG_IMAGE;

  const normalizedImage = image.trim();
  if (!normalizedImage) return DEFAULT_BLOG_IMAGE;
  if (/^(data:|blob:)/i.test(normalizedImage)) return normalizedImage;
  if (/^https?:\/\//i.test(normalizedImage)) return toAssetUrl(normalizedImage);
  if (normalizedImage.startsWith("/")) return toAssetUrl(normalizedImage);

  return `${API_ORIGIN}/uploads/${normalizedImage}`;
};

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(toApiUrl("/blogget-active"));

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setBlogs(data);
    } catch (err) {
      console.log("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-600 text-xl">
        Loading blogs...
      </div>
    );
  }

  // Slider Settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024, 
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-4xl font-bold text-center text-gray-800">
          From the Blogs
        </h2>
        <p className="text-center text-gray-500 mt-2 mb-12 text-lg">
          Find informative health blogs offering tips, advice, and medical knowledge.
        </p>

        <Slider {...settings}>
          {blogs.map((blog) => (
            <div key={blog._id} className="px-4">
              <div className="bg-white rounded-2xl shadow border hover:shadow-xl transition-all p-4 group cursor-pointer">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={getBlogImageUrl(
                      blog.imageUrl ||
                        blog.image ||
                        blog.thumbnail ||
                        blog.bannerImage ||
                        blog.coverImage
                    )}
                    alt={blog.name}
                    className="w-full h-56 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_BLOG_IMAGE;
                    }}
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2 line-clamp-2">
                  {blog.name}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed h-[65px] overflow-hidden line-clamp-3">
                  {blog.intro}
                </p>

                <a href={`/blog/${blog._id}`}>
                  <button className="mt-4 bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition">
                    Read More
                  </button>
                </a>
              </div>
            </div>
          ))}
        </Slider>

        <div className="flex justify-center mt-12">
          <a
            href="/blogs"
            className="bg-teal-500 text-white px-8 py-3 rounded-full shadow hover:bg-teal-600 transition text-lg"
          >
            ALL BLOGS
          </a>
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
