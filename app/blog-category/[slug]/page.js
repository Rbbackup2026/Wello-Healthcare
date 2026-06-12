import BlogCategoryDetailPage from "../../WebsiteComponent/Homecomponents/BlogCategoryDetailPage";
import JsonLd from "../../WebsiteComponent/Homecomponents/JsonLd";
import { deslugifyLocation } from "../../utils/cityApi";
import {
  breadcrumbSchema,
  buildPageMetadata,
  collectionPageSchema,
} from "../../utils/seo";
import { fetchBlogCategoryForSeo } from "../../utils/seoFetch";

export async function generateMetadata({ params }) {
  const category = await fetchBlogCategoryForSeo(params.slug);
  const path = `/blog-category/${params.slug}`;

  return buildPageMetadata({
    title: category?.title || `${deslugifyLocation(params.slug)} Blogs`,
    description:
      category?.description ||
      `Explore health blogs and wellness articles in the ${deslugifyLocation(params.slug)} category.`,
    path,
    keywords: ["health blog", deslugifyLocation(params.slug), "Wello Healthcare"],
  });
}

export default async function Page({ params }) {
  const category = await fetchBlogCategoryForSeo(params.slug);
  const path = `/blog-category/${params.slug}`;
  const label = category?.title || `${deslugifyLocation(params.slug)} Blogs`;

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: label,
            description: category?.description,
            path,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blogs", path: "/blogs" },
            { name: label, path },
          ]),
        ]}
      />
      <BlogCategoryDetailPage />
    </>
  );
}
