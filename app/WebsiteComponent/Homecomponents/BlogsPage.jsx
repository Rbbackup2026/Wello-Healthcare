"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { API_ORIGIN, toApiUrl, toAssetUrl } from "../../utils/api";

const DEFAULT_BLOG_IMAGE = "/images/blog-thyroid.png";

const getBlogImageUrl = (image = "") => {
  if (!image || typeof image !== "string") return DEFAULT_BLOG_IMAGE;

  const normalizedImage = image.trim();
  if (!normalizedImage) return DEFAULT_BLOG_IMAGE;
  if (/^(data:|blob:)/i.test(normalizedImage)) return normalizedImage;

  if (/^https?:\/\//i.test(normalizedImage)) {
    return normalizedImage.replace("/v1/api/uploads/", "/uploads/");
  }

  if (normalizedImage.startsWith("/v1/api/uploads/")) {
    return toAssetUrl(normalizedImage.replace("/v1/api", ""));
  }

  if (normalizedImage.startsWith("/uploads/")) return toAssetUrl(normalizedImage);
  if (normalizedImage.startsWith("/")) return toAssetUrl(normalizedImage);

  return `${API_ORIGIN}/uploads/${normalizedImage}`;
};

const normalizeFaqs = (faqs) => {
  if (Array.isArray(faqs)) {
    return faqs
      .map((faq) => ({
        question: faq?.question || faq?.q || faq?.title || "",
        answer: faq?.answer || faq?.a || faq?.content || "",
      }))
      .filter((faq) => faq.question.trim() || faq.answer.trim());
  }

  if (typeof faqs === "string") {
    try {
      return normalizeFaqs(JSON.parse(faqs));
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeBlog = (blog, index) => {
  const title = blog.title || blog.name || blog.blogTitle || "Health Blog";
  const intro =
    blog.intro ||
    blog.shortDescription ||
    blog.description ||
    blog.content ||
    "Read helpful health insights and diagnostic guidance from Wello Healthcare.";
  const image =
    blog.imageUrl ||
    blog.image ||
    blog.thumbnail ||
    blog.bannerImage ||
    blog.coverImage ||
    "";

  return {
    _id: blog._id || blog.id || `blog-${index}`,
    title,
    intro: String(intro).replace(/<[^>]*>/g, ""),
    image: getBlogImageUrl(image),
    status: blog.status,
    faqs: normalizeFaqs(blog.faqs || blog.faq),
  };
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(toApiUrl("/blogget"))
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (isMounted) {
          setBlogs(
            data
              .filter((blog) => !blog.status || blog.status === "active")
              .map(normalizeBlog)
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch blogs:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleBlogs = useMemo(
    () => blogs.slice(0, visibleCount),
    [blogs, visibleCount]
  );

  const blogFaqs = useMemo(
    () =>
      blogs.flatMap((blog) =>
        blog.faqs.map((faq, index) => ({
          ...faq,
          id: `${blog._id}-faq-${index}`,
          blogTitle: blog.title,
        }))
      ),
    [blogs]
  );

  return (
    <div className="wello-blogs-page">
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <main className="wello-blogs-main">
        <section className="wello-blogs-section">
          <h1>Blogs</h1>

          <div className="wello-blogs-list">
            {!loading && visibleBlogs.map((blog) => (
              <article className="wello-blog-list-card" key={blog._id}>
                <img
                  src={blog.image}
                  alt={blog.title}
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_BLOG_IMAGE;
                  }}
                />
                <h2>{blog.title}</h2>
                <p>{blog.intro}</p>
                <Link href={`/blog/${blog._id}`}>Read More</Link>
              </article>
            ))}
          </div>

          {loading && (
            <p className="wello-blogs-message">Loading blogs...</p>
          )}

          {!loading && blogs.length === 0 && (
            <p className="wello-blogs-message">No blogs available right now.</p>
          )}

          {visibleCount < blogs.length && (
            <button
              type="button"
              className="wello-blogs-load-more"
              onClick={() => setVisibleCount((count) => count + 3)}
            >
              Load More
            </button>
          )}

          {!loading && blogFaqs.length > 0 && (
            <section className="blog-detail-faq">
              <div className="blog-detail-faq-heading">
                <span>Frequently Asked Questions</span>
                <h2>Frequently Asked Questions for Blogs</h2>
                <p>Find quick answers to common questions related to our blogs.</p>
              </div>
              <div className="blog-detail-faq-list">
                {blogFaqs.map((faq, index) => (
                  <details
                    className="blog-detail-faq-item"
                    key={faq.id}
                    open={index === 0}
                  >
                    <summary>
                      <span>{faq.question || "Question"}</span>
                    </summary>
                    <p>{faq.answer || "Answer will be available soon."}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
