"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "../../lib/routerCompat";
import axios from "axios";

const BlogDetailCategory = () => {
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:3000/";

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}v1/api/blogget-active/${id}`);
      setBlogs(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Blogs</h1>

      {blogs.length === 0 && (
        <p className="text-gray-500">No blogs found for this category.</p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <div key={b._id} className="shadow p-4 rounded-lg">
            <img
              src={BASE_URL + b.image}
              alt={b.title}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="font-semibold mt-3">{b.title}</h2>
            <p className="text-sm text-gray-600">{b.shortDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogDetailCategory;
