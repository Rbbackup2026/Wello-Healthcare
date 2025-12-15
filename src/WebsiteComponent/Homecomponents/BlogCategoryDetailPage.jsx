import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BlogCategoryDetailPage = () => {
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "https://razobytehealthcare-website-backend-code.onrender.com/";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}v1/api/getblogsbycategory/${slug}`)
      .then((res) => {
        setBlogs(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">{slug} Blogs</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blog/${blog._id}`}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600 mt-2">{blog.shortDescription}</p>
          </Link>
        ))}
      </div>

      {blogs.length === 0 && (
        <p className="text-gray-500 mt-4">No blogs found in this category.</p>
      )}
    </div>
  );
};

export default BlogCategoryDetailPage;
