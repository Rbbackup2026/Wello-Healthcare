import BlogDetail from "../../WebsiteComponent/Homecomponents/BlogDetail";
import JsonLd from "../../WebsiteComponent/Homecomponents/JsonLd";
import {
  articleSchema,
  breadcrumbSchema,
  buildPageMetadata,
  faqSchema,
} from "../../utils/seo";
import { fetchBlogForSeo } from "../../utils/seoFetch";

export async function generateMetadata({ params }) {
  const blog = await fetchBlogForSeo(params.id);

  if (!blog) {
    return buildPageMetadata({
      title: "Health Blog",
      description: "Read health and wellness articles from Wello Healthcare.",
      path: `/blog/${params.id}`,
    });
  }

  return buildPageMetadata({
    title: blog.title,
    description: blog.description,
    path: `/blog/${blog.id}`,
    image: blog.image,
    type: "article",
    keywords: ["health blog", blog.title, "Wello Healthcare"],
  });
}

export default async function Page({ params }) {
  const blog = await fetchBlogForSeo(params.id);
  const path = `/blog/${params.id}`;

  return (
    <>
      {blog && (
        <JsonLd
          data={[
            articleSchema({
              title: blog.title,
              description: blog.description,
              path,
              image: blog.image,
              datePublished: blog.datePublished,
              dateModified: blog.dateModified,
            }),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Blogs", path: "/blogs" },
              { name: blog.title, path },
            ]),
            faqSchema(blog.faqs),
          ]}
        />
      )}
      <BlogDetail />
    </>
  );
}
