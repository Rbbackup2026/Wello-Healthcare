"use client";

import React, { useEffect, useState } from "react";
import { Link, useParams } from "../../lib/routerCompat";
import axios from "axios";
import { toApiUrl, toAssetUrl } from "../../utils/api";

const BlogCategoryDetailPage = () => {
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(toApiUrl(`/getblogsbycategory/${slug}`))
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
            {blog.image && (
              <img
                src={toAssetUrl(blog.image)}
                alt={blog.title || blog.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
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
