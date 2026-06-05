"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useParams } from "../../lib/routerCompat";
import { API_ORIGIN, toApiUrl, toAssetUrl } from "../../utils/api";

const DEFAULT_BLOG_IMAGE = "/images/blog-thyroid.png";

const getBlogTitle = (blog) =>
  blog?.title || blog?.name || blog?.blogTitle || "Blog Details";

const getBlogId = (blog) => String(blog?._id || blog?.id || "");

const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, "");

const getFullImage = (image = "") => {
  if (!image || typeof image !== "string") return DEFAULT_BLOG_IMAGE;

  const normalizedImage = image.trim();
  if (!normalizedImage) return DEFAULT_BLOG_IMAGE;
  if (/^(data:|blob:)/i.test(normalizedImage)) return normalizedImage;
  if (/^https?:\/\//i.test(normalizedImage)) return toAssetUrl(normalizedImage);
  if (normalizedImage.startsWith("/")) return toAssetUrl(normalizedImage);

  return `${API_ORIGIN}/uploads/${normalizedImage}`;
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsedTags = JSON.parse(tags);
      return Array.isArray(parsedTags) ? parsedTags : [];
    } catch {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const normalizeFaqs = (faqs) => {
  if (Array.isArray(faqs)) {
    return faqs
      .map((faq) => ({
        question: faq?.question || faq?.q || faq?.title || faq?.label || "",
        answer: faq?.answer || faq?.a || faq?.content || faq?.value || "",
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

const getBlogFaqValue = (blog) =>
  blog?.faqs ||
  blog?.faq ||
  blog?.blogFaqs ||
  blog?.blogFAQ ||
  blog?.blog_faqs ||
  blog?.raw?.faqs ||
  blog?.raw?.faq ||
  [];

const getBlogImageValue = (blog) =>
  blog?.imageUrl ||
  blog?.image ||
  blog?.thumbnail ||
  blog?.bannerImage ||
  blog?.coverImage ||
  "";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [otherBlogs, setOtherBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const [detailRes, activeRes] = await Promise.all([
          axios.get(toApiUrl(`/getblogid/${id}`)),
          axios.get(toApiUrl("/blogget-active")),
        ]);

        const detailData = detailRes.data?.data || detailRes.data;
        const activeBlogs = Array.isArray(activeRes.data)
          ? activeRes.data
          : activeRes.data?.data || [];

        if (!isMounted) return;

        const activeBlogDetail = activeBlogs.find(
          (item) => getBlogId(item) === String(id)
        );
        const detailFaqs = normalizeFaqs(getBlogFaqValue(detailData));
        const activeFaqs = normalizeFaqs(getBlogFaqValue(activeBlogDetail));

        setBlog({
          ...activeBlogDetail,
          ...detailData,
          tags: normalizeTags(detailData?.tags),
          faqs: detailFaqs.length > 0 ? detailFaqs : activeFaqs,
        });
        setOtherBlogs(
          activeBlogs.filter((item) => getBlogId(item) !== String(id)).slice(0, 3)
        );
      } catch (err) {
        console.error("Error fetching blog:", err);
        if (isMounted) setBlog(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const title = getBlogTitle(blog);
  const intro = blog?.intro || blog?.shortDescription || "";
  const description = blog?.description || blog?.content || "";
  const imageUrl = getFullImage(getBlogImageValue(blog));
  const faqs = blog?.faqs || [];

  const hasDescription = useMemo(
    () => stripHtml(description).trim().length > 0,
    [description]
  );

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>

      <main className="blog-detail-page">
        {loading ? (
          <div className="blog-detail-state">Loading Blog...</div>
        ) : !blog ? (
          <div className="blog-detail-state blog-detail-error">
            Blog Not Found
          </div>
        ) : (
          <div className="blog-detail-shell">
            <article className="blog-detail-article">
              <p className="blog-detail-kicker">Blog Details</p>
              <h1>{title}</h1>

              <img
                className="blog-detail-hero-image"
                src={imageUrl}
                alt={title}
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_BLOG_IMAGE;
                }}
              />

              {intro && <p className="blog-detail-intro">{intro}</p>}

              {hasDescription && (
                <div
                  className="blog-detail-content"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}

              {blog.tags?.length > 0 && (
                <div className="blog-detail-tags">
                  {blog.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </article>

            {otherBlogs.length > 0 && (
              <section className="blog-detail-related">
                <h2 className="blog-detail-related-title">Other Blogs</h2>
                <div className="blog-detail-related-grid">
                  {otherBlogs.map((item) => {
                    const itemTitle = getBlogTitle(item);

                    return (
                      <article className="wello-blog-list-card" key={item._id}>
                        <img
                          src={getFullImage(getBlogImageValue(item))}
                          alt={itemTitle}
                          onError={(event) => {
                            event.currentTarget.src = DEFAULT_BLOG_IMAGE;
                          }}
                        />
                        <h2>{itemTitle}</h2>
                        <p>
                          {stripHtml(
                            item.intro || item.shortDescription || item.description || ""
                          )}
                        </p>
                        <Link href={`/blog/${item._id}`}>Read More</Link>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {faqs.length > 0 && (
              <section className="blog-detail-faq">
                <div className="blog-detail-faq-heading">
                  <span>Frequently Asked Questions</span>
                  <h2>Frequently Asked Questions for {title}</h2>
                  <p>
                    Find quick answers to common questions related to this blog.
                  </p>
                </div>
                <div className="blog-detail-faq-list">
                  {faqs.map((faq, index) => (
                    <details
                      key={`${faq.question}-${index}`}
                      className="blog-detail-faq-item"
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
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogDetail;
